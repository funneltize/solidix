# @solidix/frosted

Styled component library for Solid 2, ported from [frosted-ui](https://github.com/frosted-ui) (pinned upstream commit `56787900bfe0`). Where the headless `@solidix/*` primitives ship unstyled, frosted ships theme tokens plus styled components with `fui-*` classes: Wave 1 typography (text, headings, links, code, blockquotes, kbd, separators, skeletons, spinners), Wave 2 form controls (buttons, text fields, text areas, number fields, selects, checkboxes, radio groups, switches, sliders, fields, fieldsets, forms, OTP fields), Wave 3 overlays (dialog, alert-dialog, drawer, popover, tooltip, hover-card, dropdown-menu, context-menu, lightbox), Wave 4 navigation and data display (tabs, tabs-nav, segmented-control family, breadcrumbs, scroll-area, progress, circular-progress, data-list, table, card, badge, callout, avatar with group/stack, scroll-gallery), and Wave 5 complex and remainder (strong, shine, empty-state, portal, visually-hidden, filter-chip, country-flag, stacked-horizontal-bar-chart, widget-stack, accordion, credit-card, bot-avatar). Not ported: sheet, toast, combobox, autocomplete, calendar, date-picker, date-range-picker (see below).

## Usage

```tsx
import { Theme, Heading, Text, Link, Code, Separator, Spinner } from "@solidix/frosted";
import "@solidix/frosted/styles.css";

export default () => (
  <Theme accentColor="blue" grayColor="gray" appearance="light">
    <Heading size="6">Hello, Solid</Heading>
    <Text size="3">
      Read the <Link href="#">docs</Link> and press <Code>Ctrl K</Code>.
    </Text>
    <Separator size="2" />
    <Spinner size="2" />
  </Theme>
);
```

Wrap your app in `Theme` so tokens, color scales, and the `frosted-ui` root class are present; import `styles.css` (full theme) or `styles.lite.css` (tokens only, bring your own component CSS).

```tsx
import { Button, Checkbox, Field, Fieldset, Form, Select, TextField } from "@solidix/frosted";

export default () => (
  <Form>
    <Fieldset.Root>
      <Fieldset.Legend>Profile</Fieldset.Legend>
      <Field.Root name="name">
        <Field.Label>Name</Field.Label>
        <Field.Control>
          <TextField.Root size="2">
            <TextField.Input placeholder="Ada Lovelace" />
          </TextField.Root>
        </Field.Control>
      </Field.Root>
      <Field.Root name="role">
        <Field.Label>Role</Field.Label>
        <Field.Control>
          <Select.Root>
            <Select.Trigger placeholder="Pick a role" />
            <Select.Content>
              <Select.Item value="admin">Admin</Select.Item>
              <Select.Item value="editor">Editor</Select.Item>
            </Select.Content>
          </Select.Root>
        </Field.Control>
      </Field.Root>
      <Checkbox defaultChecked>Subscribe to updates</Checkbox>
      <Button type="submit">Save</Button>
    </Fieldset.Root>
  </Form>
);
```

## Solid API mapping

Props stay close to frosted-ui names, adapted to Solid conventions: `className` becomes `class`, `children` is the `children` prop, event props are `onX`. Components with headless behavior (`Separator`) wrap the matching `@solidix/*` primitive. Styled-only wrappers (`Em`, `Quote`) take plain element props. See the [Composition guide](http://localhost:5193/#/guides/composition) for `render`-prop element swapping on `Separator`, which mirrors upstream Base UI `useRender`.

Docs-site route: `#/docs/frosted`.

## Differences from frosted-ui

- Slot (`render` prop) merges parent props onto the child imperatively; child wins for `class`/`style`, handlers run child-first then parent (see `@solidix/slot`).
- `Separator` wraps `@solidix/separator` instead of Base UI; `role`, `aria-orientation`, and `data-orientation` travel with the merged props and explicit caller props still win.
- `Skeleton` avatar size/shape are inline props (default size `3`, circle); upstream reads these from a sibling `avatar.props.ts` that does not exist at the pinned commit.
- `Spinner` with `loading={false}` renders children bare with no wrapper; a bare spinner renders when `loading` is true without children.
- `Inset` applies no margins and is non-responsive, matching upstream source.
- Upstream `useLayoutEffect` ports to `onSettled`; there is no `asChild`, contexts render as their own provider (`<Ctx value={...}>`).
- Form controls wrap the matching `@solidix/*` headless primitives (`Button`/`IconButton` over base-button, `Checkbox`, `RadioGroup`, `RadioButtonGroup`, `Switch`, `Slider`, `Select`, `NumberField`, `TextField`, `TextArea`, `OTPField`, `Field`, `Fieldset`, `Form`); controlled/uncontrolled state flows through `@solidix/use-controllable-state`.
- `Form` is a thin styled wrapper over `@solidix/form`: upstream `errors` / `actionsRef.validate()` / `validationMode` / `onFormSubmit(values)` have no headless equivalent, so use `onSubmit` with native form validity.
- `OTPField` renders one real `<input>` per slot with the native caret instead of upstream `input-otp` render-prop slots and the fake caret; `data-otp-active` tracks the focused slot.
- Upstream `label` does not exist at the pinned commit (`Field.Label` covers labelling); upstream `date-field` is not ported because its `react-aria-components` date primitives and the `calendar` dependency it shares `MappedDateValue` with have no Solidix equivalent.
- Overlay triggers and close buttons (`Dialog`, `AlertDialog`, `Drawer`, `Popover`, `Tooltip`, `HoverCard`, `DropdownMenu`, `ContextMenu`, `Lightbox` action parts) always merge onto their single child element via `@solidix/slot` (dialog precedent); contents render default elements. There is no optional `asChild` prop on overlay parts.
- `Tooltip` is a single convenience component (`content` rendered as `Text` in the popup); `TooltipProvider` stays separate and opt-in, same as upstream. Trigger-level `closeDelay`, `disabled`, `trackCursorAxis`, `actionsRef`, and `onOpenChangeComplete` have no headless equivalent and are dropped; `delay` maps to `delayDuration`.
- `HoverCard` delays live on the root (`openDelay` 200, `closeDelay` 150, from the upstream trigger defaults); upstream `handle` / `payload` are dropped with the Base UI handle API.
- `DropdownMenu` and `ContextMenu` inline the upstream `base-menu.css` with Base UI state attributes bridged to the Radix data attributes the headless layer emits; submenu content inherits size/color/variant from its parent through context. Frosted wrappers read `props.children` raw exactly once (never through a `children()` memo), so nested parts set up under the headless providers and keep menu context.
- `Lightbox` has no headless base and is ported as a custom compound (`Root`, `Trigger`, `Content`, `Close`, `ItemGroup`, `Item`, `Previous`, `Next`, `Counter`, `Caption`, `ThumbnailGroup`, `Thumbnail`, `Zoom`, `ZoomIn`, `ZoomOut`). Zoom is simplified (double-click toggle, keyboard, buttons; no pinch, wheel zoom, pan, or zoom animation hooks) and pull-to-dismiss is a simplified damped drag. `onOpenChangeComplete` fires on a microtask after settle rather than after the exit animation. There is no `LightboxOverlay` element and no `items`/`renderItem` API upstream; the port follows the backdrop-plus-dialog structure and explicit-index item registration.
- Wave 4 navigation parts wrap the matching `@solidix/*` headless primitives (`Tabs` over tabs, `TabsNav` over navigation-menu, `SegmentedControl` over tabs, `SegmentedControlNav` over navigation-menu, `SegmentedControlRadioGroup` over radio-group, `ScrollArea` over scroll-area, `Progress` over progress, `Avatar` over avatar); `DataList`, `Table`, `Card`, `Badge`, and `Callout` are styled-only compounds over native elements.
- `Breadcrumbs` items register in mount order instead of upstream's React `Children.map` order; suspended and dropdown-trigger items stay buttons, and the collapsed dropdown opens on pointer down.
- `DataList` guards the trim class when `trim` is unset; upstream emits a bogus `fui-r-lt-undefined` class in that case.
- `Table` numeric cell widths normalize to `px` strings (Solid keeps numbers unitless on `style`); intrinsic `style`/`align`/`width` conflicts resolve in favor of the frosted props.
- `CircularProgress` full-ring dash attributes differ textually from upstream (identical rendering) to satisfy Solid SVG typing.
- `SegmentedControlRadioGroup` values are strings only (upstream is generic); `SegmentedControlNav` drops the upstream link render prop, which has no headless equivalent.
- `ScrollArea` sets no viewport `tabIndex` (native focusable-scroller behavior applies) and its scrollbars carry no `scrollbar` role; the viewport is the assistive-tech surface, same as the headless layer.
- `Avatar` string fallbacks render as initials; the fallback prop is typed as `JSX.Element`.
- `ScrollGallery` has no headless base and is ported as a custom compound (`Root`, `Viewport`, `Item`, `Previous`, `Next`, `ScrollMarkerGroup`, `ScrollMarker`) with the upstream scroll math, marker locking, and keyboard behavior intact. Base UI `render` polymorphism maps to the `render` prop (element form via `@solidix/slot`, function form receiving props and state); the imperative `scrollTo` handle arrives through the root `ref`. The upstream `fui-ScrollGalleryViewport` CSS only sets `scroll-behavior`, so consumers provide the overflow and item sizing themselves.
- Wave 5 `Accordion` bridges upstream array value semantics onto the headless single/multiple accordion (single mode stays collapsible); `FilterChip` wraps the headless checkbox with bridged `data-checked`/`data-unchecked`. `WidgetStack`, `ScrollGallery`'s sibling carousel, is custom logic with the autoplay ping-pong, intersection ratios, and disabled flags intact; the upstream `console.log` in its scroller and the dead `Stack` render-prop spread are dropped in favor of a working `render` prop, and compound parts forward refs (upstream relies on React 19 spread-through).
- `Tabs`, `SegmentedControl`, and `SegmentedControlRadioGroup` bridge the selected value onto Base UI's `data-selected` / `data-checked` attributes (the frosted CSS targets those, not the headless `data-state`); `Accordion` mirrors the expanded values to pass `hidden` on closed `keepMounted` panels and `data-panel-open` on open triggers (Base UI `Panel` parity).
- Inputs composed inside `Field.Root` (`TextField`, `Field.Control`, and the rest) get no automatic id/name wiring yet; upstream Base UI links them through field context. `Field.Control` carries `fui-FieldControl` for parity (unstyled upstream too: canonical usage composes `TextField` inside `Field.Root`).
- `CreditCard` has no headless base and is ported as a custom compound (faces, trigger, face slots, brand logos, fieldset, fields, inputs) with brand detection via `credit-card-type` (pinned `10.1.2`, matching upstream's lockfile). Card fields reuse the extracted `useFieldRootState` hook under the card class instead of `fui-FieldRoot`; number/expiry inputs format on `input` events and fire the consumer `onChange` per keystroke (React `onChange` parity). `useCreditCard` returns accessors for the reactive values (Solid adaptation of the upstream plain values).
- `BotAvatar` has no headless base and is ported as custom logic (identity hash, expression catalogue, face fit, gaze priority, pointer tracking, imperative handle) with the support modules verbatim. Reactive hook values are accessors; the root forwards a `ref` (upstream drops it).
- `StackedHorizontalBarChart` self-provides a `TooltipProvider` (the headless tooltip requires one; upstream Base UI tooltips stand alone), so segment tooltips work with no setup. `Portal` narrows `container` to `Element` (Solid portals cannot mount fragments).
- Not ported (blocked on missing foundations, same as Wave 2 `date-field`): `sheet` (needs `vaul-base` drag physics), `toast` (needs the Base UI imperative toast-manager architecture; the headless toast is declarative with no manager), `combobox`/`autocomplete` (Base UI primitives with no headless equivalent; Radix itself has no combobox), and `calendar`/`date-picker`/`date-range-picker` (need the `@react-aria`/`@react-stately` date stack). Their CSS ships only when the components do.
