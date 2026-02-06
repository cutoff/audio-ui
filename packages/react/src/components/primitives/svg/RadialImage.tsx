/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React, { CSSProperties } from "react";

export type RadialImageProps = {
    /** X coordinate of the center point */
    cx: number;
    /** Y coordinate of the center point */
    cy: number;
    /** Radius the content should fit within */
    radius: number;
    /** Optional image URL to display */
    imageHref?: string;
    /** Optional dark mode image URL (used when dark mode is active) */
    imageDarkHref?: string;
    /** Optional SVG content to display (e.g., icon components) */
    children?: React.ReactNode;
    /** Optional SVG transform attribute */
    transform?: string;
    /** Additional CSS class name */
    className?: string;
    /**
     * Inline styles.
     * Supports `color` property for icon theming - icons using currentColor will inherit this value.
     */
    style?: CSSProperties;
};

/**
 * A primitive component that displays static content at radial coordinates.
 * The content is sized to fit within the specified radius and centered at (cx, cy).
 *
 * This component can display an image (via imageHref) or arbitrary SVG content (via children).
 * It is designed to work alongside ValueRing and RotaryImage components in composing knobs.
 *
 * Supports optional dark mode images via imageDarkHref. When provided, CSS automatically
 * switches between light and dark images based on the .dark class or prefers-color-scheme.
 *
 * Useful for displaying icons or static images within knob compositions.
 */
function RadialImage({
    cx,
    cy,
    radius,
    imageHref,
    imageDarkHref,
    children,
    transform,
    className,
    style,
}: RadialImageProps) {
    return (
        <g className={className} style={style} transform={transform}>
            {imageHref && (
                <image
                    href={imageHref}
                    x={cx - radius}
                    y={cy - radius}
                    width={radius * 2}
                    height={radius * 2}
                    preserveAspectRatio="xMidYMid meet"
                    className="audioui-image-light"
                />
            )}
            {imageDarkHref && (
                <image
                    href={imageDarkHref}
                    x={cx - radius}
                    y={cy - radius}
                    width={radius * 2}
                    height={radius * 2}
                    preserveAspectRatio="xMidYMid meet"
                    className="audioui-image-dark"
                />
            )}
            {children && (
                <svg
                    x={cx - radius}
                    y={cy - radius}
                    width={radius * 2}
                    height={radius * 2}
                    viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                    style={{ overflow: "visible", ...(style?.color ? { color: style.color } : {}) }}
                >
                    {children}
                </svg>
            )}
        </g>
    );
}

export default React.memo(RadialImage);
