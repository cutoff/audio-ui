"use client";

import { useMemo } from "react";
import { Rotary, ControlComponentViewProps, ControlComponent } from "@cutoff/audio-ui-react";

export type ClassicVectorKnobProps = ControlComponentViewProps;

// SVG data URL for vintage knob image (from Rotary demo example 1)
const VINTAGE_KNOB_SVG =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iIzMzMyIgc3Ryb2tlPSIjMTExIiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgPGxpbmUgeDE9IjUwIiB5MT0iNTAiIHgyPSI1MCIgeTI9IjEwIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgLz4KPC9zdmc+";

/**
 * A control component that renders a vintage knob using an SVG data image.
 * Based on Rotary demo example 1.
 */
function ClassicVectorKnob({ normalizedValue, className, style }: ClassicVectorKnobProps) {
    // Memoize style object to prevent recreation on every render
    const groupStyle = useMemo(() => {
        return { ...style };
    }, [style]);

    return (
        <g className={className} style={groupStyle}>
            {/* Background circle */}
            <circle cx={50} cy={50} r={40} fill="var(--audioui-surface-1)" />

            {/* Rotary with SVG data image */}
            <Rotary
                cx={50}
                cy={50}
                radius={40}
                normalizedValue={normalizedValue}
                openness={0}
                rotation={0}
                imageHref={VINTAGE_KNOB_SVG}
            />
        </g>
    );
}

/**
 * ViewBox dimensions for the ClassicVectorKnob component.
 */
ClassicVectorKnob.viewBox = {
    width: 100,
    height: 100,
};

/**
 * Label height for the ClassicVectorKnob component.
 */
ClassicVectorKnob.labelHeightUnits = 20;

/**
 * Interaction contract for the ClassicVectorKnob component.
 */
ClassicVectorKnob.interaction = {
    mode: "both",
    direction: "circular",
};

/**
 * Metadata for the ClassicVectorKnob component.
 */
ClassicVectorKnob.title = "Classic Vector Knob";
ClassicVectorKnob.description =
    "A timeless vintage-style knob using embedded SVG vector graphics for pixel-perfect rendering at any resolution";

export default ClassicVectorKnob as ControlComponent;
