"use client";

import React, { useMemo } from "react";
import { Base } from "../types";
import { createPropComparator } from "../../utils";

/**
 * Props for the AdaptiveContainer component.
 * Extends Base to include common properties like className and style.
 * This component serves as a foundational layout container for audio UI components.
 */
export type AdaptiveContainerProps = Base & {
    /**
     * Whether the component should stretch to fill its container.
     * - When true, it fills the parent area but stays usable: respects minWidth/minHeight,
     *   keeps content aligned with flex (center/start/end), works nicely with aspect-ratio,
     *   and enables size-aware typography via container queries.
     * - When false, it uses a predictable fixed pixel width (preferredWidth) while keeping
     *   the given aspect ratio.
     * @default false
     */
    stretch?: boolean;

    /**
     * Content to render within the container. Can be any React node,
     * typically SVG-based components like SvgSurface.
     */
    children: React.ReactNode;

    /**
     * Desired width in pixels when in fixed mode (stretch=false).
     * Will be respected unless it would be smaller than minWidth.
     * @default 100
     */
    preferredWidth?: number;

    /**
     * Minimum width the component will maintain, even when container is smaller.
     * Ensures controls remain usable regardless of container size.
     * @default 40
     */
    minWidth?: number;

    /**
     * Minimum height the component will maintain, even when container is smaller.
     * Ensures controls remain usable regardless of container size.
     * @default 40
     */
    minHeight?: number;

    /**
     * Aspect ratio of the container, determining the height relative to width.
     * Can be specified as a string "width / height" or a number (width-to-height ratio).
     * @default "1 / 1" (square aspect ratio)
     */
    aspectRatio?: `${number} / ${number}` | number;
};

/**
 * AdaptiveContainer is a small, CSS-only wrapper that helps its children size “just right”.
 *
 * Two simple modes:
 * - stretch=true: fill the parent cell, but do it safely:
 *   - respects minWidth/minHeight so controls don’t shrink into unusable dots
 *   - keeps content aligned (center/start/end) via flexbox
 *   - works with aspect-ratio so shapes stay proportional
 *   - enables container queries (e.g., cqw units) so text/icons scale with the component itself
 * - stretch=false: use a predictable fixed pixel width (preferredWidth) and maintain the given aspect ratio.
 *
 * Why not just width: 100%; height: 100%?
 * - No minimum size floor (things can collapse)
 * - Harder to align content cleanly within a grid/flex cell
 * - No component-scoped container queries for responsive typography
 * - Easy to distort aspect ratios
 *
 * Typical usage:
 * - Wrap SVG-based audio controls or small UI widgets for consistent sizing in grid/flex layouts.
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
    // Compute dynamic container styles based on props and sizing mode
    const containerStyle = useMemo<React.CSSProperties>(() => {
        // Extract alignment-related props and map them to inner flex alignment so the demo grid works
        const { alignSelf, justifySelf, ...userStyle } = style;

        // Map grid alignment properties to flex container properties
        const alignItems = toFlexAlign(alignSelf) ?? "center";
        const justifyContent = toFlexAlign(justifySelf) ?? "center";

        // Base styles applied to both stretch and fixed modes
        const baseStyles: React.CSSProperties = {
            ...userStyle,
            position: "relative",
            overflow: "hidden",
            alignItems,
            justifyContent,
            containerType: "inline-size",
            minWidth,
            minHeight,
            maxWidth: "100%",
            maxHeight: "100%",
        };

        if (stretch) {
            // Stretch mode: Fill grid cell but keep inner content alignable via flex
            return {
                ...baseStyles,
                display: "flex",
                width: "100%",
                height: "100%",
            };
        } else {
            return {
                ...baseStyles,
                display: "inline-flex",
                width: `${preferredWidth}px`,
                // Maintain aspect ratio so height is derived from width
                aspectRatio: typeof aspectRatio === "number" ? `${aspectRatio} / 1` : aspectRatio,
            };
        }
    }, [style, stretch, minWidth, minHeight, preferredWidth, aspectRatio]);

    // Render a div with the computed styles containing the children
    return (
        <div style={containerStyle} className={className}>
            {children}
        </div>
    );
}

// Helper function to map grid alignment values to flex alignment values
// Transforms 'start', 'end', 'center' to 'flex-start', 'flex-end', 'center'
// prettier-ignore
const toFlexAlign = (v: unknown) =>
    v === "start"
        ? "flex-start"
        : v === "end"
            ? "flex-end"
            : v === "center"
                ? "center"
                : undefined;

// Create a prop comparator specifically for AdaptiveContainer
// This ensures style objects are deeply compared and children are always checked for reference equality
const compareAdaptiveContainerProps = createPropComparator<AdaptiveContainerProps>({
    deepCompareProps: ["style"],
    alwaysCompareProps: ["children"],
});

// Export a memoized version of the component for better performance
export default React.memo(AdaptiveContainer, compareAdaptiveContainerProps);
