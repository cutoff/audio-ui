"use client";

import { CSSProperties, useMemo } from "react";
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
export default function Ring({
    cx,
    cy,
    radius,
    normalizedValue,
    bipolar = false,
    thickness = 6,
    roundness,
    openness = 90,
    fgArcStyle,
    bgArcStyle,
}: RingProps) {

    /**
     * Angular values for the knob's arc
     */
    const CENTER_ANGLE = 360;

    // Sanitize inputs
    const clampedValue = Math.max(0, Math.min(1, normalizedValue));
    const clampedOpenness = Math.max(0, Math.min(360, openness));

    // Memoize angular calculations based on openness
    // Calculate the start and end angles based on the openness prop.
    // 0 degrees is at 3 o'clock, increasing clockwise.
    // Standard knob (90 openness) goes from approx 225 deg (7:30) to 495 deg (4:30).
    const { maxStartAngle, maxEndAngle, maxArcAngle } = useMemo(() => {
        const start = 180 + (clampedOpenness / 2);
        const end = 540 - (clampedOpenness / 2);
        return {
            maxStartAngle: start,
            maxEndAngle: end,
            maxArcAngle: end - start
        };
    }, [clampedOpenness]);

    // Convert normalized value (0-1) to an angle in degrees
    const valueToAngle = useMemo(() => {
        return clampedValue * maxArcAngle + maxStartAngle;
    }, [clampedValue, maxArcAngle, maxStartAngle]);

    const strokeLinecap = roundness ? "round" : "square";

    // Calculate actual radius to make stroke expand inward
    // The outer edge stays at the provided radius, and the stroke grows inward as thickness increases.
    // SVG strokes are centered on the path, so we subtract half the thickness from the radius.
    // Ensure radius is non-negative.
    const actualRadius = useMemo(() => {
        return Math.max(0, radius - thickness / 2);
    }, [radius, thickness]);

    const fgStartAngle = bipolar ? CENTER_ANGLE : maxStartAngle;

    return (
        <>
            {/* Background Arc - displays the full range of the control */}
            <RingArc
                startAngle={maxStartAngle}
                endAngle={maxEndAngle}
                style={bgArcStyle}
                cx={cx}
                cy={cy}
                radius={actualRadius}
                thickness={thickness}
                strokeLinecap={strokeLinecap}
            />

            {/* Foreground Arc - displays the current value */}
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

