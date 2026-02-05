/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import { useMemo } from "react";
import {
    RotaryImage,
    ValueRing,
    RadialImage,
    ControlComponentViewProps,
    ControlComponent,
    TickRing,
} from "@cutoff/audio-ui-react";

export type ImageBackgroundKnobProps = ControlComponentViewProps;

// Constants & Styles
const KNOB_BACKGROUND_IMAGE = "/images/demo/knob-metal.png";

const FG_ARC_STYLE = { stroke: "#FCC969" };
const TICKS_STYLE = { stroke: "#FCC969", strokeWidth: 1 };
const TICKS2_STYLE = { stroke: "#51452D", strokeWidth: 0.5 };
const BG_ARC_STYLE = { stroke: "var(--audioui-adaptive-default-color)", opacity: 0.15 };
const LINE_STYLE = { stroke: "white" };

/**
 * A control component that renders a knob with a static background image.
 * Demonstrates how to use RadialImage as a background layer for knobs.
 */
function HifiKnob({ normalizedValue, className, style }: ImageBackgroundKnobProps) {
    // Memoize style object to prevent recreation on every render
    const groupStyle = useMemo(() => {
        return { ...style };
    }, [style]);

    return (
        <g className={className} style={groupStyle}>
            <TickRing cx={50} cy={50} radius={50} thickness={5} openness={90} style={TICKS2_STYLE} step={3} />
            <TickRing cx={50} cy={50} radius={50} thickness={5} openness={90} style={TICKS_STYLE} count={3} />

            {/* ValueRing indicator on top */}
            <ValueRing
                cx={50}
                cy={50}
                radius={43}
                normalizedValue={normalizedValue}
                thickness={1}
                roundness={true}
                openness={90}
                fgArcStyle={FG_ARC_STYLE}
                bgArcStyle={BG_ARC_STYLE}
            />

            {/* Static background image using RadialImage */}
            <RadialImage cx={50} cy={50} radius={40} imageHref={KNOB_BACKGROUND_IMAGE} />

            {/* Rotating indicator line */}
            <RotaryImage cx={50} cy={50} radius={43} normalizedValue={normalizedValue} openness={90}>
                <line
                    x1="43"
                    y1="15"
                    x2="43"
                    y2="8"
                    stroke="white"
                    strokeWidth={2}
                    strokeLinecap="round"
                    style={LINE_STYLE}
                />
            </RotaryImage>
        </g>
    );
}

/**
 * ViewBox dimensions for the ImageBackgroundKnob component.
 */
HifiKnob.viewBox = {
    width: 100,
    height: 100,
};

/**
 * Label height for the ImageBackgroundKnob component.
 */
HifiKnob.labelHeightUnits = 10;

/**
 * Interaction contract for the ImageBackgroundKnob component.
 */
HifiKnob.interaction = {
    mode: "both",
    direction: "circular",
};

/**
 * Metadata for the ImageBackgroundKnob component.
 */
HifiKnob.title = "Hi-Fi Knob";
HifiKnob.description =
    "A high-fidelity knob featuring a static background image, multiple TickRings for the scale, and a ValueRing indicator.";

export default HifiKnob as ControlComponent;
