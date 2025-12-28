"use client";

import { useMemo } from "react";
import { Rotary, ControlComponentViewProps, ControlComponent } from "@cutoff/audio-ui-react";

export type GuitarPixelKnobProps = ControlComponentViewProps;

// Pixel image URL for vintage knob (from Rotary demo example 3)
const VINTAGE_KNOB_IMAGE = "/knob-volume.png";

/**
 * A control component that renders a vintage knob using a pixel image with custom rotation.
 * Based on Rotary demo example 3.
 */
function GuitarKnob({ normalizedValue, className, style }: GuitarPixelKnobProps) {
    // Memoize style object to prevent recreation on every render
    const groupStyle = useMemo(() => {
        return { ...style };
    }, [style]);

    // ============================================================================
    // Render
    // ============================================================================
    // Note: The <svg> element is provided by SvgContinuousControl via AdaptiveBox.Svg
    // This component only renders the SVG content (Rotary primitive) inside a <g> group
    return (
        <g 
            className={className}
            style={groupStyle}
        >
            {/* Triangle indicator */}
            <polygon 
                points="50,7 48,3 52,3" 
                fill="grey" 
            />

            {/* Rotary with pixel image and custom rotation */}
            <Rotary
                cx={50}
                cy={50}
                radius={40}
                normalizedValue={normalizedValue}
                openness={33}
                rotation={-164}
                imageHref={VINTAGE_KNOB_IMAGE}
            />
        </g>
    );
}

/**
 * ViewBox dimensions for the GuitarPixelKnob component.
 * The parent component should use these values when setting up the SVG container.
 */
GuitarKnob.viewBox = {
    width: 100,
    height: 100,
};

/**
 * Label height for the GuitarPixelKnob component.
 */
GuitarKnob.labelHeightUnits = 10;

/**
 * Interaction contract for the GuitarPixelKnob component.
 */
GuitarKnob.interaction = {
    mode: "both",
    direction: "vertical",
};

/**
 * Metadata for the GuitarPixelKnob component.
 */
GuitarKnob.title = "Guitar Knob";
GuitarKnob.description = "A retro guitar amplifier-style knob featuring pixel art graphics with custom rotation and openness settings. Note how the component value is always located on top of the component.";

export default GuitarKnob as ControlComponent;

