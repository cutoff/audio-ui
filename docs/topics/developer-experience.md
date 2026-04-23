# Developer Experience (DX)

This document provides a high-level overview of Developer Experience (DX) for **developers who use** the AudioUI library. It is intended to support the documentation website team when writing guides, tutorials, and reference material. The focus is factual and positive: what the library offers and how to present it to users.

---

## 1. What “Developer Experience” Means Here

AudioUI explicitly prioritizes Developer Experience in its design philosophy:

- **TypeScript**: The library is written in TypeScript with strict mode. Consumers get full type safety, editor autocomplete, and clear contracts for props and events.
- **Theming**: A flexible theming system based on CSS variables allows global or per-component customization without a React Provider or runtime theme state.
- **Sensible defaults**: Built-in components (Knob, Slider, Button, CycleButton, Keys) are ready to use with minimal configuration and work well in both light and dark mode.
- **Progressive customization**: Developers start (or stay) with opinionated components, externalize the parameter model when convenient, and move to generic controls and primitives when they need custom visuals or behavior.

Documentation should reflect these pillars: type safety, theming without boilerplate, and a path from “quick start” to “full control.”

---

## 2. Installation and Setup

- **Package**: `@cutoff/audio-ui-react` (published to npm).
- **Peer dependencies**: React and React-DOM (`^18.2.0 || ^19.0.0`). The library is compatible with React 18 and 19.
- **Preview channel**: During the Developer Preview phase, users typically install with the `preview` tag (e.g. `pnpm add @cutoff/audio-ui-react@preview`). Preview releases use timestamped versions (e.g. `1.0.0-preview.YYYYMMDD.HHMM`). For production, pinning to a specific version is recommended once a Developer Preview (dp.0) is available.
- **CSS**: Consumers import at least one stylesheet:
  - `@cutoff/audio-ui-react/style.css` — includes default font (Oxanium) and all theme/layout styles.
  - `@cutoff/audio-ui-react/style-no-font.css` — same styles without the font; for apps that supply their own font (set `--audioui-font-family` and `--audioui-font-size` as needed).

---

## 3. Minimal Usage

A typical first use is a controlled Knob with local state:

```tsx
import { Knob } from "@cutoff/audio-ui-react";
import "@cutoff/audio-ui-react/style.css";

const [cutoff, setCutoff] = useState(75);
<Knob value={cutoff} onValueChange={setCutoff} label="Cutoff" min={0} max={100} />;
```

Documentation should emphasize: one component import, one CSS import, then standard React state bound through the paired input/callback props (`value`/`onValueChange`, `normalizedValue`/`onNormalizedValueChange`, `midiValue`/`onMidiValueChange`). No provider or theme setup is required for the default look.

---

## 4. Theming (No Provider)

- Theming is **CSS-variable based**. There is no React Context or Provider for theme.
- **Global theme**: Set `--audioui-primary-color`, `--audioui-roundness-base`, and optionally `--audioui-unit` (and size multipliers) at `:root` or on a wrapper. All components that use these variables update automatically.
- **Per-component theme**: Pass a `style` object (or `className` on a wrapper) that sets the same variables on a specific subtree. The reactive scoping in the library’s CSS recalculates derived variants (e.g. primary-50, primary-20) in that scope.
- **Theme utilities**: The library exports `setThemeColor`, `setThemeRoundness`, `setTheme`, `getThemeColor`, `getThemeRoundness` for programmatic updates. These are conveniences over setting CSS variables.
- **Predefined themes**: Named theme colors (e.g. blue, orange, pink) are available as CSS values; they are “just” primary colors — variants are still computed by the library’s CSS.

Docs should clearly state: “No Provider needed — use CSS variables or the theme helpers.”

---

## 5. Versioning and Stability

- **Developer Preview**: The project is in Developer Preview. Breaking changes can occur; the team does not guarantee backward compatibility during this phase.
- **Version formats**: Preview npm releases use `-preview.YYYYMMDD.HHMM`. Future numbered previews may use `-dp.X` (e.g. `1.0.0-dp.0`).
- **Recommendation for docs**: Encourage pinning to a specific version for production; mention the `preview` tag for trying the latest previews.

---

## 6. API and Type Safety

- **Props**: All public components have JSDoc on props and use TypeScript interfaces. Optional parameters and defaults are documented.
- **Events**: Control components use paired input/callback channels — one of `value`/`onValueChange`, `normalizedValue`/`onNormalizedValueChange`, or `midiValue`/`onMidiValueChange`. Keys uses `onNoteChange`. Every callback receives `(value, event)` where the first argument matches the chosen representation and the second is the full `AudioControlEvent` with all three representations populated.
- **Custom views**: Types such as `ControlComponent`, `ControlComponentView`, and `ControlComponentViewProps` are exported so that developers can build custom view components with correct typing.
- **Formatters and utilities**: The library exports formatters (e.g. `percentageFormatter`, `frequencyFormatter`, `bipolarFormatter`) and note utilities from core. These support audio-specific UIs out of the box.

Documentation should point to TypeScript and JSDoc as the source of truth for API details and show small, typed examples.

---

## 7. Theming and Customization (Summary for Docs)

- **Two CSS layers**: `themes.css` holds “input” variables (primary color, roundness, unit, size multipliers). `styles.css` holds derived values and reactive pointers (e.g. slider track color) under `.audioui, :root`. Per-component overrides work because the cascade and variable scoping re-evaluate in the component’s scope.
- **Color prop**: Themable components accept a `color` prop (any CSS color value). If omitted, they use `--audioui-primary-color` or the adaptive default. Variants (e.g. primary-50, primary-20) are computed in CSS.
- **Size system**: Sizes (xsmall → xlarge) are based on `--audioui-unit` and multipliers. Components can use fixed size or `adaptiveSize` to fill their container. Adaptive size is an intentional feature: the component fills the space its parent provides, which enables powerful layouts (e.g. CSS Grid) for control surfaces. Parents supply a defined size (e.g. grid/flex with height, or fixed dimensions) so that the component can resolve its size. Docs should explain this as the intended pattern: parent defines layout; component fills its cell.
- **Raster vs vector**: Vector (built-in) components support `color` and `roundness`. Raster (filmstrip/image) components do not; their look comes from assets. Dark mode for raster components is via optional props (e.g. `imageDarkHref`) with CSS-based switching.

Docs should explain: “Set CSS variables or use the theme helpers; use the `color` prop for per-component overrides; for adaptive size, the parent defines the layout (e.g. grid) and the component fills its cell.”

---

## 8. Documentation Tone (For Doc Authors)

- **Style**: Documentation is written in present tense, declarative (e.g. “Knob uses ContinuousControl” rather than “Knob now uses…”). The project avoids “evolution” phrasing in favor of current state.

---

## 9. Where to Find More Detail

- **Root**: `README.md` — getting started, installation, basic example, key scripts, licensing.
- **Technical deep-dives** (in repo): `packages/react/docs/` — e.g. `color-system.md`, `interaction-system.md`, `size-system.md`, `adaptive-box-layout.md`, `svg-view-primitives.md`, `parameter-specs.md`. These are the right place to mine for “how it works” and “how to customize.”
- **Releases**: `docs/releases/` — `next.md` and versioned release notes; useful for “what’s new” and the docs site.

For contributor-focused content (repo setup, scripts, playground, CI), see **Contributor Experience** (`docs/topics/contributor-experience.md`).

---

## Summary for the Documentation Team

- **Users**: Emphasize simple install (package + one CSS import), no Provider, TypeScript types, and the “progressive” path from built-in components to primitives.
- **Theming**: CSS variables and optional theme helpers. **Adaptive size**: Present as a feature for control-surface layouts (grid, flex); parent supplies the layout and size, component fills its cell.
- **Accuracy**: Use READMEs and `packages/react/docs/` as the source for technical accuracy; use `docs/releases/` for release-oriented content.
