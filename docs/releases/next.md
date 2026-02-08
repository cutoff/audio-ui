# Release notes (next release)

Notes for the upcoming release. Use this when updating the documentation site or planning client app upgrades.

---

## Raster components – dark mode support

Optional dark-mode variants are supported for all raster assets (filmstrips, images, and slider cursors). When a dark variant is provided, the library switches between light and dark assets based on the current theme, with **no JavaScript**: visibility is controlled by CSS (`.dark` class and/or `prefers-color-scheme: dark`). This keeps behavior predictable and avoids extra re-renders or observers.

### Summary

| Area                             | Prop(s)                                   | Behavior                                             |
| -------------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| Filmstrip controls               | `imageDarkHref`                           | Optional dark filmstrip; same frame layout as light. |
| Image knob / Image rotary switch | `imageDarkHref`                           | Optional dark image for the rotary asset.            |
| Image switch                     | `imageHrefFalseDark`, `imageHrefTrueDark` | Optional dark images for off and on states.          |
| Slider cursor                    | `cursorImageDarkHref`                     | Optional dark image for the raster cursor.           |

If a dark prop is omitted, the light asset is used in both themes. All new props are optional; existing usage remains valid.

### Components and props

**Filmstrip-based controls** (`FilmStripContinuousControl`, `FilmStripDiscreteControl`, `FilmStripBooleanControl`)

- **`imageDarkHref`** (optional) – URL of the dark-mode filmstrip. Must match the light filmstrip in frame count, dimensions, and orientation.

**Image knob and image rotary switch** (`ImageKnob`, `ImageRotarySwitch`)

- **`imageDarkHref`** (optional) – URL of the dark-mode image (same semantics as the main knob/switch image).

**Image switch** (`ImageSwitch`)

- **`imageHrefFalseDark`** (optional) – URL of the dark-mode image for the “off” state.
- **`imageHrefTrueDark`** (optional) – URL of the dark-mode image for the “on” state.

**Slider** (`Slider`)

- **`cursorImageDarkHref`** (optional) – URL of the dark-mode image for the raster cursor. Only has effect when `cursorImageHref` is set.

### Theme detection

- **Class-based**: When the document root has the `.dark` class (e.g. from a theme toggle), dark assets are shown.
- **System preference**: If the root does not have `.dark`, `prefers-color-scheme: dark` is used so dark assets can still be shown when the OS is in dark mode.

CSS classes used internally: `audioui-image-light` and `audioui-image-dark`. Do not rely on these in app code; use the component props instead.

### Documentation updates

- Document the new optional props on each component’s API page.
- Add examples that pass both light and dark URLs (and, if useful, one example with only light URLs to show unchanged behavior).
- Mention that light and dark filmstrips must have the same frame layout (dimensions, count, orientation).

### Client app upgrades

- **No breaking changes.** Existing code continues to work; dark props are optional.
- To support dark mode: add the corresponding `*Dark*` prop(s) with URLs for dark assets. Ensure the host app applies `.dark` on the document root when the user selects dark theme, if you want class-based switching; otherwise system preference alone will drive the switch.

---

## Accessibility

ARIA coverage and consistency have been improved across controls, and a11y is enforced by lint and automated tests.

### ARIA and roles

- **Continuous controls (Knob, Slider)**
  Slider role now exposes full range and orientation: `aria-valuemin`, `aria-valuemax` (from the parameter), and `aria-orientation` (horizontal/vertical). When a `disabled` prop is used, `aria-disabled` is forwarded and the control is removed from the tab order.
  **New optional prop**: `ariaOrientation` on continuous control props (used by `Slider`; Knob omits it for radial semantics).

- **Discrete controls (CycleButton)**
  Spinbutton role now exposes option range: `aria-valuenow` (current option index), `aria-valuemin` (0), `aria-valuemax` (options.length − 1), in addition to existing `aria-valuetext` and `aria-label`.

- **Keys**
  The keyboard container has `role="group"` and an accessible name.
  **New optional prop**: `ariaLabel` (default `"Piano keyboard"`) on `Keys`.
  **AdaptiveBox**: optional `role` and `aria-label` props are supported for components that wrap it (e.g. Keys).

### Tooling and tests

- **ESLint**: `eslint-plugin-jsx-a11y` is enabled with recommended rules for all `.tsx`/`.jsx` files (monorepo root config).
- **Tests**: The React package uses `jest-axe`; `expect` is extended with `toHaveNoViolations`. New `accessibility.test.tsx` runs axe on Button, Knob, Slider, CycleButton, and Keys (with labels/options so controls are valid for axe).

### Documentation

- `packages/react/docs/interaction-system.md` – Styling & Accessibility section updated to describe the ARIA attributes and Keys container role/label.

### Client app upgrades

- **No breaking changes.** New props (`ariaLabel` on Keys, `ariaOrientation` on continuous controls) are optional. Existing usage is unchanged.
- To customize the Keys region name for screen readers, set the `ariaLabel` prop on `Keys`.

---

## Theming – typography variables and default font

Typography is controlled by CSS variables; the default stylesheet includes a default font (Oxanium). Apps can override variables or use a no-font stylesheet.

### Default font and stylesheet entry points

- **Default stylesheet** – Import `@cutoff/audio-ui-react/style.css` (or the default entry from the package). It includes the default font (Oxanium) via `@font-face` (Google Fonts) and sets `--audioui-font-family: "Oxanium", sans-serif`. One import gives a complete look out of the box.
- **No-font stylesheet** – For apps that supply their own font, import `@cutoff/audio-ui-react/style-no-font.css` instead. Then set `--audioui-font-family` (e.g. on `body`) and adjust `--audioui-font-size` (and optionally `--audioui-font-weight`) if your font metrics differ. The library does not load Oxanium when using this entry point.
- **Package-level CSS** – The library’s default styles are pulled in from the package main entry (`index.ts`), not from a single component. Both `style.css` and `style-no-font.css` are emitted by the React package build.

Core package (`@cutoff/audio-ui-core`) exposes `fonts.css` (Oxanium `@font-face`) and `styles-with-font.css` (fonts + themes + styles) for custom build setups; most apps use the React package’s prebuilt `style.css` or `style-no-font.css`.

### Typography variables (breaking change and new)

- **Breaking**: **`--audioui-default-font-size`** has been renamed to **`--audioui-font-size`**. If your app overrides the default font size via this variable, use `--audioui-font-size` (value unchanged, e.g. `14px`).
- **New**: **`--audioui-font-weight`** – Controls the font weight applied to the library root (`.audioui`). Initial value: `500`. Override to change the default weight (e.g. `400`, `600`).

### Constants

- In `@cutoff/audio-ui-core`, `CSS_VARS.defaultFontSize` has been renamed to `CSS_VARS.fontSize`.
- **`CSS_VARS.fontWeight`** has been added for `--audioui-font-weight`.

No library code referenced `defaultFontSize`; if your app did, switch to `fontSize`.

### Documentation

- Root AGENTS.md and `agents/audioui-styling-system.md` describe typography variables (`--audioui-font-family`, `--audioui-font-size`, `--audioui-font-weight`) and the two CSS entry points.
- README documents default `style.css` (with font) and `style-no-font.css` (opt-out, set `--audioui-font-family` and sizing as needed).

### Client app upgrades

- **Breaking**: Replace any override of `--audioui-default-font-size` with `--audioui-font-size`.
- **Default font**: To use the library default look, import `@cutoff/audio-ui-react/style.css` once; no need to load Oxanium separately. To use your own font, import `@cutoff/audio-ui-react/style-no-font.css` and set `--audioui-font-family` (and sizing if needed).
- Optional: Set `--audioui-font-weight` to customize default weight.

---

## Size system – Root Phi scale and base unit

The size scale is re-anchored so that **normal = 1.0** (1× base unit) and uses a **Root Phi (√φ)** scale for consistent steps. The default base unit is **96px** (previously 48px).

### Summary

| Change       | Before                        | After                                     |
| ------------ | ----------------------------- | ----------------------------------------- |
| Base unit    | `--audioui-unit: 48px`        | `--audioui-unit: 96px`                    |
| Scale anchor | normal = 1.5× unit            | normal = 1× unit                          |
| Multipliers  | Linear (1, 1.25, 1.5, 2, 2.5) | Root Phi (0.618, 0.786, 1, 1.272, 1.618)  |
| xsmall       | 1× unit (special-cased)       | 0.618× unit (same formula as other sizes) |

**Root Phi**: φ ≈ 1.618, √φ ≈ 1.272. Multipliers: xsmall 1/φ, small 1/√φ, normal 1, large √φ, xlarge φ. Consecutive steps differ by √φ.

### Physical sizes (default, square components)

With `--audioui-unit: 96px`: xsmall ≈ 59px, small ≈ 75px, normal = 96px, large ≈ 122px, xlarge ≈ 155px. Sliders and Keys scale by the same multipliers (aspect ratios unchanged).

### Breaking changes and upgrades

- **Physical sizes change.** Components at each named size (xsmall, normal, large, etc.) render at different pixel dimensions than before. If your app relies on exact pixel sizes or fixed layouts (e.g. absolute px for surrounding UI), recalculate or use `adaptiveSize={true}` / custom CSS.
- **Base unit.** If you override `--audioui-unit`, note the new default is 96px. To approximate the old "normal" (72px) you could set `--audioui-unit: 72px` (then normal = 72px with the new scale).
- **xsmall.** xsmall no longer equals 1× base unit; it is 0.618× unit. All five sizes now use `calc(var(--audioui-unit) * var(--audioui-size-mult-{size}))`.

### Documentation

- `packages/react/docs/size-system.md` – Base unit 96px, Root Phi scale, normal = 1.0, and unified multiplier formula.
- Root AGENTS.md – Size system table updated with new multipliers and base unit.

---

## Size system – Component type API (1×1 controls)

The size utility API uses a single component type **`"square"`** for all 1×1 aspect-ratio components (Button, Knob, CycleButton), instead of separate `"knob"` and `"button"` types.

### Summary

| API             | Before                                     | After                            |
| --------------- | ------------------------------------------ | -------------------------------- |
| Component types | `"knob" \| "button" \| "keys" \| "slider"` | `"square" \| "keys" \| "slider"` |
| 1×1 controls    | Pass `"knob"` or `"button"`                | Pass `"square"`                  |

**Affected**: `getSizeClassForComponent()` and `getSizeStyleForComponent()` in `@cutoff/audio-ui-core`, and the `useAdaptiveSize()` hook in `@cutoff/audio-ui-react`. All built-in and generic components (Button, Knob, CycleButton, FilmStrip\*, ImageKnob, ImageSwitch, etc.) now call these with `"square"` internally.

### Breaking change and upgrades

- **If you call the size utilities directly**: Replace any use of `"knob"` or `"button"` with `"square"`. For example, `getSizeClassForComponent("knob", size)` → `getSizeClassForComponent("square", size)`.
- **If you only use the React components**: No change; sizing behavior is unchanged.

### Documentation

- `packages/core/src/utils/sizing.ts` – JSDoc and types use `"square" \| "keys" \| "slider"`.
- `packages/react/docs/size-system.md` – Examples and utility description updated to use `"square"`.

---

## Theming – primary luminosity variable names

The CSS variables for the lighter/darker primary color variants have been renamed for consistency.

### Breaking changes

- **`--audioui-primary-light`** has been renamed to **`--audioui-primary-lighter`**.
- **`--audioui-primary-dark`** has been renamed to **`--audioui-primary-darker`**.

In `@cutoff/audio-ui-core`, the constants have been updated: `CSS_VARS.primaryLight` → `CSS_VARS.primaryLighter`, `CSS_VARS.primaryDark` → `CSS_VARS.primaryDarker`.

### Client app upgrades

- If you override or reference these variables in your CSS or code, update to the new names: `--audioui-primary-lighter`, `--audioui-primary-darker`, and (if used) `CSS_VARS.primaryLighter`, `CSS_VARS.primaryDarker`.

---

## Raster components – label layout props propagation

Generic (raster) components now forward **`labelOverflow`** and **`labelHeightUnits`** to their underlying control primitives. These props were already part of the component types (via `AdaptiveBoxProps`) but were not previously passed through, so they had no effect.

### Affected components

- **FilmStripContinuousControl**, **FilmStripDiscreteControl**, **FilmStripBooleanControl**
- **ImageKnob**, **ImageSwitch**, **ImageRotarySwitch**

### Behavior

- **`labelOverflow`** – Controls how label text overflow is handled (`"ellipsis"`, `"abbreviate"`, or `"auto"`). When set on any of the above components, it is now forwarded to the inner AdaptiveBox layout.
- **`labelHeightUnits`** – Label row height in viewBox units. When set, it is now forwarded so the layout uses the requested label height.

### Client app upgrades

- **No breaking changes.** Existing usage is unchanged.
- To control label overflow or label height on filmstrip or image-based controls, set `labelOverflow` and/or `labelHeightUnits` on the component; they now take effect.

---

## Theming – Reactive CSS variables and per-component theming

The theme system uses a two-file CSS architecture so that derived variables (color variants, sizes, roundness) react correctly when a component overrides a base variable (e.g. `style={{ "--audioui-primary-color": "red" }}` or the `color` prop).

### Summary

- **`themes.css`** (public API): Defines only raw input variables at `:root` (base colors, units, multipliers). No `calc()` or `color-mix()`. Backward compatible.
- **`styles.css`** (reactive engine): Defines all derived calculations and reactive pointer variables using the compound selector `.audioui, :root`. Same variables apply at root (global) and on `.audioui` (per-component). When a component overrides a base variable, the browser re-evaluates formulas in that component's scope, so variants (e.g. `--audioui-primary-20`, `--audioui-primary-lighter`) and any variables that reference them (e.g. slider track color, slider cursor border color) update for that component only.

### Reactive pointer variables

Variables that point to reactive variants (e.g. `--audioui-slider-cursor-border-color: var(--audioui-primary-lighter)`) are defined in the reactive engine. If they were defined only at `:root`, they would resolve the variant from root and would not react to per-component color overrides. Slider background strip and cursor border colors therefore follow per-component theming correctly.

### Client app impact

- **No breaking changes.** Overriding `--audioui-primary-color` (or using the `color` prop) on a component now correctly updates all derived colors for that component, including slider track and cursor border.
- Documentation: `packages/react/docs/color-system.md` (Reactive Scoping Architecture, pointer variables), root AGENTS.md (Theme System).

---

## Other changes

_(Add further sections here for future releases, e.g. “Layout”, “Theming”, “Breaking changes”, “Fixes”.)_
