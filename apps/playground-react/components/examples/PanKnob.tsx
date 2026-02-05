/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import { useMemo } from "react";
import { ValueRing, ControlComponentViewProps, ControlComponent } from "@cutoff/audio-ui-react";

export type PanKnobProps = ControlComponentViewProps;

// ============================================================================
// Constants & Pre-calculations (Optimization)
// ============================================================================

const PRIMARY_COLOR = "var(--audioui-adaptive-default-color)";
const WAVE_TRANSITION_STYLE = { transition: "opacity 0.2s ease-in-out" };

// Hoist static style objects to prevent reallocation on every render
const FG_ARC_STYLE = { stroke: PRIMARY_COLOR, opacity: 0.8 };
const BG_ARC_STYLE = { stroke: `color-mix(in srgb, ${PRIMARY_COLOR} 20%, transparent)`, opacity: 0.5 };

/**
 * Pre-calculates the SVG path for a wave arc at a given radius.
 * Done at module level to avoid recalculation during render.
 */
function getWavePath(radius: number) {
    // 60 degree arc (30 up, 30 down)
    const angle = Math.PI / 6;
    const cx = 50;
    const cy = 50;

    const x1 = Math.cos(-angle) * radius;
    const y1 = Math.sin(-angle) * radius;
    const x2 = Math.cos(angle) * radius;
    const y2 = Math.sin(angle) * radius;

    // Draw right-side arc
    return `M ${cx + x1} ${cy + y1} A ${radius} ${radius} 0 0 1 ${cx + x2} ${cy + y2}`;
}

const INNER_WAVE_PATH = getWavePath(16);
const OUTER_WAVE_PATH = getWavePath(26);

/**
 * Draws a wave arc segment using a pre-calculated path.
 * purely presentational component.
 */
function WaveArc({ d, opacity = 1, isLeft = false }: { d: string; opacity?: number; isLeft?: boolean }) {
    return (
        <path
            d={d}
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
            opacity={opacity}
            transform={isLeft ? "rotate(180 50 50)" : undefined}
            style={WAVE_TRANSITION_STYLE}
        />
    );
}

/**
 * Central emitter icon (speaker source)
 */
function EmitterIcon() {
    return <circle cx="50" cy="50" r="6" fill="currentColor" />;
}

/**
 * A bipolar pan control component that visualized panning with "sound waves"
 * emanating from a central source.
 */
function PanKnob({ normalizedValue, className, style }: PanKnobProps) {
    // Memoize style object to prevent recreation on every render
    const groupStyle = useMemo(() => {
        return { ...style };
    }, [style]);

    // Determine wave visibility
    // normalizedValue: 0 (left) -> 0.5 (center) -> 1 (right)
    const bipolar = (normalizedValue - 0.5) * 2;
    const absVal = Math.abs(bipolar);
    const isLeft = bipolar < -0.05; // small deadzone for direction
    const isRight = bipolar > 0.05;

    // Thresholds: 1st wave > 15%, 2nd wave > 60%
    const showWave1 = absVal > 0.15;
    const showWave2 = absVal > 0.6;

    // Calculate opacities (0 or 1 for appear/disappear effect)
    const left1Opacity = isLeft && showWave1 ? 1 : 0;
    const left2Opacity = isLeft && showWave2 ? 1 : 0;
    const right1Opacity = isRight && showWave1 ? 1 : 0;
    const right2Opacity = isRight && showWave2 ? 1 : 0;

    return (
        <g className={className} style={groupStyle}>
            {/* ValueRing indicator - subtle background track */}
            <ValueRing
                cx={50}
                cy={50}
                radius={44}
                normalizedValue={normalizedValue}
                bipolar={true}
                thickness={3}
                roundness={true}
                openness={90}
                fgArcStyle={FG_ARC_STYLE}
                bgArcStyle={BG_ARC_STYLE}
            />

            <EmitterIcon />

            <g className="text-primary">
                <WaveArc d={INNER_WAVE_PATH} isLeft={true} opacity={left1Opacity} />
                <WaveArc d={OUTER_WAVE_PATH} isLeft={true} opacity={left2Opacity} />

                <WaveArc d={INNER_WAVE_PATH} isLeft={false} opacity={right1Opacity} />
                <WaveArc d={OUTER_WAVE_PATH} isLeft={false} opacity={right2Opacity} />
            </g>
        </g>
    );
}

/**
 * ViewBox dimensions for the PanKnob component.
 */
PanKnob.viewBox = {
    width: 100,
    height: 100,
};

/**
 * Label height for the PanKnob component.
 */
PanKnob.labelHeightUnits = 15;

/**
 * Interaction contract for the PanKnob component.
 */
PanKnob.interaction = {
    mode: "both",
    direction: "horizontal", // Horizontal drag for pan
};

/**
 * Metadata for the PanKnob component.
 */
PanKnob.title = "Pan Knob";
PanKnob.description =
    "A speaker-style pan control where sound waves appear on the left or right side based on the pan value.";

export default PanKnob as ControlComponent;
