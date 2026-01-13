/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { CSSProperties, useMemo } from "react";
import { useArcAngle } from "@/hooks/useArcAngle";
import RingArc from "./RingArc";

export type ValueRingProps = {
    /** X coordinate of the center point */
    cx: number;
    /** Y coordinate of the center point */
    cy: number;
    /** Radius of the ring */
    radius: number;
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Whether to start the arc from center (bipolar mode) */
    bipolar?: boolean;
    /** Thickness of the knob's stroke (1-20 pixels) */
    thickness?: number;
    /** Roundness for stroke linecap (false = square, true = round, or CSS variable string) */
    roundness?: boolean | string;
    /** Openness of the ring in degrees (value between 0-360º; 0º: closed; 90º: 3/4 open; 180º: half-circle;) */
    openness?: number;
    /** Optional rotation angle offset in degrees (default 0) */
    rotation?: number;
    /** Optional number of discrete positions. When defined, the value will snap to the nearest position. */
    positions?: number;
    /** Optional style overrides for the foreground (value) arc */
    fgArcStyle?: CSSProperties;
    /** Optional style overrides for the background arc */
    bgArcStyle?: CSSProperties;
};

/**
 * A reusable SVG fragment that renders a ring (arc) used in circular controls like knobs.
 * It handles the calculation of SVG paths for both the background track and the foreground value indicator.
 *
 * This component is designed to be used inside an <svg> element.
 */
function ValueRing({
    cx,
    cy,
    radius,
    normalizedValue,
    bipolar = false,
    thickness = 6,
    roundness,
    openness = 90,
    rotation = 0,
    positions,
    fgArcStyle,
    bgArcStyle,
}: ValueRingProps) {
    // Calculate arc angles using shared hook (rotation computation factored into hook)
    const { startAngle, endAngle, valueToAngle, valueStartAngle } = useArcAngle(
        normalizedValue,
        openness,
        rotation,
        bipolar,
        positions
    );

    const strokeLinecap = useMemo(() => {
        if (typeof roundness === "string") {
            return roundness;
        }
        return roundness ? "round" : "square";
    }, [roundness]);

    // Calculate actual radius to make stroke expand inward from the outer edge
    // SVG strokes are centered on the path by default, so a stroke of thickness N
    // extends N/2 pixels on each side of the path. To make the stroke grow inward
    // (keeping the outer edge at the specified radius), we subtract half the thickness.
    // This ensures the visual appearance matches the design intent: outer edge stays fixed,
    // inner edge moves inward as thickness increases.
    const actualRadius = useMemo(() => {
        return Math.max(0, radius - thickness / 2);
    }, [radius, thickness]);

    // Check if we can use the optimized RevealingPath
    // We only use RevealingPath for unipolar, non-full-circle arcs
    // (Full circles require complex path construction to work with stroke-dasharray)
    // PERFORMANCE NOTE: We explicitly AVOID the RevealingPath optimization (stroke-dasharray)
    // here because in high-concurrency scenarios (hundreds of knobs), the React overhead
    // of the extra component layer and DOM attribute updates proved slower than
    // simply recalculating the geometric path in JS.

    return (
        <>
            {/* Background Arc - Always the same regardless of optimization */}
            <RingArc
                startAngle={startAngle}
                endAngle={endAngle}
                style={bgArcStyle}
                cx={cx}
                cy={cy}
                radius={actualRadius}
                thickness={thickness}
                strokeLinecap={strokeLinecap}
            />

            {/* Foreground Arc */}
            <RingArc
                startAngle={valueStartAngle}
                endAngle={valueToAngle}
                style={fgArcStyle}
                cx={cx}
                cy={cy}
                radius={actualRadius}
                thickness={thickness}
                strokeLinecap={strokeLinecap}
            />
        </>
    );
}

export default React.memo(ValueRing);
