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
   - When the `color` prop of a component is `undefined`, the theme color from a theme provider should be used
   - If the theme color is also `undefined`, it falls back to the component's default value (typically `undefined`, which then resolves to adaptive default)

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

- Variants are computed in JavaScript at component level, not in CSS
- CSS variables are used for theme definitions, but variants are not stored as CSS variables
- The adaptive default uses a CSS variable (`--audioui-adaptive-default-color`) to prevent hydration mismatches
- Color mode tracking is shared at provider level for performance (not per-component)

## Overview

The Audio UI library uses a clean, idiomatic color system optimized for realtime audio applications:

- **Uniform color type**: All colors (theme and component) are CSS color values (literal, function, or variable)
- **Predefined theme colors**: Simple primary colors - variants are computed automatically
- **Adaptive default**: White in dark mode, black in light mode (via CSS variable)
- **Automatic variant generation**: Components compute `primary50` and `primary20` variants from the primary color
- **Mode-aware**: System automatically tracks light/dark mode changes
- **Context-based theming**: Theme provider for global color management
- **Performance optimized**: Shared observers, memoized calculations, minimal re-renders

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
useThemableProps Hook (memoized)
    ↓
Resolves: Component Prop → Theme Context → Default (undefined) → Adaptive Default (CSS variable)
    ↓
generateColorVariants Utility (optimized)
    ↓
Creates: primary, primary50, primary20, highlight
    ↓
SVG Component Rendering
```

### Key Files

- **`themes.css`**: Defines CSS theme variables for primary colors and adaptive default
- **`styles.css`**: Base styles and optional utility classes
- **`colorUtils.ts`**: Generates color variants with optimized string operations
- **`themeColors.ts`**: Exports predefined theme colors as CSS color values
- **`AudioUiProvider.tsx`**: React context for theme management with shared mode tracking
- **Component files**: Use `useThemableProps` to resolve colors and compute variants

## CSS Theme Variables

### Theme Variable Structure

The library defines theme variables in `themes.css` with simple naming - **only primary colors, no variants**:

```css
--audioui-theme-{name}  /* Just the primary color */
--audioui-adaptive-default-color  /* CSS variable for adaptive default */
```

**Note**: Variants (`primary50`, `primary20`) are **not** defined in CSS - they are computed automatically by components.

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

- **No variant CSS variables**: `--audioui-theme-blue-50` and `--audioui-theme-blue-20` do not exist
- **Variants are computed**: Components generate variants dynamically using `generateColorVariants()`
- **CSS variables are optional**: You can use direct color values, CSS variables, or any valid CSS color

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

1. **Component `color` prop** (explicit prop)
2. **Theme Context** (`AudioUiProvider` value)
3. **Component default** (component-specific default, typically `undefined`)
4. **Adaptive default** (`getAdaptiveDefaultColor()` - CSS variable that resolves to white in dark mode, black in light mode)

### `useThemableProps` Hook

**Location**: `packages/react/src/components/defaults/AudioUiProvider.tsx`

**Usage**:

```typescript
const { resolvedColor, resolvedRoundness } = useThemableProps(
  { color, roundness }, // Component props
  { color: undefined, roundness: 12 } // Default values
);
```

**Implementation**:

```typescript
export function useThemableProps(
  props: Partial<ThemableProps>,
  defaultValues: Partial<ThemableProps>
): { resolvedColor: string; resolvedRoundness: number | undefined } {
  const themeContext = useAudioUiTheme();

  // Memoized resolution - only recomputes when inputs change
  const resolvedColor = useMemo(() => {
    return props.color ?? themeContext.color ?? defaultValues.color ?? getAdaptiveDefaultColor();
  }, [props.color, themeContext.color, defaultValues.color, themeContext.isDarkMode]);

  const resolvedRoundness = useMemo(() => {
    return props.roundness ?? themeContext.roundness ?? defaultValues.roundness;
  }, [props.roundness, themeContext.roundness, defaultValues.roundness]);

  return { resolvedColor, resolvedRoundness };
}
```

**Key Features**:

- **Memoized**: Only recomputes when inputs actually change
- **Mode-aware**: Includes `isDarkMode` in dependencies to react to mode changes
- **Performance**: Prevents unnecessary recalculations on every render

### Component Implementation Pattern

All components follow this pattern:

```typescript
function MyComponent({ color, roundness, ...otherProps }: MyComponentProps) {
    // 1. Resolve color and roundness (memoized)
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness },
        { color: undefined, roundness: 12 } // undefined uses adaptive default
    );

    // 2. Generate color variants (memoized per component)
    const colorVariants = useMemo(
        () => generateColorVariants(resolvedColor, "transparency"),
        [resolvedColor]
    );

    // 3. Use variants in SVG rendering
    return (
        <SvgComponent
            color={resolvedColor}
            // or use colorVariants.primary, colorVariants.primary50, etc.
        />
    );
}
```

## Theme Provider System

### `AudioUiProvider`

**Location**: `packages/react/src/components/defaults/AudioUiProvider.tsx`

Provides React context for global theme management with **shared color mode tracking** (performance optimization).

**Props**:

```typescript
interface AudioUiProviderProps {
  children: ReactNode;
  initialColor?: string; // Default: undefined (uses adaptive default)
  initialRoundness?: number; // Default: 12
}
```

**Usage**:

```tsx
<AudioUiProvider initialColor="purple" initialRoundness={8}>
  <App />
</AudioUiProvider>
```

**Context Value**:

```typescript
interface ThemeContextType {
  color: string | undefined;
  roundness: number;
  isDarkMode: boolean; // Exposed for component reactivity
  setColor: (color: string) => void;
  setRoundness: (roundness: number) => void;
}
```

**Performance Features**:

- **Shared mode tracking**: Single `MutationObserver` and `MediaQueryList` listener for all components (not per-component)
- **Memoized context value**: Prevents unnecessary re-renders
- **Automatic mode detection**: Tracks `.dark` class changes and system preferences

### `useAudioUiTheme` Hook

Access the theme context:

```typescript
const { color, roundness, isDarkMode, setColor, setRoundness } = useAudioUiTheme();
```

**Note**: Must be used within an `AudioUiProvider`.

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

### Theme Provider Usage

```tsx
// Set global theme
import { themeColors } from '@cutoff/audio-ui-react';

<AudioUiProvider initialColor={themeColors.purple} initialRoundness={8}>
    <App />
</AudioUiProvider>

// All components inherit the theme unless overridden
<Knob value={50} label="Volume" /> {/* Uses purple */}
<Button value={75} label="Power" color="blue" /> {/* Overrides with blue */}
```

### Dynamic Theme Switching

```tsx
import { themeColors } from "@cutoff/audio-ui-react";

function App() {
  const { setColor } = useAudioUiTheme();

  return (
    <div>
      <button onClick={() => setColor(themeColors.blue)}>Blue Theme</button>
      <button onClick={() => setColor(themeColors.orange)}>Orange Theme</button>
      <button onClick={() => setColor("#FF3366")}>Custom Color</button>
      <Knob value={50} label="Volume" /> {/* Uses current theme */}
    </div>
  );
}
```

### Component-Specific Color Variants

```tsx
// Knob uses transparency variants
<KnobView color="blue" />
// Generates: primary, primary50 (50% opacity), primary20 (20% opacity)

// Keybed uses luminosity variants
<Keybed color="blue" />
// Generates: primary, primary50 (50% luminosity), primary20 (20% luminosity)
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

### Shared Color Mode Tracking

- **Single observer**: One `MutationObserver` and `MediaQueryList` listener at the provider level
- **Not per-component**: Components don't create their own observers
- **Result**: O(1) observers instead of O(n) where n = number of components
- **Impact**: ~98% reduction in observer overhead for control surfaces with many components

### Memoized Color Resolution

- **Memoized calculations**: `resolvedColor` and `resolvedRoundness` only recompute when inputs change
- **Dependency tracking**: Includes `isDarkMode` to ensure reactivity to mode changes
- **Result**: No unnecessary recalculations on every render

### Optimized Color Utilities

- **Pre-compiled regex**: No regex recompilation per call
- **Efficient lookups**: O(1) hash map access for named colors
- **Reduced operations**: Normalized color computed once and reused
- **Result**: Faster color variant generation

### Component-Level Memoization

- **Color variants**: Memoized per component based on resolved color
- **Prevents**: Unnecessary variant regeneration on unrelated re-renders

### Expected Performance Impact

| Metric            | Before                  | After        | Improvement          |
| ----------------- | ----------------------- | ------------ | -------------------- |
| Observers         | O(n) components         | O(1) shared  | ~98% reduction       |
| Color Resolution  | Every render            | Memoized     | Only on input change |
| String Operations | Multiple regex compiles | Pre-compiled | Faster execution     |

## Best Practices

1. **Use predefined colors** for consistency: `themeColors.blue`, `themeColors.purple`, etc.
2. **Use CSS variables** when you want to leverage the theme system: `"var(--audioui-theme-blue)"`
3. **Use custom colors** for one-off components or special cases: `"#FF5500"`, `"hsl(280, 80%, 60%)"`
4. **Prefer theme provider** for global theming over individual component props
5. **Use component props** when you need component-specific overrides
6. **Let components compute variants** - don't try to set variants manually
7. **Trust the memoization** - the system is optimized, don't over-optimize

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
