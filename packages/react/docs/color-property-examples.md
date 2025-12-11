# Color Property Usage Examples

> **Note**: For comprehensive documentation on the color system architecture, theme variables, color utilities, and playground integration, see [Color System Documentation](./color-system.md).

This document provides practical examples of how to use the `color` property with the Audio UI components.

## Basic Usage

All components accept a `color` property that can be any valid CSS color value. If not specified, components use the theme color from `AudioUiProvider`, or fall back to the adaptive default (white in dark mode, black in light mode).

```tsx
// Using adaptive default (inherits from theme or uses adaptive default)
<Button value={75} label="Power"/>

// Using a named color
<Knob value={50} label="Volume" color="green"/>

// Using a hex color
<Slider value={25} label="Filter" color="#FF5500"/>

// Using RGB
<Button value={100} label="Mode" color="rgb(120, 80, 200)"/>

// Using HSL
<Knob value={50} label="Volume" color="hsl(280, 80%, 60%)"/>

// Using predefined theme color
import { themeColors } from '@cutoff/audio-ui-react';
<Button value={75} label="Power" color={themeColors.blue}/>
```

## Color Animation

The `color` property can be animated by changing its value over time. Here are some examples:

### Using React State for Simple Color Changes

```tsx
function AnimatedButton() {
  const [color, setColor] = useState("blue");

  const toggleColor = () => {
    setColor((prevColor) => (prevColor === "blue" ? "red" : "blue"));
  };

  return <Button value={75} label="Toggle" color={color} onClick={toggleColor} />;
}
```

### Using CSS Transitions

You can add CSS transitions to make color changes smooth:

```css
/* In your CSS */
.animated-component rect,
.animated-component path {
  transition:
    fill 0.3s ease,
    stroke 0.3s ease;
}
```

```tsx
// In your component
<Button className="animated-component" value={75} label="Smooth" color={color} />
```

### Using Animation Libraries

You can use animation libraries like Framer Motion or React Spring for more complex animations:

```tsx
// Using Framer Motion
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

function RainbowKnob() {
  const [hue, setHue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHue((h) => (h + 1) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return <Knob value={50} label="Rainbow" color={`hsl(${hue}, 80%, 50%)`} />;
}
```

## Combining with Other Properties

The `color` property can be combined with other properties to create more complex UI elements:

```tsx
// Combining color with other properties
<Button
    value={75}
    label="Power"
    color="green"
    roundness={0}  // Square corners
    size="large"
    stretch={true}
/>

<Knob
    value={50}
    label="Volume"
    color="purple"
    thickness={20}  // Thicker stroke
    bipolar={true}  // Bipolar mode
/>

<KnobSwitch
    label="Filter Type"
    value="lowpass"
    color="orange"
    onChange={value => handleChange(value)}
>
    <KnobSwitch.Option value="lowpass">LP</KnobSwitch.Option>
    <KnobSwitch.Option value="highpass">HP</KnobSwitch.Option>
    <KnobSwitch.Option value="bandpass">BP</KnobSwitch.Option>
</KnobSwitch>
```

## Dynamic Colors Based on Value

You can dynamically change the color based on the component's value:

```tsx
function DynamicColorKnob() {
  const [value, setValue] = useState(50);

  // Color changes from blue (0) to red (100)
  const dynamicColor = `hsl(${240 - value * 2.4}, 80%, 50%)`;

  return <Knob value={value} min={0} max={100} label="Dynamic" color={dynamicColor} onChange={setValue} />;
}
```

## Theming

You can create a theme by using consistent colors across components:

```tsx
function ThemedControls() {
  // Theme color
  const themeColor = "hsl(320, 80%, 50%)"; // Pink

  return (
    <div className="controls-panel">
      <Knob value={75} label="Volume" color={themeColor} />
      <Button value={100} label="Power" color={themeColor} />
      <KnobSwitch value="sine" label="Wave" color={themeColor}>
        <KnobSwitch.Option value="sine">Sine</KnobSwitch.Option>
        <KnobSwitch.Option value="square">Square</KnobSwitch.Option>
      </KnobSwitch>
    </div>
  );
}
```

## Notes on Implementation

- The `color` property accepts any valid CSS color value
- The component automatically derives lighter/darker variants of the color for different parts of the component
- Text color is not affected by the `color` property and continues to use the CSS variable `--audioui-text-color`
- Animation is handled externally by the component user, not internally by the component

## Component-Specific Color Handling

### Keybed Component

The Keybed component uses luminosity-based color variations instead of transparency to prevent visual overlap issues between pressed white keys and surrounding black keys. This is implemented using the `generateLuminosityVariant` function from the `colorUtils.ts` utility file.

When a white key is pressed, it uses the primary color, while black keys use darker variants of the same color. This ensures that there's no visual overlap between adjacent keys, providing a clearer visual representation of the pressed keys.

### Color Utilities

The `colorUtils.ts` utility file provides the following function:

```typescript
/**
 * Generates a luminosity-based variant of a color
 * @param baseColor The base color (named color, hex, rgb, etc.)
 * @param luminosityPercentage The percentage of the original luminosity (0-100)
 * @returns An HSL color string with adjusted luminosity
 */
export function generateLuminosityVariant(baseColor: string, luminosityPercentage: number): string {
  // Implementation details...
}
```

This function can be used by other components if needed to generate luminosity-based color variations instead of using transparency.
