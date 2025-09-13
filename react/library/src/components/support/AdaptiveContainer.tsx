"use client";

import React, { useMemo } from "react";
import { Base } from "../types";

/**
 * Props for the AdaptiveContainer
 * Extends Base to include common properties like className, style
 */
export type AdaptiveContainerProps = Base & {
    /** Whether the component should stretch to fill its container while maintaining aspect ratio
     * @default false */
    stretch?: boolean;
    /** Content to render within the container */
    children: React.ReactNode;
    /** Desired width when not stretching
     * @default 100 */
    preferredWidth?: number;
    /** Minimum width the component will maintain, even when container is smaller
     * @default 40 */
    minWidth?: number;
    /** Minimum height the component will maintain, even when container is smaller
     * @default 40 */
    minHeight?: number;
    /** Aspect ratio of the container, can be a string "width / height" or a number
     * @default "1 / 1" */
    aspectRatio?: `${number} / ${number}` | number;
};

/**
 * AdaptiveContainer provides consistent sizing and aspect ratio maintenance for audio control components.
 *
 * Uses pure CSS for sizing:
 * - The container declares aspect-ratio and min/max constraints
 * - In stretch mode it fills its grid cell
 * - This component is agnostic to what's rendered inside (SVG, Canvas, or anything else)
 */
function AdaptiveContainer({
    stretch = false,
    className = "",
    style = {},
    children,
    preferredWidth = 100,
    minWidth = 40,
    minHeight = 40,
    aspectRatio = "1 / 1",
}: AdaptiveContainerProps) {
    // Styles to ensure proper grid cell containment and CSS-driven sizing
    const containerStyle = useMemo<React.CSSProperties>(() => {
        // Extract alignment-related props and map them to inner flex alignment so the demo grid works
        const { alignSelf, justifySelf, ...restStyle } = style;

        // Map alignSelf/justifySelf keywords to flex alignment for inner content
        const toFlexAlign = (v: unknown) =>
            v === "start" ? "flex-start" : v === "end" ? "flex-end" : v === "center" ? "center" : undefined;

        // Map from style
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
            // Fill grid cell but keep inner content alignable via flex
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

        // Fixed mode: enforce preferred width in pixels (respecting minWidth)
        const widthPx = Math.max(preferredWidth, minWidth);
        return {
            ...baseStyles,
            width: `${widthPx}px`,
            // Maintain aspect ratio so height is derived from width
            aspectRatio: typeof aspectRatio === "number" ? `${aspectRatio} / 1` : aspectRatio,
            minWidth,
            minHeight,
            maxWidth: "100%",
            maxHeight: "100%",
        };
    }, [style, stretch, minWidth, minHeight, preferredWidth, aspectRatio]);

    return (
        <div style={containerStyle} className={className}>
            {children}
        </div>
    );
}

// Custom comparison function for React.memo to prevent unnecessary re-renders
function arePropsEqual(prevProps: AdaptiveContainerProps, nextProps: AdaptiveContainerProps) {
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

export default React.memo(AdaptiveContainer, arePropsEqual);
