"use client";

import { useMemo } from "react";
import { Rotary, RadialImage, ControlComponentViewProps, ControlComponent } from "@cutoff/audio-ui-react";

export type SelectorKnobProps = ControlComponentViewProps;

// Image assets
const KNOB_SELECTOR_IMAGE = "/knob-selector.png";
const KNOB_SELECTOR_BODY_IMAGE = "/knob-selector-body.png";

/**
 * A custom knob component composed of two superimposed images.
 * - The "body" image is static and sits on top.
 * - The "selector" image is underneath and rotates.
 * - Uses 180-degree openness with 5 discrete positions.
 */
function SelectorKnob({ normalizedValue, className, style }: SelectorKnobProps) {
    // Memoize style object to prevent recreation on every render
    const groupStyle = useMemo(() => {
        return { ...style };
    }, [style]);

    return (
        <g className={className} style={groupStyle}>
            {/* Layer 1: Rotating Selector (Bottom) */}
            <Rotary
                cx={50}
                cy={50}
                radius={50}
                normalizedValue={normalizedValue}
                openness={180}
                positions={5}
                imageHref={KNOB_SELECTOR_IMAGE}
            />

            {/* Layer 2: Static Body (Top) */}
            <RadialImage cx={50} cy={50} radius={16} imageHref={KNOB_SELECTOR_BODY_IMAGE} />
        </g>
    );
}

/**
 * ViewBox dimensions for the SelectorKnob component.
 */
SelectorKnob.viewBox = {
    width: 100,
    height: 100,
};

/**
 * Label height for the SelectorKnob component.
 */
SelectorKnob.labelHeightUnits = 20;

/**
 * Interaction contract for the SelectorKnob component.
 */
SelectorKnob.interaction = {
    mode: "both",
    direction: "vertical",
};

/**
 * Metadata for the SelectorKnob component.
 */
SelectorKnob.title = "Selector Knob";
SelectorKnob.description =
    "A knob composed of two images: a rotating selector underneath a static body. Uses 180-degree openness with 5 discrete positions.";

export default SelectorKnob as ControlComponent;
