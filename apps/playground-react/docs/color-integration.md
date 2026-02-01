<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

# Playground App Color Integration

This document explains how the playground application integrates with the Audio UI library's color system.

## Overview

The playground app serves as both a demonstration and testing environment for the Audio UI library. It integrates the library's color system while providing its own theme management UI.

## Provider Setup

### Provider Hierarchy

The app uses a simple provider structure:

```tsx
<ThemeProvider attribute="class" defaultTheme="system">
  <ThemeInitializer>{children}</ThemeInitializer>
</ThemeProvider>
```

**Location**: `app/providers.tsx`

### Provider Details

1. **Next.js ThemeProvider** (`next-themes`)
   - Manages light/dark mode switching
   - Adds/removes `.dark` class on `<html>` element
   - Enables system theme detection

2. **ThemeInitializer** (from playground app)
   - Initializes CSS variables on mount
   - Sets initial theme values (roundness, etc.)
   - Updates global state for sidebar access
   - **No React Context needed** - uses CSS variables directly

## Global State Bridge

### Purpose

The playground uses a global state object to allow the sidebar (which may be outside the normal React tree) to control theme settings.

**Location**: `app/providers.tsx`

```typescript
export const audioUiThemeState: { current: AudioUiThemeState } = {
  current: defaultAudioUiTheme,
};
```

### ThemeInitializer Component

The `ThemeInitializer` component sets up CSS variables and global state:

```typescript
function ThemeInitializer({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Set initial theme values via CSS variables
        setThemeRoundness(DEFAULT_ROUNDNESS);

        // Update global state with current values
        audioUiThemeState.current = {
            color: getThemeColor() ?? undefined,
            roundness: getThemeRoundness() ?? DEFAULT_ROUNDNESS,
            setColor: (color: string) => {
                setThemeColor(color);
                audioUiThemeState.current.color = color;
            },
            setRoundness: (roundness: number) => {
                setThemeRoundness(roundness);
                audioUiThemeState.current.roundness = roundness;
            },
        };
    }, []);

    return <>{children}</>;
}
```

This allows the sidebar to access theme controls via global state, while components use CSS variables directly.

## Sidebar Theme Controls

### Location

`components/SideBar.tsx`

### Theme Selector

The sidebar provides a dropdown to select from predefined themes using `themeColors` from the library:

**Available Themes**:

- Default (Adaptive) - `themeColors.default`
- Blue - `themeColors.blue`
- Orange - `themeColors.orange`
- Pink - `themeColors.pink`
- Green - `themeColors.green`
- Purple - `themeColors.purple`
- Yellow - `themeColors.yellow`

### Theme Switching Implementation

```typescript
import { themeColors, setThemeColor } from "@cutoff/audio-ui-react";

const changeTheme = (themeColor: string) => {
  setCurrentTheme(themeColor);
  setThemeColor(themeColor); // Sets CSS variable directly
  audioUiThemeState.current.setColor(themeColor); // Updates global state
};
```

**How it works**:

1. User selects a theme color (e.g., `themeColors.blue` which is `"var(--audioui-theme-blue)"`)
2. `setThemeColor()` sets the CSS variable `--audioui-primary-color` directly
3. All components automatically pick up the new theme (CSS updates instantly)
4. CSS computes variants automatically via `color-mix()`

**Key Points**:

- CSS variable updates instantly - no React re-renders needed
- Variants computed by CSS using `color-mix()` - no JavaScript calculations
- Works with any CSS color value (not just predefined themes)
- No React Context overhead

### Roundness Control

The sidebar also provides a slider and input for adjusting global roundness:

```typescript
import { setThemeRoundness } from "@cutoff/audio-ui-react";

const changeRoundness = (value: number) => {
  setRoundnessValue(value);
  setThemeRoundness(value); // Sets CSS variable directly
  audioUiThemeState.current.setRoundness(value); // Updates global state
};
```

This updates the CSS variable `--audioui-roundness-base`, which all components read automatically.

## CSS Integration

### Library Styles Import

The playground imports the library's styles:

```css
@import "@cutoff/audio-ui-react/style.css";
```

**Location**: `app/globals.css`

This brings in:

- Theme variables (`themes.css`)
- Base styles and utility classes (`styles.css`)

### Tailwind Integration

The playground uses Tailwind CSS for its own UI. The library's CSS variables work alongside Tailwind's theme system without conflicts.

**Note**: The playground's Tailwind theme (defined in `globals.css`) is separate from the Audio UI theme system. They serve different purposes:

- **Tailwind theme**: Playground UI (sidebar, buttons, inputs)
- **Audio UI theme**: Library components (knobs, sliders, buttons)

## Component Pages

### Color Picker Integration

Component demo pages (e.g., `app/vector-components/knob/page.tsx`) include a color picker for testing:

```tsx
const [color, setColor] = useState<string | undefined>(undefined);

<ColorPickerField value={color} onChange={setColor} label="Color" />;
```

**Behavior**:

- `undefined`: Component uses CSS variable `--audioui-primary-color` (or adaptive default if not set)
- String value: Component uses explicit color prop (sets CSS variable for that instance)

This allows testing both CSS variable-based theming and explicit color usage.

### Example Usage

```tsx
// Uses theme (when color is undefined)
<Knob value={50} label="Volume" color={color} />

// Uses explicit color (when color is set)
<Knob value={50} label="Volume" color="#FF3366" />
```

## Theme Variable Flow

### Initialization

1. App loads with CSS variables set to defaults
2. `ThemeInitializer` sets initial roundness via `setThemeRoundness()`
3. Components read CSS variable `--audioui-primary-color` (defaults to `--audioui-adaptive-default-color`)
4. Browser resolves to appropriate color based on `.dark` class

### Theme Switching

1. User selects theme in sidebar (e.g., `themeColors.blue`)
2. `changeTheme()` calls `setThemeColor(themeColors.blue)` (which is `"var(--audioui-theme-blue)"`)
3. CSS variable `--audioui-primary-color` updated directly
4. All components update instantly (no React re-renders)
5. CSS computes variants automatically via `color-mix()`

### Component Resolution

For a component like `<Knob color={color} />`:

1. If `color` prop provided → sets `--audioui-primary-color` CSS variable for that instance
2. Else → reads `--audioui-primary-color` CSS variable (set globally or defaults to `--audioui-adaptive-default-color`)

When using CSS variables:

- Components read `var(--audioui-primary-color)` directly
- CSS computes variants via `color-mix()` automatically
- Dark mode handled by `.dark` class in CSS

## Light/Dark Mode

### Next.js Theme Integration

The playground uses `next-themes` for light/dark mode:

```tsx
<ThemeProvider attribute="class" defaultTheme="system">
```

**Behavior**:

- Adds `.dark` class to `<html>` in dark mode
- Removes it in light mode
- System mode follows OS preference

### Theme Variable Adaptation

Library theme variables automatically adapt:

```css
:root {
  --audioui-theme-default: hsl(0, 0%, 10%); /* Light mode */
  --audioui-adaptive-default-color: var(--audioui-theme-default);
}

.dark {
  --audioui-theme-default: hsl(0, 0%, 96%); /* Dark mode */
  --audioui-adaptive-default-color: var(--audioui-theme-default);
}
```

**Result**: Components automatically use appropriate colors based on mode.

### Automatic Mode Detection

Dark mode is handled automatically by CSS:

- `.dark` class on `<html>` triggers CSS variable updates
- No JavaScript observers needed
- CSS variables automatically resolve to correct values
- Components update instantly when mode changes

### Manual Theme Toggle

The sidebar provides a button to cycle through:

- Light
- Dark
- System

## Best Practices for Playground

1. **Use themeColors**: Prefer `themeColors.blue` over hardcoded CSS variables
2. **Test Theme Switching**: Ensure components work with all themes
3. **Test Light/Dark Mode**: Verify components in both modes
4. **Allow Overrides**: Component pages should allow explicit color props
5. **Sync State**: Keep sidebar controls in sync with actual theme state

## Troubleshooting

### Components Not Updating

If components don't update when theme changes:

1. Check CSS variable is set:

   ```typescript
   const color = getComputedStyle(document.documentElement).getPropertyValue("--audioui-primary-color");
   console.log(color);
   ```

2. Verify components read CSS variables correctly

3. Check that `ThemeInitializer` is setting initial values properly

### Color Not Applying

If explicit colors don't work:

1. Verify color format is valid CSS color
2. Check component accepts `color` prop
3. Ensure prop is passed correctly (not `undefined`)

### Theme Variables Not Found

If theme variables are missing:

1. Verify library styles are imported: `@import "@cutoff/audio-ui-react/style.css"`
2. Check `themes.css` is included in library build
3. Verify CSS is loaded before components render

## Related Documentation

- [Library Color System](../../library/docs/color-system.md) - Comprehensive color system documentation
- [Color Property Examples](../../library/docs/color-property-examples.md) - Usage examples
