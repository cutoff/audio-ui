"use client";

import { useMemo } from "react";
import { ValueRing, RadialImage, ControlComponentViewProps, ControlComponent } from "@cutoff/audio-ui-react";
import { Volume2 } from "lucide-react";

export type IconKnobProps = ControlComponentViewProps;

// Constants & Styles
const PRIMARY_COLOR = "var(--audioui-adaptive-default-color)";
const FG_ARC_STYLE = { stroke: PRIMARY_COLOR };
const BG_ARC_STYLE = { stroke: `color-mix(in srgb, ${PRIMARY_COLOR} 50%, transparent)`, opacity: 1 };

/**
 * A control component that renders a knob with an icon using RadialImage.
 * Demonstrates how to use icon libraries (like lucide-react) with RadialImage.
 */
function IconKnob({ normalizedValue, className, style }: IconKnobProps) {
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
                thickness={6}
                roundness={true}
                openness={90}
                fgArcStyle={FG_ARC_STYLE}
                bgArcStyle={BG_ARC_STYLE}
            />

            {/* Static icon in center using RadialImage */}
            <RadialImage cx={50} cy={50} radius={15}>
                <Volume2 width="100%" height="100%" strokeWidth={2} className="fill-none stroke-current" />
            </RadialImage>
        </g>
    );
}

/**
 * ViewBox dimensions for the IconKnob component.
 */
IconKnob.viewBox = {
    width: 100,
    height: 100,
};

/**
 * Label height for the IconKnob component.
 */
IconKnob.labelHeightUnits = 20;

/**
 * Interaction contract for the IconKnob component.
 */
IconKnob.interaction = {
    mode: "both",
    direction: "circular",
};

/**
 * Metadata for the IconKnob component.
 */
IconKnob.title = "Icon Knob";
IconKnob.description =
    "A knob featuring a static icon from lucide-react. Demonstrates how to use icon libraries with RadialImage primitive for centered icon display.";

export default IconKnob as ControlComponent;
