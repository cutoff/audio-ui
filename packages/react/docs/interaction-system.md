<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

# Interaction System

The interaction system in AudioUI provides a unified way to handle user input across all control components. Continuous controls (Knob, Slider) use continuous interaction (drag/wheel), discrete controls (CycleButton, Button) use discrete interaction (click/keyboard), and note-based controls (Keys) use note interaction (pointer events with glissando). It is designed to be performant, accessible, and consistent with professional audio software standards.

## Architecture

The interaction system consists of four main hooks:

1. **`useContinuousInteraction`** - For continuous controls (Knob, Slider)
2. **`useBooleanInteraction`** - For boolean controls (Button)
3. **`useDiscreteInteraction`** - For discrete/enum controls (CycleButton)
4. **`useNoteInteraction`** - For note-based controls (Keys)

### Continuous Interaction

The core of continuous interaction is the `useContinuousInteraction` hook, which centralizes the logic for:

- **Pointer Dragging**: Mouse and Touch support with adaptive sensitivity.
- **Mouse Wheel**: High-precision scrolling with configurable sensitivity and accumulator for discrete steps.
- **Keyboard Navigation**: Accessible control via Arrow keys, Home/End, and specialized handlers (Space/Enter).
- **Double-Click Reset**: Double-click to reset the value to its default (only active when editable and `resetToDefault` is provided).
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

### Note Interaction

The `useNoteInteraction` hook wraps the framework-agnostic `NoteInteractionController` and provides:

- **Multi-Touch Support**: Tracks multiple concurrent pointers (mouse, multi-touch) for polyphonic interactions.
- **Glissando Detection**: Detects note changes when sliding across keys, automatically triggering note off for the previous key and note on for the new key.
- **Pointer Capture**: Uses pointer capture to continue receiving events even when the pointer leaves the element, enabling smooth glissando across the entire keyboard.
- **Note Events**: Triggers `onNoteOn` when a key is pressed and `onNoteOff` when released or when moving to a different key.
- **Touch Action**: Applies `touchAction: "none"` to prevent default touch behaviors (scrolling, zooming).

### `useContinuousInteraction` Hook

This hook abstracts the complexity of event handling and state management.

```typescript
const handlers = useContinuousInteraction({
  adjustValue, // Function to update the normalized value
  resetToDefault, // Function to reset value to default (called on double-click)
  interactionMode, // "drag" | "wheel" | "both"
  direction, // "vertical" | "horizontal" | "circular" | "both"
  sensitivity, // Drag sensitivity (normalized value per pixel, default: 0.005)
  wheelSensitivity, // Wheel sensitivity (normalized value per unit, default: 0.005)
  step, // Normalized step size (0..1) for adaptive behavior and accumulators
  min, // Minimum value (real domain) - used to calculate normalized step if step not provided
  max, // Maximum value (real domain) - used to calculate normalized step if step not provided
  paramStep, // Step size (real domain) - used to calculate normalized step if step not provided
  disabled, // Whether the control is disabled
  editable, // Whether the control is editable (default: true)
});
```

**Adaptive Sensitivity**: When `step` (or `min`/`max`/`paramStep`) is provided, the hook automatically calculates adaptive drag sensitivity to ensure responsiveness. The normalized step is calculated from real values if needed, and the effective sensitivity is `Math.max(baseSensitivity, stepSize / TARGET_PIXELS_PER_STEP)` where `TARGET_PIXELS_PER_STEP = 30`.

**Note**: High-level components (Knob, CycleButton, Slider) expose these props as `interactionDirection` and `interactionSensitivity` for clarity. The internal hook uses `direction` and `sensitivity`.

It returns a set of event handlers (`onMouseDown`, `onTouchStart`, `onWheel`, `onKeyDown`, `onDoubleClick`) and accessibility props (`tabIndex`, `role`, `aria-*`) that should be spread onto the interactive element.

**Double-Click Reset**: When `resetToDefault` is provided and the control is editable and not disabled, double-clicking the control resets the value to its default. The default value is determined by the parameter's `defaultValue` property, or calculated as 0.0 for unipolar or 0.5 for bipolar parameters when not specified.

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

### `useNoteInteraction` Hook

This hook provides note interaction logic for keyboard-like components that need to handle polyphonic input and glissando.

```typescript
const { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, style } = useNoteInteraction({
  onNoteOn: (note) => synth.noteOn(note), // MIDI note number (0-127)
  onNoteOff: (note) => synth.noteOff(note), // MIDI note number (0-127)
  disabled, // Whether the interaction is disabled
});
```

It returns pointer event handlers (`onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerCancel`) and a style object containing `touchAction: "none"` to prevent default touch behaviors. The component must provide `data-note` attributes on key elements for note detection.

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
- **Sensitivity**: Configurable per component. Defaults to `0.005` (approx 200px throw).
  - **Adaptive Sensitivity**: For low-resolution parameters (where step size is large), the sensitivity is automatically adjusted to ensure that a single step change requires no more than 30 pixels of movement (`TARGET_PIXELS_PER_STEP`). This prevents "dead zones" in discrete-like continuous controls. The adaptive calculation uses `Math.max(baseSensitivity, stepSize / TARGET_PIXELS_PER_STEP)` to ensure responsiveness.
  - **Drag Accumulator**: Uses an accumulator for stepped parameters to support slow dragging without losing progress between events. Small drag movements accumulate until they exceed the step size, at which point the value is adjusted in discrete steps. This prevents unresponsive behavior when dragging slowly on low-resolution parameters.

### Mouse Wheel

- **Behavior**: Scroll over the control to adjust value.
- **Direction**: Standard scrolling (Up/Push = Increase, Down/Pull = Decrease).
- **Page Scroll**: Strictly prevented. Wheel events on controls stop propagation and default behavior to avoid scrolling the page while adjusting parameters.
- **Sensitivity**: Configurable. Defaults to `DEFAULT_WHEEL_SENSITIVITY` (0.005).
  - **Decoupled**: Wheel sensitivity is decoupled from drag sensitivity to prevent "too fast" scrolling on low-resolution parameters that use boosted drag sensitivity. This allows independent tuning of wheel and drag interactions.
  - **Wheel Accumulator**: For stepped parameters, wheel deltas are accumulated until they exceed the step size. This ensures reliable operation across different hardware (trackpads with small deltas vs. mice with large clicks) and prevents landing "between" steps. The accumulator ensures that even small wheel movements contribute to value changes.

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

### Pointer Events (Keys)

- **Multi-Touch**: Supports multiple concurrent touches for polyphonic playing.
- **Glissando**: Sliding across keys automatically triggers note off for the previous key and note on for the new key.
- **Pointer Capture**: Uses pointer capture to continue receiving events even when the pointer leaves the element, enabling smooth glissando across the entire keyboard.
- **Touch Action**: Prevents default touch behaviors (scrolling, zooming) via `touchAction: "none"`.

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

### Keys

- **Interaction**: Click/touch keys to trigger note on/off events.
- **Multi-Touch**: Supports multiple concurrent touches for polyphonic playing.
- **Glissando**: Sliding across keys automatically triggers note off for the previous key and note on for the new key, enabling smooth glissando effects.
- **Pointer Capture**: Uses pointer capture to continue receiving events even when the pointer leaves the element, ensuring reliable glissando detection across the entire keyboard.
- **Note Detection**: Keys must have `data-note` attributes (MIDI note numbers 0-127) for the interaction system to detect which key is being pressed.
- **Touch Action**: Prevents default touch behaviors (scrolling, zooming) via `touchAction: "none"`.
- **Implementation**: Uses `useNoteInteraction` hook which wraps `NoteInteractionController` for framework-agnostic note interaction logic.

## Styling & Accessibility

- **Highlight Class**: `.audioui-highlight` provides the standard interaction visual (hover/focus).
- **Focus**: Uses `:focus-visible` and `:focus-within` to apply the highlight style when focused, replacing the default outline.
- **ARIA**: Components automatically receive `role="slider"` (or `button`), `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-label`.

## Cursor Behavior

The interaction system provides intelligent cursor feedback based on the control's interaction capabilities and state. All cursor values use CSS variables (defined in `packages/core/src/styles/themes.css`) for customization.

### ContinuousControl (Knob, Slider)

Cursor behavior depends on whether the control is editable (`onChange`), clickable (`onClick`), or both:

**When Editable (`onChange` provided):**

- Uses `useContinuousInteraction` hook which selects cursor based on interaction configuration:
  - `disabled` → `--audioui-cursor-disabled` (default: `not-allowed`)
  - `!editable` (no onChange) → `--audioui-cursor-noneditable` (default: `default`)
  - `interactionMode === "wheel"` → `--audioui-cursor-vertical` (default: `ns-resize`)
  - `direction === "horizontal"` → `--audioui-cursor-horizontal` (default: `ew-resize`)
  - `direction === "vertical"` → `--audioui-cursor-vertical` (default: `ns-resize`)
  - `direction === "both"` → `--audioui-cursor-bidirectional` (default: `move`)
  - `direction === "circular"` → `--audioui-cursor-circular` (custom circular cursor)
  - Otherwise → `--audioui-cursor-clickable` (default: `pointer`)
- **During drag**: Cursor is applied to `document.body` by the controller to provide consistent feedback even when the pointer moves outside the control boundary.

**When Clickable Only (`onClick` but no `onChange`):**

- Always uses `--audioui-cursor-clickable` (default: `pointer`) regardless of direction/mode configuration.

**When Neither (`!onChange && !onClick`):**

- No cursor style applied (default browser cursor).

### DiscreteControl (CycleButton)

**When Interactive (`onChange || onClick`):**

- Always uses `--audioui-cursor-clickable` (default: `pointer`).

**When Neither (`!onChange && !onClick`):**

- No cursor style applied (default browser cursor).

### BooleanControl (Button)

**When Interactive (`onChange || onClick`):**

- Always uses `--audioui-cursor-clickable` (default: `pointer`).

**When Neither (`!onChange && !onClick`):**

- No cursor style applied (default browser cursor).

### Keys

**When Interactive (`onChange || onClick`):**

- Always uses `--audioui-cursor-clickable` (default: `pointer`).

**When Neither (`!onChange && !onClick`):**

- No cursor style applied (default browser cursor).

### Cursor Customization

All cursor values are customizable via CSS variables in `packages/core/src/styles/themes.css`:

- `--audioui-cursor-clickable`: Clickable controls (default: `pointer`)
- `--audioui-cursor-bidirectional`: Continuous controls with `direction="both"` (default: SVG data URI for `move` cursor)
- `--audioui-cursor-horizontal`: Horizontal drag (default: SVG data URI for `ew-resize` cursor)
- `--audioui-cursor-vertical`: Vertical drag (default: SVG data URI for `ns-resize` cursor)
- `--audioui-cursor-circular`: Circular drag for knobs (custom circular cursor)
- `--audioui-cursor-noneditable`: Non-editable controls (default: `default`)
- `--audioui-cursor-disabled`: Disabled controls (default: `not-allowed`)

**Note on SVG Cursors**: The library uses SVG data URIs for bidirectional, horizontal, and vertical cursors instead of standard CSS keywords (like `ns-resize`) to ensure consistent behavior across browsers, specifically addressing a Safari regression where CSS variable-based keyword cursors were ignored in inline styles.

The cursor selection logic (which cursor to show when) is fixed based on interaction state, but the actual cursor values are customizable via CSS variables.

## Performance

- **Lazy Listeners**: Global `mousemove`/`touchmove` listeners are only attached _during_ an active drag session and removed immediately after.
- **Refs**: Mutable state (drag start position, current value) is tracked in `useRef` to avoid stale closures and unnecessary re-renders during high-frequency events.
- **Native Events**: Wheel handling uses native non-passive listeners (via `AdaptiveBox`) to reliably prevent page scrolling, which React's synthetic events cannot always guarantee.
