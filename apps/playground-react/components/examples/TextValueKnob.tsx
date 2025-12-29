"use client";

import { useMemo } from "react";
import {
    ValueRing,
    RotaryImage,
    RadialText,
    ControlComponentViewProps,
    ControlComponent,
    withPrecision,
} from "@cutoff/audio-ui-react";

export type TextValueKnobProps = ControlComponentViewProps;

// Constants & Styles
const PRIMARY_COLOR = "var(--audioui-adaptive-default-color)";
const FG_ARC_STYLE = { stroke: PRIMARY_COLOR };
const BG_ARC_STYLE = { stroke: `color-mix(in srgb, ${PRIMARY_COLOR} 50%, transparent)`, opacity: 1 };
const REFERENCE_TEXT = ["100.0", "%"];

/**
 * A control component that renders a knob with text displaying the normalized value.
 * Demonstrates how to use RadialText to show knob values inside the control.
 */
function TextValueKnob({ normalizedValue, className, style }: TextValueKnobProps) {
    // Memoize style object to prevent recreation on every render
    const groupStyle = useMemo(() => {
        return { ...style };
    }, [style]);

    // Format value as percentage with 1 decimal place
    const formattedValue = useMemo(() => {
        const percentage = normalizedValue * 100;
        return withPrecision(1)(percentage);
    }, [normalizedValue]);

    // Split into value and unit for multiline display
    const textLines = useMemo(() => {
        return [formattedValue, "%"];
    }, [formattedValue]);

    return (
        <g className={className} style={groupStyle}>
            {/* ValueRing indicator */}
            <ValueRing
                cx={50}
                cy={50}
                radius={40}
                normalizedValue={normalizedValue}
                thickness={4}
                roundness={false}
                openness={90}
                fgArcStyle={FG_ARC_STYLE}
                bgArcStyle={BG_ARC_STYLE}
            />

            {/* Rotating indicator line */}
            <RotaryImage cx={50} cy={50} radius={35} normalizedValue={normalizedValue} openness={90}>
                <line x1="50%" y1="10%" x2="50%" y2="0%" stroke="currentColor" strokeWidth={4} strokeLinecap="round" />
            </RotaryImage>

            {/* Static text displaying value using RadialText */}
            <RadialText
                className="font-medium fill-current"
                cx={50}
                cy={50}
                radius={20}
                text={textLines}
                referenceText={REFERENCE_TEXT}
            />
        </g>
    );
}

/**
 * ViewBox dimensions for the TextValueKnob component.
 */
TextValueKnob.viewBox = {
    width: 100,
    height: 100,
};

/**
 * Label height for the TextValueKnob component.
 */
TextValueKnob.labelHeightUnits = 15;

/**
 * Interaction contract for the TextValueKnob component.
 */
TextValueKnob.interaction = {
    mode: "both",
    direction: "circular",
};

/**
 * Metadata for the TextValueKnob component.
 */
TextValueKnob.title = "Text Value Knob";
TextValueKnob.description =
    "A knob with text displaying the current normalized value as a percentage. Demonstrates RadialText primitive with multiline text support (value and unit on separate lines).";

export default TextValueKnob as ControlComponent;
