# Example Components Guide

This directory contains reference implementations of custom control components using the `@cutoff/audio-ui-react` library. These examples demonstrate how to build performant, interactive, and visually rich audio controls using the library's primitives.

## Anatomy of a Control Component

A custom control component is a pure React component that implements the `ControlComponentView` contract. It is responsible for rendering the visual state of the control based on a `normalizedValue` (0-1).

### Basic Structure

```tsx
"use client";

import { useMemo } from "react";
import { ControlComponentViewProps, ControlComponent } from "@cutoff/audio-ui-react";

// 1. Define Props
export type MyKnobProps = ControlComponentViewProps;

// 2. Component Implementation
function MyKnob({ normalizedValue, className, style }: MyKnobProps) {
  // Memoize style to prevent re-renders
  const groupStyle = useMemo(() => ({ ...style }), [style]);

  return (
    <g className={className} style={groupStyle}>
      {/* Render your SVG content here */}
      <circle cx={50} cy={50} r={40} fill="currentColor" />
    </g>
  );
}

// 3. Static Configuration (Required)
MyKnob.viewBox = { width: 100, height: 100 }; // Coordinate system
MyKnob.interaction = { mode: "both", direction: "circular" }; // Interaction behavior (circular for rotary knobs)
MyKnob.labelHeightUnits = 15; // Space reserved for label/value text

// 4. Metadata (Documentation)
MyKnob.title = "My Custom Knob";
MyKnob.description = "Description of the component.";

// 5. Export
export default MyKnob as ControlComponent;
```

## Optimization Guidelines

Audio controls often update at 60fps (or higher) during interaction. Optimizing render performance is critical to avoid UI stutter.

### 1. Hoist Constants

Move all static objects, arrays, and primitive values **outside** the component function. This prevents garbage collection churn and object identity changes.

**Bad:**

```tsx
function BadKnob() {
    // Created on every render!
    const arcStyle = { stroke: "blue", opacity: 0.5 };
    return <Ring fgArcStyle={arcStyle} ... />;
}
```

**Good:**

```tsx
// Created once
const FG_ARC_STYLE = { stroke: "blue", opacity: 0.5 };

function GoodKnob() {
    return <Ring fgArcStyle={FG_ARC_STYLE} ... />;
}
```

### 2. Pre-calculate Geometry

If your SVG paths are static (don't depend on props), calculate them once at module load time.

**Good:**

```tsx
const WAVE_PATH = (() => {
    // Expensive math happens only once
    const radius = 20;
    // ... complex path generation ...
    return `M ...`;
})();

function WaveKnob() {
    return <path d={WAVE_PATH} ... />;
}
```

### 3. Memoize Dynamic Styles

If a style object depends on props, use `useMemo` to ensure referential stability when inputs haven't changed.

```tsx
const groupStyle = useMemo(() => {
  return { ...style, opacity: isDisabled ? 0.5 : 1 };
}, [style, isDisabled]);
```

### 4. Use Primitives

Leverage the library's optimized primitives instead of writing raw SVG where possible:

- **`Ring`**: Optimized arc drawing.
- **`Rotary`**: Handles rotation logic.
- **`RadialImage`**: Handles centered images with proper aspect ratio.
- **`RadialText`**: Handles text centering and scaling.

## Creating a New Component

1.  **Duplicate an Example**: Start by copying `PanKnob.tsx` or `IconKnob.tsx`.
2.  **Define ViewBox**: Set your coordinate system (usually 100x100 for knobs).
3.  **Implement Visuals**:
    - Use `Rotary` for rotating elements.
    - Use `Ring` for value indicators.
    - Use standard SVG (`path`, `circle`, `rect`) for static elements.
4.  **Tune Interaction**: Set `direction` in the `interaction` contract ("vertical", "horizontal", "circular") to match the visual metaphor. Knobs typically use "circular" for rotary behavior.
5.  **Optimize**: Review against the guidelines above.
