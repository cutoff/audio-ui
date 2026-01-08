<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

**Version**: 2.0 | **Meta**: Extends root AGENTS.md for library internals (component exports, build, env).

## Architecture: React Implementation of Framework-Agnostic Core

**CRITICAL**: This package (`packages/react/`) is the **React-specific implementation** of the AudioUI library.

- **Framework-Agnostic Core**: `packages/core/` contains all business logic, models, controllers, utilities, and styles that are independent of any UI framework. It has zero framework dependencies and can be used by any framework implementation.
- **React Implementation**: This package (`packages/react/`) provides React components, hooks, and React-specific adapters that wrap the framework-agnostic core logic from `@cutoff/audio-ui-core`.
- **Future Implementations**: The architecture supports additional framework-specific packages (e.g., `packages/solid/` for SolidJS). Each would depend on `@cutoff/audio-ui-core` and provide framework-specific components following the same pattern.

**Key Pattern**: React components use core's `InteractionController`, models, and utilities, but add React-specific rendering via hooks (`useInteractiveControl`, `useAudioParameter`) and React components.

## Quick Setup Summary (Load This First)

| Category            | Details                                                                                                                                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scripts             | `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm link`, `pnpm lint:css`                                                                                                                                                                          |
| Env Vars            | None                                                                                                                                                                                                                                               |
| Component Structure | Props with JSDoc; default params; function ComponentName() {}; arrow functions for handlers; SVG for graphics                                                                                                                                      |
| Exports             | All from src/index.ts: Components (Button, Knob, Slider, Keybed, AdaptiveBox, ContinuousControl, etc.), Providers (AudioUiProvider, hooks), Types (including ControlComponent, ControlComponentView), Utils (formatters, note utils), Theme colors |
| Testing             | Vitest; .test.tsx alongside; mock deps; React 18 compat                                                                                                                                                                                            |
| Build               | Vite; generates dist/index.js, index.d.ts, style.css; ES modules                                                                                                                                                                                   |
| Path Aliases        | Use `@/primitives/*`, `@/hooks/*`, `@/defaults/*`, `@/utils/*`, `@/types` instead of relative paths (configured in tsconfig.json and vite.config.ts)                                                                                               |

## Key File Structure

- `src/components/`: Component .tsx with .test.tsx
  - `defaults/`: Default/built-in components and theme system
    - `controls/`: Interactive controls (Button, Knob, Slider, CycleButton) and their SVG views (ButtonView, KnobView, SliderView). Knob and Slider use ContinuousControl internally.
    - `devices/`: Device components (Keybed)
    - `AudioUiProvider.tsx`: Default theme system provider
  - `primitives/`: Base components for building final components, excluding theme-specific
    - `controls/`: Control primitives (ContinuousControl, Option)
    - `svg/`: SVG view primitives (ValueRing, RotaryImage, RadialImage, RadialText, etc.)

## Component Architecture: Built-in vs Customizable

**Built-in Controls** (`src/components/defaults/controls/`):

- Ready-to-use components (Button, Knob, Slider, CycleButton)
- Include `ThemableProps` (`color`, `roundness`) via type extensions
- Opinionated, production-ready with full theming integration
- Props: `KnobProps`, `SliderProps`, `ButtonProps` extend primitives with `ThemableProps`
- SVG view components (ButtonView, KnobView, SliderView) are co-located with the controls that use them

**Customizable Primitives** (`src/components/primitives/`):

- Lower-level components organized by purpose:
  - `controls/`: Control primitives (ContinuousControl, Option)
  - `svg/`: SVG view primitives (ValueRing, RotaryImage, RadialImage, RadialText, etc.)
- No built-in theming - users add their own theming props as needed
- For building custom controls without theming constraints
- Props: `ContinuousControlProps`, `BooleanControlProps` (no `ThemableProps` included)

**Type System:**

- Primitive types (`ContinuousControlProps`, `BooleanControlProps`) do NOT include `ThemableProps`
- Built-in control types (`KnobProps`, `SliderProps`, `ButtonProps`) extend primitives with `ThemableProps`
- This separation allows custom controls to opt into theming only if needed
- `src/index.ts`: Export all components, types, utilities, and theme colors
- `src/hooks/`: React adapters for Core logic (`useAudioParameter`, `useContinuousInteraction`)
- `dist/`: Built output (index.js, index.d.ts, style.css)
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
  - Example: `import { useThemableProps } from "@/defaults/AudioUiProvider";`
  - Example: `import KnobView from "@/defaults/controls/KnobView";`

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

- **`docs/color-system.md`**: Complete color system architecture documentation. Covers axioms & requirements, CSS theme variables, color utilities (`generateColorVariants`, `getAdaptiveDefaultColor`), component color resolution hierarchy, theme provider system (`AudioUiProvider`, `useThemableProps`), predefined theme colors, usage examples, and performance optimizations.

- **`docs/color-property-examples.md`**: Practical examples of using the `color` property with components. Includes basic usage, color animation, combining with other properties, dynamic colors, and component-specific color handling (Keybed luminosity variants).

- **`docs/keybed-middle-c-positions.md`**: Specifications for middle C positions on physical MIDI keyboards. Documents standard layouts for common keyboard sizes (25-88 keys), MIDI note numbering conventions, visual representations, and transposition considerations.

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

### Generic Control Architecture (ContinuousControl)

The library provides a generic `ContinuousControl` component that decouples behavior from visualization. `Knob` and `Slider` use `ContinuousControl` internally, eliminating code duplication.

- **Purpose**: Allows users to use any SVG component as a continuous control (knob, fader, etc.) without reimplementing interaction logic. Also used internally by `Knob` and `Slider` for shared behavior.
- **Location**: `packages/react/src/components/primitives/controls/ContinuousControl.tsx`
- **Contract**: The view component must implement `ControlComponentView` interface, defining:
  - `viewBox`: Dimensions for the SVG (required)
  - `labelHeightUnits`: Label height in viewBox units (optional, defaults to 20)
  - `interaction`: Preferred mode ("drag" | "wheel" | "both") and direction ("vertical" | "horizontal" | "circular")
- **Props**: The view receives `ControlComponentViewProps` (normalizedValue, children, className, style) plus any custom props (passed through generic type parameter `P`).
- **Reference Implementations**:
  - `KnobView` (located in `defaults/controls/`) - implements contract with `viewBox: {width: 100, height: 100}`, `labelHeightUnits: 20`, `interaction: {mode: "both", direction: "vertical"}`
  - `VerticalSliderView` / `HorizontalSliderView` (located in `defaults/controls/`) - specialized slider views with orientation-specific viewBox and interaction direction
- **Internal Usage**: `Knob` wraps `ContinuousControl` with `view={KnobView}`, `Slider` wraps with `view={VerticalSliderView}` or `view={HorizontalSliderView}` based on orientation
- **Performance**: Double memoization (both wrapper and ContinuousControl are memoized) provides optimal re-render protection
- **Type Exports**: `ControlComponent`, `ControlComponentView`, and `ControlComponentViewProps` are exported from `src/index.ts` for users creating custom view components

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

### CycleButton (Enum Parameters)

- **Discrete-Only Control**: CycleButton is a discrete interaction control only. It does not support continuous interaction (drag/wheel). All interactions result in discrete step changes.
- **Visual Variants**: Designed to support multiple visual variants (rotary knob-style, LED indicators, etc.). The current implementation uses a rotary knob-style visual, but the architecture supports other variants.
- **Icon Theming**: Uses inline SVG components with `fill="currentColor"` to inherit text color automatically. Library CSS applies `fill: currentColor` to all inline SVGs within content. Third-party icon libraries (e.g., react-icons) work seamlessly.
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
