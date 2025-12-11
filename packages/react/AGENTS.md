**Version**: 2.0 | **Meta**: Extends root AGENTS.md for library internals (component exports, build, env).

## Quick Setup Summary (Load This First)

| Category            | Details                                                                                                                                                                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scripts             | `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm link`, `pnpm lint:css`                                                                                                                                                                             |
| Env Vars            | None                                                                                                                                                                                                                                                  |
| Component Structure | Props with JSDoc; default params; function ComponentName() {}; arrow functions for handlers; SVG for graphics                                                                                                                                         |
| Exports             | All from src/index.ts: Components (Button, Knob, Slider, Keybed, AdaptiveBox, SvgContinuousControl, etc.), Providers (AudioUiProvider, hooks), Types (including ControlComponent, ControlComponentView), Utils (formatters, note utils), Theme colors |
| Testing             | Vitest; .test.tsx alongside; mock deps; React 18 compat                                                                                                                                                                                               |
| Build               | Vite; generates dist/index.js, index.d.ts, style.css; ES modules                                                                                                                                                                                      |

## Key File Structure

- `src/components/`: Component .tsx with .test.tsx
  - `controls/`: Interactive controls (Button, Knob, Slider, KnobSwitch). Knob and Slider use SvgContinuousControl internally.
  - `primitives/`: Base components for building final components, excluding theme-specific (AdaptiveBox, Option, SvgContinuousControl)
  - `theme/`: Default theme system (AudioUiProvider, default SVG components: SvgButton, SvgKnob, SvgSlider with SvgVerticalSlider/SvgHorizontalSlider variants)

## Component Architecture: Built-in vs Customizable

**Built-in Controls** (`src/components/controls/`):

- Ready-to-use components (Button, Knob, Slider, KnobSwitch)
- Include `Themable` props (`color`, `roundness`) via type extensions
- Opinionated, production-ready with full theming integration
- Props: `KnobProps`, `SliderProps`, `ButtonProps` extend primitives with `Themable`

**Customizable Primitives** (`src/components/primitives/`):

- Lower-level components (SvgContinuousControl, AdaptiveBox)
- No built-in theming - users add their own theming props as needed
- For building custom controls without theming constraints
- Props: `ContinuousControlProps`, `BooleanControlProps` (no `Themable` included)

**Type System:**

- Primitive types (`ContinuousControlProps`, `BooleanControlProps`) do NOT include `Themable`
- Built-in control types (`KnobProps`, `SliderProps`, `ButtonProps`) extend primitives with `Themable`
- This separation allows custom controls to opt into theming only if needed
  - `Keybed.tsx`: Keyboard component
- `src/index.ts`: Export all components, types, utilities, and theme colors
- `src/themes.css`: Theme CSS variables (primary colors only; variants computed by components, all prefixed `--audioui-*`); size system CSS variables (base unit, multipliers, component-specific dimensions)
- `src/styles.css`: Base styles, utility classes, imports themes.css; size utility classes for semantic purposes
- `src/styles/`: Shared TS constants for class names and CSS variables (enforce `audioui-` prefix)
- `src/themeColors.ts`: Exports predefined theme colors (themeColors, themeColorsDirect)
- `src/components/utils/sizeMappings.ts`: Size class name mappings and utility functions (`getSizeClassForComponent`, `getSizeStyleForComponent`)
- `dist/`: Built output (index.js, index.d.ts, style.css)
- `docs/`: Technical documentation (see Documentation section below)

## Workflow Patterns

- Component dev: Function declarations; hooks; CSS classes/inline; theming utility classes; size system via CSS variables
- Build: `pnpm build`; Vite with declarations
- Test: Alongside; e.g., render Button, expect class
- Local dev: `pnpm link`; demo imports
- TS: Prefix unused params with \_; strict

Agent Note: Enforce from agents/typescript-guidelines-2.0.md; read docs/ for AdaptiveBox, color system, size system, and component-specific documentation.

## Documentation

Technical documentation is located in `docs/`:

- **`docs/adaptive-box-layout.md`**: Comprehensive specification for AdaptiveBox layout system (CSS/SVG-based, replaces AdaptiveContainer + SvgSurface). Covers DOM structure, sizing algorithms, label modes, alignment controls, and React API mapping.

- **`docs/color-system.md`**: Complete color system architecture documentation. Covers axioms & requirements, CSS theme variables, color utilities (`generateColorVariants`, `getAdaptiveDefaultColor`), component color resolution hierarchy, theme provider system (`AudioUiProvider`, `useThemableProps`), predefined theme colors, usage examples, and performance optimizations.

- **`docs/color-property-examples.md`**: Practical examples of using the `color` property with components. Includes basic usage, color animation, combining with other properties, dynamic colors, and component-specific color handling (Keybed luminosity variants).

- **`docs/Keybed-MiddleC-Positions.md`**: Specifications for middle C positions on physical MIDI keyboards. Documents standard layouts for common keyboard sizes (25-88 keys), MIDI note numbering conventions, visual representations, and transposition considerations.

- **`docs/interaction-system.md`**: Complete interaction system architecture documentation. Covers the `useInteractiveControl` hook, interaction modes, sensitivity tuning, input methods (drag/touch, wheel, keyboard), focus management, accessibility, performance considerations, and component-specific behavior. **Essential reference for understanding how all interactive controls handle user input.**

- **`docs/size-system.md`**: Complete size system architecture documentation. Covers base unit system, component aspect ratios, CSS variable structure, size utility classes, implementation details, customization options, and design system consistency. **Essential reference for understanding component sizing and the size prop.**

**Reference these docs when:**

- Working with AdaptiveBox component (layout, sizing, alignment)
- Implementing or modifying color theming
- Using color properties in components
- Working with Keybed component (MIDI note positioning)
- **Implementing or modifying interactive controls (drag, wheel, keyboard interactions)**
- **Tuning sensitivity or interaction behavior**
- **Working with component sizing, size prop, or customizing the size system**

## Component-Specific Notes

### Generic Control Architecture (SvgContinuousControl)

The library provides a generic `SvgContinuousControl` component that decouples behavior from visualization. `Knob` and `Slider` use `SvgContinuousControl` internally, eliminating code duplication.

- **Purpose**: Allows users to use any SVG component as a continuous control (knob, fader, etc.) without reimplementing interaction logic. Also used internally by `Knob` and `Slider` for shared behavior.
- **Location**: `packages/react/src/components/primitives/SvgContinuousControl.tsx`
- **Contract**: The view component must implement `ControlComponentView` interface, defining:
  - `viewBox`: Dimensions for the SVG (required)
  - `labelHeightUnits`: Label height in viewBox units (optional, defaults to 20)
  - `interaction`: Preferred mode ("drag" | "wheel" | "both") and direction ("vertical" | "horizontal")
- **Props**: The view receives `ControlComponentViewProps` (normalizedValue, children, className, style) plus any custom props (passed through generic type parameter `P`).
- **Reference Implementations**:
  - `SvgKnob` - implements contract with `viewBox: {width: 100, height: 100}`, `labelHeightUnits: 20`, `interaction: {mode: "both", direction: "vertical"}`
  - `SvgVerticalSlider` / `SvgHorizontalSlider` - specialized slider views with orientation-specific viewBox and interaction direction
- **Internal Usage**: `Knob` wraps `SvgContinuousControl` with `view={SvgKnob}`, `Slider` wraps with `view={SvgVerticalSlider}` or `view={SvgHorizontalSlider}` based on orientation
- **Performance**: Double memoization (both wrapper and SvgContinuousControl are memoized) provides optimal re-render protection
- **Type Exports**: `ControlComponent`, `ControlComponentView`, and `ControlComponentViewProps` are exported from `src/index.ts` for users creating custom view components

### Unified Interaction System (useInteractiveControl)

**Comprehensive Documentation**: See `packages/react/docs/interaction-system.md` for complete interaction system architecture, design decisions, sensitivity tuning, and implementation details.

**Quick Reference**:

- **Hook Location**: `packages/react/src/hooks/useInteractiveControl.ts`
- **Interaction Modes**: Controls support `interactionMode` ("drag" | "wheel" | "both") to restrict input methods.
- **Sensitivity Tuning**:
  - Knob: `0.008` drag (increased for responsiveness)
  - Slider: `0.005` drag (standard)
  - KnobSwitch: `0.1` drag, `stepSize / 4` wheel (high sensitivity for enumerated steps)
- **Mouse/Touch**:
  - `user-select: none` applied during drag to prevent text selection.
  - `preventDefault` on `onMouseDown` is AVOIDED to allow element focus (enabling keyboard support).
  - Global window listeners attached only during active drag sessions (zero overhead when idle).
- **Keyboard**:
  - Standard focus management via `tabIndex={0}`.
  - Arrow keys increment/decrement values (clamped at min/max).
  - Home/End jump to min/max.
  - `KnobSwitch`: Space key and Click cycle through options ("rotate" with wrap-around).
  - `KnobSwitch`: Arrow keys step increment/decrement (clamped, no wrap).
- **Wheel**:
  - Native non-passive listeners are used in `AdaptiveBox.Svg` to reliably `preventDefault` and stop page scrolling.
  - Direction: Positive `deltaY` (scrolling down/pulling) increases value, consistent with standard audio knob behavior.
  - Default wheel sensitivity is `sensitivity / 4` to account for larger wheel deltas.
- **Focus Styles**:
  - Default browser ring disabled via `outline: none`.
  - Custom highlight effect (brightness/contrast boost) applied via `:focus-visible` and `.audioui-highlight:focus-within`.
  - All controls must include `.audioui-component-container` class for focus styles to work.
- **Performance**:
  - Uses `useRef` for mutable state to avoid stale closures.
  - O(1) value-to-index Map lookups in KnobSwitch.
  - Memoized event handlers with `useCallback`.

### KnobSwitch (Enum Parameters)

- **Icon Theming**: Uses inline SVG components with `fill="currentColor"` to inherit text color automatically. Library CSS applies `fill: currentColor` to all inline SVGs within knob content. Third-party icon libraries (e.g., react-icons) work seamlessly.
- **Interaction Methods**:
  - **Click**: Cycles to next value (same as Space key, wraps to first when reaching end)
  - **Space Key**: Cycles to next value (wraps to first when reaching end)
  - **Arrow Keys**: Step increment/decrement (clamped at min/max, no wrap)
  - **Wheel**: Discrete step-by-step navigation (one option per wheel tick) using O(1) value-to-index Map lookups
  - **Drag/Touch**: High sensitivity (0.1) for responsive enumerated step changes
- **Sensitivity**:
  - Drag: `0.1` (much higher than continuous controls for responsive step changes)
  - Wheel: `stepSize / 4` (ensures one wheel notch ≈ one step)
- **Performance Optimizations**:
  - Value-to-index Map for O(1) lookups instead of O(n) array searches
  - Option-by-value Map for O(1) content rendering lookups
  - Memoized style objects to prevent object recreation
  - `useRef` for event handlers to avoid stale closures

## Shared Conventions

- `agents/react-conventions-2.0.md`: Components/hooks
- `agents/typescript-guidelines-2.0.md`: TS
- `agents/documentation-standards-2.0.md`: JSDoc
- `agents/coding-conventions-2.0.md`: Formatting
