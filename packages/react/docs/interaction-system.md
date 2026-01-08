<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

# Interaction System

The interaction system in AudioUI provides a unified way to handle user input across all control components. Continuous controls (Knob, Slider) use continuous interaction (drag/wheel), while discrete controls (CycleButton, Button) use discrete interaction (click/keyboard). It is designed to be performant, accessible, and consistent with professional audio software standards.

## Architecture

The interaction system consists of three main hooks:

1. **`useContinuousInteraction`** - For continuous controls (Knob, Slider)
2. **`useBooleanInteraction`** - For boolean controls (Button)
3. **`useDiscreteInteraction`** - For discrete/enum controls (CycleButton)

### Continuous Interaction

The core of continuous interaction is the `useContinuousInteraction` hook, which centralizes the logic for:

- **Pointer Dragging**: Mouse and Touch support with velocity-sensitive value adjustment.
- **Mouse Wheel**: High-precision scrolling with configurable sensitivity.
- **Keyboard Navigation**: Accessible control via Arrow keys, Home/End, and specialized handlers (Space/Enter).
- **Focus Management**: Consistent focus behavior and styling.

### Boolean Interaction

The `useBooleanInteraction` hook wraps the framework-agnostic `BooleanInteractionController` and provides:

- **Momentary Mode**: Press to activate, release to deactivate (with global pointer tracking).
- **Toggle Mode**: Click to toggle state.
- **Drag-In/Drag-Out**: Hardware-like behavior where buttons respond to pointer entering/leaving while pressed, even when press starts outside the button.
- **Global Pointer Tracking**: Tracks pointer state globally to enable drag-in behavior from anywhere on the page.
- **Keyboard Support**: Enter/Space for activation/release.

### Discrete Interaction

The `useDiscreteInteraction` hook wraps the framework-agnostic `DiscreteInteractionController` and provides:

- **Cycling**: Click or Space/Enter to cycle to the next value (wraps around to the start).
- **Stepping**: Arrow keys to step up/down through options (clamped at min/max).
- **Value Resolution**: Automatically finds the nearest valid option index when the current value doesn't match any option.
- **Keyboard Support**: Arrow keys for stepping, Space/Enter for cycling.

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

### `useDiscreteInteraction` Hook

This hook provides discrete interaction logic for controls that cycle through a set of options.

```typescript
const handlers = useDiscreteInteraction({
  value, // Current value (string or number)
  options, // Array of { value: string | number }
  onValueChange, // Callback to update the value
  disabled, // Whether the control is disabled
});
```

It returns event handlers (`handleClick`, `handleKeyDown`) and manual control methods (`cycleNext`, `stepNext`, `stepPrev`) that can be used to programmatically control the discrete value.

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

- **Click**: Clicking the control cycles to the next value (wraps around to the start).
- **Keyboard**:
  - `Arrow Up` / `Arrow Right`: Step to next value (clamped at max).
  - `Arrow Down` / `Arrow Left`: Step to previous value (clamped at min).
  - `Space` / `Enter`: Cycle to next value (wraps around).
- **Implementation**: Uses `useDiscreteInteraction` hook which wraps `DiscreteInteractionController` for framework-agnostic discrete option management.

### Button

- **Interaction**: Click or `Space`/`Enter` to activate.
- **Modes**: Supports `momentary` (active only while pressed) and `latch` (toggle on/off).
- **Drag-In/Drag-Out Behavior**: Buttons support hardware-like drag-in/drag-out interactions that work even when the press starts outside the button boundary:
  - **Momentary Mode**:
    - Press inside button → turns on
    - Drag out while still pressed → turns off
    - Drag back in while still pressed → turns on again
    - Works even when press starts outside the button
  - **Toggle/Latch Mode**:
    - Press inside button → toggles state
    - Drag out while still pressed → no change (state remains)
    - Drag back in while still pressed → toggles again
    - Works even when press starts outside the button
- **Step Sequencer Pattern**: The drag-in/drag-out behavior enables classic step sequencer interactions where multiple buttons can be activated with a single drag gesture, perfect for programming drum patterns or melodic sequences.
- **Implementation**: Uses global pointer tracking (`BooleanInteractionController`) and `mouseenter`/`mouseleave` events to detect when pointer crosses button boundary while pressed.

## Styling & Accessibility

- **Highlight Class**: `.audioui-highlight` provides the standard interaction visual (hover/focus).
- **Focus**: Uses `:focus-visible` and `:focus-within` to apply the highlight style when focused, replacing the default outline.
- **ARIA**: Components automatically receive `role="slider"` (or `button`), `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-label`.

## Performance

- **Lazy Listeners**: Global `mousemove`/`touchmove` listeners are only attached _during_ an active drag session and removed immediately after.
- **Refs**: Mutable state (drag start position, current value) is tracked in `useRef` to avoid stale closures and unnecessary re-renders during high-frequency events.
- **Native Events**: Wheel handling uses native non-passive listeners (via `AdaptiveBox`) to reliably prevent page scrolling, which React's synthetic events cannot always guarantee.
