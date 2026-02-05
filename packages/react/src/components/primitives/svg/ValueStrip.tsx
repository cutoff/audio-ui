/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React, { CSSProperties, useMemo } from "react";
import { translateSliderRoundness, DEFAULT_ROUNDNESS, calculateLinearPosition } from "@cutoff/audio-ui-core";

export type ValueStripProps = {
    /** X coordinate of the center point */
    cx: number;
    /** Y coordinate of the center point */
    cy: number;
    /** Length of the strip */
    length: number;
    /** Rotation angle in degrees (0 = vertical, -90 or 270 = horizontal) */
    rotation?: number;
    /** Width of the strip (thickness) */
    thickness: number;
    /** Corner roundness (normalized 0.0-1.0, maps to 0-20, or CSS variable string) */
    roundness?: number | string;
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Whether to start fill from center (bipolar mode) */
    bipolar?: boolean;
    /** CSS class name */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
};

/**
 * A reusable SVG primitive that renders the active (foreground) portion of a linear strip.
 * Designed to work in tandem with LinearStrip (background).
 *
 * The strip is positioned at a center point (cx, cy) and can be rotated to any angle.
 * - In unipolar mode (default), it fills from the "bottom" (relative to rotation) to the current value.
 * - In bipolar mode, it fills from the center to the current value.
 *
 * This component is designed to be used inside an <svg> element.
 *
 * @param {number} cx - X coordinate of the center point
 * @param {number} cy - Y coordinate of the center point
 * @param {number} length - Length of the strip
 * @param {number} [rotation=0] - Rotation angle in degrees (0 = vertical, -90 or 270 = horizontal)
 * @param {number} thickness - Width of the strip (thickness)
 * @param {number | string} [roundness] - Corner roundness (normalized 0.0-1.0, maps to 0-20, or CSS variable string)
 * @param {number} normalizedValue - Normalized value between 0 and 1
 * @param {boolean} [bipolar=false] - Whether to start fill from center (bipolar mode)
 * @param {string} [className] - CSS class name
 * @param {CSSProperties} [style] - Inline styles
 * @returns {JSX.Element | null} SVG rect element representing the filled portion, or null if height is too small
 *
 * @example
 * ```tsx
 * // Vertical value strip (unipolar)
 * <ValueStrip cx={50} cy={150} length={260} thickness={6} normalizedValue={0.65} />
 *
 * // Horizontal value strip (bipolar)
 * <ValueStrip cx={150} cy={50} length={260} thickness={6} rotation={-90} normalizedValue={0.75} bipolar />
 * ```
 */
function ValueStrip({
    cx,
    cy,
    length,
    rotation = 0,
    thickness,
    roundness = DEFAULT_ROUNDNESS,
    normalizedValue,
    bipolar = false,
    className,
    style,
}: ValueStripProps) {
    // Calculate corner radius
    const cornerRadius = useMemo(() => {
        if (typeof roundness === "string") {
            return roundness;
        }
        const legacyRoundness = translateSliderRoundness(roundness ?? DEFAULT_ROUNDNESS);
        if (legacyRoundness === 0) return 0;
        return legacyRoundness;
    }, [roundness]);

    // Calculate dimensions of the filled rectangle in unrotated coordinate space
    // The rectangle will be rotated around (cx, cy) using the transform attribute
    // The rectangle is computed based on the cursor center position
    const rectProps = useMemo(() => {
        // Get cursor Y position (cursor is always centered horizontally at cx)
        // Note: cursor position is independent of bipolar mode - bipolar only affects rectangle drawing
        const cursorY = calculateLinearPosition(cy, length, normalizedValue);

        // Base X position (unrotated) - centered horizontally around cx
        const x = cx - thickness / 2;
        const width = thickness;

        let y, height;

        if (bipolar) {
            // Bipolar mode: rectangle extends from center (cy) to cursor center (cursorY)
            // Height is the distance from center to cursor
            height = Math.abs(cy - cursorY);
            // Y position is the minimum of center and cursor (top edge of rectangle)
            y = Math.min(cy, cursorY);
        } else {
            // Unipolar mode: rectangle extends from bottom (cy + length/2) to cursor center (cursorY)
            const bottomY = cy + length / 2;
            // Height is the distance from bottom to cursor
            height = bottomY - cursorY;
            // Y position is at cursor (top edge of rectangle)
            y = cursorY;
        }

        return { x, y, width, height };
    }, [cx, cy, length, thickness, normalizedValue, bipolar]);

    // Build rotation transform
    const transform = useMemo(() => {
        if (rotation === 0) return undefined;
        // Negate rotation to match Radial components (positive = counter-clockwise)
        return `rotate(${-rotation} ${cx} ${cy})`;
    }, [rotation, cx, cy]);

    // Optimization: Don't render if height is 0 (or very small)
    if (rectProps.height <= 0.001) {
        return null;
    }

    return (
        <rect
            style={{
                ...style,
                rx: cornerRadius,
                ry: cornerRadius,
            }}
            x={rectProps.x}
            y={rectProps.y}
            width={rectProps.width}
            height={rectProps.height}
            // Use 0 as fallback for older browsers that don't support CSS rx/ry
            rx={typeof cornerRadius === "number" ? cornerRadius : 0}
            ry={typeof cornerRadius === "number" ? cornerRadius : 0}
            transform={transform}
            className={className}
        />
    );
}

export default React.memo(ValueStrip);
