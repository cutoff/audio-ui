<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 See LICENSE.md for details.
-->

**Version**: 2.0 | **Meta**: Extends root AGENTS.md for library internals (component exports, build, env).

## Architecture: React Implementation of Framework-Agnostic Core

**CRITICAL**: This package (`packages/react/`) is the **React-specific implementation** of the AudioUI library.

- **Framework-Agnostic Core**: `packages/core/` contains all business logic, models, controllers, utilities, and styles that are independent of any UI framework. It has zero framework dependencies and can be used by any framework implementation.
- **React Implementation**: This package (`packages/react/`) provides React components, hooks, and React-specific adapters that wrap the framework-agnostic core logic from `@cutoff/audio-ui-core`.
- **Framework-Agnostic Architecture**: The core package is designed to be framework-agnostic, enabling potential implementations for other frameworks. Any future framework-specific packages would follow the same architectural pattern: depend on `@cutoff/audio-ui-core` and provide framework-specific components and adapters.

**Key Pattern**: React components use core's `InteractionController`, models, and utilities, but add React-specific rendering via hooks (`useInteractiveControl`, `useAudioParameter`) and React components.

## Quick Setup Summary (Load This First)

| Category            | Details                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scripts             | `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm link`, `pnpm lint:css`                                                                                                                                                                                                                                                                                                          |
| Env Vars            | None                                                                                                                                                                                                                                                                                                                                                                               |
| Component Structure | Props with JSDoc; default params; function ComponentName() {}; arrow functions for handlers; SVG for graphics                                                                                                                                                                                                                                                                      |
| Exports             | All from src/index.ts: Components (Button, Knob, Slider, Keys, AdaptiveBox, ContinuousControl, FilmStripContinuousControl, FilmStripDiscreteControl, FilmStripBooleanControl, etc.), Theme utilities (setThemeColor, setThemeRoundness, etc.), Types (including ControlComponent, ControlComponentView, AdaptiveBoxLogicalSizeProps), Utils (formatters, note utils), Theme colors |
| Testing             | Vitest; .test.tsx alongside; mock deps; React 18/19 compat                                                                                                                                                                                                                                                                                                                         |
| Build               | Vite; generates dist/index.js, index.d.ts, style.css (with default font), style-no-font.css (opt-out); ES modules                                                                                                                                                                                                                                                                  |
| Path Aliases        | Use `@/primitives/*`, `@/hooks/*`, `@/defaults/*`, `@/utils/*`, `@/types` instead of relative paths (configured in tsconfig.json and vite.config.ts)                                                                                                                                                                                                                               |

## Key File Structure

- `src/components/`: Component .tsx with .test.tsx
  - `defaults/`: Default/built-in components
    - `controls/`: Interactive controls (Button, Knob, Slider, CycleButton) and their SVG views (ButtonView, KnobView, SliderView). Knob and Slider use ContinuousControl internally.
    - `devices/`: Device components (Keys)
  - `generic/`: Generic components that support industry-standard control representations
    - `controls/`: Filmstrip-based controls (FilmStripContinuousControl, FilmStripDiscreteControl, FilmStripBooleanControl) that use bitmap sprite sheets (filmstrips) for visualization
  - `primitives/`: Base components for building final components, excluding theme-specific
    - `controls/`: Control primitives (ContinuousControl, DiscreteControl, BooleanControl, OptionView)
    - `svg/`: SVG view primitives (ValueRing, RotaryImage, RadialImage, RadialText, FilmstripImage, etc.)

## Component Architecture: Built-in vs Generic vs Customizable

**Built-in Controls** (`src/components/defaults/controls/`):

- Ready-to-use components (Button, Knob, Slider, CycleButton)
- Include `ThemableProps` (`color`, `roundness`) via type extensions
- Opinionated, production-ready with full theming integration
- Props: `KnobProps`, `SliderProps`, `ButtonProps` extend primitives with `ThemableProps`
- SVG view components (ButtonView, KnobView, SliderView) are co-located with the controls that use them
- Use SVG for graphics, allowing dynamic theming and scaling

**Generic Controls** (`src/components/generic/controls/`):

- Filmstrip-based controls (FilmStripContinuousControl, FilmStripDiscreteControl, FilmStripBooleanControl)
- Support the widely-used current industry standard for control representation: bitmap sprite sheets (filmstrips)
- While based on bitmap images (more constrained than SVG), these components provide full access to:
  - Complete layout system (AdaptiveBox with all sizing, alignment, and label modes)
  - Full parameter model (AudioParameter with min/max, scaling, units, formatting)
  - Complete interaction system (drag, wheel, keyboard with all sensitivity and mode options)
  - All accessibility features (ARIA attributes, focus management, keyboard navigation)
- Use bitmap sprite sheets where each frame represents a control state
- No themable props (color, roundness, thickness) - visuals are determined by the image content
- Filmstrip-specific props: `frameWidth`, `frameHeight`, `frameCount`, `imageHref`, `orientation`, `frameRotation`
- Location: `packages/react/src/components/generic/controls/`
- View component: `FilmstripView` (uses `FilmstripImage` primitive)

**Customizable Primitives** (`src/components/primitives/`):

- Lower-level components organized by purpose:
  - `controls/`: Control primitives (ContinuousControl, DiscreteControl, BooleanControl, Option)
  - `svg/`: SVG view primitives (ValueRing, RotaryImage, RadialImage, RadialText, FilmstripImage, etc.)
- No built-in theming - users add their own theming props as needed
- For building custom controls without theming constraints
- Props: `ContinuousControlProps`, `BooleanControlProps` (no `ThemableProps` included)

**Type System:**

- Primitive types (`ContinuousControlProps`, `BooleanControlProps`) do NOT include `ThemableProps`
- Built-in control types (`KnobProps`, `SliderProps`, `ButtonProps`) extend primitives with `ThemableProps`
- This separation allows custom controls to opt into theming only if needed
- `src/index.ts`: Export all components, types, utilities, and theme colors
- `src/hooks/`: React adapters for Core logic (`useAudioParameter`, `useContinuousInteraction`)
- `dist/`: Built output (index.js, index.d.ts, style.css, style-no-font.css)
- `docs/`: Technical documentation (see Documentation section below)

## TypeScript Path Aliases

The library uses TypeScript path aliases to simplify imports and avoid cluttered relative paths. **Always use these aliases instead of relative paths** when importing from these locations:

- `@/primitives/*` → `src/components/primitives/*`
  - Example: `import AdaptiveBox from "@/primitives/AdaptiveBox";`
  - Example: `import ContinuousControl from "@/primitives/controls/ContinuousControl";`
  - Example: `import ValueRing from "@/primitives/svg/ValueRing";`

- `@/hooks/*` → `src/hooks/*`
  - Example: `import { useAudioParameter } from "@/hooks/useAudioParameter";`
  - Example: `import { useContinuousInteraction } from "@/hooks/useContinuousInteraction";`
  - Example: `import { useArcAngle } from "@/hooks/useArcAngle";`

- `@/defaults/*` → `src/components/defaults/*`
  - Example: `import KnobView from "@/defaults/controls/KnobView";`
  - Example: `import ButtonView from "@/defaults/controls/ButtonView";`

- `@/utils/*` → `src/utils/*`
  - Example: `import { propCompare } from "@/utils/propCompare";`

- `@/types` → `src/components/types`
  - Example: `import { AdaptiveBoxProps, ThemableProps } from "@/types";`
  - Example: `import { ControlComponent } from "@/types";`

**Configuration:**

- TypeScript: Configured in `tsconfig.json` with `baseUrl` and `paths`
- Vite: Configured in `vite.config.ts` with `resolve.alias`
- Both must be kept in sync when adding new aliases

**Benefits:**

- Cleaner, more readable imports
- Easier refactoring (no need to update relative paths when moving files)
- Consistent import style across the codebase
- Better IDE autocomplete and navigation

## Workflow Patterns

- Component dev: Function declarations; hooks; CSS classes/inline; theming utility classes; size system via CSS variables; **use TypeScript path aliases for imports**
- Build: `pnpm build`; Vite with declarations
- Test: Alongside; e.g., render Button, expect class
- Local dev: `pnpm link`; demo imports
- TS: Prefix unused params with \_; strict

Agent Note: Enforce from agents/typescript-guidelines-2.0.md; read docs/ for AdaptiveBox, color system, size system, and component-specific documentation.

## Documentation

Technical documentation is located in `docs/`:

- **`docs/adaptive-box-layout.md`**: Comprehensive specification for AdaptiveBox layout system (CSS/SVG-based, replaces AdaptiveContainer + SvgSurface). Covers DOM structure, sizing algorithms, label modes, alignment controls, and React API mapping.

- **`docs/color-system.md`**: Complete color system architecture documentation. Covers axioms & requirements, CSS theme variables, color utilities, component color resolution hierarchy, CSS variable-based theming system, theme utility functions (`setThemeColor`, `setThemeRoundness`, etc.), predefined theme colors, usage examples, and performance optimizations.

- **`docs/color-property-examples.md`**: Practical examples of using the `color` property with components. Includes basic usage, color animation, combining with other properties, dynamic colors, and component-specific color handling (Keys luminosity variants).

- **`docs/keys-middle-c-positions.md`**: Specifications for middle C positions on physical MIDI keyboards. Documents standard layouts for common keyboard sizes (25-88 keys), MIDI note numbering conventions, visual representations, and transposition considerations.

- **`docs/interaction-system.md`**: Complete interaction system architecture documentation. Covers the `useInteractiveControl` hook, interaction modes, sensitivity tuning, input methods (drag/touch, wheel, keyboard), focus management, accessibility, performance considerations, and component-specific behavior. **Essential reference for understanding how all interactive controls handle user input.**

- **`docs/size-system.md`**: Complete size system architecture documentation. Covers base unit system, component aspect ratios, CSS variable structure, size utility classes, implementation details, customization options, and design system consistency. **Essential reference for understanding component sizing and the size prop.**

**Reference these docs when:**

- Working with AdaptiveBox component (layout, sizing, alignment)
- Implementing or modifying color theming
- Using color properties in components
- Working with Keys component (MIDI note positioning)
- **Implementing or modifying interactive controls (drag, wheel, keyboard interactions)**
- **Tuning sensitivity or interaction behavior**
- **Working with component sizing, size prop, or customizing the size system**

## Component-Specific Notes

### Generic Control Architecture (ContinuousControl, DiscreteControl, BooleanControl)

The library provides generic control components that decouple behavior from visualization. `Knob` and `Slider` use `ContinuousControl` internally, eliminating code duplication.

- **Purpose**: Allows users to use any visualization component (SVG or bitmap-based) as a control without reimplementing interaction logic. Also used internally by built-in controls for shared behavior.
- **Location**: `packages/react/src/components/primitives/controls/`
  - `ContinuousControl.tsx`: For continuous value controls
  - `DiscreteControl.tsx`: For discrete/enum value controls
  - `BooleanControl.tsx`: For boolean (on/off) controls
- **DiscreteControl: Options vs Children (CRITICAL DISTINCTION)**:
  - **`options` prop**: Defines the parameter model (value, label, midiValue). Used for parameter structure. This is the data definition.
  - **`children` (OptionView components)**: Provides visual content (ReactNodes) for rendering. Used for display. This is the visual representation.
  - **These serve different purposes and can be used together**:
    - Use `options` when you have data-driven option definitions (e.g., from API, config file, or computed data)
    - Use `children` when you want to provide custom visual content (icons, styled text, custom components)
    - Use both: `options` for the model, `children` for visuals (matched by value)
  - **Modes of Operation**:
    1. **Ad-Hoc Mode (Options prop)**: Model from `options` prop, visual from `children` (if provided) or default rendering
    2. **Ad-Hoc Mode (Children only)**: Model inferred from OptionView children, visual from children
    3. **Strict Mode (Parameter only)**: Model from `parameter` prop, visual via `renderOption` callback
    4. **Hybrid Mode (Parameter + Children)**: Model from `parameter` prop, visual from children (matched by value)
- **Contract**: The view component must implement `ControlComponentView` interface, defining:
  - `viewBox`: Dimensions for the SVG (required) - serves as default, can be overridden via props
  - `labelHeightUnits`: Label height in viewBox units (optional, defaults to 20) - serves as default, can be overridden via props
  - `interaction`: Preferred mode ("drag" | "wheel" | "both") and direction ("vertical" | "horizontal" | "circular") - serves as default, can be overridden via props
- **Props**: The view receives `ControlComponentViewProps` (normalizedValue, children, className, style) plus any custom props (passed through generic type parameter `P`).
- **Per-Instance Override**: Control primitives accept `AdaptiveBoxLogicalSizeProps` which allow per-instance override of viewBox dimensions:
  - `viewBoxWidthUnits?: number` - Overrides `viewBox.width` from the view component
  - `viewBoxHeightUnits?: number` - Overrides `viewBox.height` from the view component
  - `labelHeightUnits?: number` - Overrides `labelHeightUnits` from the view component
- **Interaction Override**: Interaction behavior can be overridden via `InteractiveControlProps`:
  - `interactionMode?: InteractionMode` - Overrides `interaction.mode` from the view component
  - `interactionDirection?: InteractionDirection` - Overrides `interaction.direction` from the view component
- **Reference Implementations**:
  - `KnobView` (located in `defaults/controls/`) - SVG-based, implements contract with `viewBox: {width: 100, height: 100}`, `labelHeightUnits: 20`, `interaction: {mode: "both", direction: "vertical"}`
  - `VerticalSliderView` / `HorizontalSliderView` (located in `defaults/controls/`) - SVG-based, specialized slider views with orientation-specific viewBox and interaction direction
  - `FilmstripView` (located in `generic/controls/`) - Bitmap-based, uses `FilmstripImage` primitive to display frames from sprite sheets. Default viewBox is 100x100 but is overridden per-instance via props.
  - `ImageSwitchView` (located in `generic/controls/`) - Bitmap-based boolean control that displays one of two images. Default viewBox is 100x100 but is overridden per-instance via props.
  - `ImageKnobView` (located in `generic/controls/`) - Bitmap-based rotary control that rotates an image. Default viewBox is 100x100 but is overridden per-instance via props.
- **Internal Usage**: `Knob` wraps `ContinuousControl` with `view={KnobView}`, `Slider` wraps with `view={VerticalSliderView}` or `view={HorizontalSliderView}` based on orientation
- **Generic Controls**: Filmstrip and image-based controls use default exported view components and pass `viewBoxWidthUnits` and `viewBoxHeightUnits` as props to override the default viewBox dimensions. No factory functions are needed.
- **Performance**: Double memoization (both wrapper and control primitive are memoized) provides optimal re-render protection
- **Type Exports**: `ControlComponent`, `ControlComponentView`, `ControlComponentViewProps`, and `AdaptiveBoxLogicalSizeProps` are exported from `src/index.ts` for users creating custom view components

### Slider Component

The Slider component provides linear fader controls with multiple visual variants and extensive cursor customization.

- **Variants**: Four visual variants available via `variant` prop:
  - `"abstract"`: Minimal design with transparent track background (uses `--audioui-primary-20` for subtle track visibility)
  - `"trackless"`: Track background without padding
  - `"trackfull"`: Full track with thickness-dependent padding (formula: `25 * thickness + 5` pixels)
  - `"stripless"`: No value strip (track only, no fill indicator)
- **Cursor Customization**: Comprehensive cursor props for fine-grained control:
  - `cursorSize`: Determines cursor width source (`"None"` | `"Strip"` | `"Track"` | `"Tick"` | `"Label"`)
    - `"None"`: No cursor rendered
    - `"Strip"`: Width matches ValueStrip (if variant supports it)
    - `"Track"`: Width matches LinearStrip (track background)
    - `"Tick"`: Width includes tick track shift (future use for tick marks)
    - `"Label"`: Width includes tick and label track shifts (future use for full-width cursor)
  - `cursorAspectRatio`: Numeric aspect ratio for cursor (height = width / aspectRatio)
  - `cursorRoundness`: Overrides cursor roundness (defaults to component `roundness` prop)
  - `cursorImageHref`: Optional image URL for image-based cursor (preserves natural aspect ratio)
  - `cursorClassName`: Optional CSS class for cursor
  - `cursorStyle`: Optional inline styles for cursor
- **Cursor Length Adjustment**: Cursor length automatically subtracts cursor height to prevent the cursor from extending beyond strip bounds. This ensures the cursor stays within the visible track area at all positions.
- **Performance Optimizations**: SliderView uses balanced memoization:
  - Memoized: thickness translation, layout coordinates, strip padding, cursor width/height/length calculations, style objects
  - Not memoized: Simple boolean checks (`shouldRenderCursor`), nullish coalescing (`effectiveCursorRoundness`), constant values
  - Constants moved outside component to avoid unnecessary dependency array entries
- **CSS Variables**: Slider-specific color variables in `themes.css`:
  - `--audioui-slider-track-color`: Background track color (defaults to `--audioui-adaptive-20`)
  - `--audioui-slider-strip-color`: Foreground value strip color (defaults to `--audioui-primary-color`)
  - `--audioui-slider-cursor-color`: Cursor fill color (defaults to `--audioui-primary-color`)
  - `--audioui-slider-cursor-border-color`: Cursor border color (uses luminosity variants: `--audioui-primary-lighter` in light mode, `--audioui-primary-darker` in dark mode)
  - `--audioui-slider-cursor-border-width`: Cursor border width (defaults to `1px`)
- **Location**: `packages/react/src/components/defaults/controls/Slider.tsx` (wrapper) and `SliderView.tsx` (SVG view component)

### SVG DOM Optimization

**Design Decision**: Control view components should avoid wrapping single child elements in unnecessary `<g>` (group) elements to reduce DOM depth and improve performance.

**Rule**: When a view component renders only a single child element (e.g., a single primitive component), the `<g>` wrapper should be removed and props (like `className`) should be passed directly to the child element.

**Examples**:

- ✅ **Correct**: `ImageSwitchView` renders `<Image className={className} />` directly (no `<g>` wrapper)
- ✅ **Correct**: `FilmstripView` renders `<FilmstripImage className={className} />` directly (no `<g>` wrapper)
- ✅ **Correct**: `ImageKnobView` renders `<RotaryImage className={className} />` directly (no `<g>` wrapper)
- ❌ **Incorrect**: Wrapping a single child in `<g className={className}><Child /></g>` when the child accepts `className`

**When `<g>` is necessary**:

- Multiple children need to be grouped together
- Transform, className, or style must be applied to a container that cannot be applied to the child element
- The child element does not accept the necessary props (className, style, transform)

**Performance Impact**: Reducing DOM depth by one level can improve rendering performance, especially in scenarios with many controls (100+ knobs). This optimization is particularly important for audio applications where smooth UI performance is critical.

**Reference**: See `packages/react/docs/svg-view-primitives.md` for complete documentation on SVG primitives and DOM optimization guidelines.

### Filmstrip-Based Controls (Generic Components)

The library provides filmstrip-based controls that support the widely-used current industry standard for control representation: bitmap sprite sheets (filmstrips). These components are located in `src/components/generic/controls/`.

**Current Industry Standard Support**:

- Filmstrips (bitmap sprite sheets) are the current widely-used standard in the audio/MIDI industry for representing control states
- Each frame in the sprite sheet represents a different control state (value, position, on/off, etc.)
- This approach is commonly used in professional audio software and hardware interfaces

**Trade-offs and Benefits**:

- **Constraint**: Bitmap-based visualization is more constrained than SVG (no dynamic theming, fixed visual appearance)
- **Benefit**: Despite using bitmaps, these components provide **full access to all library features**:
  - Complete layout system: AdaptiveBox with all sizing modes, label positioning, alignment options
  - Full parameter model: AudioParameter with min/max ranges, scaling functions (linear/log/exp), units, custom formatting
  - Complete interaction system: Drag, wheel, and keyboard interactions with configurable sensitivity and modes
  - Full accessibility: ARIA attributes, focus management, keyboard navigation
  - All AdaptiveBox features: Container queries, responsive sizing, label modes (visible/hidden/none)

**Components**:

- `FilmStripContinuousControl`: Maps continuous values (0-1) to frame indices (0 to frameCount-1)
- `FilmStripDiscreteControl`: Maps discrete values to frame indices based on option count
- `FilmStripBooleanControl`: Maps boolean values to frames (typically 2 frames: false/off, true/on)

**Props**: Filmstrip-specific props (`frameWidth`, `frameHeight`, `frameCount`, `imageHref`, `orientation`, `frameRotation`) are defined in `FilmstripProps` type. These components do NOT support themable props (color, roundness, thickness) as visuals are entirely determined by the image content.

**View Component**: `FilmstripView` (located in `generic/controls/`) uses the `FilmstripImage` primitive to render frames from sprite sheets. The view component has a default viewBox of 100x100, but generic controls pass `viewBoxWidthUnits` and `viewBoxHeightUnits` props to override these defaults with the actual frame dimensions. This allows per-instance customization without needing factory functions.

### Unified Interaction System (useInteractiveControl)

**Comprehensive Documentation**: See `packages/react/docs/interaction-system.md` for complete interaction system architecture, design decisions, sensitivity tuning, and implementation details.

**Quick Reference**:

- **Hook Location**: `packages/react/src/hooks/useInteractiveControl.ts` (wrapper around core's `InteractionController`)
- **Core Logic**: `packages/core/src/controller/InteractionController.ts`
- **Interaction Modes**: Controls support `interactionMode` ("drag" | "wheel" | "both") to restrict input methods.
- **Interaction Direction**: Continuous controls (Knob, Slider) support `interactionDirection` ("vertical" | "horizontal" | "circular") to define drag behavior. Knobs default to "circular" for rotary behavior. CycleButton is discrete-only and does not support drag interaction.
- **Interaction Sensitivity**: High-level components support `interactionSensitivity` to tune drag responsiveness. Lower-level components use `direction` and `sensitivity` internally.
- **Sensitivity Tuning**:
  - Knob: `0.008` drag (increased for responsiveness)
  - Slider: `0.005` drag (standard)
  - CycleButton: Discrete-only (no continuous interaction - click/keyboard only)
- **Mouse/Touch**:
  - `user-select: none` applied during drag to prevent text selection.
  - `preventDefault` on `onMouseDown` is AVOIDED to allow element focus (enabling keyboard support).
  - Global window listeners attached only during active drag sessions (zero overhead when idle).
- **Keyboard**:
  - Standard focus management via `tabIndex={0}`.
  - Arrow keys increment/decrement values (clamped at min/max).
  - Home/End jump to min/max.
  - `CycleButton`: Space key and Click cycle through options ("rotate" with wrap-around).
  - `CycleButton`: Arrow keys step increment/decrement (clamped, no wrap).
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
  - O(1) value-to-index Map lookups in CycleButton.
  - Memoized event handlers with `useCallback`.

### CycleButton (Discrete Parameters)

- **Discrete-Only Control**: CycleButton is a discrete interaction control only. It does not support continuous interaction (drag/wheel). All interactions result in discrete step changes.
- **Visual Variants**: Designed to support multiple visual variants (rotary knob-style, LED indicators, etc.). The current implementation uses a rotary knob-style visual, but the architecture supports other variants.
- **Icon Theming**: Uses inline SVG components with `fill="currentColor"` to inherit text color automatically. Library CSS applies `fill: currentColor` to all inline SVGs within content. Third-party icon libraries (e.g., react-icons) work seamlessly.
- **Options vs Children (CRITICAL DISTINCTION)**:
  - **`options` prop**: Defines the parameter model (value, label, midiValue). Used for parameter structure. This is the data definition.
  - **`children` (OptionView components)**: Provides visual content (ReactNodes) for rendering. Used for display. This is the visual representation.
  - **These serve different purposes and can be used together**:
    - Use `options` when you have data-driven option definitions (e.g., from API, config file, or computed data)
    - Use `children` when you want to provide custom visual content (icons, styled text, custom components)
    - Use both: `options` for the model, `children` for visuals (matched by value)
  - **Modes of Operation**:
    1. **Ad-Hoc Mode (Options prop)**: Model from `options` prop, visual from `children` (if provided) or default rendering
    2. **Ad-Hoc Mode (Children only)**: Model inferred from OptionView children, visual from children
    3. **Strict Mode (Parameter only)**: Model from `parameter` prop, visual via `renderOption` callback
    4. **Hybrid Mode (Parameter + Children)**: Model from `parameter` prop, visual from children (matched by value)
- **Interaction Methods**:
  - **Click**: Cycles to next value (same as Space key, wraps to first when reaching end)
  - **Space Key**: Cycles to next value (wraps to first when reaching end)
  - **Arrow Keys**: Step increment/decrement (clamped at min/max, no wrap)
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
