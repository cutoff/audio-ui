/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import { useMemo } from "react";
import { ValueRing, RotaryImage, ControlComponentViewProps, ControlComponent } from "@cutoff/audio-ui-react";

export type HtmlContentKnobProps = ControlComponentViewProps;

// Constants & Styles
const PRIMARY_COLOR = "var(--audioui-adaptive-default-color)";
const FG_ARC_STYLE = { stroke: PRIMARY_COLOR };
const BG_ARC_STYLE = { stroke: `color-mix(in srgb, ${PRIMARY_COLOR} 50%, transparent)`, opacity: 1 };

/**
 * A custom knob view component that renders a ring indicator with a rotating line.
 *
 * Center content (text, icons) is rendered via the `overlay` prop on AdaptiveBox.Svg,
 * which is handled automatically by ContinuousControl when you pass children.
 * This approach avoids Safari's foreignObject rendering bugs.
 *
 * Usage with ContinuousControl:
 * ```tsx
 * <ContinuousControl view={HtmlContentKnob} value={value} onChange={onChange}>
 *     <div style={{ fontSize: "24px", fontWeight: 700 }}>42.0</div>
 *     <div style={{ fontSize: "10px", opacity: 0.6 }}>%</div>
 * </ContinuousControl>
 * ```
 */
function HtmlContentKnob({ normalizedValue, className, style }: HtmlContentKnobProps) {
    // Memoize style object to prevent recreation on every render
    const groupStyle = useMemo(() => {
        return { ...style };
    }, [style]);

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

            {/* Center content is rendered via overlay prop, not inside SVG */}
        </g>
    );
}

/**
 * ViewBox dimensions for the HtmlContentKnob component.
 */
HtmlContentKnob.viewBox = {
    width: 100,
    height: 100,
};

/**
 * Label height for the HtmlContentKnob component.
 */
HtmlContentKnob.labelHeightUnits = 15;

/**
 * Interaction contract for the HtmlContentKnob component.
 */
HtmlContentKnob.interaction = {
    mode: "both",
    direction: "circular",
};

/**
 * Metadata for the HtmlContentKnob component.
 */
HtmlContentKnob.title = "Custom Knob View";
HtmlContentKnob.description =
    "A custom knob view with ring indicator and rotating line. Center content is rendered via HTML overlay (outside SVG) for Safari compatibility.";

export default HtmlContentKnob as ControlComponent;
