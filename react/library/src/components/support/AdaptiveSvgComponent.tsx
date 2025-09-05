"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { Base } from "../types";

/**
 * Props for the AdaptiveSvgComponent
 * Extends Base to include common properties like className, style, and event handlers
 */
export type AdaptiveSvgComponentProps = Base & {
    /** Whether the component should stretch to fill its container while maintaining aspect ratio
     * @default false */
    stretch?: boolean;
    /** SVG content to render within the component */
    children: React.ReactNode;
    /** Desired width when not stretching
     * @default 100 */
    preferredWidth?: number;
    /** Desired height when not stretching (used as a hint; actual height derives from aspect-ratio)
     * @default 100 */
    preferredHeight?: number;
    /** Minimum width the component will maintain, even when container is smaller
     * @default 40 */
    minWidth?: number;
    /** Minimum height the component will maintain, even when container is smaller
     * @default 40 */
    minHeight?: number;
    /** Width of the SVG viewport coordinate system
     * @default 100 */
    viewBoxWidth?: number;
    /** Height of the SVG viewport coordinate system
     * @default 100 */
    viewBoxHeight?: number;
    /** Handler for wheel events. When provided, wheel events are prevented from propagating
     * and their default behavior is prevented */
    onWheel?: (e: WheelEvent) => void;
    /** Override event handlers with more specific SVGSVGElement type */
    onClick?: React.MouseEventHandler<SVGSVGElement>;
    onMouseDown?: React.MouseEventHandler<SVGSVGElement>;
    onMouseUp?: React.MouseEventHandler<SVGSVGElement>;
    onMouseEnter?: React.MouseEventHandler<SVGSVGElement>;
    onMouseLeave?: React.MouseEventHandler<SVGSVGElement>;
};

/**
 * AdaptiveSvgComponent serves as the foundation for audio control components, providing consistent
 * sizing, aspect ratio maintenance, and event handling.
 *
 * Now uses pure CSS for sizing:
 * - The outer container declares aspect-ratio and min/max constraints
 * - In stretch mode it fills its grid cell
 * - The inner SVG scales to 100% of the container with preserveAspectRatio="xMidYMid meet"
 */
function AdaptiveSvgComponent({
    stretch = false,
    className = "",
    style = {},
    children,
    preferredWidth = 100,
    preferredHeight: _preferredHeight = 100,
    minWidth = 40,
    minHeight = 40,
    viewBoxWidth = 100,
    viewBoxHeight = 100,
    onWheel,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
}: AdaptiveSvgComponentProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    // Handle wheel events
    useEffect(() => {
        if (!svgRef.current) return;

        const element = svgRef.current;
        const wheelHandler = (e: WheelEvent) => {
            // Only call the user's handler if it's defined
            if (onWheel) {
                onWheel(e);
            }

            // Only prevent default and stop propagation if the event hasn't been prevented by the user's handler
            if (!e.defaultPrevented) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        element.addEventListener("wheel", wheelHandler, { passive: false });
        return () => element.removeEventListener("wheel", wheelHandler);
    }, [onWheel]);

    // Styles to ensure proper grid cell containment and CSS-driven sizing
    const containerStyle = useMemo<React.CSSProperties>(() => {
        // Extract alignment-related props and map them to inner flex alignment so the demo grid works
        const { alignSelf, justifySelf, ...restStyle } = style;

        // Map alignSelf/justifySelf keywords to flex alignment for the inner SVG box
        const toFlexAlign = (v: unknown) => (v === "start" ? "flex-start" : v === "end" ? "flex-end" : v === "center" ? "center" : undefined);
        const alignItems = toFlexAlign(alignSelf) ?? "center";
        const justifyContent = toFlexAlign(justifySelf) ?? "center";

        const baseStyles: React.CSSProperties = {
            position: "relative",
            overflow: "hidden",
            display: stretch ? "flex" : "inline-flex",
            alignItems,
            justifyContent,
            // @ts-ignore - TS doesn't yet know containerType inline style in React types
            containerType: "inline-size",
            ...restStyle,
        };

        if (stretch) {
            // Fill grid cell but keep inner SVG box alignable via flex (SVG won't forcibly take full height)
            return {
                ...baseStyles,
                width: "100%",
                height: "100%",
                maxWidth: "100%",
                maxHeight: "100%",
                minWidth,
                minHeight,
            };
        }

        // Fixed mode: enforce preferred width in pixels (respecting minWidth) so the Size demo works
        const widthPx = Math.max(preferredWidth, minWidth);
        return {
            ...baseStyles,
            width: `${widthPx}px`,
            // Maintain aspect ratio so height is derived from width
            aspectRatio: `${viewBoxWidth} / ${viewBoxHeight}`,
            minWidth,
            minHeight,
            maxWidth: "100%",
            maxHeight: "100%",
        };
    }, [style, stretch, minWidth, minHeight, preferredWidth]);

    const svgStyle = useMemo<React.CSSProperties>(
        () => (
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
                  }
        ),
        [stretch, viewBoxWidth, viewBoxHeight]
    );

    return (
        <div style={containerStyle} className={className}>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
                preserveAspectRatio="xMidYMid meet"
                style={svgStyle}
                onClick={onClick}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                {children}
            </svg>
        </div>
    );
}

// Custom comparison function for React.memo to prevent unnecessary re-renders
function arePropsEqual(prevProps: AdaptiveSvgComponentProps, nextProps: AdaptiveSvgComponentProps) {
    const { style: prevStyle, children: prevChildren, ...prevRest } = prevProps;
    const { style: nextStyle, children: nextChildren, ...nextRest } = nextProps;

    // Compare primitive props
    for (const key in prevRest) {
        if (prevRest[key as keyof typeof prevRest] !== nextRest[key as keyof typeof nextRest]) {
            return false;
        }
    }

    // Compare style objects
    if (JSON.stringify(prevStyle) !== JSON.stringify(nextStyle)) {
        return false;
    }

    // Always check for changes in children to ensure re-renders when content changes
    return prevChildren === nextChildren;
}

export default React.memo(AdaptiveSvgComponent, arePropsEqual);
