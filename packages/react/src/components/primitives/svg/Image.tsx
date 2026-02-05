/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React, { CSSProperties } from "react";

export type ImageProps = {
    /** X coordinate of the top-left corner (default: 0) */
    x?: number;
    /** Y coordinate of the top-left corner (default: 0) */
    y?: number;
    /** Width of the image */
    width: number;
    /** Height of the image */
    height: number;
    /** Optional image URL to display */
    imageHref?: string;
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
 * A primitive component that displays static content at rectangular coordinates.
 * The content is positioned at (x, y) with the specified width and height.
 *
 * This component can display an image (via imageHref) or arbitrary SVG content (via children).
 * It is designed for straightforward rectangular image placement without radial/centered positioning.
 *
 * Useful for displaying images or icons at specific positions and sizes.
 *
 * @param {ImageProps} props - Component props
 * @param {number} [props.x=0] - X coordinate of the top-left corner
 * @param {number} [props.y=0] - Y coordinate of the top-left corner
 * @param {number} props.width - Width of the image
 * @param {number} props.height - Height of the image
 * @param {string} [props.imageHref] - Optional image URL to display
 * @param {React.ReactNode} [props.children] - Optional SVG content to display
 * @param {string} [props.transform] - Optional SVG transform attribute
 * @param {string} [props.className] - Additional CSS class name
 * @param {CSSProperties} [props.style] - Inline styles
 * @returns {JSX.Element} SVG group element containing the image
 */
function Image({ x = 0, y = 0, width, height, imageHref, children, transform, className, style }: ImageProps) {
    return (
        <g className={className} style={style} transform={transform}>
            {imageHref && (
                <image href={imageHref} x={x} y={y} width={width} height={height} preserveAspectRatio="xMidYMid meet" />
            )}
            {children && (
                <svg
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    style={{ overflow: "visible", ...(style?.color ? { color: style.color } : {}) }}
                >
                    {children}
                </svg>
            )}
        </g>
    );
}

export default React.memo(Image);
