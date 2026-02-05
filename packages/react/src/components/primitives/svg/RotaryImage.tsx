/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React, { CSSProperties } from "react";
import { useArcAngle } from "@/hooks/useArcAngle";
import RadialImage from "./RadialImage";

export type RotaryImageProps = {
    /** X coordinate of the center point */
    cx: number;
    /** Y coordinate of the center point */
    cy: number;
    /** Radius of the rotary control (used for bounds/image sizing) */
    radius: number;
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Whether to start the arc from center (bipolar mode) */
    bipolar?: boolean;
    /** Openness of the arc in degrees (default 90) */
    openness?: number;
    /** Optional image URL to display */
    imageHref?: string;
    /** Optional SVG content to rotate */
    children?: React.ReactNode;
    /** Optional rotation angle offset in degrees (default 0) */
    rotation?: number;
    /** Optional number of discrete positions. When defined, the value will snap to the nearest position. */
    positions?: number;
    /** Optional X coordinate for the center of rotation (defaults to cx) */
    pivotX?: number;
    /** Optional Y coordinate for the center of rotation (defaults to cy) */
    pivotY?: number;
    /** Additional CSS class name */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
};

/**
 * A primitive component that rotates its content based on a normalized value.
 * Designed to work with the same angle logic as ValueRing.tsx.
 *
 * This component wraps RadialImage and applies rotation based on the normalized value.
 * It can display an image (via imageHref) or arbitrary SVG content (via children).
 */
function RotaryImage({
    cx,
    cy,
    radius,
    normalizedValue,
    bipolar = false,
    openness = 90,
    imageHref,
    children,
    rotation = 0,
    positions,
    pivotX,
    pivotY,
    className,
    style,
}: RotaryImageProps) {
    // Calculate arc angles using shared hook (rotation computation factored into hook)
    const { valueToAngle } = useArcAngle(normalizedValue, openness, rotation, bipolar, positions);

    // Use explicit pivot point if provided, otherwise default to center (cx, cy)
    const rotateX = pivotX ?? cx;
    const rotateY = pivotY ?? cy;

    return (
        <RadialImage
            cx={cx}
            cy={cy}
            radius={radius}
            imageHref={imageHref}
            transform={`rotate(${valueToAngle}, ${rotateX}, ${rotateY})`}
            className={className}
            style={{ ...style, willChange: "transform" }}
        >
            {children}
        </RadialImage>
    );
}

export default React.memo(RotaryImage);
