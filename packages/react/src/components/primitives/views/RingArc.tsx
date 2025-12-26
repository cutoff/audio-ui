"use client";

import { calculateArcPath } from "@cutoff/audio-ui-core";
import { CSSProperties, useMemo } from "react";

export type RingArcProps = {
    startAngle: number;
    endAngle: number;
    style: CSSProperties | undefined;
    cx: number;
    cy: number;
    radius: number;
    thickness: number;
    strokeLinecap: "round" | "square" | "butt";
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
}: RingArcProps) {
    // Determine if it's a full circle based on angular difference (>= 360 degrees)
    const isFullCircle = Math.abs(endAngle - startAngle) >= 360;

    const path = useMemo(() => {
        if (isFullCircle) return undefined;
        
        // Use default "counter-clockwise" (End -> Start) for standard static shapes.
        return calculateArcPath(cx, cy, startAngle, endAngle, radius, "counter-clockwise");
    }, [isFullCircle, cx, cy, startAngle, endAngle, radius]);

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
