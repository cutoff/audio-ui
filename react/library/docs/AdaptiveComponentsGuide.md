# Adaptive Components Guide

## Architecture Overview

The Audio UI library has been refactored to use a three-layer architecture for better separation of concerns:

1. **AdaptiveContainer**: Handles sizing, aspect ratio, and alignment (layout)
2. **SvgSurface**: Handles SVG-specific rendering (viewBox, preserveAspectRatio, etc.)
3. **Control components**: Handle control-specific logic and rendering text/labels using SVG text and foreignObject

This separation allows for:

- Cleaner code with better separation of concerns
- More flexibility in rendering (SVG, Canvas, or other technologies)
- Consistent component design with proper separation of layout from rendering
- Better maintenance and future extensibility

## Components

### AdaptiveContainer

The `AdaptiveContainer` component is responsible for:

- Controlling the sizing and aspect ratio of a component
- Handling grid alignment and positioning
- Providing a responsive container for content

#### Props

```typescript
type AdaptiveContainerProps = Base & {
    /** Whether the component should stretch to fill its container while maintaining aspect ratio */
    stretch?: boolean;
    /** Content to render within the container */
    children: React.ReactNode;
    /** Desired width when not stretching */
    preferredWidth?: number;
    /** Minimum width the component will maintain, even when container is smaller */
    minWidth?: number;
    /** Minimum height the component will maintain, even when container is smaller */
    minHeight?: number;
    /** Aspect ratio of the container, can be a string "width / height" or a number */
    aspectRatio?: `${number} / ${number}` | number;
};
```

#### Usage

```jsx
<AdaptiveContainer
    stretch={false}
    aspectRatio="100 / 115"
    preferredWidth={100}
    minWidth={40}
    minHeight={40}
>
    {/* Content goes here */}
</AdaptiveContainer>
```

### SvgSurface

The `SvgSurface` component is responsible for:

- Rendering an SVG element with proper viewBox and preserveAspectRatio
- Handling SVG-specific events like wheel events
- Applying appropriate styling for the SVG element

#### Props

```typescript
type SvgSurfaceProps = {
    /** Width of the SVG viewport coordinate system */
    viewBoxWidth?: number;
    /** Height of the SVG viewport coordinate system */
    viewBoxHeight?: number;
    /** Whether the SVG should stretch to fill its container or maintain its aspect ratio */
    stretch?: boolean;
    /** SVG content to render */
    children: React.ReactNode;
    /** Custom CSS class name */
    className?: string;
    /** Custom inline styles to apply to the SVG */
    style?: React.CSSProperties;
    /** Handler for wheel events */
    onWheel?: (e: WheelEvent) => void;
    /** Handler for click events */
    onClick?: React.MouseEventHandler<SVGSVGElement>;
    /** Handler for mouse down events */
    onMouseDown?: React.MouseEventHandler<SVGSVGElement>;
    /** Handler for mouse up events */
    onMouseUp?: React.MouseEventHandler<SVGSVGElement>;
    /** Handler for mouse enter events */
    onMouseEnter?: React.MouseEventHandler<SVGSVGElement>;
    /** Handler for mouse leave events */
    onMouseLeave?: React.MouseEventHandler<SVGSVGElement>;
    /** Any other SVG attributes */
    [key: string]: any;
};
```

#### Usage

```jsx
<SvgSurface
    viewBoxWidth={100}
    viewBoxHeight={115}
    onWheel={handleWheel}
    onClick={handleClick}
    onMouseDown={handleMouseDown}
    onMouseUp={handleMouseUp}
    className="my-svg-class"
    style={{cursor: "pointer"}}
>
    {/* SVG content like paths, rects, etc. */}
</SvgSurface>
```

## SVG Text and ForeignObject

The components use standard SVG elements for rendering text and complex content:

### SVG Text Element

For simple labels, the SVG `<text>` element is used:

- Positioned using SVG coordinates (x, y)
- Styled with standard SVG attributes (fontSize, fontWeight, textAnchor)
- Uses CSS variable for color via the fill attribute

```jsx
<text
    style={{fill: "var(--text-color)"}}
    x="50"
    y="110"
    fontSize="18"
    fontWeight="500"
    textAnchor="middle"
>
    {label}
</text>
```

### ForeignObject for Complex Content

For more complex content like formatted values or custom children, the `<foreignObject>` element is used:

- Provides a container for HTML content within SVG
- Positioned using SVG coordinates (x, y, width, height)
- Allows full HTML/CSS styling within the SVG viewport

```jsx
<foreignObject x="20" y="22" width="60" height="60">
    <div
        style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: "500",
        }}
    >
        {formatValueFn(value)}
    </div>
</foreignObject>
```

## Putting It All Together

To create a component with proper layout and SVG rendering:

```jsx
<AdaptiveContainer
    stretch={stretch}
    aspectRatio="100 / 115"
    preferredWidth={preferredWidth}
    minWidth={40}
    minHeight={40}
>
    <SvgSurface
        viewBoxWidth={100}
        viewBoxHeight={115}
        stretch={stretch}
        onWheel={handleWheel}
        onClick={onClick}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="control-surface"
        style={{cursor: "pointer"}}
    >
        {/* SVG graphics content */}
        <path
            style={{stroke: "var(--primary-50)"}}
            fill="none"
            strokeWidth={12}
            strokeLinecap="round"
            d="M 60 20 A 40 40 0 1 1 20 60"
        />

        {/* Value display using foreignObject */}
        <foreignObject x="20" y="22" width="60" height="60">
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    fontWeight: "500",
                }}
            >
                75
            </div>
        </foreignObject>

        {/* Label using SVG text */}
        <text
            style={{fill: "var(--text-color)"}}
            x="50"
            y="110"
            fontSize="18"
            fontWeight="500"
            textAnchor="middle"
        >
            Level
        </text>
    </SvgSurface>
</AdaptiveContainer>
```

## SVG Coordinates and Positioning

SVG elements are positioned directly within the SVG coordinate system:

- For `<text>` elements, use `x` and `y` attributes to specify the position
- For `<foreignObject>`, use `x`, `y`, `width`, and `height` to specify position and dimensions
- Use `textAnchor="middle"` for centered text (similar to `text-align: center` in CSS)
- Use `dominant-baseline` attribute to control vertical alignment

## Event Handling

Event handlers for wheel and mouse events are attached directly to the SvgSurface component:

```jsx
<SvgSurface
    viewBoxWidth={100}
    viewBoxHeight={100}
    onWheel={handleWheel}
    onClick={handleClick}
    onMouseDown={handleMouseDown}
    onMouseUp={handleMouseUp}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
/>
```

The SvgSurface component automatically:

- Attaches these handlers to the SVG element
- Sets up non-passive wheel event listeners when needed
- Prevents default behavior and propagation for wheel events
