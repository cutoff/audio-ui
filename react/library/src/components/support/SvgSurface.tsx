"use client";

import React, { useEffect, useMemo, useRef } from "react";

/**
 * Props for the SvgSurface component
 */
export type SvgSurfaceProps = {
    /** Width of the SVG viewport coordinate system
     * @default 100 */
    viewBoxWidth?: number;
    /** Height of the SVG viewport coordinate system
     * @default 100 */
    viewBoxHeight?: number;
    /** Whether the SVG should stretch to fill its container or maintain its aspect ratio
     * @default false */
    stretch?: boolean;
    /** SVG content to render */
    children: React.ReactNode;
    /** Custom CSS class name */
    className?: string;
    /** Custom inline styles to apply to the SVG */
    style?: React.CSSProperties;
    /** Handler for wheel events. When provided, wheel events are prevented from propagating
     * and their default behavior is prevented */
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
    /** Any other SVG attributes to apply to the SVG element */
    [key: string]: any;
};

/**
 * SvgSurface renders an SVG element with proper viewBox and aspect ratio handling.
 * It handles wheel and mouse events, and applies appropriate styling for the SVG element.
 *
 * This component should be used inside AdaptiveContainer for optimal layout and sizing.
 */
function SvgSurface({
    viewBoxWidth = 100,
    viewBoxHeight = 100,
    stretch = false,
    children,
    className,
    style = {},
    onWheel,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    ...otherProps
}: SvgSurfaceProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    // Handle wheel events
    useEffect(() => {
        if (!svgRef.current || !onWheel) return;

        const element = svgRef.current;
        const wheelHandler = (e: WheelEvent) => {
            // Call the user's handler
            onWheel(e);

            // Only prevent default and stop propagation if the event hasn't been prevented by the user's handler
            if (!e.defaultPrevented) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        element.addEventListener("wheel", wheelHandler, { passive: false });
        return () => element.removeEventListener("wheel", wheelHandler);
    }, [onWheel]);

    // SVG-specific styling based on stretch mode
    const svgStyle = useMemo<React.CSSProperties>(
        () =>
            stretch
                ? {
                      // In stretch mode, allow the SVG to fit inside the container and be aligned via flex
                      width: "auto",
                      height: "auto",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      display: "block",
                      // Keep the intrinsic ratio based on viewBox
                      aspectRatio: `${viewBoxWidth} / ${viewBoxHeight}`,
                  }
                : {
                      // In fixed mode, the container defines exact box; let SVG fill it fully
                      width: "100%",
                      height: "100%",
                      display: "block",
                  },
        [stretch, viewBoxWidth, viewBoxHeight]
    );

    // Combine internal style with user-provided style
    const combinedStyle = { ...svgStyle, ...style };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMidYMid meet"
            className={className}
            style={combinedStyle}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            {...otherProps}
        >
            {children}
        </svg>
    );
}

export default React.memo(SvgSurface);
