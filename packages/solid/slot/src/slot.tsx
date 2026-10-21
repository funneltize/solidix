import { children, createEffect, omit, onCleanup, untrack, type Component } from "solid-js";
import { DelegatedEvents, type JSX } from "@solidjs/web";
import { afterConnected, composeRefs, type Ref } from "@solidix/compose-refs";

/* -------------------------------------------------------------------------------------------------
 * Slot
 * -----------------------------------------------------------------------------------------------*/

type SlotProps<Elem extends Element = HTMLElement, Props = JSX.HTMLAttributes<Elem>> = Props & {
  children?: JSX.Element | undefined;
  ref?: Ref<Elem> | undefined;
};

/**
 * Targets marked by `Slottable`, shared across all slots (like Radix's
 * `Symbol.for('radix.slottable')` identifier).
 */
const slottableTargets = new WeakSet<Element>();

/** Creates a Slot component that merges its props onto its single child element. */
/* @__NO_SIDE_EFFECTS__ */ export function createSlot<
  Elem extends Element = HTMLElement,
  Props = JSX.HTMLAttributes<Elem>,
>(ownerName: string): Component<SlotProps<Elem, Props>> {
  const Slot: Component<SlotProps<Elem, Props>> = (props) => {
    const resolved = children(() => props.children);
    const rest = omit(props, "children", "ref");
    const ref = untrack(() => props.ref);

    // Fail fast on initial misuse, like Radix's render-time throw. Skipped
    // during SSR, where children cannot be inspected.
    if (typeof document !== "undefined") {
      untrack(() => findSlotTarget(resolved.toArray(), ownerName));
    }

    let currentTarget: Element | null = null;
    let previousNodes: ReadonlyArray<unknown> = [];
    // Props this slot applied to `currentTarget`, keyed by slot prop. Updates
    // apply in place from this record: changed values are written directly,
    // unchanged values are left untouched, and only removed keys are torn
    // down. A remove-then-reapply cycle would transiently drop focus for
    // `tabindex` (and churn listeners) on every reactive update.
    const applied = new Map<string, AppliedProp>();

    createEffect(
      () => ({ nodes: resolved.toArray(), slotProps: { ...rest } }),
      ({ nodes, slotProps }) => {
        const target = findSlotTarget(nodes, ownerName);

        if (target !== currentTarget) {
          if (currentTarget) {
            teardownSlotProps(currentTarget, applied);
            composeRefs(ref)(null);
          }
          currentTarget = target;
          if (target) {
            moveSlotSiblings(target, nodes);
            previousNodes = [...nodes];
            composeRefs(ref)(target as Elem);
          }
        } else if (target && !sameNodes(previousNodes, nodes)) {
          moveSlotSiblings(target, nodes);
          previousNodes = [...nodes];
        }

        if (target) syncSlotProps(target, applied, slotProps as Record<string, any>);
        // NOTE: no per-run cleanup. Returning one would tear down every
        // applied prop before each update - the transient removal this record
        // exists to avoid. Removed keys tear down inside `syncSlotProps`;
        // disposal tears down in `onCleanup` below.
        return undefined;
      },
    );

    onCleanup(() => {
      teardownSlotProps(currentTarget, applied);
      if (currentTarget) {
        composeRefs(ref)(null);
        currentTarget = null;
      }
    });

    return <>{resolved}</>;
  };

  return Slot;
}

/** Merges its props onto its single child element instead of rendering a wrapper. */
const Slot = createSlot("Slot");

/* -------------------------------------------------------------------------------------------------
 * Slottable
 * -----------------------------------------------------------------------------------------------*/

type SlottableChildrenProps = { children: JSX.Element };
type SlottableRenderFnProps = {
  child: JSX.Element;
  children: (childNodes: Node[]) => JSX.Element;
};

type SlottableProps = SlottableRenderFnProps | SlottableChildrenProps;

/** Creates a Slottable component that marks which child receives slotted props. */
/* @__NO_SIDE_EFFECTS__ */ export function createSlottable(
  ownerName: string,
): Component<SlottableProps> {
  const Slottable: Component<SlottableProps> = (props) => {
    const resolved = children(() => ("child" in props ? props.child : props.children));

    if (typeof document !== "undefined") {
      untrack(() => {
        const nodes = resolved.toArray();
        const element = nodes.length === 1 && nodes[0] instanceof Element ? nodes[0] : null;

        // NOTE: like Radix, the element form is a pure passthrough marker -
        // non-element children (eg. tooltip text) are fine and simply mark
        // nothing. A `Slot` that cannot find a target still throws via
        // `findSlotTarget`. Only the render-fn form requires its element.
        if ("child" in props) {
          if (!element) {
            throw new Error(createSlottableError(ownerName));
          }
          // NOTE: read the render fn exactly once - `props.children` is a
          // lazy getter and every read re-invokes it (see Presence).
          const renderFn = props.children as unknown;
          if (typeof renderFn === "function") {
            const current = Array.from(element.childNodes);
            const next = (renderFn as (childNodes: Node[]) => JSX.Element)(current);
            element.replaceChildren(...normalizeSlottableChildren(next));
          }
        }

        if (element) {
          slottableTargets.add(element);
        }
      });
    }

    return <>{resolved}</>;
  };

  return Slottable;
}

/** Marks which child of a Slot receives the slotted props. */
const Slottable = createSlottable("Slottable");

/* -------------------------------------------------------------------------------------------------
 * findSlotTarget
 * -----------------------------------------------------------------------------------------------*/

function findSlotTarget(nodes: ReadonlyArray<unknown>, ownerName: string): Element | null {
  const elements = nodes.filter((node): node is Element => node instanceof Element);

  for (const element of elements) {
    const tagged = findTagged(element);
    if (tagged) return tagged;
  }

  if (nodes.length === 1 && elements.length === 1) {
    return elements[0]!;
  }

  const hasContent = nodes.some(
    (node) => node !== null && node !== undefined && node !== false && node !== true,
  );
  if (!hasContent) {
    return null;
  }

  throw new Error(createSlotError(ownerName));
}

function findTagged(root: Element): Element | null {
  if (slottableTargets.has(root)) return root;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node = walker.nextNode();
  while (node) {
    if (slottableTargets.has(node as Element)) return node as Element;
    node = walker.nextNode();
  }
  return null;
}

function sameNodes(a: ReadonlyArray<unknown>, b: ReadonlyArray<unknown>): boolean {
  return a.length === b.length && a.every((node, index) => node === b[index]);
}

/* -------------------------------------------------------------------------------------------------
 * moveSlotSiblings
 * -----------------------------------------------------------------------------------------------*/

/**
 * Moves the slot's other top-level nodes into the target, preserving order:
 * the target's existing children stay at the target's position. Only `Node`
 * siblings are moved; raw text siblings are left in place.
 */
function moveSlotSiblings(target: Element, nodes: ReadonlyArray<unknown>): void {
  const parts: Node[] = [];
  for (const node of nodes) {
    if (node instanceof Element && (node === target || node.contains(target))) {
      parts.push(...Array.from(target.childNodes));
    } else if (node instanceof Node) {
      parts.push(node);
    }
  }

  const current = Array.from(target.childNodes);
  if (sameNodes(current, parts)) return;
  target.replaceChildren(...parts);
}

function normalizeSlottableChildren(value: unknown): Array<Node | string> {
  if (Array.isArray(value)) {
    return (value as unknown[]).flatMap(normalizeSlottableChildren);
  }
  if (typeof value === "function") {
    return normalizeSlottableChildren(untrack(value as () => unknown));
  }
  if (value instanceof Node || typeof value === "string") {
    return [value];
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }
  return [];
}

/* -------------------------------------------------------------------------------------------------
 * syncSlotProps
 * -----------------------------------------------------------------------------------------------*/

/**
 * What this slot applied for one slot prop, so updates can apply in place.
 * Child-wins checks run only on first application; later runs re-assert
 * owned values directly, which preserves the remove-then-reapply end state
 * (including clobbering child changes) without the transient removal.
 */
type AppliedProp =
  | { kind: "event"; fn: unknown; cleanup: () => void; settled: boolean }
  | { kind: "class"; owned: Set<string> }
  | { kind: "styleObject"; owned: Map<string, () => void> }
  | { kind: "styleText"; prev: string }
  | { kind: "describedby"; prev: string | null }
  | { kind: "prop"; prev: unknown }
  | { kind: "attr"; attr: string };

function teardownSlotProp(target: Element, key: string, record: AppliedProp): void {
  switch (record.kind) {
    case "event":
      record.cleanup();
      break;
    case "class":
      for (const token of record.owned) target.classList.remove(token);
      break;
    case "styleObject":
      for (const restore of record.owned.values()) restore();
      break;
    case "styleText":
      (target as HTMLElement).style.cssText = record.prev;
      break;
    case "describedby":
      if (record.prev === null) target.removeAttribute("aria-describedby");
      else target.setAttribute("aria-describedby", record.prev);
      break;
    case "prop":
      (target as unknown as Record<string, unknown>)[key] = record.prev;
      // Restoring the property can reflect back into the attribute (eg.
      // `type`); remove it so a later re-application doesn't mistake the
      // restored default for a child-set value.
      target.removeAttribute(key);
      target.removeAttribute(hyphenateAttr(key));
      break;
    case "attr":
      target.removeAttribute(record.attr);
      break;
  }
}

function teardownSlotProps(target: Element | null, applied: Map<string, AppliedProp>): void {
  if (target) {
    for (const record of [...applied].reverse()) {
      teardownSlotProp(target, record[0], record[1]);
    }
  }
  applied.clear();
}

/**
 * Applies slot props to an already-created element, mirroring Radix's
 * `mergeProps` semantics:
 *
 * - event handlers compose (the child's runs first - it was attached first)
 * - `class` tokens merge, `style` objects merge with the child winning,
 *   `aria-describedby` concatenates
 * - other attributes are only set when absent (child wins); DOM properties
 *   follow the same rule via attribute presence: an explicit attribute means
 *   the child wins, otherwise the slot value wins over the implicit DOM
 *   default (eg. `type="password"` over an input's implicit `"text"`); an
 *   explicit value matching the implicit default is still serialized as an
 *   attribute so the DOM matches a direct render
 *
 * Owned values update in place (a single write, never remove-then-reapply:
 * the intermediate removal drops focus for `tabindex`); unchanged values
 * are left untouched; only keys missing from the new props are torn down.
 */
function syncSlotProps(
  target: Element,
  applied: Map<string, AppliedProp>,
  slotProps: Record<string, any>,
): void {
  const seen = new Set<string>();
  for (const key of Object.keys(slotProps)) {
    const value = slotProps[key];
    // Prototype-chain keys are never valid DOM props: `key in target` matches
    // them via inheritance and the alias-table read below would resolve
    // inherited members (`__proto__` reads as `Object.prototype`), crashing
    // `setAttribute` and halting the reactive queue. Skip them outright.
    if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
    if (value === undefined || value === null || key === "children") continue;
    seen.add(key);
    syncOneSlotProp(target, applied, key, value);
  }
  for (const [key, record] of applied) {
    if (!seen.has(key)) {
      teardownSlotProp(target, key, record);
      applied.delete(key);
    }
  }
}

// Tears down an owned record whose value changed shape across runs (eg.
// `style` flipped between object and string), so the branch below applies
// fresh. Returns the owned record when it already has the expected kind.
function takeOwned<K extends AppliedProp["kind"]>(
  target: Element,
  applied: Map<string, AppliedProp>,
  key: string,
  kind: K,
): Extract<AppliedProp, { kind: K }> | undefined {
  const record = applied.get(key);
  if (!record) return undefined;
  if (record.kind !== kind) {
    teardownSlotProp(target, key, record);
    applied.delete(key);
    return undefined;
  }
  return record as Extract<AppliedProp, { kind: K }>;
}

function syncOneSlotProp(
  target: Element,
  applied: Map<string, AppliedProp>,
  key: string,
  value: any,
): void {
  if (typeof value === "function" && /^on[A-Z]/.test(key)) {
    const record = takeOwned(target, applied, key, "event");
    if (record && record.fn === value) {
      // A record attached while disconnected waits on a MutationObserver
      // that resolves only on a later mutation; when the target is connected
      // now, re-attach through the sync fast-path instead of waiting for it.
      if (!record.settled && target.isConnected) {
        teardownSlotProp(target, key, record);
        applied.delete(key);
      } else {
        return;
      }
    } else if (record) {
      teardownSlotProp(target, key, record);
      applied.delete(key);
    }
    applied.set(key, attachSlotEvent(target, key, value));
    return;
  }

  if (key === "class") {
    const tokens = String(value).split(/\s+/).filter(Boolean);
    const record = takeOwned(target, applied, key, "class");
    if (!record) {
      const owned = new Set<string>();
      for (const token of tokens) {
        if (!target.classList.contains(token)) {
          target.classList.add(token);
          owned.add(token);
        }
      }
      applied.set(key, { kind: "class", owned });
      return;
    }
    const wanted = new Set(tokens);
    for (const token of record.owned) {
      if (!wanted.has(token)) {
        target.classList.remove(token);
        record.owned.delete(token);
      }
    }
    for (const token of wanted) {
      if (!target.classList.contains(token)) {
        target.classList.add(token);
        record.owned.add(token);
      }
    }
    return;
  }

  if (key === "style" && typeof value === "object") {
    const record = takeOwned(target, applied, key, "styleObject");
    const style = (target as HTMLElement).style;
    const fields = style as unknown as Record<string, string>;
    const applyStyleKey = (owned: Map<string, () => void>, styleKey: string): void => {
      if (styleKey === "__proto__" || styleKey === "constructor" || styleKey === "prototype") {
        return;
      }
      if (owned.has(styleKey)) {
        // Owned: re-assert in place (no transient restore).
        if (styleKey.includes("-")) style.setProperty(styleKey, value[styleKey]);
        else fields[styleKey] = value[styleKey];
      } else if (styleKey.includes("-")) {
        if (!style.getPropertyValue(styleKey)) {
          style.setProperty(styleKey, value[styleKey]);
          owned.set(styleKey, () => style.removeProperty(styleKey));
        }
      } else if (!fields[styleKey]) {
        const prevValue = fields[styleKey];
        fields[styleKey] = value[styleKey];
        owned.set(styleKey, () => {
          fields[styleKey] = prevValue;
        });
      }
    };
    if (!record) {
      const owned = new Map<string, () => void>();
      for (const styleKey of Object.keys(value)) applyStyleKey(owned, styleKey);
      applied.set(key, { kind: "styleObject", owned });
      return;
    }
    const seen = new Set<string>();
    for (const styleKey of Object.keys(value)) {
      seen.add(styleKey);
      applyStyleKey(record.owned, styleKey);
    }
    for (const [styleKey, restore] of record.owned) {
      if (!seen.has(styleKey)) {
        restore();
        record.owned.delete(styleKey);
      }
    }
    return;
  }

  if (key === "style" && typeof value === "string") {
    const record = takeOwned(target, applied, key, "styleText");
    const style = (target as HTMLElement).style;
    // Rebuild from the original base in a single write: same end state as
    // restore-then-append, with no transient removal in between.
    const base = record ? record.prev : style.cssText;
    style.cssText = base + (base && !base.endsWith(";") ? ";" : "") + value;
    if (!record) applied.set(key, { kind: "styleText", prev: base });
    return;
  }

  if (key === "aria-describedby" && typeof value === "string") {
    const record = takeOwned(target, applied, key, "describedby");
    // Recompute from the original base in a single write: same end state as
    // restore-then-concatenate, with no transient removal in between.
    const base = record ? record.prev : target.getAttribute(key);
    target.setAttribute(key, concatAriaDescribedby(base, value) ?? "");
    if (!record) applied.set(key, { kind: "describedby", prev: base });
    return;
  }

  if (key in target) {
    const record = takeOwned(target, applied, key, "prop");
    if (record) {
      if (value === false) {
        // Removing: teardown restores the previous value (a re-application
        // would skip a `false` value, same as the attribute branch).
        teardownSlotProp(target, key, record);
        applied.delete(key);
      } else {
        // Owned: write the new value directly. The record keeps the original
        // prev (a remove-then-reapply cycle would re-capture the restored
        // original each run, so this matches without the transient).
        (target as unknown as Record<string, unknown>)[key] = value;
      }
      return;
    }
    const prev = (target as unknown as Record<string, unknown>)[key];
    if (isComplexIDLValue(prev)) {
      // Complex IDL values (eg. SVG `viewBox`, an `SVGAnimatedRect`) are
      // always truthy and often read-only: setting the property is wrong,
      // and skipping would drop the default. Fall through to the attribute.
      applyFreshSlotAttribute(target, applied, key, value);
    } else if (value === false) {
      // Removing: nothing to apply (matches the attribute branch).
    } else if (hasAttrAnySpelling(target, key)) {
      // The child set this explicitly: child wins.
    } else if (
      prev === value &&
      (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    ) {
      // The explicit value matches the implicit IDL default (eg.
      // `type="submit"` on a `<button>`): the property is already correct,
      // but serialize the attribute so the DOM matches a direct render.
      applyFreshSlotAttribute(target, applied, key, value);
    } else {
      // No explicit attribute: the current value is an implicit DOM default
      // (eg. `type="text"` on an `<input>`), so the slot's explicit value
      // wins, matching Radix `mergeProps` where the child declared no such
      // prop - including falsy-but-meaningful values like `0` or `""`.
      (target as unknown as Record<string, unknown>)[key] = value;
      applied.set(key, { kind: "prop", prev });
    }
    return;
  }

  const record = takeOwned(target, applied, key, "attr");
  if (record) {
    if (value === false) {
      teardownSlotProp(target, key, record);
      applied.delete(key);
    } else {
      // Owned: the attribute stays present throughout the update, so focus
      // (`tabindex`) and child-wins re-checks elsewhere never see it missing.
      target.setAttribute(record.attr, value === true ? "" : String(value));
    }
    return;
  }
  applyFreshSlotAttribute(target, applied, key, value);
}

/**
 * First application of an attribute-form prop: set only when absent (child
 * wins), and record the resolved attribute name for in-place updates.
 */
function applyFreshSlotAttribute(
  target: Element,
  applied: Map<string, AppliedProp>,
  key: string,
  value: unknown,
): void {
  if (hasAttrAnySpelling(target, key)) {
    return;
  }
  if (value === false) return;
  // SVG attributes are case-sensitive (`viewBox`, not `view-box`), so keep
  // the authored spelling; HTML attributes hyphenate, except for the known
  // lowercase aliases (`tabIndex` is handled via the IDL property and never
  // reaches here).
  const attr = target instanceof SVGElement ? key : (attrAlias(key) ?? hyphenateAttr(key));
  target.setAttribute(attr, value === true ? "" : String(value));
  applied.set(key, { kind: "attr", attr });
}

function attachSlotEvent(
  target: Element,
  key: string,
  value: (...args: never[]) => unknown,
): AppliedProp {
  let name = key.slice(2).toLowerCase();
  let capture = false;
  if (name.endsWith("capture")) {
    capture = true;
    name = name.slice(0, -"capture".length);
  }
  let cleanup: () => void;
  // `afterConnected` runs synchronously exactly when the target is connected;
  // otherwise the listener is still pending behind a MutationObserver. Direct
  // attaches settle immediately (they work on detached nodes too).
  let settled = true;
  if (!capture && DelegatedEvents.has(name)) {
    settled = target.isConnected;
    // Solid delegates this event to the document, where the child's
    // handler runs. Attach there (after the delegation master) so the
    // child's handler runs first, matching Radix's composition order.
    // The target may not be connected yet (slotted children resolve
    // lazily), in which case its `ownerDocument` can be a detached
    // template document; wait for insertion and re-read it then.
    cleanup = afterConnected(target, () => {
      const doc = target.ownerDocument ?? document;
      const listener = (event: Event) => {
        const path =
          typeof event.composedPath === "function" ? event.composedPath() : [event.target];
        if (path.includes(target)) {
          // Proxy so `currentTarget` reads as the slotted element, exactly
          // as if the listener were attached there.
          (value as EventListener)(
            new Proxy(event, {
              // NOTE: no `receiver` passthrough - Event IDL getters throw
              // ("Illegal invocation") when `this` is not a real Event.
              get(other, property) {
                if (property === "currentTarget") return target;
                const resolved = Reflect.get(other, property);
                if (typeof resolved !== "function") return resolved;
                const descriptor = Reflect.getOwnPropertyDescriptor(other, property);
                // Non-configurable own methods (eg. jsdom legacy events)
                // must be returned as-is (proxy invariant); they don't rely
                // on dynamic `this`.
                if (descriptor && !descriptor.configurable) return resolved;
                return resolved.bind(other);
              },
            }),
          );
        }
      };
      doc.addEventListener(name, listener);
      return () => doc.removeEventListener(name, listener);
    });
  } else {
    target.addEventListener(name, value as EventListener, capture);
    cleanup = () => target.removeEventListener(name, value as EventListener, capture);
  }
  return { kind: "event", fn: value, cleanup, settled };
}

function isComplexIDLValue(value: unknown): boolean {
  return (typeof value === "object" && value !== null) || typeof value === "function";
}

function hyphenateAttr(key: string): string {
  return key.replace(/[A-Z]/g, (part) => `-${part.toLowerCase()}`);
}

function hasAttrAnySpelling(target: Element, key: string): boolean {
  const aliased = attrAlias(key);
  return (
    target.hasAttribute(key) ||
    target.hasAttribute(hyphenateAttr(key)) ||
    (aliased !== undefined && target.hasAttribute(aliased))
  );
}

/**
 * React-cased prop names whose HTML attribute is lowercase rather than
 * hyphenated (`setAttribute` lowercases but never hyphenates, so these need
 * explicit mapping). Everything else hyphenates (`acceptCharset` is already
 * correct as `accept-charset`).
 */
/**
 * Prototype-safe alias read: inherited members (`toString`, …) must not
 * resolve, or the inherited value would be passed to `setAttribute` as the
 * attribute name and throw.
 */
function attrAlias(key: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(HTML_ATTR_ALIASES, key)
    ? HTML_ATTR_ALIASES[key]
    : undefined;
}

const HTML_ATTR_ALIASES: Record<string, string> = {
  autoCapitalize: "autocapitalize",
  autoComplete: "autocomplete",
  autoFocus: "autofocus",
  autoPlay: "autoplay",
  colSpan: "colspan",
  contentEditable: "contenteditable",
  crossOrigin: "crossorigin",
  dateTime: "datetime",
  encType: "enctype",
  formNoValidate: "formnovalidate",
  htmlFor: "for",
  maxLength: "maxlength",
  minLength: "minlength",
  noValidate: "novalidate",
  readOnly: "readonly",
  rowSpan: "rowspan",
  srcSet: "srcset",
  useMap: "usemap",
};

// TODO: Move to primitive once that package exposed individual sub-modules
function concatAriaDescribedby(...values: unknown[]): string | undefined {
  const ids = new Set<string>();
  for (const value of values) {
    if (typeof value !== "string") continue;
    for (const id of String(value).trim().split(/\s+/)) {
      if (id) ids.add(id);
    }
  }

  return ids.size > 0 ? Array.from(ids).join(" ") : undefined;
}

const createSlotError = (ownerName: string) => {
  return `${ownerName} failed to slot onto its children. Expected a single element child or \`Slottable\`.`;
};

const createSlottableError = (ownerName: string) => {
  return `${ownerName} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single element child.`;
};

/* -----------------------------------------------------------------------------------------------*/

export {
  Slot,
  Slottable,
  //
  Slot as Root,
};
export type { SlotProps };
