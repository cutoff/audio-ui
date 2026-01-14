<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

# SVG View Primitives

SVG View Primitives are low-level building blocks for composing custom radial controls like knobs, dials, and rotary encoders. They provide a consistent API for positioning content at radial coordinates within an SVG viewBox.

## Overview

The library provides SVG View Primitives:

| Primitive             | Purpose            | Key Feature                                           |
| --------------------- | ------------------ | ----------------------------------------------------- |
| **ValueRing**         | Arc/ring indicator | Shows value progress as a circular arc                |
| **RotaryImage**       | Rotating content   | Rotates children based on normalized value            |
| **RadialImage**       | Static content     | Displays image or SVG at radial coordinates           |
| **RadialHtmlOverlay** | HTML content       | Renders HTML content (text/icons) using foreignObject |
| **FilmstripImage**    | Sprite animation   | Scrubs through a sprite sheet based on value          |
| **RevealingPath**     | Path animation     | Reveals an arbitrary SVG path based on value          |
| **TickRing**          | Scale decoration   | Renders a ring of ticks/markers                       |
| **LabelRing**         | Scale labels       | Renders text or icons at radial positions             |

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

## RadialHtmlOverlay

⚠️ **Safari Limitation**: This primitive uses `<foreignObject>` which has rendering bugs in Safari/WebKit when the SVG is inside complex CSS layouts (container queries, aspect-ratio boxes). For Safari-safe rendering, use the `children` prop on `Knob`/`ContinuousControl` instead, which renders HTML **outside** the SVG.

Renders arbitrary HTML content inside the SVG at a radial position using `foreignObject`. This provides superior text rendering quality and layout capabilities (Flexbox) compared to pure SVG text.

### Props

```typescript
type RadialHtmlOverlayProps = {
  cx: number; // X coordinate of center
  cy: number; // Y coordinate of center
  radius: number; // Content fits within a square of size (radius * 2)
  children?: React.ReactNode; // HTML content
  className?: string;
  style?: CSSProperties;
  pointerEvents?: "none" | "auto"; // Default: "none"
};
```

### Usage

```tsx
// Basic centered value
<RadialHtmlOverlay cx={50} cy={50} radius={30}>
  <div className="text-xl font-bold">
    {formattedValue}
  </div>
</RadialHtmlOverlay>

// Complex layout
<RadialHtmlOverlay cx={50} cy={50} radius={30}>
  <div className="flex flex-col items-center">
    <span className="text-lg">{value}</span>
    <span className="text-xs text-muted-foreground">dB</span>
  </div>
</RadialHtmlOverlay>
```

### Design Notes

- **ForeignObject**: Uses SVG `<foreignObject>` to embed HTML.
- **Safari Warning**: May render incorrectly in Safari/WebKit when SVG is in complex CSS layouts.
- **Centering**: Automatically applies Flexbox centering to the container.
- **Sizing**: Creates a square container with side length `radius * 2`, centered at `(cx, cy)`.
- **Pointer Events**: Defaults to `none` so that the overlay doesn't block mouse interactions.

## FilmstripImage

Renders a frame from a sprite sheet (filmstrip) based on the normalized value. This is the current industry-standard method for rendering complex, photorealistic knobs in audio software (VSTs, Kontakt).

### Props

```typescript
type FilmstripImageProps = {
  cx: number; // X coordinate of center
  cy: number; // Y coordinate of center
  frameWidth: number; // Width of a SINGLE frame
  frameHeight: number; // Height of a SINGLE frame
  frameCount: number; // Total number of frames in the strip
  normalizedValue: number; // Value between 0 and 1
  imageHref: string; // URL to the sprite sheet/filmstrip image
  orientation?: "vertical" | "horizontal"; // Strip direction (default: "vertical")
  frameRotation?: number; // Frame rotation in degrees (default: 0)
  className?: string;
  style?: CSSProperties;
};
```

### Usage

```tsx
// Standard vertical strip (KnobMan style)
<FilmstripImage
  cx={50} cy={50}
  frameWidth={64} frameHeight={64}
  frameCount={100}
  normalizedValue={value}
  imageHref="/knobs/vintage-black.png"
/>

// Horizontal strip
<FilmstripImage
  cx={50} cy={50}
  frameWidth={100} frameHeight={100}
  frameCount={50}
  normalizedValue={value}
  orientation="horizontal"
  imageHref="/knobs/horizontal-strip.png"
/>

// Rotated filmstrip
<FilmstripImage
  cx={50} cy={50}
  frameWidth={64} frameHeight={64}
  frameCount={100}
  normalizedValue={value}
  imageHref="/knobs/vintage-black.png"
  frameRotation={45} // Rotate entire strip by 45 degrees
/>
```

### Design Notes

- **Performance**: Uses a fixed `viewBox` with a CSS-transformed nested `<image>`. This uses `transform: translate()` which is hardware accelerated (compositor-only), avoiding expensive layout repaints associated with changing `viewBox` attributes.
- **Hardware Acceleration**: Explicitly hinted with `will-change: transform` to ensure smooth scrubbing even on lower-end devices.
- **Frame Calculation**: `frameIndex = Math.round(normalizedValue * (frameCount - 1))`
- **Rotation**: Supported via the `frameRotation` prop, which rotates the entire filmstrip container using an SVG transform. This is useful for aligning filmstrips or creating rotating body effects.
- **Data Source**: Compatible with standard filmstrips exported from WebKnobMan and other VST development tools.

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

## TickRing

Renders a ring of tick marks, useful for creating scales on knobs and dials. It renders as a single optimized SVG path.

### Props

```typescript
type TickRingProps = {
  cx: number; // X coordinate of center
  cy: number; // Y coordinate of center
  radius: number; // Outer radius of the ring
  thickness: number; // Length of ticks (line/pill) or diameter (dot)
  openness?: number; // Openness in degrees (default: 90)
  rotation?: number; // Rotation offset in degrees (default: 0)
  count?: number; // Total number of ticks
  step?: number; // Angle between ticks
  variant?: "line" | "dot" | "pill"; // Shape type (default: "line")
  renderTick?: (data: TickData) => ReactNode; // Custom renderer
  className?: string;
  style?: CSSProperties;
};

type TickData = {
  x: number; // X coordinate at outer radius
  y: number; // Y coordinate at outer radius
  angle: number; // Angle in degrees
  index: number; // Index of the tick
};
```

### Usage

```tsx
// 11 ticks (0-10) for a standard knob
<TickRing
  cx={50} cy={50} radius={45} thickness={5}
  count={11}
  style={{ stroke: "var(--audioui-foreground)", strokeWidth: 1 }}
/>

// Ring of dots
<TickRing
  cx={50} cy={50} radius={45} thickness={4}
  count={11}
  variant="dot"
  className="text-primary"
/>

// Custom shapes (e.g., text numbers)
<TickRing
  cx={50} cy={50} radius={45} thickness={0}
  count={11}
  renderTick={({ x, y, angle, index }) => (
    <text
      x={x} y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      transform={`rotate(${angle + 90}, ${x}, ${y})`}
      fontSize={6}
      fill="currentColor"
    >
      {index}
    </text>
  )}
/>
```

### Design Notes

- **Optimized Mode**: When `renderTick` is omitted, `line`, `pill`, and `dot` variants render as a single optimized `<path>` element.
- **Custom Mode**: Providing `renderTick` allows arbitrary content but renders individual elements (less optimized for high counts).
- **Dots**: In `dot` mode, `thickness` determines the dot diameter. Dots are centered at `radius - thickness/2`.
- **Pills**: `pill` variant is a line with `stroke-linecap: round`.

## LabelRing

A specialized wrapper around `TickRing` designed for rendering text labels or icons at radial positions. It simplifies the creation of numeric scales or labeled indicators.

### Props

```typescript
type LabelRingProps = Omit<TickRingProps, "renderTick" | "variant" | "thickness" | "count" | "step"> & {
  /** Array of content to render at each tick position */
  labels: (string | number | ReactNode)[];
  /** Orientation of the labels */
  orientation?: "upright" | "radial"; // default: "upright"
  /** CSS class name for text elements (only applies to string/number labels) */
  labelClassName?: string;
  /** Inline styles for text elements (only applies to string/number labels) */
  labelStyle?: CSSProperties;
};
```

### Usage

```tsx
// Numeric scale (1-10)
<LabelRing
  cx={50} cy={50} radius={45}
  labels={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
  labelClassName="text-xs font-medium"
/>

// Radial text orientation
<LabelRing
  cx={50} cy={50} radius={45}
  labels={["Min", "Low", "Mid", "High", "Max"]}
  orientation="radial"
/>

// Icon labels
<LabelRing
  cx={50} cy={50} radius={40}
  labels={[<Icon1 />, <Icon2 />, <Icon3 />]}
/>
```

### Design Notes

- **Wrapper Component**: Internally uses `TickRing` with `thickness={0}` and custom `renderTick` logic.
- **Orientation**:
  - `upright`: Text remains horizontal regardless of position (standard for readable numbers).
  - `radial`: Text rotates to match the angle (like tick marks).
- **React Nodes**: When passing React components as labels, they are wrapped in a `<g>` element that handles positioning and rotation. The components themselves should be centered (e.g., icons).

## Composing Custom Knobs

These primitives are designed to be composed together to create custom knob designs.

**Important**: Center content (text, icons) should NOT be rendered inside the SVG view component. Instead, pass it as `children` to `ContinuousControl`, which renders it via HTML overlay for Safari compatibility.

### View Component (SVG only)

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

      {/* Center content is rendered via overlay, not here */}
    </g>
  );
}

// Required static properties for ContinuousControl
CustomKnob.viewBox = { width: 100, height: 100 };
CustomKnob.labelHeightUnits = 15;
CustomKnob.interaction = { mode: "both", direction: "circular" };
```

### Usage with Center Content

```tsx
<ContinuousControl view={CustomKnob} value={value} onChange={setValue}>
  {/* Center content rendered as HTML overlay */}
  <div style={{ fontSize: "20px", fontWeight: 700 }}>{formattedValue}</div>
  <div style={{ fontSize: "10px", opacity: 0.6 }}>dB</div>
</ContinuousControl>
```

## SSR Considerations

**Server-Side Rendering is not a priority for this library.** Audio/MIDI applications require real-time client-side processing, making SSR impractical for the primary use cases (VST plugin UIs, DAWs, web-based audio tools).

## File Locations

- **ValueRing**: `packages/react/src/components/primitives/svg/ValueRing.tsx`
- **RotaryImage**: `packages/react/src/components/primitives/svg/RotaryImage.tsx`
- **RadialImage**: `packages/react/src/components/primitives/svg/RadialImage.tsx`
- **RadialHtmlOverlay**: `packages/react/src/components/primitives/svg/RadialHtmlOverlay.tsx`
- **FilmstripImage**: `packages/react/src/components/primitives/svg/FilmstripImage.tsx`
- **TickRing**: `packages/react/src/components/primitives/svg/TickRing.tsx`
- **Example Components**: `apps/playground-react/components/examples/`

## Related Documentation

- [Interaction System](./interaction-system.md) - How controls handle user input
- [Size System](./size-system.md) - Component sizing and aspect ratios
- [Color System](./color-system.md) - Theming and color variables
- [AdaptiveBox Layout](./adaptive-box-layout.md) - SVG container and scaling
