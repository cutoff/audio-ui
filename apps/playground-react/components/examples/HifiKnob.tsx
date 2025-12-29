"use client";

import { useMemo } from "react";
import { Rotary, Ring, RadialImage, ControlComponentViewProps, ControlComponent } from "@cutoff/audio-ui-react";

export type ImageBackgroundKnobProps = ControlComponentViewProps;

// Constants & Styles
const KNOB_BACKGROUND_IMAGE = "/knob-metal.png";

const FG_ARC_STYLE = { stroke: "#7100FF" };
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
            {/* Ring indicator on top */}
            <Ring
                cx={50}
                cy={50}
                radius={50}
                normalizedValue={normalizedValue}
                thickness={2}
                roundness={true}
                openness={0}
                fgArcStyle={FG_ARC_STYLE}
                bgArcStyle={BG_ARC_STYLE}
            />

            {/* Static background image using RadialImage */}
            <RadialImage cx={50} cy={50} radius={47} imageHref={KNOB_BACKGROUND_IMAGE} />

            {/* Rotating indicator line */}
            <Rotary cx={50} cy={50} radius={50} normalizedValue={normalizedValue} openness={0}>
                <line
                    x1="50"
                    y1="15"
                    x2="50"
                    y2="8"
                    stroke="white"
                    strokeWidth={2}
                    strokeLinecap="round"
                    style={LINE_STYLE}
                />
            </Rotary>
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
HifiKnob.labelHeightUnits = 15;

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
    "A knob with a static background image using RadialImage primitive. The image provides visual texture while the Ring and Rotary primitives show the current value.";

export default HifiKnob as ControlComponent;
