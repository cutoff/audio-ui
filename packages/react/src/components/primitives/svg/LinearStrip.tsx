/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { CSSProperties, useMemo } from "react";
import { translateSliderRoundness } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";

export type LinearStripProps = {
    /** X coordinate of the center point */
    cx: number;
    /** Y coordinate of the center point */
    cy: number;
    /** Length of the strip */
    length: number;
    /** Rotation angle in degrees (0 = vertical, 270 = horizontal) */
    rotation?: number;
    /** Width of the strip (thickness) */
    thickness: number;
    /** Corner roundness (normalized 0.0-1.0, maps to 0-20, or CSS variable string) */
    roundness?: number | string;
    /** CSS class name */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
};

/**
 * A reusable SVG primitive that renders a linear strip (rectangle) for linear controls.
 * The strip is positioned at a center point (cx, cy) and can be rotated to any angle.
 *
 * This component is designed to be used inside an <svg> element.
 *
 * @param {number} cx - X coordinate of the center point
 * @param {number} cy - Y coordinate of the center point
 * @param {number} length - Length of the strip (height of the rectangle)
 * @param {number} [rotation=0] - Rotation angle in degrees (0 = vertical, 270 = horizontal)
 * @param {number} thickness - Width of the strip (thickness of the rectangle)
 * @param {number | string} [roundness] - Corner roundness (normalized 0.0-1.0, maps to 0-20, or CSS variable string)
 * @param {string} [className] - CSS class name
 * @param {CSSProperties} [style] - Inline styles
 * @returns {JSX.Element} SVG rect element representing the linear strip
 *
 * @example
 * ```tsx
 * // Vertical strip (default)
 * <LinearStrip cx={50} cy={150} length={260} thickness={6} />
 *
 * // Horizontal strip (rotated 270 degrees)
 * <LinearStrip cx={150} cy={50} length={260} thickness={6} rotation={270} />
 * ```
 */
function LinearStrip({
    cx,
    cy,
    length,
    rotation = 0,
    thickness,
    roundness = DEFAULT_ROUNDNESS,
    className,
    style,
}: LinearStripProps) {
    // Calculate corner radius from roundness prop or CSS variable
    const cornerRadius = useMemo(() => {
        if (typeof roundness === "string") {
            // CSS variable - pass directly to SVG (browser will resolve it)
            return roundness;
        }
        // Numeric value - translate to legacy pixel range (0-20)
        const legacyRoundness = translateSliderRoundness(roundness ?? DEFAULT_ROUNDNESS);

        // If roundness is 0, use square corners
        if (legacyRoundness === 0) {
            return 0;
        }

        // Use the translated roundness value
        return legacyRoundness;
    }, [roundness]);

    // Calculate rectangle position and dimensions
    // The rectangle is centered at (cx, cy) with width=thickness and height=length
    // Then rotated around the center point
    const rectX = useMemo(() => {
        return cx - thickness / 2;
    }, [cx, thickness]);

    const rectY = useMemo(() => {
        return cy - length / 2;
    }, [cy, length]);

    // Build transform string for rotation
    const transform = useMemo(() => {
        if (rotation === 0) {
            return undefined;
        }
        return `rotate(${rotation} ${cx} ${cy})`;
    }, [rotation, cx, cy]);

    return (
        <rect
            style={{
                ...style,
                rx: cornerRadius,
                ry: cornerRadius,
            }}
            x={rectX}
            y={rectY}
            width={thickness}
            height={length}
            // Use 0 as fallback for older browsers that don't support CSS rx/ry
            // If cornerRadius is a number, we can use it directly
            rx={typeof cornerRadius === "number" ? cornerRadius : 0}
            ry={typeof cornerRadius === "number" ? cornerRadius : 0}
            transform={transform}
            className={className}
        />
    );
}

export default React.memo(LinearStrip);
