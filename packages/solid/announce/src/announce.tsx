import { Show, createEffect, createSignal, omit, onSettled, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { composeRefs } from "@solidix/compose-refs";
import { Portal } from "@solidix/portal";
import { Primitive, type PrimitivePropsWithRef } from "@solidix/primitive";

const RegionType = {
  Polite: "polite",
  Assertive: "assertive",
  Off: "off",
} as const;

const RegionRole = {
  Status: "status",
  Alert: "alert",
  Log: "log",
  None: "none",
} as const;

type RegionType = (typeof RegionType)[keyof typeof RegionType];
type RegionRole = (typeof RegionRole)[keyof typeof RegionRole];

const ROLES: { [key in RegionType]: RegionRole } = {
  polite: RegionRole.Status,
  assertive: RegionRole.Alert,
  off: RegionRole.None,
};

const listenerMap = new Map<Element, number>();

/* -------------------------------------------------------------------------------------------------
 * Announce
 * -----------------------------------------------------------------------------------------------*/

type AnnounceProps = Omit<PrimitivePropsWithRef<"div">, "aria-atomic"> & {
  /**
   * Mirrors the `aria-atomic` DOM attribute for live regions. It is an optional attribute that
   * indicates whether assistive technologies will present all, or only parts of, the changed region
   * based on the change notifications defined by the `aria-relevant` attribute.
   *
   * @see WAI-ARIA https://www.w3.org/TR/wai-aria-1.2/#aria-atomic
   * @see Demo     http://pauljadam.com/demos/aria-atomic-relevant.html
   */
  "aria-atomic"?: boolean | "true" | "false" | undefined;
  /**
   * Mirrors the `aria-relevant` DOM attribute for live regions. It is an optional attribute used to
   * describe what types of changes have occurred to the region, and which changes are relevant and
   * should be announced. Any change that is not relevant acts in the same manner it would if the
   * `aria-live` attribute were set to off.
   *
   * Unfortunately, `aria-relevant` doesn't behave as expected across all device/screen reader
   * combinations. It's important to test its implementation before relying on it to work for your
   * users. The attribute is omitted by default.
   *
   * @see WAI-ARIA https://www.w3.org/TR/wai-aria-1.2/#aria-relevant
   * @see MDN      https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-relevant_attribute
   * @see Opinion  https://medium.com/dev-channel/why-authors-should-avoid-aria-relevant-5d3164fab1e3
   * @see Demo     http://pauljadam.com/demos/aria-atomic-relevant.html
   */
  "aria-relevant"?: PrimitivePropsWithRef<"div">["aria-relevant"] | undefined;
  /**
   * Children of your component. Children can be mirrored directly or modified to optimize for
   * screen reader user experience.
   */
  children: JSX.Element;
  /**
   * An optional unique identifier for the live region.
   *
   * By default, `Announce` components create, at most, two unique `aria-live` regions in the
   * document (one for all `polite` notifications, one for all `assertive` notifications). In some
   * cases you may wish to append additional `aria-live` regions for distinct purposes (for example,
   * simple status updates may need to be separated from a stack of toast-style notifications). By
   * passing an id, you indicate that any content rendered by components with the same identifier
   * should be mirrored in a separate `aria-live` region.
   */
  regionIdentifier?: string | undefined;
  /**
   * Mirrors the `role` DOM attribute. This is optional and may be useful as an override in some
   * cases. By default, the role is determined by the `type` prop.
   *
   * @see MDN https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions#Preferring_specialized_live_region_roles
   */
  role?: RegionRole | undefined;
  /**
   * Mirrors the `aria-live` DOM attribute. The `aria-live=POLITENESS_SETTING` is used to set the
   * priority with which screen reader should treat updates to live regions. Its possible settings
   * are: off, polite or assertive. Defaults to `polite`.
   *
   * @see MDN https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
   */
  type?: RegionType | undefined;
};

/** Renders an ARIA live region that announces its children to screen readers. */
const Announce: Component<AnnounceProps> = (props) => {
  const rest = omit(
    props,
    "aria-atomic",
    "aria-relevant",
    "children",
    "type",
    "role",
    "regionIdentifier",
    "ref",
  );

  const type = () => props.type ?? RegionType.Polite;
  const role = () => props.role ?? ROLES[type()];
  // Solid's DOM types only accept the string form, so normalize booleans (same rendered output).
  const ariaAtomicValue = (): "true" | "false" | undefined => {
    const value = props["aria-atomic"];
    if (value == null) return undefined;
    return value === true || value === "true" ? "true" : "false";
  };
  const ariaAtomic = () => ariaAtomicValue() === "true";
  const relevant = () => {
    const ariaRelevant = props["aria-relevant"];
    if (!ariaRelevant) return undefined;
    return Array.isArray(ariaRelevant) ? ariaRelevant.join(" ") : ariaRelevant;
  };

  // The region is appended to the root document node, which is usually the global `document` but
  // in some contexts may be another node. After the Announce element ref is attached, we set the
  // owner document to make sure we have the right root node. Refs run synchronously during mount,
  // so this is settled before the effects below run.
  let ownerDocument: Document = globalThis.document;
  let sourceElement: HTMLDivElement | undefined;
  const ref = composeRefs(props.ref, (node: HTMLDivElement | null) => {
    if (node) {
      sourceElement = node;
      ownerDocument = node.ownerDocument;
    }
  });

  const [region, setRegion] = createSignal<HTMLElement | undefined>();

  const getLiveRegionElement = () => {
    const regionConfig = {
      type: type(),
      role: role(),
      relevant: relevant(),
      id: props.regionIdentifier,
      atomic: ariaAtomic(),
    };
    const regionSelector = buildSelector(regionConfig);
    const element = ownerDocument.querySelector(regionSelector);
    return element ?? buildLiveRegionElement(ownerDocument, regionConfig);
  };

  createEffect(
    () => getLiveRegionElement(),
    (regionElement) => {
      setRegion(regionElement as HTMLElement);
    },
  );

  // In some screen reader/browser combinations, alerts coming from an inactive browser tab may be
  // announced, which is a confusing experience for a user interacting with a completely different
  // page. When the page visibility changes we'll update the `role` and `aria-live` attributes of
  // our region element to prevent that.
  // https://inclusive-components.design/notifications/#restrictingmessagestocontexts
  createEffect(
    // We need to hide `aria-live` regions via a global event listener, as noted in the comment
    // above. We only need one listener per region - each `Announce` does not necessarily generate
    // a unique live region element - so we track attached listeners in a map to skip the setup
    // after `Announce` is used again with a shared live region.
    () => getLiveRegionElement(),
    (regionElement) => {
      const documentNode = ownerDocument;

      function updateAttributesOnVisibilityChange() {
        regionElement.setAttribute("role", documentNode.hidden ? RegionRole.None : role());
        regionElement.setAttribute("aria-live", documentNode.hidden ? "off" : type());
      }

      const announceCount = listenerMap.get(regionElement) ?? 0;
      if (announceCount === 0) {
        documentNode.addEventListener("visibilitychange", updateAttributesOnVisibilityChange);
      }
      listenerMap.set(regionElement, announceCount + 1);

      return () => {
        const count = listenerMap.get(regionElement)! - 1;
        listenerMap.set(regionElement, count);
        if (count === 0) {
          documentNode.removeEventListener("visibilitychange", updateAttributesOnVisibilityChange);
        }
      };
    },
  );

  return (
    <>
      <Primitive.div {...rest} ref={ref} aria-atomic={ariaAtomicValue()}>
        {props.children}
      </Primitive.div>

      {/* portal into live region for screen reader announcements */}
      <Show when={region()}>
        {(regionElement) => <RegionMirror region={regionElement()} source={() => sourceElement} />}
      </Show>
    </>
  );
};

/* ---------------------------------------------------------------------------------------------- */

/**
 * Mirrors the rendered children into the live region.
 *
 * React re-renders the same `children` descriptor in both places; Solid children are live DOM
 * nodes, which can only be mounted once. So the mirror renders a clone and re-syncs it through a
 * `MutationObserver`, keeping both copies - and dynamic updates - in sync.
 */
const RegionMirror: Component<{
  region: Element;
  source: () => HTMLDivElement | undefined;
}> = (props) => {
  let mirror!: HTMLDivElement;

  const sync = () => {
    const origin = props.source();
    mirror.replaceChildren();
    if (origin) {
      for (const node of Array.from(origin.childNodes)) {
        mirror.appendChild(node.cloneNode(true));
      }
    }
  };

  onSettled(() => {
    sync();
    const origin = props.source();
    if (!origin) return;
    const observer = new MutationObserver(sync);
    observer.observe(origin, {
      childList: true,
      characterData: true,
      subtree: true,
      attributes: true,
    });
    return () => observer.disconnect();
  });

  return (
    <Portal container={props.region}>
      <div
        ref={(element) => {
          mirror = element;
        }}
      />
    </Portal>
  );
};

/* ---------------------------------------------------------------------------------------------- */

type LiveRegionOptions = {
  type: string;
  relevant?: string | undefined;
  role: string;
  atomic?: boolean | undefined;
  id?: string | undefined;
};

function buildLiveRegionElement(
  ownerDocument: Document,
  { type, relevant, role, atomic, id }: LiveRegionOptions,
) {
  const element = ownerDocument.createElement("div");
  element.setAttribute(getLiveRegionPartDataAttr(id), "");
  element.setAttribute(
    "style",
    "position: absolute; top: -1px; width: 1px; height: 1px; overflow: hidden;",
  );
  ownerDocument.body.appendChild(element);

  element.setAttribute("aria-live", type);
  element.setAttribute("aria-atomic", String(atomic || false));
  element.setAttribute("role", role);
  if (relevant) {
    element.setAttribute("aria-relevant", relevant);
  }

  return element;
}

function buildSelector({ type, relevant, role, atomic, id }: LiveRegionOptions) {
  // The identifier and attribute values are consumer-controlled: escape the
  // identifier segment and quote the values so selector-significant
  // characters (`:`, spaces in multi-token `aria-relevant`, …) match
  // literally instead of breaking `querySelector` (or matching the wrong
  // region). The element itself keeps the literal attribute name.
  return `[${escapeSelectorIdent(getLiveRegionPartDataAttr(id))}]${[
    ["aria-live", type],
    ["aria-atomic", atomic],
    ["aria-relevant", relevant],
    ["role", role],
  ]
    .filter(([, val]) => !!val)
    .map(([attr, val]) => `[${attr}="${escapeSelectorString(String(val))}"]`)
    .join("")}`;
}

/**
 * Escapes a CSS identifier segment without depending on the `CSS.escape`
 * global, which SSR runtimes and older DOM implementations may lack.
 */
function escapeSelectorIdent(value: string): string {
  return value.replace(/[^a-zA-Z0-9-_]/g, (character) => `\\${character}`);
}

/** Escapes a value interpolated into a double-quoted selector string. */
function escapeSelectorString(value: string): string {
  return value.replace(/["\\\n\r\f]/g, (character) => {
    if (character === "\n") return "\\a ";
    if (character === "\r") return "\\d ";
    if (character === "\f") return "\\c ";
    return `\\${character}`;
  });
}

function getLiveRegionPartDataAttr(id?: string) {
  return "data-radix-announce-region" + (id ? `-${id}` : "");
}

export {
  Announce,
  //
  Announce as Root,
};
export type { AnnounceProps };
