# AudioUI Styling System Agent Guidelines

**Version**: 1.0 | **Purpose**: Maintain consistent, namespaced styling across the AudioUI library

## Overview

The AudioUI library uses a comprehensive namespace isolation strategy to prevent style conflicts with host applications. All CSS classes and CSS custom properties are prefixed with `audioui-` to ensure complete style isolation.

## Core Principles

1. **Complete Namespace Isolation**: All styles must be prefixed with `audioui-`
2. **Centralized Constants**: Use shared constants from `styles/classNames.ts` and `styles/cssVars.ts`
3. **Automated Enforcement**: Stylelint validates naming conventions
4. **Type Safety**: TypeScript types for class names and CSS variables

## Naming Conventions

### CSS Classes

**Format**: `.audioui-{component-or-utility}-{modifier?}`

**Examples:**

- `.audioui` - Main component root class
- `.audioui-component-container` - Container helper class
- `.audioui-highlight` - Interactive state class
- `.audioui-stroke-primary` - Utility class for stroke color
- `.audioui-fill-text` - Utility class for text fill

**Rules:**

- Always use kebab-case (lowercase with hyphens)
- Main component class is simply `.audioui` (not `.audioui-root`)
- Utility classes follow pattern: `.audioui-{property}-{value}`
- State classes follow pattern: `.audioui-{state}`

### CSS Custom Properties (Variables)

**Format**: `--audioui-{category}-{name}`

**Examples:**

- `--audioui-theme-blue` - Theme color variable
- `--audioui-adaptive-default-color` - Adaptive default color
- `--audioui-text-color` - Text color variable
- `--audioui-primary-color` - Optional primary color (user-defined)
- `--audioui-default-font-size` - Font size variable

**Rules:**

- Always use kebab-case
- Category prefixes: `theme-*`, `adaptive-default-color`, `text-color`, `bg-color`, `primary-color`, `default-font-size`
- Theme colors: `--audioui-theme-{name}` (blue, orange, pink, green, purple, yellow, default)

## Using Constants

### Class Names

**Location**: `packages/react/src/styles/classNames.ts`

**Usage:**

```typescript
import { CLASSNAMES } from "../../styles/classNames";

// In component
const className = classNames(CLASSNAMES.root, CLASSNAMES.highlight, customClassName);
```

**Available Constants:**

- `CLASSNAMES.root` - `"audioui"` - Main component class
- `CLASSNAMES.container` - `"audioui-component-container"` - Container helper
- `CLASSNAMES.highlight` - `"audioui-highlight"` - Interactive state

**When to Use:**

- ✅ Always use constants for class names in TypeScript/JavaScript files
- ✅ Prevents typos and ensures consistency
- ✅ Makes refactoring easier
- ❌ Never use string literals like `"audioui"` directly in code

### CSS Variables

**Location**: `packages/react/src/styles/cssVars.ts`

**Usage:**

```typescript
import { CSS_VARS } from "../../styles/cssVars";

// In component or utility
const defaultColor = CSS_VARS.adaptiveDefaultColor;
// Returns: "--audioui-adaptive-default-color"
```

**Available Constants:**

- `CSS_VARS.adaptiveDefaultColor` - `"--audioui-adaptive-default-color"`

**When to Use:**

- ✅ Use constants for CSS variables referenced in TypeScript/JavaScript
- ✅ For theme colors, use `themeColors` from `themeColors.ts` instead
- ❌ Avoid hardcoding CSS variable names in code

## Adding New Styles

**Important**: When adding new styles, follow the [CSS Conventions](#css-conventions) section for color formats, units, layout techniques, and performance best practices.

### Adding a New CSS Class

1. **Define in CSS file** (`styles.css` or component-specific CSS):

   ```css
   .audioui-my-new-class {
     /* Use HSL for colors, relative units, modern CSS */
     color: hsl(204, 88%, 52%);
     padding: 0.5em;
   }
   ```

2. **Add to constants** (`styles/classNames.ts`):

   ```typescript
   export const CLASSNAMES = {
     // ... existing
     myNewClass: "audioui-my-new-class",
   } as const;
   ```

3. **Use in components**:

   ```typescript
   import { CLASSNAMES } from "../../styles/classNames";
   // Use CLASSNAMES.myNewClass
   ```

4. **Verify with Stylelint**:
   ```bash
   pnpm --filter @cutoff/audio-ui-react lint:css
   ```

### Adding a New CSS Variable

1. **Define in CSS file** (`themes.css` or `styles.css`):

   ```css
   :root {
     --audioui-my-new-variable: value;
   }
   ```

2. **Add to constants** (`styles/cssVars.ts`):

   ```typescript
   export const CSS_VARS = {
     // ... existing
     myNewVariable: "--audioui-my-new-variable",
   } as const;
   ```

3. **Use in code**:

   ```typescript
   import { CSS_VARS } from "../../styles/cssVars";
   // Use CSS_VARS.myNewVariable
   ```

4. **Verify with Stylelint**:
   ```bash
   pnpm --filter @cutoff/audio-ui-react lint:css
   ```

### Adding a New Theme Color

1. **Define in `themes.css`**:

   ```css
   :root {
     --audioui-theme-red: hsl(0, 100%, 50%);
   }

   .dark {
     --audioui-theme-red: hsl(0, 100%, 52%);
   }
   ```

2. **Add to `themeColors.ts`**:

   ```typescript
   export const themeColors = {
     // ... existing
     red: "var(--audioui-theme-red)",
   } as const;
   ```

3. **Add to `themeColorsDirect.ts`** (if needed):
   ```typescript
   export const themeColorsDirect = {
     // ... existing
     red: {
       light: "hsl(0, 100%, 50%)",
       dark: "hsl(0, 100%, 52%)",
     },
   } as const;
   ```

## Stylelint Enforcement

### Configuration

**Location**: `packages/react/.stylelintrc.json`

**Rules:**

- `custom-property-pattern`: Enforces `^audioui-[a-z0-9-]+$` pattern
- `selector-class-pattern`: Enforces `^(audioui(-[a-z0-9]+)*|dark)$` pattern (allows `.dark` for dark mode)

### Running Stylelint

```bash
# From library directory
pnpm lint:css

# From root
pnpm --filter @cutoff/audio-ui-react lint:css
```

### Common Violations

**Error**: `Expected "--my-var" to match pattern "^audioui-[a-z0-9-]+$"`
**Fix**: Prefix with `audioui-`: `--audioui-my-var`

**Error**: `Expected ".my-class" to match pattern "^audioui(-[a-z0-9]+)*$"`
**Fix**: Prefix with `audioui-`: `.audioui-my-class`

**Note**: `.dark` selector is allowed (used for dark mode overrides)

## File Organization

### CSS Files

- **`styles.css`**: Base styles, utility classes, component classes
- **`themes.css`**: Theme color variables, adaptive defaults

### TypeScript Files

- **`styles/classNames.ts`**: Centralized class name constants
- **`styles/cssVars.ts`**: Centralized CSS variable constants
- **`themeColors.ts`**: Theme color exports (uses CSS variables)

## Best Practices

### DO

✅ **Use constants** from `classNames.ts` and `cssVars.ts`
✅ **Prefix all classes** with `audioui-`
✅ **Prefix all CSS variables** with `--audioui-`
✅ **Follow CSS conventions** (HSL colors, modern functions, relative units)
✅ **Run Stylelint** before committing changes
✅ **Update constants** when adding new classes/variables
✅ **Document new styles** in component JSDoc if needed
✅ **Use HSL** for all color definitions
✅ **Use `color-mix()`** for color variants and transparency
✅ **Optimize for performance** (fast transitions, GPU-accelerated animations)

### DON'T

❌ **Never use unprefixed classes** or CSS variables
❌ **Never hardcode class names** as string literals in code
❌ **Never skip Stylelint** validation
❌ **Never add styles without updating constants** (if used in TS/JS)
❌ **Never use camelCase** for CSS classes (use kebab-case)
❌ **Avoid RGB/Hex** for theme colors (use HSL)
❌ **Avoid expensive CSS properties** in animations (blur, complex shadows)
❌ **Avoid fixed units** for responsive properties (use relative units)

## Component Integration Pattern

### Standard Component Pattern

```typescript
import { CLASSNAMES } from "../../styles/classNames";
import classNames from "classnames";

function MyComponent({ className, onChange, ...props }: MyComponentProps) {
    const componentClassName = useMemo(() => {
        return classNames(
            CLASSNAMES.root,           // Always include root class
            onChange ? CLASSNAMES.highlight : "",  // Conditional highlight
            className                          // User-provided classes
        );
    }, [className, onChange]);

    return (
        <div className={componentClassName}>
            {/* component content */}
        </div>
    );
}
```

## CSS Conventions

### Color Formats

**Preferred: HSL (Hue, Saturation, Lightness)**

✅ **Use HSL for all theme colors and color definitions**

```css
/* ✅ Preferred */
--audioui-theme-blue: hsl(204, 88%, 52%);
--audioui-text-color: hsl(0, 0%, 10%);

/* ❌ Avoid */
--audioui-theme-blue: rgb(33, 150, 243);
--audioui-theme-blue: #2196f3;
```

**Why HSL?**

- **Easier manipulation**: Adjust lightness/saturation independently
- **Intuitive theming**: Lightness changes work naturally for light/dark modes
- **Better for variants**: Generate lighter/darker variants by adjusting lightness
- **Human-readable**: Easier to understand and modify color values

**When to use other formats:**

- **Hex/RGB**: Only for one-off colors or when HSL isn't practical
- **Named colors**: Only for semantic values like `transparent`, `currentColor`
- **CSS variables**: Always prefer variables for themeable colors

### Modern Color Functions

**Use `color-mix()` for color manipulation**

✅ **Preferred for variants and transparency**:

```css
/* Transparency variant */
color-mix(in srgb, hsl(204, 88%, 52%) 50%, transparent)

/* Luminosity variant */
color-mix(in srgb, hsl(204, 88%, 52%) 80%, black 20%)
```

**Color Space**: Use `srgb` (standard RGB) for `color-mix()` - it's widely supported and predictable.

**Why `color-mix()`?**

- Modern CSS standard (CSS Color Module Level 5)
- Browser-native, no JavaScript required
- Works with any color format (HSL, RGB, hex, etc.)
- Better performance than JavaScript color manipulation

### Units

**Relative Units Preferred**

✅ **Use relative units for responsive design**:

```css
/* ✅ Preferred */
font-size: 14px; /* Base font size - px is fine for base values */
width: 100%; /* Percentage for responsive widths */
padding: 0.5em; /* em for spacing relative to font size */

/* ❌ Avoid fixed units for responsive properties */
width: 500px; /* Too rigid */
font-size: 12pt; /* pt is for print, not screen */
```

**Unit Guidelines:**

- **`px`**: Base font sizes, fixed dimensions when needed
- **`%`**: Widths, heights relative to container
- **`em`**: Spacing, sizing relative to font size
- **`rem`**: Spacing relative to root font size (if needed)
- **`vh`/`vw`**: Viewport-relative sizing (use sparingly)
- **Container queries**: Use `cqw`/`cqh` for container-relative sizing (AdaptiveBox uses this)

### Layout Techniques

**Modern CSS Layout**

✅ **Preferred approaches**:

```css
/* CSS Grid for component layouts */
.audioui-component-container {
  display: grid;
  grid-template-columns: 1fr;
}

/* Flexbox for alignment */
.audioui-highlight {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Container queries for responsive components */
@container (min-width: 200px) {
  .audioui-component-container {
    /* responsive styles */
  }
}
```

**Layout Guidelines:**

- **CSS Grid**: For two-dimensional layouts, component structure
- **Flexbox**: For one-dimensional alignment, distribution
- **Container Queries**: For component-level responsiveness (used in AdaptiveBox)
- **Avoid**: Float-based layouts, table layouts for non-tabular data

### Performance

**Optimize for Realtime Audio UIs**

✅ **Performance best practices**:

```css
/* ✅ Use will-change for animated properties */
.audioui-highlight {
  will-change: filter;
  transition: filter 50ms linear; /* Fast transitions for audio UI */
}

/* ✅ Use transform/opacity for animations (GPU-accelerated) */
.audioui-component {
  transform: translateZ(0); /* Force GPU acceleration if needed */
}

/* ❌ Avoid expensive properties */
.audioui-component {
  /* Avoid: box-shadow, blur, complex gradients in animations */
}
```

**Performance Guidelines:**

- **Fast transitions**: 50ms or less for audio UI feedback (instant feel)
- **GPU acceleration**: Use `transform` and `opacity` for animations
- **`will-change`**: Hint browser about upcoming changes
- **Avoid**: Expensive filters, complex shadows, blur in hot paths
- **Minimize reflows**: Use transforms instead of changing layout properties

### Accessibility

**Ensure Accessible Colors**

✅ **Accessibility considerations**:

```css
/* ✅ Ensure sufficient contrast */
--audioui-text-color: hsl(0, 0%, 10%); /* High contrast on light bg */
--audioui-text-color-dark: hsl(0, 0%, 96%); /* High contrast on dark bg */

/* ✅ Use semantic color names */
--audioui-text-color: /* For text content */;
```

**Accessibility Guidelines:**

- **Contrast ratios**: Minimum 4.5:1 for normal text, 3:1 for large text (WCAG AA)
- **Color independence**: Don't rely solely on color to convey information
- **Focus indicators**: Ensure interactive elements have visible focus states
- **Dark mode**: Provide high-contrast alternatives for dark mode

### Vendor Prefixes

**Minimal Use**

✅ **Only when necessary**:

```css
/* ✅ Use standard property with fallback */
.audioui {
  user-select: none;
  -webkit-user-select: none; /* Safari fallback */
}

/* ❌ Avoid unnecessary prefixes */
.audioui {
  -webkit-transform:; /* Use transform instead */
}
```

**Vendor Prefix Guidelines:**

- **Avoid**: Most prefixes are no longer needed (browsers support standards)
- **Use sparingly**: Only for properties with known Safari/older browser issues
- **Standard first**: Always include standard property, prefix as fallback
- **Check caniuse.com**: Verify if prefix is still needed

### CSS Custom Properties

**Use for Theming**

✅ **Best practices**:

```css
/* ✅ Define in :root for global scope */
:root {
  --audioui-theme-blue: hsl(204, 88%, 52%);
}

/* ✅ Override in .dark for dark mode */
.dark {
  --audioui-theme-blue: hsl(204, 88%, 53%);
}

/* ✅ Use var() with fallback */
color: var(--audioui-primary-color, var(--audioui-text-color));
```

**Custom Property Guidelines:**

- **Naming**: Always prefix with `--audioui-`
- **Scope**: Use `:root` for global, component classes for scoped
- **Fallbacks**: Provide fallback values in `var()` when appropriate
- **Performance**: CSS variables are fast, use them liberally for theming

## Testing

### Verify Styling Changes

1. **Type checking**:

   ```bash
   pnpm --filter @cutoff/audio-ui-react typecheck
   ```

2. **Stylelint**:

   ```bash
   pnpm --filter @cutoff/audio-ui-react lint:css
   ```

3. **Build**:

   ```bash
   pnpm --filter @cutoff/audio-ui-react build
   ```

4. **Visual testing**: Check playground app renders correctly

## Common Patterns

### Utility Classes

Utility classes follow the pattern: `.audioui-{property}-{value}`

```css
.audioui-stroke-primary {
  stroke: var(--audioui-primary-color);
}
.audioui-fill-primary {
  fill: var(--audioui-primary-color);
}
.audioui-border-primary {
  border-color: var(--audioui-primary-color);
}
.audioui-text-primary {
  color: var(--audioui-primary-color);
}
.audioui-fill-text {
  fill: var(--audioui-text-color);
}
.audioui-fill-transparent {
  fill: transparent;
}
```

### Theme Variables

Theme variables follow the pattern: `--audioui-theme-{name}`

```css
:root {
  --audioui-theme-default: hsl(0, 0%, 10%);
  --audioui-theme-blue: hsl(204, 88%, 52%);
  --audioui-theme-orange: hsl(29, 100%, 48%);
  /* ... */
}
```

### Adaptive Default

The adaptive default uses a CSS variable to prevent hydration mismatches:

```css
:root {
  --audioui-adaptive-default-color: var(--audioui-theme-default);
}

.dark {
  --audioui-adaptive-default-color: var(--audioui-theme-default);
}
```

## Troubleshooting

### Stylelint Fails

**Problem**: Stylelint reports unprefixed classes/variables
**Solution**:

1. Check that all classes start with `audioui-`
2. Check that all CSS variables start with `--audioui-`
3. Verify `.stylelintrc.json` rules are correct
4. Run `pnpm lint:css --fix` to auto-fix some issues

### TypeScript Errors

**Problem**: TypeScript can't find class name constants
**Solution**:

1. Import from `styles/classNames.ts`
2. Use `CLASSNAMES` object, not string literals
3. Check that constants are exported correctly

### Styles Not Applying

**Problem**: Styles don't appear in browser
**Solution**:

1. Verify CSS file is imported in component
2. Check that class names match exactly (case-sensitive)
3. Verify CSS is included in build output (`dist/style.css`)
4. Check browser DevTools for CSS conflicts

## References

- **Color System Documentation**: `packages/react/docs/color-system.md`
- **Color Integration Guide**: `apps/playground-react/docs/color-integration.md`
- **Stylelint Config**: `packages/react/.stylelintrc.json`
- **Class Name Constants**: `packages/react/src/styles/classNames.ts`
- **CSS Variable Constants**: `packages/react/src/styles/cssVars.ts`
- **Theme Colors**: `packages/react/src/themeColors.ts`

## Maintenance Notes

- This styling system was implemented in version 1.0.0-dp.1
- All styles are prefixed with `audioui-` to prevent conflicts
- Stylelint enforces naming conventions automatically
- Constants provide type safety and refactoring support
- Documentation should be updated when adding new patterns
