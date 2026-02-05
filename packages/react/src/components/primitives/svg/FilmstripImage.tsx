/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React, { CSSProperties } from "react";

export type FilmstripImageProps = {
    /** X coordinate of the top-left corner (default: 0) */
    x?: number;
    /** Y coordinate of the top-left corner (default: 0) */
    y?: number;
    /** Width of a SINGLE frame */
    frameWidth: number;
    /** Height of a SINGLE frame */
    frameHeight: number;
    /** Total number of frames in the strip */
    frameCount: number;
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** URL to the sprite sheet/filmstrip image */
    imageHref: string;
    /** Orientation of the strip (default: "vertical") */
    orientation?: "vertical" | "horizontal";
    /** Optional frame rotation in degrees (default: 0) */
    frameRotation?: number;
    /**
     * If true, inverts the normalized value (0.0 -> 1.0 and 1.0 -> 0.0).
     * Useful for filmstrips where frame 0 represents "on" and frame 1 represents "off".
     * @default false
     */
    invertValue?: boolean;
    /** Additional CSS class name */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
};

/**
 * A primitive component that displays a single frame from a sprite sheet (filmstrip)
 * based on a normalized value.
 *
 * This is the most performant way to animate complex knobs and UI elements in audio applications.
 * It uses a nested SVG with a shifted viewBox to "scrub" through the filmstrip, which is hardware accelerated.
 *
 * The filmstrip image should contain all frames stacked vertically (default) or horizontally.
 *
 * @param {FilmstripImageProps} props - Component props
 * @param {number} [props.x=0] - X coordinate of the top-left corner
 * @param {number} [props.y=0] - Y coordinate of the top-left corner
 * @param {number} props.frameWidth - Width of a single frame in the filmstrip
 * @param {number} props.frameHeight - Height of a single frame in the filmstrip
 * @param {number} props.frameCount - Total number of frames in the strip
 * @param {number} props.normalizedValue - Normalized value between 0 and 1 (determines which frame to display)
 * @param {string} props.imageHref - URL to the sprite sheet/filmstrip image
 * @param {"vertical" | "horizontal"} [props.orientation="vertical"] - Orientation of the strip
 * @param {number} [props.frameRotation=0] - Optional frame rotation in degrees
 * @param {boolean} [props.invertValue=false] - If true, inverts the normalized value (0.0 -> 1.0 and 1.0 -> 0.0)
 * @param {string} [props.className] - Additional CSS class name
 * @param {CSSProperties} [props.style] - Inline styles
 * @returns {JSX.Element} SVG group element containing the filmstrip frame
 */
function FilmstripImage({
    x = 0,
    y = 0,
    frameWidth,
    frameHeight,
    frameCount,
    normalizedValue,
    imageHref,
    orientation = "vertical",
    frameRotation = 0,
    invertValue = false,
    className,
    style,
}: FilmstripImageProps) {
    // Invert value if requested
    const effectiveValue = invertValue ? 1 - normalizedValue : normalizedValue;
    // Clamp value between 0 and 1
    const clampedValue = Math.max(0, Math.min(1, effectiveValue));

    // Calculate frame index (0 to frameCount - 1)
    const frameIndex = Math.round(clampedValue * (frameCount - 1));

    // Calculate total dimensions of the strip
    const totalWidth = orientation === "horizontal" ? frameWidth * frameCount : frameWidth;
    const totalHeight = orientation === "vertical" ? frameHeight * frameCount : frameHeight;

    // Calculate viewBox coordinates for the current frame
    const viewBoxX = orientation === "horizontal" ? frameIndex * frameWidth : 0;
    const viewBoxY = orientation === "vertical" ? frameIndex * frameHeight : 0;

    // Calculate center point for rotation
    const centerX = x + frameWidth / 2;
    const centerY = y + frameHeight / 2;

    return (
        <g className={className} style={style} transform={`rotate(${frameRotation}, ${centerX}, ${centerY})`}>
            <svg
                x={x}
                y={y}
                width={frameWidth}
                height={frameHeight}
                viewBox={`0 0 ${frameWidth} ${frameHeight}`}
                preserveAspectRatio="none"
                style={{ overflow: "hidden" }}
            >
                <image
                    href={imageHref}
                    width={totalWidth}
                    height={totalHeight}
                    preserveAspectRatio="none"
                    style={{
                        transform: `translate(${-viewBoxX}px, ${-viewBoxY}px)`,
                        willChange: "transform",
                    }}
                />
            </svg>
        </g>
    );
}

export default React.memo(FilmstripImage);
