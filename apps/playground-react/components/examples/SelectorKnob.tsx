/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import { useMemo } from "react";
import {
    RotaryImage,
    RadialImage,
    ControlComponentViewProps,
    ControlComponent,
    TickRing,
    LabelRing,
} from "@cutoff/audio-ui-react";

export type SelectorKnobProps = ControlComponentViewProps;

// Image assets
const KNOB_SELECTOR_IMAGE = "/images/demo/knob-selector.png";
const KNOB_SELECTOR_BODY_IMAGE = "/images/demo/knob-selector-body.png";
const TICKS_STYLE = { stroke: "var(--audioui-adaptive-default-color)", strokeWidth: 0.5 };

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
            <LabelRing
                cx={50}
                cy={50}
                radius={45}
                openness={180}
                labels={[1, 2, 3, 4, 5]}
                labelClassName="text-foreground font-mono text-[6px] font-medium"
                labelStyle={{ fill: "currentColor" }}
            />
            <TickRing cx={50} cy={50} radius={35} thickness={5} openness={180} style={TICKS_STYLE} count={5} />

            {/* Layer 1: Rotating Selector (Bottom) */}
            <RotaryImage
                cx={50}
                cy={50}
                radius={35}
                normalizedValue={normalizedValue}
                openness={180}
                positions={5}
                imageHref={KNOB_SELECTOR_IMAGE}
            />

            {/* Layer 2: Static Body (Top) */}
            <RadialImage cx={50} cy={50} radius={10} imageHref={KNOB_SELECTOR_BODY_IMAGE} />
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
    direction: "circular",
};

/**
 * Metadata for the SelectorKnob component.
 */
SelectorKnob.title = "Selector Knob";
SelectorKnob.description =
    "A multi-layer knob with discrete positions, featuring a rotating selector image, static body overlay, and custom-rendered text labels via TickRing.";

export default SelectorKnob as ControlComponent;
