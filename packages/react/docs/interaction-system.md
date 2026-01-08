<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

# Interaction System

The interaction system in AudioUI provides a unified way to handle user input across all control components. Continuous controls (Knob, Slider) use continuous interaction (drag/wheel), while discrete controls (CycleButton, Button) use discrete interaction (click/keyboard). It is designed to be performant, accessible, and consistent with professional audio software standards.

## Architecture

The core of the system is the `useContinuousInteraction` hook, which centralizes the logic for:

- **Pointer Dragging**: Mouse and Touch support with velocity-sensitive value adjustment.
- **Mouse Wheel**: High-precision scrolling with configurable sensitivity.
- **Keyboard Navigation**: Accessible control via Arrow keys, Home/End, and specialized handlers (Space/Enter).
- **Focus Management**: Consistent focus behavior and styling.

### `useContinuousInteraction` Hook

This hook abstracts the complexity of event handling and state management.

```typescript
const handlers = useContinuousInteraction({
  adjustValue, // Function to update the normalized value
  value, // Current normalized value (optional)
  interactionMode, // "drag" | "wheel" | "both"
  direction, // "vertical" | "horizontal" | "circular" (internal prop name)
  sensitivity, // Drag sensitivity (normalized value per pixel) (internal prop name)
  wheelSensitivity, // Wheel sensitivity (normalized value per unit)
  disabled, // Whether the control is disabled
});
```

**Note**: High-level components (Knob, CycleButton, Slider) expose these props as `interactionDirection` and `interactionSensitivity` for clarity. The internal hook uses `direction` and `sensitivity`.

It returns a set of event handlers (`onMouseDown`, `onTouchStart`, `onWheel`, `onKeyDown`) and accessibility props (`tabIndex`, `role`, `aria-*`) that should be spread onto the interactive element.

## Interaction Modes

### Dragging (Mouse & Touch)

- **Behavior**: Click/Touch and drag to adjust value.
- **Direction**:
  - **Knobs**: Defaults to Circular drag (Rotational drag around the center: Clockwise = Increase, Counter-Clockwise = Decrease). Can be configured to "vertical" or "horizontal" for linear behavior.
  - **Vertical Sliders**: Defaults to Vertical drag (Up = Increase, Down = Decrease).
  - **Horizontal Sliders**: Horizontal drag (Right = Increase, Left = Decrease).
  - **Circular Mode**: Rotational drag around the center of the element (Clockwise = Increase, Counter-Clockwise = Decrease).
- **Text Selection**: Automatically disabled (`user-select: none`) during drag operations to prevent accidental selection.
- **Focus**: Clicking a control gives it focus, enabling keyboard interaction.
- **Sensitivity**: Configurable per component. Default is tuned for precision (`0.005` for continuous, `0.1` for discrete).

### Mouse Wheel

- **Behavior**: Scroll over the control to adjust value.
- **Direction**: Standard scrolling (Up/Push = Increase, Down/Pull = Decrease).
- **Page Scroll**: Strictly prevented. Wheel events on controls stop propagation and default behavior to avoid scrolling the page while adjusting parameters.
- **Sensitivity**: Configurable. Tuned to be responsive but controllable (`stepSize / 5` for discrete controls).

### Keyboard

- **Focus**: Controls are focusable via Tab navigation.
- **Visual Feedback**: Focused controls display a high-contrast highlight effect (brightness/contrast boost + shadow), consistent with the hover state, instead of a browser-default focus ring.
- **Keys**:
  - `Arrow Up` / `Arrow Right`: Increment value.
  - `Arrow Down` / `Arrow Left`: Decrement value.
  - `Home`: Set to Minimum.
  - `End`: Set to Maximum.
  - `Space` / `Enter`:
    - **Button**: Toggle/Activate.
    - **CycleButton**: Cycle to next value (wraps around).

## Component Implementation

### Knob & Slider (Continuous)

- **Drag**: Standard continuous adjustment.
- **Wheel**: Fine adjustments.
- **Keyboard**: Step-based increments.

### CycleButton (Discrete/Enum)

- **Click**: Clicking the control cycles to the next value (like `Space`).
- **Keyboard**:
  - `Arrow Keys`: Step up/down (clamped at min/max).
  - `Space`: Cycle next (wraps around).

### Button

- **Interaction**: Click or `Space`/`Enter` to activate.
- **Modes**: Supports `momentary` (active only while pressed) and `latch` (toggle on/off).

## Styling & Accessibility

- **Highlight Class**: `.audioui-highlight` provides the standard interaction visual (hover/focus).
- **Focus**: Uses `:focus-visible` and `:focus-within` to apply the highlight style when focused, replacing the default outline.
- **ARIA**: Components automatically receive `role="slider"` (or `button`), `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-label`.

## Performance

- **Lazy Listeners**: Global `mousemove`/`touchmove` listeners are only attached _during_ an active drag session and removed immediately after.
- **Refs**: Mutable state (drag start position, current value) is tracked in `useRef` to avoid stale closures and unnecessary re-renders during high-frequency events.
- **Native Events**: Wheel handling uses native non-passive listeners (via `AdaptiveBox`) to reliably prevent page scrolling, which React's synthetic events cannot always guarantee.
