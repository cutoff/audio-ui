# Release notes (next release)

Notes for the upcoming release. Use this when updating the documentation site or planning client app upgrades.

---

## Raster components – dark mode support

Optional dark-mode variants are supported for all raster assets (filmstrips, images, and slider cursors). When a dark variant is provided, the library switches between light and dark assets based on the current theme, with **no JavaScript**: visibility is controlled by CSS (`.dark` class and/or `prefers-color-scheme: dark`). This keeps behavior predictable and avoids extra re-renders or observers.

### Summary

| Area | Prop(s) | Behavior |
|------|---------|----------|
| Filmstrip controls | `imageDarkHref` | Optional dark filmstrip; same frame layout as light. |
| Image knob / Image rotary switch | `imageDarkHref` | Optional dark image for the rotary asset. |
| Image switch | `imageHrefFalseDark`, `imageHrefTrueDark` | Optional dark images for off and on states. |
| Slider cursor | `cursorImageDarkHref` | Optional dark image for the raster cursor. |

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

## Other changes

*(Add further sections here for future releases, e.g. “Layout”, “Theming”, “Breaking changes”, “Fixes”.)*
