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

The app uses a nested provider structure:

```tsx
<ThemeProvider attribute="class" defaultTheme="system">
  <AudioUiProvider initialRoundness={12}>
    <ThemeConnector>{children}</ThemeConnector>
  </AudioUiProvider>
</ThemeProvider>
```

**Location**: `app/providers.tsx`

### Provider Details

1. **Next.js ThemeProvider** (`next-themes`)
   - Manages light/dark mode switching
   - Adds/removes `.dark` class on `<html>` element
   - Enables system theme detection

2. **AudioUiProvider** (from library)
   - Provides theme context for library components
   - Initial color: `undefined` (uses adaptive default)
   - Initial roundness: `12`
   - **Shared mode tracking**: Single observer for all components (performance optimization)

3. **ThemeConnector**
   - Bridges Audio UI context to global state
   - Allows sidebar to access theme without React context

## Global State Bridge

### Purpose

The playground uses a global state object to allow the sidebar (which may be outside the normal React tree) to control theme settings.

**Location**: `app/providers.tsx`

```typescript
export const audioUiThemeState: { current: AudioUiThemeState } = {
  current: defaultAudioUiTheme,
};
```

### ThemeConnector Component

The `ThemeConnector` component syncs the Audio UI context to the global state:

```typescript
function ThemeConnector({ children }: { children: React.ReactNode }) {
    const { color, roundness, setColor, setRoundness } = useAudioUiTheme();

    useEffect(() => {
        audioUiThemeState.current = {
            color, // Can be undefined - components will use adaptive default
            roundness: roundness ?? 12,
            setColor,
            setRoundness,
        };
    }, [color, roundness, setColor, setRoundness]);

    return <>{children}</>;
}
```

This allows the sidebar to access theme controls without being wrapped in the provider.

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
import { themeColors } from "@cutoff/audio-ui-react";

const changeTheme = (themeColor: string) => {
  setCurrentTheme(themeColor);
  audioUiThemeState.current.setColor(themeColor);
};
```

**How it works**:

1. User selects a theme color (e.g., `themeColors.blue` which is `"var(--audioui-theme-blue)"`)
2. Sets the color directly in Audio UI context via `setColor()`
3. All components automatically pick up the new theme
4. Components compute variants automatically

**Key Points**:

- No CSS variable manipulation needed
- Just set the color value - variants are computed automatically
- Works with any CSS color value (not just predefined themes)

### Roundness Control

The sidebar also provides a slider and input for adjusting global roundness:

```typescript
const changeRoundness = (value: number) => {
  setRoundnessValue(value);
  audioUiThemeState.current.setRoundness(value);
};
```

This updates the Audio UI context, which all components inherit.

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

Component demo pages (e.g., `app/controls/knob/page.tsx`) include a color picker for testing:

```tsx
const [color, setColor] = useState<string | undefined>(undefined);

<ColorPickerField value={color} onChange={setColor} label="Color" />;
```

**Behavior**:

- `undefined`: Component uses theme context (or adaptive default if no theme set)
- String value: Component uses explicit color prop

This allows testing both theme-based and explicit color usage.

### Example Usage

```tsx
// Uses theme (when color is undefined)
<Knob value={50} label="Volume" color={color} />

// Uses explicit color (when color is set)
<Knob value={50} label="Volume" color="#FF3366" />
```

## Theme Variable Flow

### Initialization

1. App loads with no initial theme color (uses adaptive default)
2. AudioUiProvider initializes with `initialColor={undefined}`
3. Components resolve to adaptive default via CSS variable: `"var(--audioui-adaptive-default-color)"`
4. Browser resolves to appropriate color based on `.dark` class

### Theme Switching

1. User selects theme in sidebar (e.g., `themeColors.blue`)
2. `changeTheme()` calls `setColor(themeColors.blue)` (which is `"var(--audioui-theme-blue)"`)
3. Audio UI context updated
4. All components re-render with new theme
5. Components compute variants automatically

### Component Resolution

For a component like `<Knob color={color} />`:

1. If `color` prop provided → use it
2. Else if Audio UI context has color → use context
3. Else if component default → use `undefined`
4. Else → use `"var(--audioui-adaptive-default-color)"` (CSS variable)

When using CSS variable:

- Resolves to current theme variable (e.g., `--audioui-theme-blue`)
- Which has light/dark mode variants in CSS
- Components compute their own variants from the primary color

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

The library's `AudioUiProvider` automatically tracks mode changes:

- Single shared `MutationObserver` watches for `.dark` class changes
- Single shared `MediaQueryList` listener watches system preferences
- All components react to mode changes via context
- No per-component observers (performance optimization)

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

1. Check Audio UI context is updating:

   ```typescript
   const { color } = useAudioUiTheme();
   console.log(color);
   ```

2. Verify components use `useThemableProps` correctly

3. Check that `ThemeConnector` is syncing state properly

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
