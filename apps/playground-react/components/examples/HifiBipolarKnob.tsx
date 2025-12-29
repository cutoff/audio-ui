"use client";

import { useMemo } from "react";
import { Rotary, Ring, RadialImage, ControlComponentViewProps, ControlComponent } from "@cutoff/audio-ui-react";

export type ImageBackgroundKnobProps = ControlComponentViewProps;

// Background image for the knob
const KNOB_BACKGROUND_IMAGE = "/knob-metal.png";

/**
 * A bipolar control component that renders a knob with a static background image.
 * Demonstrates how to use RadialImage as a background layer for bipolar knobs.
 */
function HifiBipolarKnob({ normalizedValue, className, style }: ImageBackgroundKnobProps) {
    // Memoize style object to prevent recreation on every render
    const groupStyle = useMemo(() => {
        return { ...style };
    }, [style]);

    // ============================================================================
    // Render
    // ============================================================================
    return (
        <g className={className} style={groupStyle}>
            {/* Ring indicator on top (bipolar) */}
            <Ring
                cx={50}
                cy={50}
                radius={50}
                normalizedValue={normalizedValue}
                thickness={2}
                roundness={true}
                openness={0}
                bipolar={true}
                fgArcStyle={{ stroke: "#7100FF" }}
                bgArcStyle={{ stroke: "var(--audioui-adaptive-default-color)", opacity: 0.15 }}
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
                    style={{ stroke: "white" }}
                />
            </Rotary>
        </g>
    );
}

/**
 * ViewBox dimensions for the ImageBackgroundKnob component.
 */
HifiBipolarKnob.viewBox = {
    width: 100,
    height: 100,
};

/**
 * Label height for the ImageBackgroundKnob component.
 */
HifiBipolarKnob.labelHeightUnits = 15;

/**
 * Interaction contract for the ImageBackgroundKnob component.
 */
HifiBipolarKnob.interaction = {
    mode: "both",
    direction: "vertical",
};

/**
 * Metadata for the ImageBackgroundKnob component.
 */
HifiBipolarKnob.title = "Hi-Fi Bipolar Knob";
HifiBipolarKnob.description =
    "A bipolar knob with a static background image using RadialImage primitive. The Ring starts from the center (12 o'clock) to show positive or negative values.";

export default HifiBipolarKnob as ControlComponent;
