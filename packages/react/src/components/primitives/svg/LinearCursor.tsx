/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React, { CSSProperties, useMemo } from "react";
import { translateSliderRoundness, DEFAULT_ROUNDNESS, calculateLinearPosition } from "@cutoff/audio-ui-core";

export type LinearCursorProps = {
    /** X coordinate of the center point of the strip */
    cx: number;
    /** Y coordinate of the center point of the strip */
    cy: number;
    /** Length of the strip */
    length: number;
    /** Rotation angle in degrees (0 = vertical, -90 or 270 = horizontal) */
    rotation?: number;
    /** Normalized value between 0 and 1, driving the cursor position */
    normalizedValue: number;
    /** Width of the cursor (x axis) */
    width: number;
    /** Aspect ratio of the cursor (numeric value, e.g., 1 = 1:1, 1.5 = 1.5:1). Height = width / aspectRatio. Ignored when imageHref is provided. */
    aspectRatio: number;
    /** Optional image URL to display as cursor. When provided, roundness and aspectRatio are ignored (image preserves its natural aspect ratio). */
    imageHref?: string;
    /** Optional dark mode image URL for the cursor (used when dark mode is active) */
    imageDarkHref?: string;
    /** Corner roundness (normalized 0.0-1.0, maps to 0-20, or CSS variable string). 1.0 = ellipse/circle, 0.0-1.0 (excl.) = rounded rectangle. Ignored when imageHref is provided. */
    roundness?: number | string;
    /** CSS class name */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
};

/**
 * A reusable SVG primitive that renders a cursor that slides along a linear strip.
 * The cursor position is driven by a normalized value (0.0 to 1.0).
 *
 * The cursor slides along a virtual bar centered at (cx, cy) with a defined length.
 * - normalizedValue 0.0: cursor at the bottom of the virtual bar
 * - normalizedValue 1.0: cursor at the top of the virtual bar
 *
 * The rotation prop represents the rotation of the virtual bar (not the cursor itself).
 * The cursor rotates around the strip center (cx, cy) along with the bar.
 *
 * The cursor can be rendered as:
 * - An image (via imageHref)
 * - An SVG shape (rectangle or ellipse based on roundness)
 *
 * Supports optional dark mode images via imageDarkHref. When provided, CSS automatically
 * switches between light and dark cursor images based on the .dark class or prefers-color-scheme.
 *
 * This component is designed to be used inside an <svg> element.
 *
 * @param {number} cx - X coordinate of the center point of the strip
 * @param {number} cy - Y coordinate of the center point of the strip
 * @param {number} length - Length of the strip
 * @param {number} [rotation=0] - Rotation angle in degrees of the virtual bar (0 = vertical, -90 or 270 = horizontal)
 * @param {number} normalizedValue - Normalized value between 0 and 1, driving the cursor position
 * @param {number} width - Width of the cursor (x axis)
 * @param {number} aspectRatio - Aspect ratio of the cursor (numeric value, e.g., 1 = 1:1, 1.5 = 1.5:1). Height = width / aspectRatio. Ignored when imageHref is provided.
 * @param {string} [imageHref] - Optional image URL to display as cursor. When provided, roundness and aspectRatio are ignored (image preserves its natural aspect ratio).
 * @param {string} [imageDarkHref] - Optional dark mode image URL for the cursor
 * @param {number | string} [roundness] - Corner roundness (normalized 0.0-1.0, maps to 0-20, or CSS variable string). 1.0 = ellipse/circle. Ignored when imageHref is provided.
 * @param {string} [className] - CSS class name
 * @param {CSSProperties} [style] - Inline styles
 * @returns {JSX.Element} SVG element representing the cursor
 *
 * @example
 * ```tsx
 * // Vertical cursor (rectangle)
 * <LinearCursor cx={50} cy={150} length={260} normalizedValue={0.65} width={6} aspectRatio={1} />
 *
 * // Horizontal cursor (ellipse)
 * <LinearCursor cx={150} cy={50} length={260} rotation={-90} normalizedValue={0.75} width={8} aspectRatio={1} roundness={1} />
 *
 * // Image-based cursor (aspectRatio and roundness ignored, image preserves natural aspect ratio)
 * <LinearCursor cx={50} cy={150} length={260} normalizedValue={0.5} width={20} aspectRatio={1} imageHref="/cursor.png" />
 *
 * // Image-based cursor with dark mode
 * <LinearCursor cx={50} cy={150} length={260} normalizedValue={0.5} width={20} aspectRatio={1} imageHref="/cursor.png" imageDarkHref="/cursor-dark.png" />
 * ```
 */
function LinearCursor({
    cx,
    cy,
    length,
    rotation = 0,
    normalizedValue,
    width,
    aspectRatio,
    imageHref,
    imageDarkHref,
    roundness = DEFAULT_ROUNDNESS,
    className,
    style,
}: LinearCursorProps) {
    // Calculate cursor position along the strip (no memo - normalizedValue changes frequently)
    const cursorY = calculateLinearPosition(cy, length, normalizedValue);

    // Calculate height from width and aspect ratio (only used for non-image cursors)
    const height = useMemo(() => {
        return width / aspectRatio;
    }, [width, aspectRatio]);

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

    // Determine if we should render an ellipse (roundness = 1.0) or rectangle
    const isEllipse = useMemo(() => {
        if (typeof roundness === "string") {
            return false; // CSS variables can't be compared, default to rectangle
        }
        // Check if normalized roundness is exactly 1.0 (ellipse/circle)
        return (roundness ?? DEFAULT_ROUNDNESS) >= 1.0;
    }, [roundness]);

    // Calculate position for the cursor (centered at cursorY, horizontally centered at cx)
    const cursorX = useMemo(() => {
        return cx - width / 2;
    }, [cx, width]);

    // Calculate Y position (no memo - depends on cursorY which changes frequently)
    const cursorYPos = cursorY - height / 2;

    // Build transform string for rotation
    // The rotation represents the rotation of the virtual bar (strip), so the cursor rotates
    // around the center of the strip (cx, cy), not around the cursor's current position
    const transform = useMemo(() => {
        if (rotation === 0) {
            return undefined;
        }
        // Negate rotation to match Radial components (positive = counter-clockwise)
        // Rotate around the strip center (cx, cy)
        return `rotate(${-rotation} ${cx} ${cy})`;
    }, [rotation, cx, cy]);

    // Render image if provided (aspectRatio and roundness are ignored - image preserves natural aspect ratio)
    if (imageHref) {
        // Use a square bounding box (width x width) and let preserveAspectRatio maintain the image's natural aspect ratio
        // The image will be centered and scaled to fit within the square while preserving its aspect ratio
        return (
            <g transform={transform} className={className} style={style}>
                <image
                    href={imageHref}
                    x={cx - width / 2}
                    y={cursorY - width / 2}
                    width={width}
                    height={width}
                    className="audioui-image-light"
                    preserveAspectRatio="xMidYMid meet"
                />
                {imageDarkHref && (
                    <image
                        href={imageDarkHref}
                        x={cx - width / 2}
                        y={cursorY - width / 2}
                        width={width}
                        height={width}
                        className="audioui-image-dark"
                        preserveAspectRatio="xMidYMid meet"
                    />
                )}
            </g>
        );
    }

    // Render ellipse if roundness = 1.0
    if (isEllipse) {
        return (
            <ellipse
                cx={cx}
                cy={cursorY}
                rx={width / 2}
                ry={height / 2}
                transform={transform}
                className={className}
                style={style}
            />
        );
    }

    // Render rounded rectangle
    return (
        <rect
            x={cursorX}
            y={cursorYPos}
            width={width}
            height={height}
            // Use 0 as fallback for older browsers that don't support CSS rx/ry
            rx={typeof cornerRadius === "number" ? cornerRadius : 0}
            ry={typeof cornerRadius === "number" ? cornerRadius : 0}
            transform={transform}
            className={className}
            style={{
                ...style,
                rx: cornerRadius,
                ry: cornerRadius,
            }}
        />
    );
}

export default React.memo(LinearCursor);
