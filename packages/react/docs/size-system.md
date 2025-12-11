# Size System Architecture

This document specifies the size system used by AudioUI components. The system provides consistent, themeable sizing across all components using a base unit and multiplier approach.

## Overview

The size system uses CSS variables and utility classes to provide consistent sizing across all components. Sizes are defined relative to a base unit, ensuring components work harmoniously together in layouts.

## Base Unit System

All component sizes derive from a single base unit:

- **Base Unit**: `--audioui-unit` (default: 48px)
- **Size Multipliers**:
  - `xsmall`: 1x base unit
  - `small`: 1.25x base unit
  - `normal`: 1.5x base unit (default)
  - `large`: 2x base unit
  - `xlarge`: 2.5x base unit

## Component Aspect Ratios

Each component type has a fixed aspect ratio that defines its shape:

- **Button**: 1x1 (square)
- **Knob**: 1x1 (square)
- **KnobSwitch**: 1x1 (square)
- **Horizontal Slider**: 1x3 (width:height) - width > height
- **Vertical Slider**: 3x1 (width:height) - height > width
- **Keybed**: 1x5 (width:height) - width > height

## CSS Variable Structure

Size dimensions are defined in `themes.css` using CSS variables:

```css
/* Base unit */
--audioui-unit: 48px;

/* Size multipliers */
--audioui-size-mult-xsmall: 1;
--audioui-size-mult-small: 1.25;
--audioui-size-mult-normal: 1.5;
--audioui-size-mult-large: 2;
--audioui-size-mult-xlarge: 2.5;

/* Square components (Button, Knob, KnobSwitch) */
--audioui-size-square-{size}: calc(var(--audioui-unit) * var(--audioui-size-mult-{size}));

/* Horizontal Slider (1x3) */
--audioui-size-hslider-height-{size}: var(--audioui-unit) * multiplier;
--audioui-size-hslider-width-{size}: calc(height * 3);

/* Vertical Slider (3x1) */
--audioui-size-vslider-width-{size}: var(--audioui-unit) * multiplier;
--audioui-size-vslider-height-{size}: calc(width * 3);

/* Keybed (1x5) */
--audioui-size-keybed-height-{size}: var(--audioui-unit) * multiplier;
--audioui-size-keybed-width-{size}: calc(height * 5);
```

## Size Utility Classes

Size utility classes are defined in `styles.css`. They provide the dimensions for each size variant.

```css
.audioui-size-square-{size} {
    width: var(--audioui-size-square-{size});
    height: var(--audioui-size-square-{size});
}

.audioui-size-hslider-{size} {
    width: var(--audioui-size-hslider-width-{size});
    height: var(--audioui-size-hslider-height-{size});
}

.audioui-size-vslider-{size} {
    width: var(--audioui-size-vslider-width-{size});
    height: var(--audioui-size-vslider-height-{size});
}

.audioui-size-keybed-{size} {
    width: var(--audioui-size-keybed-width-{size});
    height: var(--audioui-size-keybed-height-{size});
}
```

## Implementation Details

### Size Prop

All controls support a `size` prop:

```typescript
type SizeType = "xsmall" | "small" | "normal" | "large" | "xlarge";
```

Default: `"normal"`

### Stretch Prop

All controls support a `stretch` prop:

- `stretch={false}` (default): Component uses size constraints from `size` prop
- `stretch={true}`: Component fills its container (AdaptiveBox's default 100% behavior)

### Size Application

When `stretch={false}` and `size` is provided:

1. **CSS Classes**: Size class is applied for semantic purposes and external styling
2. **Inline Styles**: Size dimensions are applied as inline styles (CSS variable references) to override AdaptiveBox's default 100% sizing
3. **Precedence**: User `className` and `style` props take precedence over size classes/styles

When `stretch={true}`:

1. No size class or inline size styles are applied
2. AdaptiveBox's default `width: 100%; height: 100%` takes effect
3. Component fills its container

### Utility Functions

**`getSizeClassForComponent()`**: Returns the CSS class name for a given component type, size, and orientation.

```typescript
getSizeClassForComponent("knob", "large"); // "audioui-size-square-large"
getSizeClassForComponent("slider", "normal", "vertical"); // "audioui-size-vslider-normal"
```

**`getSizeStyleForComponent()`**: Returns an object with `width` and `height` CSS variable references for inline style application.

```typescript
getSizeStyleForComponent("knob", "large");
// { width: "var(--audioui-size-square-large)", height: "var(--audioui-size-square-large)" }

getSizeStyleForComponent("slider", "normal", "vertical");
// { width: "var(--audioui-size-vslider-width-normal)", height: "var(--audioui-size-vslider-height-normal)" }
```

## Component Implementation

### Built-in Controls

All built-in controls (Button, Knob, Slider, KnobSwitch, Keybed) implement size support:

1. Get size class name using utility functions
2. Merge size class with user className (user takes precedence)
3. Apply to AdaptiveBox root element

### Example: Knob Component

```typescript
// Get the size class name based on the size prop
const sizeClassName = stretch ? undefined : getSizeClassForComponent("knob", size);

// Merge class names: size class first, then user className (user takes precedence)
const mergedClassName = classNames(sizeClassName, className);

// Build merged style: size style (when not stretching), then user style (user takes precedence)
const sizeStyle = stretch ? undefined : getSizeStyleForComponent("knob", size);

return (
    <SvgContinuousControl
        className={mergedClassName}
        style={{ ...sizeStyle, ...style }}
        // ... other props
    />
);
```

## Customization

### Changing Base Unit

To scale the entire size system, modify the base unit in `themes.css`:

```css
:root {
  --audioui-unit: 60px; /* Increase from 48px to 60px */
}
```

All components will scale proportionally while maintaining their aspect ratios.

### Overriding Size

Users can override size constraints using `className` or `style` props. User-provided styles are spread after size styles, so they take precedence:

```tsx
<Knob
    size="normal"
    className="w-20 h-20" // Overrides via CSS class (if higher specificity)
/>

<Knob
    size="normal"
    style={{ width: "100px", height: "100px" }} // Overrides inline (always wins)
/>
```

## Design System Consistency

The size system ensures mathematical harmony between components:

- A "small" knob (1x1) aligns perfectly with a "small" slider's track width
- All components use the same base unit and multipliers
- Size variations are consistent across component types
- Aspect ratios are preserved at all sizes

## Performance Considerations

- Size classes use CSS variables (computed at render time, cached by browser)
- Size dimensions applied as inline styles (CSS variable references) override AdaptiveBox's default 100% sizing
- No JavaScript calculations required for sizing - all sizing is CSS-based
- All controls are wrapped with `React.memo` - style objects are only created when props change
- Simple object spread for style merging is used (no `useMemo` overhead needed for 2-3 property objects)
