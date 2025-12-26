"use client";

import React, { CSSProperties } from "react";
import { useArcAngle } from "../../../hooks/useArcAngle";

export type RotaryProps = {
    /** X coordinate of the center point */
    cx: number;
    /** Y coordinate of the center point */
    cy: number;
    /** Radius of the rotary control (used for bounds/image sizing) */
    radius: number;
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Openness of the arc in degrees (default 90) */
    openness?: number;
    /** Optional image URL to display */
    imageHref?: string;
    /** Optional SVG content to rotate */
    children?: React.ReactNode;
    /** Optional rotation angle offset in degrees (default 0) */
    rotation?: number;
    /** Additional CSS class name */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
};

/**
 * A primitive component that rotates its content based on a normalized value.
 * Designed to work with the same angle logic as Ring.tsx.
 * 
 * This component renders a group <g> that rotates around (cx, cy).
 * It can display an image (via imageHref) or arbitrary SVG content (via children).
 */
export default function Rotary({
    cx,
    cy,
    radius,
    normalizedValue,
    openness = 90,
    imageHref,
    children,
    rotation = 0,
    className,
    style,
}: RotaryProps) {
    // Calculate arc angles using shared hook (rotation computation factored into hook)
    const { valueToAngle } = useArcAngle(normalizedValue, openness, rotation);

    return (
        <g
            className={className}
            style={style}
            transform={`rotate(${valueToAngle}, ${cx}, ${cy})`}
        >
            {imageHref && (
                <image
                    href={imageHref}
                    x={cx - radius}
                    y={cy - radius}
                    width={radius * 2}
                    height={radius * 2}
                    preserveAspectRatio="xMidYMid meet"
                />
            )}
            {children}
        </g>
    );
}

