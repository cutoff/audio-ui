<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

# AdaptiveBox Layout Specification

This document specifies the pure layout model used by AdaptiveBox. It focuses on the atomic unit composed of an SVG drawing area plus an optional label, and the CSS technique that achieves contain-style scaling with optional alignment controls.

Compatibility: React 18+ (library peer dependency)

Key points

- AdaptiveBox is the current layout component for SVG-based controls with labels.
- Layout and sizing are driven by CSS/SVG only (no ResizeObserver or JS layout math).
- The inner unit (SVG + label) can either scale to fit (contain) or fill the wrapper.
- Alignment of the scalable unit within its wrapper and the label’s own horizontal alignment are independent.

Glossary and Roles

- External Container (out of scope to modify): Fixed or grid cell-sized region that hosts the component.
- Wrapper (aka “Control+Label Wrapper”): A 100% width/height box that acts as a size container, exposing container query units cqw/cqh to descendants.
- Aspect Scaler: Inner box preserving the combined aspect ratio of [SVG drawing area + label strip] and scaling to the maximum size that fits within the wrapper (contain behavior). Internally uses a two‑row grid for SVG and label.
- SVG (Main Component): The vector graphic. In scaleToFit mode, it preserves its viewBox aspect via preserveAspectRatio="xMidYMid meet"; in fill mode it intentionally stretches using preserveAspectRatio="none".
- Overlay: Absolutely positioned HTML content that covers the same area as the SVG and appears above it.
- Label: Single-line text occupying the second grid row. It’s horizontally justified (start/center/end) within its row.

DOM Structure (simplified)

```jsx
<div data-name="External Container">
  {" "}
  // fixed size; not changed here
  <div data-name="Control+Label Wrapper" style={{ width: "100%", height: "100%", containerType: "size" }}>
    <div
      data-name="Aspect Scaler"
      style={{ position: "relative" }} // enables absolute positioning for overlay
    >
      <svg data-name="Main Component" />
      <div data-name="Overlay">42</div> // positioned over SVG
      <div data-name="Label" style={{ containerType: "size" }}>
        <span style={{ fontSize: "75cqh" }}>Label</span>
      </div>
    </div>
  </div>
</div>
```

Parameters

- svgViewBoxWidth (W): Width of the SVG viewBox.
- svgViewBoxHeight (H): Height of the SVG viewBox.
- LABEL_HEIGHT_UNITS (L): Absolute height reserved for the label row in the same units as the SVG viewBox height. In the demo: L = 15.

These define

- Combined unit aspect ratio: W : (H + L)
- Internal grid row proportions: Hfr for the SVG row and Lfr for the label row.

Label Modes

- visible (default) — Two-row grid (SVG + label). Aspect: W / (H + L). Label is rendered and horizontally justified via justify-content in its row.
- hidden — Same two-row grid (space reserved), same aspect W / (H + L). Label element is present but not visible (e.g., visibility: hidden).
- none — Single-row grid (only SVG). Aspect: W / H. No label element is rendered.

Label position (above/below) applies only in visible/hidden modes.

Sizing and Layout Algorithm

1. Wrapper setup

- Wrapper stretches to fill its parent area.
- Sets container-type: size, exposing cqw/cqh units to descendants (100cqw equals wrapper width, 100cqh equals wrapper height).

2. Aspect-preserving scaling (contain)

- Aspect Scaler declares the unit aspect ratio: aspect-ratio: W / (H + L)
- Width is the min that fits both axes: width: min(100%, calc(100cqh \* W / (H + L)))
- Height: auto to derive from the aspect ratio
- Result: The scaler becomes as large as possible while fully contained in the wrapper, letterboxing the non‑limiting axis.

3. Internal layout (SVG + Label)

- The scaler is a grid with two rows proportional to H and L when label space is shown.
- Label below (default): grid-template-rows: H_percent% L_percent%; SVG in row 1 / 2; Label in row 2 / 3.
- Label above: grid-template-rows: L_percent% H_percent%; Label in row 1 / 2; SVG in row 2 / 3.
- SVG cell: width/height 100%, display: block; preserveAspectRatio="xMidYMid meet" in scaleToFit, "none" in fill.
- Label cell: width/height 100%, display: flex; align-items: center; justify-content: start|center|end. The label cell is a size container (container-type: size) so the text can use cqh.

4. Overlay positioning

- Scaler sets position: relative.
- Overlay is absolutely positioned to overlay the SVG area: position: absolute; top: 0; left: 0; width: 100%; height: 100%;
- Overlay uses the same grid row as the SVG (grid-row: 1 / 2 or 2 / 3 depending on label position), a higher z-index, and pointer-events: none.

5. Alignment controls

- To position the scaler inside the wrapper when it does not fill the full area (letterboxing): set align-self and justify-self on the scaler to start|center|end.
- To align the label within its own row: set justify-content on the label container (start|center|end).
- Precedence when using the React API: `<AdaptiveBox.Svg>` props hAlign/vAlign override scaler alignment; otherwise the wrapper’s style.justifySelf/style.alignSelf are mapped to the scaler; default is center/center.

Reference Styles (essential parts)

```css
/* Wrapper: provides cqw/cqh and fills the external container */
.wrapper {
  width: 100%;
  height: 100%;
  container-type: size; /* enables 100cqw / 100cqh inside */
  display: grid; /* grid is convenient for self-alignment */
}

/* Aspect Scaler: scales to contain while preserving aspect */
/* Example with W=100, H=100, L=15 -> 87% 13% */
.aspect-scaler {
  aspect-ratio: 100 / 115;
  width: min(100%, calc(100cqh * 100 / 115));
  height: auto;
  display: grid;
  grid-template-rows: 86.95% 13.05%;
  justify-items: center;
  align-items: center;
  /* Allow shrinking below content min-size to prevent overflow */
  min-width: 0;
  min-height: 0;
  container-type: inline-size; /* not strictly necessary, but harmless */
  position: relative; /* enables absolute positioning for overlay */
  /* Position within the wrapper (change as needed): */
  justify-self: center; /* start|center|end */
  align-self: center; /* start|center|end */
}

/* SVG fills the first row (the drawing keeps its intrinsic proportions) */
.aspect-scaler > svg {
  display: block;
  width: 100%;
  height: 100%;
  grid-row: 1 / 2;
}

/* Label occupies the bottom row; it is a flex container for alignment */
.aspect-scaler > .label {
  grid-row: 2 / 3;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center; /* start|center|end */
  container-type: size; /* Provides cqh for font scaling */
}

/* The text itself scales with the label container height */
.aspect-scaler > .label > span {
  font-size: 75cqh; /* e.g., 75% of the label container height */
}
```

Notes

- Standard CSS only; Tailwind utilities are not assumed.
- Label font size uses a nested container query: the label cell is container-type: size; the inner text uses font-size: 75cqh so font scales with the label cell’s height.
- The wrapper remains a size query container and spans 100% width/height.

Behavioral Guarantees

- No overflow in either mode: the unit never exceeds wrapper bounds.
- scaleToFit mode: contain-fit scaling with letterboxing on the non‑limiting axis; overall unit preserves W : (H + L); the SVG drawing preserves W : H (meet, centered).
- fill mode: the unit fills the wrapper (width/height 100%); vertical proportions between SVG and label rows match scaleToFit; the SVG drawing may distort (preserveAspectRatio: none).
- Independent alignment: scaler alignment within the wrapper and label justification are independent (wrapper alignment is typically neutral in fill mode).

Porting Checklist

- Ensure the wrapper spans the available area and has container-type: size.
- Provide W, H, and L for your SVG + label arrangement.
- Apply the scaler rules with aspect-ratio, width: min(100%, calc(100cqh \* ...)), and two-row grid.
- Render SVG in the first row with preserveAspectRatio="xMidYMid meet" and width/height: 100% (or preserveAspectRatio: none in fill mode).
- Render the label in the second row and set its horizontal alignment as desired.

Example Values (as used in the demo)

- W = 100, H = 100 (square) or H = 400 (vertical) or W = 400, H = 100 (horizontal)
- L = 15
- Aspect ratio becomes:
  - Square: 100 / (100 + 15)
  - Vertical: 100 / (400 + 15)
  - Horizontal: 400 / (100 + 15)

Mapping to the React API

- `<AdaptiveBox>` props
  - displayMode: "scaleToFit" | "fill"
  - labelMode: "visible" | "hidden" | "none"
  - labelHeightUnits: number (L), default 15
  - minWidth, minHeight: optional CSS min sizes on the wrapper
  - style.justifySelf/style.alignSelf: used as fallback alignment for the scaler when `<AdaptiveBox.Svg>` does not supply hAlign/vAlign
- `<AdaptiveBox.Svg>`
  - viewBoxWidth (W) and viewBoxHeight (H)
  - hAlign/vAlign: start|center|end, override scaler alignment
  - In fill mode, the component sets preserveAspectRatio="none"; otherwise "xMidYMid meet"
  - Wheel/mouse events are attached directly to the SVG; wheel uses a non‑passive listener and prevents default when not already prevented
- `<AdaptiveBox.Label>`
  - position: "above" | "below" (default "below")
  - align: start|center|end controls justify-content
  - labelMode none hides the label entirely and switches aspect to W/H; hidden reserves space but does not render glyphs
- Overlay
  - To add an overlay above the SVG, render a sibling element inside `<AdaptiveBox>` after `<AdaptiveBox.Svg>` with style: position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", and gridRow matching the SVG row ("1 / 2" if label is below, "2 / 3" if label is above). Use a higher z-index as needed.

Implementation Notes: Layout Shift Prevention

During initial development, two layout shift issues were identified and resolved:

**Issue 1: Label Space Reservation**

**Problem**: Components would initially render without label space (as if `labelMode="none"`), then shift when the label registered via `useLayoutEffect`, causing a visible size change.

**Root Cause**: The layout calculation checked both `labelMode !== "none"` AND whether `labelInfo` had been registered. Since registration happens in `useLayoutEffect` (after render), the initial render used incorrect dimensions.

**Solution**: Changed the space reservation logic to depend solely on `labelMode`. If `labelMode !== "none"`, space is reserved immediately regardless of whether the Label component has registered yet. This ensures correct layout from the first render.

**Key Insight**: AdaptiveBox only cares about `labelMode` for space reservation, not whether a label value exists or has been registered. The label value can be `undefined` - only the mode matters.

**Issue 2: ViewBox Dimensions and Aspect Ratio**

**Problem**: Components showed a visible zoom/shift effect during startup where proportions between the main component zone and label zone varied. Sliders (non-square aspect ratios) were particularly affected, with labels initially oversized and main components undersized.

**Root Cause**: AdaptiveBox used default 100x100 dimensions until `AdaptiveBox.Svg` registered its actual viewBox via `useLayoutEffect`. This caused incorrect aspect ratio and grid template row calculations on first render.

**Solution**: ViewBox dimensions (`viewBoxWidth` and `viewBoxHeight`) are now required props on `AdaptiveBox` itself, not on `AdaptiveBox.Svg`. This centralizes sizing concerns in AdaptiveBox (alongside `labelHeightUnits`) and ensures correct dimensions are available from the first render.

**Architectural Decision**: ViewBox dimensions are specified once at the AdaptiveBox level, similar to how `labelHeightUnits` is specified. The SVG component reads these dimensions from context. This approach:

- Eliminates prop duplication (no need to pass viewBox to both AdaptiveBox and AdaptiveBox.Svg)
- Prevents layout shift by having dimensions available synchronously
- Keeps sizing concerns centralized in AdaptiveBox
- Documents that for SVG content, viewBox maps to SVG viewBox; for future Canvas/GL content, it will map to canvas/gl dimensions

**Note**: React's render model prevents reading child values during parent render, so dimensions must be passed as props rather than derived from children. This is why viewBox dimensions are required props rather than being inferred from the SVG component.

Further Reading

- Source: packages/react/src/components/primitives/AdaptiveBox.tsx
- Demo usages: apps/playground-react/app/examples/control-surface/page.tsx and control pages (e.g., knob/slider)
