<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

# Component Color System Documentation

This document provides a comprehensive guide to how colors are handled in the Audio UI library.

## Table of Contents

1. [Axioms & Requirements](#axioms--requirements)
2. [Overview](#overview)
3. [Core Principles](#core-principles)
4. [Library Color Architecture](#library-color-architecture)
5. [CSS Theme Variables](#css-theme-variables)
6. [Color Utilities](#color-utilities)
7. [Component Color Resolution](#component-color-resolution)
8. [Theme Provider System](#theme-provider-system)
9. [Predefined Theme Colors](#predefined-theme-colors)
10. [Usage Examples](#usage-examples)
11. [Performance Optimizations](#performance-optimizations)

## Axioms & Requirements

These are the fundamental requirements that define the color system. **These must be preserved in all future changes.**

### Library Requirements

1. **Color Prop**
   - Themable components must have a `color` prop that defines the "primary" color
   - The `color` prop accepts **any CSS color literal, function, or variable**
   - Examples: `"blue"`, `"#FF5500"`, `"rgb(255, 85, 0)"`, `"hsl(20, 100%, 50%)"`, `"var(--audioui-theme-blue)"`, `"color-mix(...)"`

2. **Color Variants**
   - From the primary color, **2 variants must be derived** automatically
   - These variants (`primary50`, `primary20`) are usable by component implementations
   - Variants are computed dynamically, not predefined in CSS

3. **Re-computation & Animation**
   - The set of colors (primary + variants) **must be re-computed each time the color prop changes**
   - The `color` prop **must be animatable** (can change smoothly over time)

4. **Adaptive Default**
   - There **must be a default color**: white in dark mode, black in light mode
   - This default must adapt seamlessly to display mode changes

5. **Mode-Aware Variants**
   - Computed color variants **must potentially take the display mode (light/dark) into account**
   - Components must display seamlessly in either mode

6. **Color Resolution Hierarchy**
   - When the `color` prop of a component is `undefined`, the CSS variable `--audioui-primary-color` is used
   - If the CSS variable is not set, it falls back to the adaptive default (`--audioui-adaptive-default-color`)

### Client App Requirements

1. **Uniform Color Type**
   - Theme color and component colors are **just a CSS color literal, function, or variable**
   - **Uniform color type for both theme and component** - no special types or wrappers

2. **Standard CSS Methods**
   - When users want to define a theme color, they **just use the way they know from CSS**
   - Examples: `"blue"`, `"#FF5500"`, `"var(--my-color)"`, `"hsl(280, 80%, 60%)"`

3. **Predefined Colors**
   - The library exposes a set of predefined colors (default, pink, orange, blue, etc.)
   - **Important**: These predefined colors are the "primary" color of the components
   - **The variants remain computed by the components**, just as with explicit prop colors
   - Predefined colors are not special - they're just convenient CSS color values

### Design Principles

- **Idiomatic and Clean**: The system should feel natural to CSS developers
- **Performance First**: Optimized for realtime, high-performance, low-latency audio UIs
- **No Backward Compatibility**: The project was never released, so focus on the best solution

### Implementation Notes

- Variants are computed in CSS using `color-mix()` for optimal performance
- CSS variables are used for all theme values (color, roundness, thickness)
- The adaptive default uses a CSS variable (`--audioui-adaptive-default-color`) to prevent hydration mismatches
- Dark mode is handled automatically by CSS via `.dark` class - no JavaScript tracking needed

## Overview

The Audio UI library uses a clean, idiomatic color system optimized for realtime audio applications:

- **Uniform color type**: All colors (theme and component) are CSS color values (literal, function, or variable)
- **Predefined theme colors**: Simple primary colors - variants are computed automatically via CSS `color-mix()`
- **Adaptive default**: White in dark mode, black in light mode (via CSS variable)
- **Automatic variant generation**: CSS computes `primary50` and `primary20` variants from the primary color using `color-mix()`
- **Mode-aware**: Dark mode handled automatically by CSS via `.dark` class
- **CSS variable-based theming**: Pure CSS variables for global theme management - no React Context needed
- **Performance optimized**: No React re-renders for theme changes, CSS handles updates automatically

## Core Principles

1. **Predefined colors are just primary colors** - variants (`primary50`, `primary20`) are computed automatically by components
2. **Uniform color type** - all colors are CSS color values (literal, function, or variable)
3. **Adaptive default** - white in dark mode, black in light mode (handled via CSS variable)
4. **Simple theme switching** - just set one color value, variants are computed automatically
5. **No redundant CSS variables** - only primary colors are predefined, not variants
6. **Performance first** - optimized for realtime audio UIs with minimal overhead

## Library Color Architecture

### Color Flow

```
Component Prop (color="blue" or undefined)
    ↓
CSS Variable Resolution
    ↓
Resolves: Component Prop → CSS Variable (--audioui-primary-color) → Adaptive Default (--audioui-adaptive-default-color)
    ↓
CSS color-mix() (automatic)
    ↓
Creates: primary, primary50, primary20 via CSS variables
    ↓
SVG Component Rendering (reads CSS variables)
```

### Key Files

- **`themes.css`**: Defines CSS theme variables for primary colors, variants, roundness, thickness, and adaptive default
- **`styles.css`**: Base styles and optional utility classes
- **`colorUtils.ts`**: Legacy utility for color variant generation (used by Keys component for luminosity variants)
- **`themeColors.ts`**: Exports predefined theme colors as CSS color values
- **`utils/theme.ts`**: Utility functions for programmatic theme management (setThemeColor, setThemeRoundness, etc.)
- **Component files**: Read CSS variables directly, props set CSS variables as convenience API

## CSS Theme Variables

### Theme Variable Structure

The library defines theme variables in `themes.css`:

```css
--audioui-theme-{name}  /* Predefined theme colors */
--audioui-adaptive-default-color  /* CSS variable for adaptive default */
--audioui-primary-color  /* Current theme color (set by user or defaults to adaptive) */
--audioui-primary-50  /* 50% variant (computed via color-mix) */
--audioui-primary-20  /* 20% variant (computed via color-mix) */
--audioui-roundness-base  /* Base roundness (normalized 0.0-1.0) */
--audioui-thickness-base  /* Base thickness (normalized 0.0-1.0) */
```

**Note**: Variants (`primary50`, `primary20`) are computed automatically in CSS using `color-mix()` for optimal performance.

### Adaptive Default Color

The adaptive default color uses a CSS variable to ensure consistent server-side and client-side rendering:

```css
:root {
  --audioui-theme-default: hsl(0, 0%, 10%); /* Light mode: near-black */
  --audioui-adaptive-default-color: var(--audioui-theme-default);
}

.dark {
  --audioui-theme-default: hsl(0, 0%, 96%); /* Dark mode: near-white */
  --audioui-adaptive-default-color: var(--audioui-theme-default);
}
```

This approach:

- Prevents hydration mismatches (server and client render the same string)
- Allows browser to resolve the color based on `.dark` class
- Ensures components automatically adapt to mode changes

### Available Named Themes

1. **Default (Adaptive)**: `--audioui-theme-default`
   - Light mode: Near-black (`hsl(0, 0%, 10%)`)
   - Dark mode: Near-white (`hsl(0, 0%, 96%)`)
   - Adaptive like shadcn/ui: dark ink on light, light ink on dark

2. **Blue**: `--audioui-theme-blue`
   - Light: `hsl(204, 88%, 52%)`
   - Dark: `hsl(204, 88%, 53%)`

3. **Orange**: `--audioui-theme-orange`
   - Light: `hsl(29, 100%, 48%)`
   - Dark: `hsl(29, 100%, 50%)`

4. **Pink**: `--audioui-theme-pink`
   - Light: `hsl(332, 92%, 52%)`
   - Dark: `hsl(332, 95%, 54%)`

5. **Green**: `--audioui-theme-green`
   - Light: `hsl(160, 95%, 44%)`
   - Dark: `hsl(160, 98%, 37%)`

6. **Purple**: `--audioui-theme-purple`
   - Light: `hsl(252, 96%, 54%)`
   - Dark: `hsl(252, 100%, 67%)`

7. **Yellow**: `--audioui-theme-yellow`
   - Light: `hsl(50, 100%, 50%)`
   - Dark: `hsl(50, 100%, 50%)`

### Important Notes

- **Variant CSS variables**: `--audioui-primary-50` and `--audioui-primary-20` are computed automatically via CSS `color-mix()`
- **Variants are computed in CSS**: No JavaScript needed - CSS handles variant generation automatically
- **CSS variables are the foundation**: Components read CSS variables, props set CSS variables as convenience
- **Direct color values work**: You can still use direct color values via props, which set CSS variables

## Color Utilities

### `getAdaptiveDefaultColor()`

Returns the adaptive default color as a CSS variable.

**Location**: `packages/react/src/components/utils/colorUtils.ts`

**Returns**:

- `"var(--audioui-adaptive-default-color)"` - CSS variable that resolves to white in dark mode, black in light mode

**Usage**:

```typescript
import { getAdaptiveDefaultColor } from "@cutoff/audio-ui-react";

const defaultColor = getAdaptiveDefaultColor();
// Returns: "var(--audioui-adaptive-default-color)"
```

**Why CSS variable?**: Ensures server and client render the same string, preventing hydration mismatches. The browser resolves the actual color based on the `.dark` class.

### `generateColorVariants()`

The core utility function that generates color variants from a base color. Optimized for performance with pre-compiled regex and efficient lookups.

**Location**: `packages/react/src/components/utils/colorUtils.ts`

**Signature**:

```typescript
function generateColorVariants(
  baseColor: string,
  variant: "luminosity" | "transparency" = "luminosity"
): {
  primary: string;
  primary50: string;
  primary20: string;
  highlight: string;
};
```

**Parameters**:

- `baseColor`: Any valid CSS color value (named color, hex, rgb, hsl, CSS variable)
- `variant`: Method for generating variants
  - `"luminosity"`: Adjusts brightness (darker variants) - used by Keybed
  - `"transparency"`: Adjusts opacity (semi-transparent variants) - used by Knob, Button, Slider

**Returns**:

- `primary`: The base color (normalized to HSL for named colors)
- `primary50`: 50% variant (50% luminosity or 50% opacity)
- `primary20`: 20% variant (20% luminosity or 20% opacity)
- `highlight`: Brighter variant for hover effects

**Performance Optimizations**:

- Pre-compiled regex pattern (no recompilation per call)
- O(1) hash map lookup for named colors
- Normalized color computed once and reused

**Example**:

```typescript
const variants = generateColorVariants("blue", "transparency");
// Returns:
// {
//   primary: "hsl(204, 88%, 53%)",
//   primary50: "color-mix(in srgb, hsl(204, 88%, 53%) 50%, transparent)",
//   primary20: "color-mix(in srgb, hsl(204, 88%, 53%) 20%, transparent)",
//   highlight: "hsl(204, 88%, 63%)"
// }
```

## Component Color Resolution

### Resolution Hierarchy

Components resolve colors using the following priority (highest to lowest):

1. **Component `color` prop** (explicit prop - sets CSS variable)
2. **CSS Variable** (`--audioui-primary-color` - set globally or via utility functions)
3. **Adaptive default** (`--audioui-adaptive-default-color` - CSS variable that resolves to white in dark mode, black in light mode)

### Component Implementation Pattern

All components follow this pattern:

```typescript
function MyComponent({ color, roundness, thickness, style, ...otherProps }: MyComponentProps) {
    // 1. Build CSS variables from props (if provided)
    const cssVars = useMemo(() => {
        const vars: React.CSSProperties = {};
        if (roundness !== undefined) {
            vars["--audioui-roundness-base"] = clampNormalized(roundness);
        }
        if (color !== undefined) {
            vars["--audioui-primary-color"] = color;
        }
        if (thickness !== undefined) {
            vars["--audioui-thickness-base"] = clampNormalized(thickness);
        }
        return { ...vars, ...style }; // User style takes precedence
    }, [roundness, color, thickness, style]);

    // 2. Pass CSS variables to component
    return (
        <SvgComponent
            style={cssVars}
            // CSS reads: var(--audioui-primary-color, var(--audioui-adaptive-default-color))
            // CSS reads: var(--audioui-primary-50) for variants
        />
    );
}
```

**Key Features**:

- **CSS-native**: Components read CSS variables directly
- **Props as convenience**: Props set CSS variables, but CSS-only customization works too
- **No re-renders**: CSS updates automatically when variables change
- **Performance**: No JavaScript calculations needed for theme changes

## Theme Management System

### CSS Variable-Based Theming

The library uses pure CSS variables for theming. No React Context or Provider needed.

**CSS Variables**:

```css
:root {
  --audioui-primary-color: var(--audioui-adaptive-default-color);
  --audioui-roundness-base: 0.3;
  --audioui-thickness-base: 0.4;
  --audioui-primary-50: color-mix(in srgb, var(--audioui-primary-color) 50%, transparent);
  --audioui-primary-20: color-mix(in srgb, var(--audioui-primary-color) 20%, transparent);
}
```

### Theme Utility Functions

**Location**: `packages/react/src/utils/theme.ts`

Lightweight utility functions for programmatic theme management (no Context needed):

```typescript
import { setThemeColor, setThemeRoundness, setThemeThickness, setTheme } from "@cutoff/audio-ui-react";

// Set individual theme values
setThemeColor("blue");
setThemeRoundness(0.5);
setThemeThickness(0.6);

// Set multiple values at once
setTheme({ color: "purple", roundness: 0.4, thickness: 0.5 });
```

**Available Functions**:

- `setThemeColor(color: string)` - Set global theme color
- `setThemeRoundness(value: number)` - Set global theme roundness (0.0-1.0)
- `setThemeThickness(value: number)` - Set global theme thickness (0.0-1.0)
- `setTheme(theme: ThemeConfig)` - Set multiple theme values at once
- `getThemeColor()` - Get current theme color from CSS variable
- `getThemeRoundness()` - Get current theme roundness from CSS variable
- `getThemeThickness()` - Get current theme thickness from CSS variable

**Performance Features**:

- **No React overhead**: Direct CSS variable manipulation
- **No re-renders**: CSS updates automatically
- **Works everywhere**: Can be used in vanilla JS, React, or any framework
- **Dark mode automatic**: Handled by CSS `.dark` class - no JavaScript tracking needed

## Predefined Theme Colors

### `themeColors`

**Location**: `packages/react/src/themeColors.ts`

Exported predefined theme colors as CSS color values (CSS variables).

```typescript
import { themeColors } from '@cutoff/audio-ui-react';

// Use in AudioUiProvider
<AudioUiProvider initialColor={themeColors.blue}>
    <App />
</AudioUiProvider>

// Use in components
<Knob value={50} color={themeColors.purple} />
```

**Available colors**:

- `themeColors.default` - `"var(--audioui-theme-default)"`
- `themeColors.blue` - `"var(--audioui-theme-blue)"`
- `themeColors.orange` - `"var(--audioui-theme-orange)"`
- `themeColors.pink` - `"var(--audioui-theme-pink)"`
- `themeColors.green` - `"var(--audioui-theme-green)"`
- `themeColors.purple` - `"var(--audioui-theme-purple)"`
- `themeColors.yellow` - `"var(--audioui-theme-yellow)"`

### `themeColorsDirect`

Direct HSL values for when CSS variables aren't available:

```typescript
import { themeColorsDirect } from "@cutoff/audio-ui-react";

// Access light/dark mode values directly
const blueLight = themeColorsDirect.blue.light;
const blueDark = themeColorsDirect.blue.dark;
```

## CSS Utility Classes

The library provides utility classes for consistent styling:

### Available Utility Classes

```css
.audioui-stroke-primary      /* stroke: var(--audioui-primary-color) - only works if user sets --audioui-primary-color */
.audioui-fill-primary        /* fill: var(--audioui-primary-color) - only works if user sets --audioui-primary-color */
.audioui-border-primary      /* border-color: var(--audioui-primary-color) - only works if user sets --audioui-primary-color */
.audioui-text-primary        /* color: var(--audioui-primary-color) - only works if user sets --audioui-primary-color */
.audioui-fill-text           /* fill: var(--audioui-text-color) */
.audioui-fill-transparent    /* fill: transparent */
```

**Note**: These utility classes only work if the user sets `--audioui-primary-color` in their CSS. They are optional and not required for component functionality.

## Usage Examples

### Basic Component Usage

```tsx
// Use adaptive default (white in dark mode, black in light mode)
<Knob value={50} label="Volume" />

// Use named color
<Button value={75} label="Power" color="green" />

// Use predefined theme color
import { themeColors } from '@cutoff/audio-ui-react';
<Slider value={25} label="Filter" color={themeColors.blue} />

// Use custom color
<Knob value={50} label="Volume" color="#FF5500" />

// Use CSS variable
<Button value={75} label="Power" color="var(--audioui-theme-purple)" />
```

### Global Theme Setup

```tsx
// Set global theme using utility functions
import { setTheme, themeColors } from "@cutoff/audio-ui-react";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    // Set initial theme on mount
    setTheme({
      color: themeColors.purple,
      roundness: 0.3,
    });
  }, []);

  return (
    <>
      {/* All components inherit the theme unless overridden */}
      <Knob value={50} label="Volume" /> {/* Uses purple */}
      <Button value={75} label="Power" color="blue" /> {/* Overrides with blue */}
    </>
  );
}
```

### Dynamic Theme Switching

```tsx
import { setThemeColor, themeColors } from "@cutoff/audio-ui-react";

function App() {
  return (
    <div>
      <button onClick={() => setThemeColor(themeColors.blue)}>Blue Theme</button>
      <button onClick={() => setThemeColor(themeColors.orange)}>Orange Theme</button>
      <button onClick={() => setThemeColor("#FF3366")}>Custom Color</button>
      <Knob value={50} label="Volume" /> {/* Uses current theme - updates instantly */}
    </div>
  );
}
```

### CSS-Only Customization

```tsx
// No JavaScript needed - pure CSS
<div style={{ '--audioui-primary-color': 'hsl(200, 100%, 50%)' }}>
  <Knob value={50} label="Volume" /> {/* Inherits CSS variable */}
</div>

// Or via CSS classes
<style>{`
  .my-theme {
    --audioui-primary-color: hsl(200, 100%, 50%);
    --audioui-roundness-base: 0.5;
  }
`}</style>
<div className="my-theme">
  <Knob value={50} label="Volume" />
</div>
```

### Component-Specific Color Variants

```tsx
// Components read CSS variables automatically
<KnobView color="blue" />
// CSS uses: var(--audioui-primary-color) and var(--audioui-primary-50)

// Keybed uses luminosity variants (still computed in JS for compatibility)
<Keybed color="blue" />
// Uses generateColorVariants() for luminosity-based variants
```

### Custom Color with Variants

```tsx
// Any CSS color works - variants are computed automatically
<Knob value={50} color="hsl(280, 80%, 60%)" />
<Button value={75} color="rgb(120, 80, 200)" />
<Slider value={25} color="#FF3366" />
```

## Component-Specific Notes

### Keybed Component

- **Uses luminosity variants** to prevent visual overlap between white and black keys
- Pressed white keys use `primary` color
- Black keys use darker variants (`primary50`, `primary20`)
- Ensures clear visual distinction

### Knob Component

- **Uses transparency variants** for layered arc rendering
- Background arc: `primary50` (50% opacity)
- Foreground arc: `primary` (full opacity)
- Creates depth effect

### Button Component

- **Uses transparency variants** for state-based styling
- Off state: `primary20` stroke, `primary50` fill
- On state: `primary50` stroke, `primary` fill
- Clear visual feedback

### Slider Component

- **Uses transparency variants** for track and fill
- Background track: `primary50` (50% opacity)
- Filled portion: `primary` (full opacity)
- Smooth visual progression

## Performance Optimizations

The color system is optimized for realtime audio UIs with the following features:

### CSS-Native Theming

- **No React overhead**: CSS variables update directly - no React Context or re-renders
- **Automatic updates**: CSS handles theme changes instantly without JavaScript
- **No observers needed**: Dark mode handled by CSS `.dark` class - no MutationObserver or MediaQueryList
- **Result**: Zero JavaScript overhead for theme changes

### CSS color-mix() for Variants

- **Native CSS**: Variants computed by browser using `color-mix()` - no JavaScript calculations
- **GPU-accelerated**: Browser handles color mixing efficiently
- **Result**: Faster variant generation than JavaScript

### Component-Level CSS Variables

- **Props set CSS variables**: Component props set CSS variables as convenience API
- **CSS reads variables**: Components read CSS variables directly via `var()`
- **Result**: No prop drilling, no Context overhead, pure CSS performance

### Expected Performance Impact

| Metric         | Before (React Context) | After (CSS Variables) | Improvement      |
| -------------- | ---------------------- | --------------------- | ---------------- |
| Theme Updates  | React re-renders       | CSS-only              | No re-renders    |
| Observers      | O(1) shared            | None needed           | 100% elimination |
| Color Variants | JavaScript computation | CSS color-mix()       | GPU-accelerated  |
| Memory         | Context overhead       | Zero overhead         | Reduced memory   |

## Best Practices

1. **Use predefined colors** for consistency: `themeColors.blue`, `themeColors.purple`, etc.
2. **Use CSS variables** for global theming: Set `--audioui-primary-color` at root or element level
3. **Use utility functions** for programmatic theme changes: `setThemeColor()`, `setThemeRoundness()`
4. **Use component props** for per-instance customization: Props set CSS variables automatically
5. **Use CSS-only customization** when possible: Set CSS variables directly via `style` prop or classes
6. **Let CSS compute variants** - `color-mix()` handles variant generation automatically
7. **No Provider needed** - CSS variables work everywhere, no React Context required

## Technical Details

### Color Format Support

The system supports all valid CSS color formats:

- Named colors: `"blue"`, `"red"`, `"transparent"`
- Hex: `"#FF5500"`, `"#F50"`
- RGB: `"rgb(255, 85, 0)"`, `"rgba(255, 85, 0, 0.5)"`
- HSL: `"hsl(20, 100%, 50%)"`, `"hsla(20, 100%, 50%, 0.5)"`
- CSS Variables: `"var(--audioui-theme-blue)"`
- CSS Functions: `"color-mix(...)"`, `"hsl(...)"`

### Browser Compatibility

- Uses modern CSS features: `color-mix()`, CSS variables
- Requires browsers with CSS Color Module Level 5 support
- Fallbacks handled gracefully for older browsers

### SSR Compatibility

- Adaptive default uses CSS variable to prevent hydration mismatches
- Server and client render the same string: `"var(--audioui-adaptive-default-color)"`
- Browser resolves the actual color based on `.dark` class
- No JavaScript required for mode detection on initial render
