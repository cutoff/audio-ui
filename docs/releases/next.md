# Release notes (next release)

Notes for the upcoming release. Use this when updating the documentation site or planning client app upgrades.

---

## Fixes – raster components visible without dark variant

Raster controls now correctly render in dark mode (and on dark-OS systems) when no dark asset is supplied, matching the documented behavior "if a dark prop is omitted, the light asset is used in both themes".

Previously, the four image-emitting primitives (`RadialImage`, `Image`, `FilmstripImage`, `LinearCursor`) tagged the light `<image>` with `audioui-image-light` whenever `imageHref` was set, even when no dark sibling was rendered. The CSS hide rules (`.dark .audioui-image-light { display: none }` and the `prefers-color-scheme: dark` equivalent) then fired against an element with no fallback, leaving the control blank. Every consumer-level raster control built on these primitives — `ImageKnob`, `ImageRotarySwitch`, `ImageSwitch`, the three `FilmStrip*` controls, and `Slider` with `cursorImageHref` — was affected.

The light/dark class toggles are now only emitted when both assets are present; single-asset call sites render a plain `<image>` and the CSS toggles never apply. The `audioui-image-light` and `audioui-image-dark` class names are exposed as `CLASSNAMES.imageLight` and `CLASSNAMES.imageDark` in `@cutoff/audio-ui-core` for downstream code that composes its own primitives.

This addresses issue [#39](https://github.com/cutoff/audio-ui/issues/39).

---

## Performance – microbenchmark harness with CodSpeed

A `vitest bench`-based microbenchmark harness covers the runtime-critical interaction path. `pnpm bench` runs the suite locally with tinybench wall-clock numbers; `.github/workflows/codspeed.yml` runs the same suite under CodSpeed instrumentation (Valgrind/cachegrind) on every push to `main` and `develop`, publishing deterministic per-commit results to the CodSpeed dashboard. Authentication uses OIDC — no `CODSPEED_TOKEN` secret is needed for the public repo, only the CodSpeed GitHub App installation.

**Coverage** — the four interaction controllers (`ContinuousInteractionController`, `BooleanInteractionController`, `DiscreteInteractionController`, `NoteInteractionController`), the size utilities (`getSizeClassForComponent`, `getSizeStyleForComponent`), and the AdaptiveBox layout math (`computeAdaptiveBoxLayout`).

**AdaptiveBox refactor** — the inline `gridTemplateRows`/`combinedHeightUnits` math becomes a pure helper `computeAdaptiveBoxLayout()` co-located in `packages/react/src/components/primitives/AdaptiveBox.tsx`. Lossless extraction (same inputs, same outputs); the helper gains a unit test and is the bench target so AdaptiveBox layout cost can be measured without React render overhead.

**Layout** — bench files live in `packages/<pkg>/bench/` (outside `src/` so they stay out of `dist/`). `*.bench.ts` extension distinguishes them from `*.test.ts`. Vitest discovers them via `benchmark.include` in each package's `vitest.config.ts`. The CodSpeed plugin is wired into the same vitest configs and acts as a no-op locally — `pnpm bench` runs as plain tinybench when not invoked under the CodSpeed action.

**Review command integration** — the **Review** procedure in `agents/coding-agent-commands-1.0.md` gains a performance regression check step. Coding agents executing Review consult the CodSpeed dashboard for the touched code paths and flag instruction-count regressions > 2%. The Compare Any Runs feature supports diffing arbitrary commit pairs without requiring a PR; flamegraphs attribute deltas to specific functions, supporting both regression triage and optimization work.

**Out of scope for this iteration** — threshold-based hard gates / merge blocking. Numbers are informational while runner variance is observed; thresholds graduate later once a few weeks of data exist. The CodSpeed instrumentation mode is hardware-agnostic (deterministic instruction count) so a self-hosted runner is not required.

This addresses issue [#36](https://github.com/cutoff/audio-ui/issues/36).

---

## Testing – render-count regression tests

The React package ships a new Vitest suite that guards the library's memoization guarantees on two complementary layers. Memo behavior is contractual and deterministic, so divergence from baseline always fails the test — no informational warn-mode or staged rollout.

**Static memo-coverage check.** A direct `$$typeof === Symbol.for("react.memo")` assertion verifies that every interactive component, every control primitive, and every exported view is `React.memo`-wrapped. Covers `Knob`, `Slider`, `Button`, `CycleButton`, `Keys`, the filmstrip and image generic controls, the three control primitives (`ContinuousControl`, `DiscreteControl`, `BooleanControl`), the exported default views (`KnobView`, `ButtonView`, `SliderView` + Vertical/Horizontal variants), and the internal raster views on the render-time path (`FilmstripView`, `ImageKnobView`, `ImageSwitchView`). Catches _leaf_ regressions — someone removes `React.memo` from a component's export — without depending on rendering or reconciliation behavior. Adding a new memoized component to the library requires one row in the table.

**Scene-level tests.** Three small test fixtures (8-knob mixer grid, channel strip, 8-step sequencer row) exercise four triggers — single-control value change, parent re-render with no prop changes, theme toggle (CSS variable on scene root), and container resize (inline width/height). Catches _composition_ regressions: a scene-level inline callback that defeats memo, a non-stable list of options, and so on. Baselines live as inline constants in each `*.test.tsx` file.

Test fixtures live in `packages/react/test/render-count/` (outside `src/`), so neither the JS bundle nor the type declarations in `dist/` grow as a result. The library's public surface and consumer behavior are unchanged.

This addresses issue [#35](https://github.com/cutoff/audio-ui/issues/35) — "knob re-renders on every parent update"-class regressions would previously have slipped through review silently.

---

## CI – bundle-size gate

A `size-limit` gate runs on every push and pull request, enforcing per-entry-point brotli-compressed budgets for the publishable packages (`@cutoff/audio-ui-core`, `@cutoff/audio-ui-react`). This is phase 1 of the pre-1.0 performance baseline (issues [#34](https://github.com/cutoff/audio-ui/issues/34), [#35](https://github.com/cutoff/audio-ui/issues/35), [#36](https://github.com/cutoff/audio-ui/issues/36)) and catches accidental bloat (e.g. a heavy utility library slipping in) before it ships.

- **On PRs**: `andresz1/size-limit-action@v1` builds base and head, posts a diff comment, and fails the job when an absolute budget is breached.
- **On push**: `pnpm size` runs the gate directly.
- **Config**: `.size-limit.cjs` at the repo root lists six entries (ESM `index.js` plus CSS entry points for each package). Budgets start at current size plus modest headroom; they tighten once a few PRs have landed cleanly.
- **Local**: `pnpm size` reports current vs budgeted size per entry; `pnpm size:why` surfaces composition via size-limit's webpack report.

No library API or consumer-facing behavior changes.

---

## Distribution – `unstable` npm dist-tag auto-published from `develop`

Every push to `develop` that touches source or workspace manifests auto-publishes both `@cutoff/audio-ui-core` and `@cutoff/audio-ui-react` to npm under the new `unstable` dist-tag. The `latest` and `preview` dist-tags are not affected and continue to be driven by the milestone job in the same workflow when pushing to `main`.

- **Install**: `pnpm add @cutoff/audio-ui-react@unstable` (or `@cutoff/audio-ui-core@unstable`).
- **Version format**: `1.0.0-unstable.YYYYMMDD.HHMM.<shortsha>` — UTC timestamp and 7-char HEAD sha. Unique per publish, traceable to the source commit, chronologically sortable.
- **Reliability**: ephemeral, may break at any time. Intended for downstream consumers who need bleeding-edge changes without waiting for a preview/release.
- **Committed version**: the committed version on `develop` stays at `1.0.0-dev`. The unstable version is computed in CI (`pnpm run version unstable`) and never committed back.

The `version` script gains a new `unstable` type (`pnpm run version unstable`) used by the workflow; local usage is unnecessary.

## Controls – explicit `editable` and `disabled` props (breaking)

Every interactive control (`Knob`, `Slider`, `Button`, `CycleButton`, `Keys`, plus the primitives `ContinuousControl` / `DiscreteControl` / `BooleanControl`, and the filmstrip/image generic wrappers) now exposes two explicit boolean props to govern user-gesture editability:

- **`editable?: boolean`** (default `true`) — governs user gestures only (mouse, keyboard, touch, wheel). When `false`, gestures produce no value changes, but external `value` prop updates still flow through to the visuals. Useful for display-only controls driven by automation, MIDI, or external state.
- **`disabled?: boolean`** (default `false`) — genuinely off. Implies non-editable **and** suppresses all value-change callback dispatch (including `onClick`). Removes the control from the tab order. External `value` prop updates still animate the visual so automation can keep driving the display.

Precedence: `disabled=true` wins over `editable`. Effective editability at the primitive layer is `editable && !disabled`.

### Behavior matrix

| State                                     | Gestures              | Callbacks fire                          | Tab order                               | ARIA                                   |
| ----------------------------------------- | --------------------- | --------------------------------------- | --------------------------------------- | -------------------------------------- |
| `editable=true, disabled=false` (default) | Yes                   | Yes                                     | In (`0`)                                | none                                   |
| `editable=false, disabled=false`          | No (no value changes) | No from UI; external updates still flow | Out (`-1`) unless `onClick` is provided | `aria-readonly` where role supports it |
| `disabled=true`                           | No                    | No (including `onClick`)                | Out (`-1`)                              | `aria-disabled`                        |

When `editable=false` is combined with a bare `onClick` handler, the control stays focusable so Space/Enter can still activate the click — only drag/wheel/value-editing gestures are suppressed.

### Keys specifics

On `Keys`, `editable=false` blocks note triggering on pointer down/move. In-flight pointers still release cleanly (`onNoteOff` fires on pointer up / cancel) so flipping `editable` mid-hold does not leave stuck notes. `disabled=true` fully blocks gestures and suppresses `onClick`; `notesOn` highlights still flow to the visuals in both states.

### ARIA

- Continuous controls (`role="slider"`): emit `aria-readonly="true"` when `editable=false && !disabled`; emit `aria-disabled="true"` when `disabled`.
- Discrete controls (`role="spinbutton"`): same as above.
- Boolean controls (`role="button"`): emit `aria-disabled="true"` when `disabled`. No `aria-readonly` (not a valid ARIA attribute for `button`).
- `Keys` (`role="group"` on the wrapper): emit `aria-disabled="true"` when `disabled`.

### Breaking change — upgrade steps

Previously, omitting the paired value-change callback (`onValueChange`, `onNormalizedValueChange`, or `onMidiValueChange`) implicitly locked the control. That implicit rule is removed — a control with a `value` prop and no callback is now editable by default (drag/wheel/keyboard work, but nothing persists).

- Consumers that relied on "no callback = locked" as a display-only pattern must pass `editable={false}` explicitly.
- A `disabled` control that previously fired `onClick` on click now suppresses `onClick` (and every value-change callback). This is the correct "disabled" semantic.
- No type-level breaks: both new props are optional with safe defaults, so existing call sites continue to type-check.

### Example

```tsx
// Display-only knob driven by automation
<Knob value={automationValue} editable={false} label="Cutoff" parameter={cutoffParam} />

// Fully disabled knob (tab order excluded, callbacks suppressed)
<Knob value={value} onValueChange={setValue} disabled label="Cutoff" parameter={cutoffParam} />

// Non-editable with onClick (focusable, Space/Enter triggers click)
<Knob value={42} editable={false} onClick={() => openMenu()} label="Preset" />
```

### Cursor behavior

Cursor selection follows observable interactivity, not just the declared intent, to avoid misleading a user into dragging a control that has no callback to dispatch to. A control is considered **truly editable** when `editable && !disabled && (onValueChange || onNormalizedValueChange || onMidiValueChange)` — all three must hold. Without a value-change callback, the cursor falls back to the non-editable or clickable variant.

- `disabled=true` → `--audioui-cursor-disabled`
- truly editable (continuous) → direction-based cursor (bidirectional / vertical / horizontal / circular)
- truly editable (boolean / discrete / keys) → `--audioui-cursor-clickable`
- not truly editable, `onClick` provided → `--audioui-cursor-clickable`
- not truly editable, no `onClick` → `--audioui-cursor-noneditable`

`Button`, `CycleButton`, and `Keys` now always set an explicit cursor (previously they left the cursor unset when non-interactive, inheriting from user-agent styling and occasionally showing a pointer on SVG).

### CSS variable default – `--audioui-cursor-disabled`

- **Before**: `not-allowed` (the browser "forbidden" cursor).
- **After**: `default`.

Rationale: the disabled state will be communicated through desaturation and other visual treatments in a follow-up rendering story; the cursor itself should not be the distinguishing signal. Consumers who want the old "forbidden" cursor can still override the variable:

```css
.audioui {
  --audioui-cursor-disabled: not-allowed;
}
```

`--audioui-cursor-noneditable` and `--audioui-cursor-disabled` remain separate variables so the two states can be customized independently.

### Playground

A new example at `/examples/editable-disabled` showcases all three states (editable, editable=false, disabled) for each interactive control, with a toggle that drives non-editable/disabled visuals from simulated external automation.

---

## Controls – paired-channel value API (breaking)

Every parameter-bound control (`Knob`, `Slider`, `Button`, `CycleButton`, and the primitives
`ContinuousControl` / `DiscreteControl` / `BooleanControl`) exposes three mutually-exclusive
input/output channels. The single `onChange` prop and the `value`-only input are replaced
by paired channels that carry the value in the representation consumers already think in —
real-world, normalized 0..1, or MIDI integer — with no round-trip through the real domain.

### Input / output shape

Each control accepts exactly one of three value channels. Every callback receives
`(value, event)` — the first argument matches the chosen representation; the second is
the full `AudioControlEvent<T>` with all three representations (`value`, `normalizedValue`,
`midiValue`) plus the `parameter` reference populated.

| Channel         | Input prop        | Callback prop             | First-arg type                              |
| --------------- | ----------------- | ------------------------- | ------------------------------------------- |
| Real value      | `value`           | `onValueChange`           | `T` (the control's native type)             |
| Normalized 0..1 | `normalizedValue` | `onNormalizedValueChange` | `number`                                    |
| MIDI integer    | `midiValue`       | `onMidiValueChange`       | `number` (7/14-bit depending on resolution) |

End-user controls (`Knob`, `Slider`, `Button`, `CycleButton`) use a strict discriminated
union: passing more than one channel at the call site is a TypeScript error. Primitives
(`ContinuousControl`, `DiscreteControl`, `BooleanControl`) use a permissive variant
(`ContinuousControlPrimitiveProps` and siblings) where all six props are independent
optionals, making composition and forwarding ergonomic for custom wrappers. Runtime
precedence (`value` > `normalizedValue` > `midiValue`) picks the active channel when more
than one is supplied in the permissive case.

### Examples

```tsx
// Real-world binding (typical)
<Knob value={cutoffHz} onValueChange={setCutoffHz} parameter={cutoffParam} />

// Normalized binding (e.g. JUCE WebUI integration)
<Knob normalizedValue={n} onNormalizedValueChange={setN} parameter={cutoffParam} />

// MIDI binding (e.g. MIDI controller mapping, WebMIDI, Cutoff Fusion)
<Knob midiValue={cc} onMidiValueChange={setCC} parameter={cutoffParam} />

// Full event access via the second callback argument
<Knob
    value={hz}
    onValueChange={(v, event) => {
        setHz(v);
        hardware.sendCc(event.midiValue);
    }}
    parameter={cutoffParam}
/>
```

### Breaking change — upgrade steps

Existing consumers that use the single `onChange` callback must migrate:

- `onChange={(e) => setX(e.value)}` → `onValueChange={setX}` (or `(v) => setX(v)` if wrapping is still needed).
- If the callback relied on `event.normalizedValue` or `event.midiValue`, use the second callback argument: `onValueChange={(v, event) => ...}`.
- To bind directly to MIDI or normalized domain, pass `midiValue` / `normalizedValue` as input and use `onMidiValueChange` / `onNormalizedValueChange` on output.

TypeScript makes the migration self-announcing: every unmigrated site is a compile error
under the new prop types. No runtime shim is provided; the silent-bug class that
`onChange={setX}` could previously hide (writing the full event object into state) is
eliminated structurally by the scalar-first callback signature.

### Keys — `onChange` becomes `onNoteChange`

`Keys` is an event-stream control (polyphonic note on/off), not a parameter-bound control,
so it opts out of the paired-channel model. Its callback becomes:

```tsx
<Keys
  nbKeys={61}
  onNoteChange={(note, event) => {
    if (note.active) handleNoteOn(note.note);
    else handleNoteOff(note.note);
  }}
/>
```

`note` is `{ note: number; active: boolean }`; `event` is the full
`AudioControlEvent<{ note: number; active: boolean }>` with the note number mirrored into
`normalizedValue` (note / 127) and `midiValue`.

### Hook — `useAudioParameter` options-object signature

`useAudioParameter` takes a single options object instead of positional arguments:

```tsx
const { realValue, normalizedValue, formattedValue, commitValue, setNormalizedValue, adjustValue } = useAudioParameter({
  value,
  normalizedValue,
  midiValue,
  onValueChange,
  onNormalizedValueChange,
  onMidiValueChange,
  parameter,
  userValueFormatter,
  userLabel,
  valueAsLabel,
});
```

The hook resolves the effective real value from whichever input channel was supplied,
computes the canonical triple via `AudioParameterConverter`, and — on interaction — fires
exactly one paired callback matching the active channel. `commitValue(newRealValue)` is a
new public method for callers (e.g. boolean / discrete primitives) that produce full
values rather than deltas.

### Exported types

The library exports both strict and permissive forms so consumers can choose the right
shape for their wrappers:

- Strict (end-user controls): `ValueChannel<T>`, `InteractiveControlProps<T>`,
  `ContinuousControlProps`, `DiscreteControlProps`, `BooleanControlProps`.
- Permissive (primitives, custom wrappers): `ValueChannelAny<T>`,
  `InteractiveControlPrimitiveProps<T>`, `ContinuousControlPrimitiveProps`,
  `DiscreteControlPrimitiveProps`, `BooleanControlPrimitiveProps`.
- Shared: `InteractionTuningProps`.

A strict `ContinuousControlProps` is structurally assignable to the permissive
`ContinuousControlPrimitiveProps`, so forwarding from a strict parent (e.g. a custom
end-user control) to a permissive primitive type-checks directly — no conditional spreads
or manual channel selection needed at the call site.

### Documentation

Design discussion and rationale live in:

- `packages/react/docs/control-value-api-design.md` — design space, options considered,
  open questions.
- `packages/react/docs/integration-design.md` — how each of WebMIDI, Web Audio, Tone.js,
  JUCE WebUI, and Cutoff Fusion maps onto the paired-channel API.

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

## Playground – value channels example

A new playground example at `/examples/value-channels` documents the paired-channel value API end-to-end. Three `Knob` instances bind through the three mutually-exclusive channels — real-value (`value` / `onValueChange`), normalized (`normalizedValue` / `onNormalizedValueChange`), and MIDI (`midiValue` / `onMidiValueChange`) — each with a live readout of the full `AudioControlEvent` triple delivered as the callback's second argument.

Use this page as a reference when wiring controls to domain code (real value), DAW / JUCE WebUI automation (normalized), or WebMIDI / hardware-controller mappings (MIDI).

---

## Other changes

_(Add further sections here for future releases, e.g. “Layout”, “Theming”, “Breaking changes”, “Fixes”.)_
