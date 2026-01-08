<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

# Text and Icon Rendering Strategy

**How center content (text, icons, images) is rendered in controls**

This document explains the architectural approach for rendering text, icons, and other content inside knobs and controls, with full Safari/WebKit compatibility.

## Target Browsers

Safari and Tauri (which uses WKWebView on macOS) are first-class citizens. This library must work correctly in:

- **Chromium** (Chrome, Edge, Brave, etc.)
- **Firefox**
- **Safari** (macOS, iOS)
- **Tauri** (uses WKWebView on macOS, WebView2 on Windows)

## The Problem: foreignObject in Safari

Safari/WebKit has long-standing bugs with SVG `<foreignObject>` rendering when the SVG is embedded in complex CSS layout contexts. The HTML content inside foreignObject can render at incorrect positions or scales.

**Affected CSS contexts:**

- Container queries (`container-type: size`)
- Aspect-ratio boxes (`aspect-ratio`)
- CSS grid layouts
- Combinations of the above (as used in `AdaptiveBox`)

**Symptoms:**

- Text/content pinned toward the SVG's top-left
- Incorrect scaling relative to the viewBox
- Content appearing fine in simple contexts but broken in complex layouts

See also: [WebKit `foreignObject` Rendering Issues](./webkit-foreignobject-issues.md)

## The Solution: HTML Overlay Outside SVG

Instead of embedding HTML inside the SVG via `<foreignObject>`, we render HTML content as a **sibling element** in the same CSS Grid cell as the SVG. This completely avoids the foreignObject bugs.

### Architecture

```
┌─────────────────────────────────┐
│ AdaptiveBox                     │
│  ┌───────────────────────────┐  │
│  │ Aspect Scaler (CSS Grid)  │  │
│  │  ┌─────────────────────┐  │  │
│  │  │ AdaptiveBox.Svg     │  │  │  ← Grid Row 1
│  │  │   <svg>             │  │  │
│  │  └─────────────────────┘  │  │
│  │  ┌─────────────────────┐  │  │
│  │  │ AdaptiveBox.Html-   │  │  │  ← Same Grid Row (stacks on top)
│  │  │ Overlay             │  │  │
│  │  │ (text, icons)       │  │  │
│  │  │ pointer-events:none │  │  │
│  │  │ containerType:size  │  │  │
│  │  └─────────────────────┘  │  │
│  │  ┌─────────────────────┐  │  │
│  │  │ AdaptiveBox.Label   │  │  │  ← Grid Row 2
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### How It Works

1. `AdaptiveBox` manages a CSS Grid layout with rows for main content and optional label
2. `AdaptiveBox.Svg` and `AdaptiveBox.HtmlOverlay` are **sibling components** that occupy the same grid cell
3. CSS Grid naturally stacks elements in DOM order — `HtmlOverlay` renders after `Svg`, appearing on top
4. The overlay has `pointer-events: none` so interactions pass through to the SVG
5. The overlay provides `containerType: "size"` for container query units (`cqmin`)

### Key Implementation Details

#### Container Query Units for Scaling

Text and icons use `cqmin` (container query minimum) units to scale with the component size:

```tsx
// Text sizing in Knob and CycleButton
fontSize: "22cqmin"; // Scales with container

// Icon sizing in CycleButton
width: "50cqmin";
height: "50cqmin";
```

The `cqmin` unit requires a container query context, which is why `AdaptiveBox.HtmlOverlay` has `containerType: "size"`.

#### Icon Wrapper CSS Class

SVG icons need explicit sizing to render correctly. The `.audioui-icon-wrapper` CSS class ensures icons fill their container:

```css
/* In styles.css */
.audioui-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.audioui-icon-wrapper svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
  color: inherit;
}
```

## Usage

### Built-in Controls (Knob, CycleButton, Slider)

For built-in controls, pass content as `children`:

```tsx
// Text content
<Knob value={value} onChange={setValue}>
    <div style={{ fontSize: "22cqmin", fontWeight: 500 }}>
        {formattedValue}
    </div>
</Knob>

// Icon content (CycleButton)
<CycleButton options={waveOptions}>
    {waveOptions.map((opt, i) => (
        <WaveIcon key={i} type={opt.value} />
    ))}
</CycleButton>
```

### Custom Controls with ContinuousControl

For custom controls using `ContinuousControl`, the same pattern applies:

```tsx
<ContinuousControl view={MyCustomKnob} value={value} onChange={setValue}>
  <div className="text-lg font-bold">{value}</div>
  <div className="text-xs opacity-60">dB</div>
</ContinuousControl>
```

The `children` are automatically rendered via `AdaptiveBox.HtmlOverlay` as a sibling to `AdaptiveBox.Svg`.

## SVG View Components

With this architecture, SVG view components (like `KnobView`) only render SVG graphics:

```tsx
function KnobView({ normalizedValue, color, ... }) {
    return (
        <g>
            <ValueRing ... />
            {/* No center content here - it's rendered via overlay */}
        </g>
    );
}
```

## Primitives for Custom Controls

For fully custom controls, the primitive set focuses on SVG geometry (`ValueRing`, `TickRing`, `LabelRing`, etc.) plus an optional HTML overlay (`RadialHtmlOverlay`).

Text rendering inside SVG via `<text>` is intentionally avoided.

### RadialHtmlOverlay (foreignObject)

⚠️ **Safari Limitation**: This primitive uses `<foreignObject>` which has rendering bugs in Safari/WebKit when the SVG is inside complex CSS layouts.

Use only when:

- You control the embedding context and know it works in Safari
- Safari compatibility is not required
- You need foreignObject for a specific reason

```tsx
<RadialHtmlOverlay cx={50} cy={50} radius={30}>
  <div className="text-center">
    <div className="text-xl font-bold">42.0</div>
    <div className="text-xs text-muted">dB</div>
  </div>
</RadialHtmlOverlay>
```

## Alternative Approaches Considered

### 1. Browser Detection with Hybrid Component

**Approach:** Detect browser at runtime and switch between two rendering implementations.

**Problems:**

- Unit inconsistency between SVG viewBox units and HTML pixel units
- Browser detection timing causes visual flash on initial render
- Increased complexity with two code paths to maintain
- Safari detection can be unreliable

**Decision:** Rejected in favor of the overlay approach.

### 2. Fixing foreignObject in AdaptiveBox

**Approach:** Modify AdaptiveBox CSS to avoid triggering the Safari bug.

**Investigation:** The bug is triggered by the combination of `containerType: "size"`, `aspectRatio`, and grid layout. Removing any of these would break the responsive sizing behavior.

**Decision:** Not feasible without sacrificing core functionality.

### 3. HTML Overlay Outside SVG (Current Solution)

**Approach:** Render HTML content as a sibling element, completely outside the SVG DOM.

**Advantages:**

- Works identically in all browsers
- No browser detection needed
- Clean separation between SVG graphics and HTML content
- Full CSS/HTML capabilities for content styling

**Tradeoffs:**

- Requires container query context for responsive sizing
- Content must be passed through the component hierarchy
- SVG view components can't render their own center content

**Decision:** Adopted as the standard approach.

## Summary

| Approach                                      | Safari Safe | Recommended For          |
| --------------------------------------------- | ----------- | ------------------------ |
| `children` prop on `Knob`/`ContinuousControl` | ✅ Yes      | All use cases            |
| `RadialHtmlOverlay`                           | ⚠️ Limited  | Known-safe contexts only |
