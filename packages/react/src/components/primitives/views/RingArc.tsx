"use client";

import { calculateArcPath } from "@cutoff/audio-ui-core";
import { CSSProperties, useMemo } from "react";
import RevealingPath from "./RevealingPath";

export type RingArcProps = {
    startAngle: number;
    endAngle: number;
    style: CSSProperties | undefined;
    cx: number;
    cy: number;
    radius: number;
    thickness: number;
    strokeLinecap: "round" | "square" | "butt";
    /**
     * Optional normalized value (0-1).
     * If provided, the arc will be rendered as a full path (defined by startAngle/endAngle)
     * but visually revealed based on this value using CSS stroke-dashoffset optimization.
     */
    normalizedValue?: number;
};

/**
 * Helper component to render either a circle or path based on whether it's a full circle.
 *
 * @internal
 */
export default function RingArc({
    startAngle,
    endAngle,
    style,
    cx,
    cy,
    radius,
    thickness,
    strokeLinecap,
    normalizedValue,
}: RingArcProps) {
    // Determine if it's a full circle based on angular difference (>= 360 degrees)
    const isFullCircle = Math.abs(endAngle - startAngle) >= 360;

    const path = useMemo(() => {
        if (isFullCircle) return undefined;
        
        // Use "clockwise" direction (Start -> End) for optimized reveal animations so fill works left-to-right.
        // Use default "counter-clockwise" (End -> Start) for standard static shapes.
        const direction = normalizedValue !== undefined ? "clockwise" : "counter-clockwise";
        return calculateArcPath(cx, cy, startAngle, endAngle, radius, direction);
    }, [isFullCircle, cx, cy, startAngle, endAngle, radius, normalizedValue]);

    if (isFullCircle) {
        return (
            <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                strokeWidth={thickness}
                strokeLinecap={strokeLinecap}
                style={style}
            />
        );
    }

    if (!path) return null;

    // OPTIMIZATION: Use RevealingPath if normalizedValue is provided.
    if (normalizedValue !== undefined) {
        return (
            <RevealingPath
                d={path}
                normalizedValue={normalizedValue}
                fill="none"
                strokeWidth={thickness}
                strokeLinecap={strokeLinecap}
                style={style}
            />
        );
    }

    return (
        <path
            d={path}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap={strokeLinecap}
            style={style}
        />
    );
}
