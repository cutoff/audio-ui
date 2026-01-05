"use client";

import React, { useMemo } from "react";
import { generateColorVariants, getAdaptiveDefaultColor } from "@cutoff/audio-ui-core";
import { ControlComponent } from "@/types";
import { translateKnobRoundness, translateKnobThickness } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";
import ValueRing from "@/primitives/svg/ValueRing";

/**
 * Props for the SvgKnob component
 */
export type SvgKnobProps = {
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Whether to start the arc from center (bipolar mode) */
    bipolar?: boolean;
    /** Thickness of the knob's stroke (normalized 0.0-1.0, maps to 1-20) */
    thickness?: number;
    /** Roundness for stroke linecap (normalized 0.0-1.0, 0.0 = square, >0.0 = round) */
    roundness?: number;
    /** Openness of the ring in degrees (value between 0-360º; 0º: closed; 90º: 3/4 open; 180º: half-circle;) */
    openness?: number;
    /** Optional rotation angle offset in degrees */
    rotation?: number;
    /** Resolved color string */
    color?: string;
    /** Additional CSS class name */
    className?: string;
};

/**
 * Pure SVG presentation component for a knob.
 * Renders background and foreground arcs as the visual indicator.
 *
 * Center content (text, icons, images) is rendered via the `overlay` prop
 * on AdaptiveBox.Svg, which places HTML content OUTSIDE the SVG to avoid
 * Safari's foreignObject rendering bugs with container queries.
 *
 * @param normalizedValue - Value between 0 and 1
 * @param bipolar - Whether to start arc from center (default false)
 * @param thickness - Normalized thickness 0.0-1.0 (default 0.4, maps to 1-20)
 * @param roundness - Normalized roundness 0.0-1.0 (default 0.3, 0.0 = square, >0.0 = round)
 * @param openness - Openness of the ring in degrees (default 90)
 * @param rotation - Optional rotation angle offset in degrees (default 0)
 * @param color - Resolved color string
 * @param className - Optional CSS class
 */
function SvgKnob({
    normalizedValue,
    bipolar = false,
    thickness = 0.4,
    roundness = DEFAULT_ROUNDNESS,
    openness = 90,
    rotation = 0,
    color,
    className,
}: SvgKnobProps) {
    // Translate normalized thickness to pixel range (1-20)
    const pixelThickness = useMemo(() => {
        return translateKnobThickness(thickness);
    }, [thickness]);

    // Translate normalized roundness to boolean (0 = square, >0 = round)
    const isRound = useMemo(() => {
        return translateKnobRoundness(roundness) !== 0;
    }, [roundness]);

    // Generate color variants
    const colorVariants = useMemo(
        () => generateColorVariants(color ?? getAdaptiveDefaultColor(), "transparency"),
        [color]
    );

    return (
        <g className={className}>
            <ValueRing
                cx={50}
                cy={50}
                radius={50}
                normalizedValue={normalizedValue}
                bipolar={bipolar}
                thickness={pixelThickness}
                roundness={isRound}
                openness={openness}
                rotation={rotation}
                fgArcStyle={{ stroke: colorVariants.primary }}
                bgArcStyle={{ stroke: colorVariants.primary50 }}
            />
        </g>
    );
}

// Create memoized component
const MemoSvgKnob = React.memo(SvgKnob);

// Explicitly attach static properties to the memoized component
(MemoSvgKnob as any).viewBox = { width: 100, height: 100 };
(MemoSvgKnob as any).labelHeightUnits = 20;
(MemoSvgKnob as any).interaction = { mode: "both", direction: "circular" } as const;
(MemoSvgKnob as any).title = "Knob";
(MemoSvgKnob as any).description = "A rotary knob control with circular arc indicator";

export default MemoSvgKnob as unknown as ControlComponent<
    Omit<SvgKnobProps, "normalizedValue" | "className" | "style">
>;
