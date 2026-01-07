<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

# WebKit `foreignObject` Rendering Issues (Safari / WKWebView / Tauri)

This document describes WebKit rendering issues that affect SVG `<foreignObject>` usage in complex layout contexts, and how the library addresses them.

## Summary

- **Issue**: WebKit renders HTML content inside SVG `<foreignObject>` with incorrect positioning and/or scale when the SVG is embedded in complex CSS layouts.
- **Affected Contexts**: CSS container queries (`container-type: size`), aspect-ratio boxes, CSS grid layouts.
- **Impact**: Center text for knobs can appear pinned toward the SVG's top-left, with inconsistent sizing.
- **Constraint**: Tauri on macOS uses WKWebView, so WebKit behavior impacts desktop apps, not only Safari.
- **Solution**: Render HTML content **outside the SVG** as an absolutely positioned overlay, avoiding `<foreignObject>` entirely.

## Browser Support Status

Safari and Tauri are first-class citizens for this library. The solution must work correctly in:

| Browser         | Engine         | Status                                     |
| --------------- | -------------- | ------------------------------------------ |
| Chrome          | Chromium/Blink | ✅ Works with foreignObject                |
| Firefox         | Gecko          | ✅ Works with foreignObject                |
| Safari          | WebKit         | ⚠️ foreignObject issues in complex layouts |
| Tauri (macOS)   | WKWebView      | ⚠️ Same issues as Safari                   |
| Tauri (Windows) | WebView2       | ✅ Works with foreignObject                |

## Symptoms

When a control view uses `<foreignObject>` for center text inside an SVG that's embedded in a complex CSS layout:

- **Chromium / Firefox**: Text layout and scale appear correct.
- **Safari / WKWebView**: Text content can render:
  - **Offset** toward the SVG's top-left
  - **Scaled** incorrectly relative to the viewBox
  - **Inconsistent** between different embedding contexts

### Reproduction

The same `<foreignObject>` content renders correctly in:

- A plain `<svg>` element
- A simple carousel preview (as in `ComponentCarousel.tsx`)

But breaks when the SVG is inside:

- `AdaptiveBox` (which uses container queries for responsive sizing)
- Any element with `container-type: size` + `aspect-ratio`

## Root Cause

The issue is not `<foreignObject>` itself, but WebKit's interaction between `<foreignObject>` and certain CSS properties on ancestor elements:

- `container-type: size` (container queries)
- `aspect-ratio` combined with grid layouts
- Complex nested layout contexts

The exact mechanism is unclear, but it appears to be a WebKit bug in how foreignObject content coordinates are calculated when the SVG's intrinsic size is determined by CSS container queries.

## Solution: HTML Overlay Outside SVG

Instead of using `<foreignObject>` inside the SVG, the library renders HTML content as a **sibling element** in the same CSS Grid cell:

```tsx
// AdaptiveBox with Svg and HtmlOverlay siblings
<AdaptiveBox>
  <AdaptiveBox.Svg viewBoxWidth={100} viewBoxHeight={100}>
    {/* SVG graphics only */}
  </AdaptiveBox.Svg>
  <AdaptiveBox.HtmlOverlay>{/* HTML content here - completely outside SVG */}</AdaptiveBox.HtmlOverlay>
</AdaptiveBox>
```

Both `AdaptiveBox.Svg` and `AdaptiveBox.HtmlOverlay` occupy the same grid cell. CSS Grid naturally stacks elements in DOM order, so the overlay appears on top of the SVG.

This approach:

- Avoids `<foreignObject>` entirely
- Works identically in all browsers
- Maintains proper layering (HTML appears on top of SVG via DOM order)
- Preserves interactivity (`pointer-events: none` on overlay by default)
- Enables container query units (`cqmin`) for responsive sizing

## Implementation Details

### Container Query Context

`AdaptiveBox.HtmlOverlay` has `containerType: "size"` to enable container query units (`cqmin`, `cqmax`, `cqw`, `cqh`) in the overlay content. This allows text and icons to scale proportionally with the component size.

```css
/* Text sizing */
font-size: 22cqmin;

/* Icon sizing */
width: 50cqmin;
height: 50cqmin;
```

### Icon Wrapper CSS

SVG icons need explicit sizing to render correctly across browsers. The `.audioui-icon-wrapper` class ensures icons fill their container:

```css
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

### Component Architecture

1. **`AdaptiveBox.Svg`**: Renders SVG graphics in the main content grid cell
2. **`AdaptiveBox.HtmlOverlay`**: Renders HTML content in the same grid cell (stacks on top)
3. **`ContinuousControl`**: Renders `children` via `AdaptiveBox.HtmlOverlay` as a sibling to `AdaptiveBox.Svg`
4. **`Knob`/`KnobSwitch`**: Accept `children` for custom content
5. **View components** (`SvgKnob`, etc.): Render only SVG graphics, no center content

## Usage

### Built-in Controls

Pass center content as `children`:

```tsx
<Knob value={value} onChange={setValue}>
  <div style={{ fontSize: "22cqmin" }}>{formattedValue}</div>
</Knob>
```

### Custom Controls

When building custom controls with `ContinuousControl`:

```tsx
<ContinuousControl view={MyCustomView} value={value} onChange={setValue}>
  <div>Center content</div>
</ContinuousControl>
```

### Low-Level Primitives

For fully custom controls without `ContinuousControl`:

- **`RadialHtmlOverlay`**: Uses `<foreignObject>`, has Safari limitations

## Guidance for Component Authors

1. **Use the `children` pattern**: Pass center content to `Knob`/`ContinuousControl` as children
2. **Avoid `<foreignObject>` in view components**: Let the framework handle HTML rendering via overlay
3. **Test in Safari**: Always verify rendering in Safari/WebKit when making layout changes

## Troubleshooting

### Icons not showing in Safari

1. Ensure the overlay container has `containerType: "size"`
2. Use the `.audioui-icon-wrapper` class for icon containers
3. Verify SVG icons have `fill="currentColor"` or inherit color

### Text not scaling with component

1. Use `cqmin` units instead of `px` for font sizes
2. Ensure the container hierarchy has `containerType: "size"` set

### Content not centered

1. Check that the overlay div has `display: flex`, `alignItems: center`, `justifyContent: center`
2. Verify the content wrapper has `width: 100%` and `height: 100%`

## References

- [CSS Container Queries - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [foreignObject - MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject)
- [WebKit Bug Tracker](https://bugs.webkit.org/) (various foreignObject-related issues)
