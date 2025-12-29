# SVG View Primitives

SVG View Primitives are low-level building blocks for composing custom radial controls like knobs, dials, and rotary encoders. They provide a consistent API for positioning content at radial coordinates within an SVG viewBox.

## Overview

The library provides five SVG View Primitives:

| Primitive         | Purpose            | Key Feature                                   |
| ----------------- | ------------------ | --------------------------------------------- |
| **ValueRing**     | Arc/ring indicator | Shows value progress as a circular arc        |
| **RotaryImage**   | Rotating content   | Rotates children based on normalized value    |
| **RadialImage**   | Static content     | Displays image or SVG at radial coordinates   |
| **RadialText**    | Auto-fitting text  | Measures and scales text to fit within radius |
| **RevealingPath** | Path animation     | Reveals an arbitrary SVG path based on value  |

All primitives share a common coordinate system:

- `cx`, `cy`: Center point coordinates
- `radius`: Distance from center to content boundary

## ValueRing

Renders a circular arc indicator, commonly used for showing parameter values on knobs.

### Props

```typescript
type ValueRingProps = {
  cx: number; // X coordinate of center
  cy: number; // Y coordinate of center
  radius: number; // Outer radius of the ring
  normalizedValue: number; // Value between 0 and 1
  bipolar?: boolean; // Start arc from center (default: false)
  thickness?: number; // Stroke width in pixels (default: 6)
  roundness?: boolean; // Round stroke caps (default: false)
  openness?: number; // Gap in degrees (default: 90)
  rotation?: number; // Rotation offset in degrees (default: 0)
  fgArcStyle?: CSSProperties; // Foreground arc styles
  bgArcStyle?: CSSProperties; // Background arc styles
};
```

### Usage

```tsx
// Basic unipolar ring
<ValueRing
  cx={50} cy={50} radius={40}
  normalizedValue={0.75}
  thickness={4}
  fgArcStyle={{ stroke: "var(--audioui-primary-color)" }}
  bgArcStyle={{ stroke: "rgba(0,0,0,0.2)" }}
/>

// Bipolar ring (starts from center)
<ValueRing
  cx={50} cy={50} radius={40}
  normalizedValue={0.3}
  bipolar={true}
  openness={90}
/>
```

### Design Notes

- The stroke expands **inward** from the specified radius (outer edge stays fixed)
- `openness` creates a gap at the bottom of the ring (90° = 3/4 circle)
- Uses `RingArc` sub-component for path generation
- Memoized with `React.memo` for performance

## RotaryImage

Rotates its content based on a normalized value. Shares angle logic with ValueRing for consistent behavior.

### Props

```typescript
type RotaryImageProps = {
  cx: number; // X coordinate of center
  cy: number; // Y coordinate of center
  radius: number; // Radius for content bounds
  normalizedValue: number; // Value between 0 and 1
  openness?: number; // Arc range in degrees (default: 90)
  imageHref?: string; // Optional image URL
  children?: React.ReactNode; // Optional SVG content
  rotation?: number; // Rotation offset in degrees (default: 0)
  className?: string;
  style?: CSSProperties;
};
```

### Usage

```tsx
// Rotating indicator line
<RotaryImage cx={50} cy={50} radius={35} normalizedValue={value} openness={90}>
  <line x1="50%" y1="10%" x2="50%" y2="0%" stroke="currentColor" strokeWidth={4} />
</RotaryImage>

// Rotating image
<RotaryImage
  cx={50} cy={50} radius={40}
  normalizedValue={value}
  imageHref="/knob-texture.png"
/>
```

### Design Notes

- Wraps `RadialImage` internally
- Uses `useArcAngle` hook for angle calculations (same as ValueRing)
- Children are rendered inside a nested `<svg>` element for proper coordinate handling

## RadialImage

Displays static content (image or SVG) at radial coordinates. Does not respond to value changes.

### Props

```typescript
type RadialImageProps = {
  cx: number; // X coordinate of center
  cy: number; // Y coordinate of center
  radius: number; // Content fits within this radius
  imageHref?: string; // Image URL to display
  children?: React.ReactNode; // SVG content to display
  transform?: string; // SVG transform attribute
  className?: string;
  style?: CSSProperties;
};
```

### Usage

```tsx
// Static background image
<RadialImage
  cx={50} cy={50} radius={45}
  imageHref="/knob-background.png"
/>

// Static SVG icon
<RadialImage cx={50} cy={50} radius={20}>
  <circle cx="50%" cy="50%" r="40%" fill="currentColor" />
</RadialImage>
```

### Design Notes

- Image uses `preserveAspectRatio="xMidYMid meet"` for proper scaling
- Children are wrapped in a nested `<svg>` with `overflow: visible`
- Commonly used as a base layer for RotaryImage

## RadialText

Displays text at radial coordinates with automatic sizing based on reference text measurement.

### Props

```typescript
type RadialTextProps = {
  cx: number; // X coordinate of center
  cy: number; // Y coordinate of center
  radius: number; // Text fits within this radius
  text: string | string[]; // Display text (array for multiline)
  referenceText?: string | string[]; // Sizing reference (default: "-127")
  padding?: number; // Fit within radius * padding (default: 0.85)
  textAnchor?: "start" | "middle" | "end"; // Horizontal alignment (default: "middle")
  lineSpacing?: number; // Line height multiplier (default: 1.2)
  className?: string;
  style?: CSSProperties; // Font styles are respected for measurement
};
```

### Usage

```tsx
// Single line value
<RadialText
  cx={50} cy={50} radius={30}
  text={currentValue}
  referenceText="100"
/>

// Multiline with value and unit
<RadialText
  cx={50} cy={50} radius={30}
  text={[formattedValue, "dB"]}
  referenceText={["-60.0", "dB"]}
/>

// With custom font styling
<RadialText
  cx={50} cy={50} radius={25}
  text={["∞"]}
  style={{
    fontFamily: "monospace",
    fontWeight: "bold",
    fill: "var(--audioui-primary-color)"
  }}
/>
```

### Integration with AudioParameterConverter

The `AudioParameterConverter` class provides a `getMaxDisplayText()` method specifically designed for RadialText sizing:

```tsx
const converter = new AudioParameterConverter(volumeParam);

// Single line with unit
<RadialText
  text={converter.format(currentValue)}
  referenceText={converter.getMaxDisplayText()}
/>

// Multiline: value on first line, unit on second
<RadialText
  text={[formattedValue, unit]}
  referenceText={[converter.getMaxDisplayText({ includeUnit: false }), unit]}
/>
```

### Design Decisions

#### Measure-Once Pattern

RadialText uses a "measure-once" approach for performance:

1. **Reference text is required** (defaults to "-127" if not provided)
2. Text is measured **once** when the component mounts or reference changes
3. A CSS `transform: scale()` is applied for fitting (GPU-accelerated)
4. Actual display text can change without re-measurement

This design ensures consistent sizing even as values change dynamically.

#### Global Font Metrics Cache

Text measurements are cached globally in a `Map`:

```
┌─────────────────────────────────────────────────────────────┐
│                    Font Metrics Cache                        │
├─────────────────────────────────────────────────────────────┤
│  Key: "text|fontFamily|fontSize|fontWeight|lineSpacing"     │
│  Value: { width: number, height: number }                   │
├─────────────────────────────────────────────────────────────┤
│  Benefits:                                                   │
│  - Survives component unmounts                              │
│  - 100 knobs showing "dB" = 1 measurement                   │
│  - O(1) lookup for cached entries                           │
└─────────────────────────────────────────────────────────────┘
```

#### GPU-Accelerated Scaling

Instead of calculating font size, RadialText renders at a base size and applies `transform: scale()`:

- `transform: scale()` is GPU-accelerated
- No layout recalculation when scale changes
- Works with any font styling the user provides

#### Vertical Centering

RadialText uses `dominantBaseline="central"` with a baseline correction factor (0.1em) to achieve true visual centering. This compensates for the fact that most fonts have more ascender height than descender height, especially for numeric text (0-9) which has no descenders.

#### Performance Characteristics

| Scenario            | Measurement Cost           | Render Cost                |
| ------------------- | -------------------------- | -------------------------- |
| Initial mount       | 1 DOM measurement (cached) | 1 render                   |
| Value change        | 0 (cached)                 | 1 render (scale unchanged) |
| 100 identical knobs | 1 measurement total        | 100 renders                |
| Font/style change   | 1 new measurement          | 1 render                   |

## RevealingPath

Reveals an arbitrary SVG path from start to end using `stroke-dashoffset`. This is useful for custom indicators, non-circular tracks, or creative visualizations like mazes.

### Props

```typescript
type RevealingPathProps = SVGProps<SVGPathElement> & {
  normalizedValue: number; // Value between 0 and 1
  resolution?: number; // Internal path resolution (default: 100)
};
```

### Usage

```tsx
// Basic usage
<RevealingPath
  d="M 10 10 L 90 90"
  normalizedValue={0.5} // Half the line is visible
  stroke="red"
  strokeWidth={4}
/>

// Complex path (e.g. maze solution)
<RevealingPath
  d={COMPLEX_PATH_DATA}
  normalizedValue={progress}
  stroke="blue"
  pathLength={100} // Optional override
/>
```

### Design Notes

- Uses the `pathLength` SVG attribute to normalize dash calculations
- Avoids expensive JS path measurement (`getTotalLength()`)
- GPU-friendly (uses `stroke-dashoffset`)
- Ideal for complex shapes where `ValueRing` (arc) is insufficient

## Composing Custom Knobs

These primitives are designed to be composed together to create custom knob designs:

```tsx
function CustomKnob({ normalizedValue, className, style }: ControlComponentViewProps) {
  return (
    <g className={className} style={style}>
      {/* Background ring track */}
      <ValueRing
        cx={50}
        cy={50}
        radius={45}
        normalizedValue={normalizedValue}
        thickness={4}
        bgArcStyle={{ stroke: "rgba(0,0,0,0.2)" }}
        fgArcStyle={{ stroke: "var(--audioui-primary-color)" }}
      />

      {/* Static background texture */}
      <RadialImage cx={50} cy={50} radius={40} imageHref="/knob-texture.png" />

      {/* Rotating indicator */}
      <RotaryImage cx={50} cy={50} radius={35} normalizedValue={normalizedValue}>
        <line x1="50%" y1="15%" x2="50%" y2="5%" stroke="white" strokeWidth={2} />
      </RotaryImage>

      {/* Value display */}
      <RadialText cx={50} cy={50} radius={20} text={[formattedValue, "dB"]} referenceText={["-60.0", "dB"]} />
    </g>
  );
}

// Required static properties for ContinuousControl
CustomKnob.viewBox = { width: 100, height: 100 };
CustomKnob.labelHeightUnits = 15;
CustomKnob.interaction = { mode: "both", direction: "vertical" };
```

## SSR Considerations

**Server-Side Rendering is not a priority for this library.** Audio/MIDI applications require real-time client-side processing, making SSR impractical for the primary use cases (VST plugin UIs, DAWs, web-based audio tools).

RadialText handles the browser-only measurement gracefully:

- Falls back to `scale=1` during SSR
- Measures and updates on client hydration
- No hydration mismatch errors

## File Locations

- **ValueRing**: `packages/react/src/components/primitives/views/ValueRing.tsx`
- **RotaryImage**: `packages/react/src/components/primitives/views/RotaryImage.tsx`
- **RadialImage**: `packages/react/src/components/primitives/views/RadialImage.tsx`
- **RadialText**: `packages/react/src/components/primitives/views/RadialText.tsx`
- **Text Measurement Utilities**: `packages/core/src/utils/textMeasurement.ts`
- **Example Components**: `apps/playground-react/components/examples/`

## Related Documentation

- [Interaction System](./interaction-system.md) - How controls handle user input
- [Size System](./size-system.md) - Component sizing and aspect ratios
- [Color System](./color-system.md) - Theming and color variables
- [AdaptiveBox Layout](./adaptive-box-layout.md) - SVG container and scaling
