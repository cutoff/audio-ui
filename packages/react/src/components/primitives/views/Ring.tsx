"use client";

import React, { CSSProperties, useMemo } from "react";
import { useArcAngle } from "../../../hooks/useArcAngle";
import RingArc from "./RingArc";

export type RingProps = {
    /** X coordinate of the center point */
    cx: number,
    /** Y coordinate of the center point */
    cy: number,
    /** Radius of the ring */
    radius: number,
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Whether to start the arc from center (bipolar mode) */
    bipolar?: boolean;
    /** Thickness of the knob's stroke (1-20 pixels) */
    thickness?: number;
    /** Roundness for stroke linecap (false = square, true = round) */
    roundness?: boolean;
    /** Openness of the ring in degrees (value between 0-360º; 0º: closed; 90º: 3/4 open; 180º: half-circle;) */
    openness?: number;
    /** Optional rotation angle offset in degrees (default 0) */
    rotation?: number;
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
function Ring({
    cx,
    cy,
    radius,
    normalizedValue,
    bipolar = false,
    thickness = 6,
    roundness,
    openness = 90,
    rotation = 0,
    fgArcStyle,
    bgArcStyle,
}: RingProps) {

    /**
     * Angular values for the knob's arc
     */
    const CENTER_ANGLE = 360;

    // Calculate arc angles using shared hook (rotation computation factored into hook)
    const {
        startAngle,
        endAngle,
        valueToAngle,
    } = useArcAngle(normalizedValue, openness, rotation);

    const strokeLinecap = roundness ? "round" : "square";

    // Calculate actual radius to make stroke expand inward
    // The outer edge stays at the provided radius, and the stroke grows inward as thickness increases.
    // SVG strokes are centered on the path, so we subtract half the thickness from the radius.
    // Ensure radius is non-negative.
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
    
    // Calculate start angle for the foreground arc
    // For bipolar: start at top (or rotated center). For unipolar: start at min angle.
    const fgStartAngle = bipolar ? (CENTER_ANGLE - rotation) : startAngle;

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
                startAngle={fgStartAngle}
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

export default React.memo(Ring);

