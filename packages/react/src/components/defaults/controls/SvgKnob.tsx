"use client";

import React, { useMemo } from "react";
import { generateColorVariants, getAdaptiveDefaultColor } from "@cutoff/audio-ui-core";
import { ControlComponent, KnobVariant } from "@/types";
import { translateKnobRoundness, translateKnobThickness } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";
import ValueRing from "@/primitives/svg/ValueRing";
import RotaryImage from "@/primitives/svg/RotaryImage";
import RadialImage from "@/primitives/svg/RadialImage";

/**
 * Props for the SvgKnob component
 */
export type SvgKnobProps = {
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Whether to start the arc from center (bipolar mode) */
    bipolar?: boolean;
    /** Visual variant of the knob */
    variant?: KnobVariant;
    /** Thickness of the knob's stroke (normalized 0.0-1.0, maps to 1-20) */
    thickness?: number;
    /** Roundness for stroke linecap (normalized 0.0-1.0, 0.0 = square, >0.0 = round) */
    roundness?: number;
    /** Openness of the ring in degrees (value between 0-360º; 0º: closed; 90º: 3/4 open; 180º: half-circle;) */
    openness?: number;
    /** Optional rotation angle offset in degrees */
    rotation?: number;
    /** Resolved color string */
    color?: string;
    /** Additional CSS class name */
    className?: string;
    /**
     * Whether to use RotaryImage (true) or RadialImage (false) for iconCap overlay.
     * When true, the icon rotates with the knob value; when false, the icon remains static.
     * Only applies when variant is "iconCap" and svgOverlay is provided.
     * @default false
     */
    svgOverlayRotary?: boolean;
    /**
     * SVG content to display as overlay in iconCap variant.
     * Typically an icon component (e.g., wave icons) that will be rendered at the center of the knob.
     * The icon inherits color via currentColor, so it will adapt to light/dark mode automatically.
     * Only used when variant is "iconCap".
     */
    svgOverlay?: React.ReactNode;
};

/**
 * Pure SVG presentation component for a knob.
 * Renders background and foreground arcs as the visual indicator.
 *
 * Center content (text, icons, images) is rendered via the `overlay` prop
 * on AdaptiveBox.Svg, which places HTML content OUTSIDE the SVG to avoid
 * Safari's foreignObject rendering bugs with container queries.
 *
 * @param normalizedValue - Value between 0 and 1
 * @param bipolar - Whether to start arc from center (default false)
 * @param variant - Visual variant of the knob (default "abstract")
 * @param thickness - Normalized thickness 0.0-1.0 (default: 0.4 for abstract/simplest, 0.2 for others; maps to 1-20)
 * @param roundness - Normalized roundness 0.0-1.0 (default 0.3, 0.0 = square, >0.0 = round)
 * @param openness - Openness of the ring in degrees (default 90)
 * @param rotation - Optional rotation angle offset in degrees (default 0)
 * @param color - Resolved color string
 * @param className - Optional CSS class
 * @param svgOverlayRotary - Whether to use RotaryImage (true) or RadialImage (false) for iconCap overlay (default false)
 * @param svgOverlay - SVG content to display as overlay in iconCap variant (typically an icon component)
 */
function SvgKnob({
    normalizedValue,
    bipolar = false,
    variant = "abstract",
    thickness,
    roundness = DEFAULT_ROUNDNESS,
    openness = 90,
    rotation = 0,
    color,
    className,
    svgOverlayRotary = false,
    svgOverlay,
}: SvgKnobProps) {
    // Determine default thickness based on variant
    // abstract and simplest: 0.4 (8 units), others: 0.2 (4 units)
    const defaultThickness = variant === "abstract" || variant === "simplest" ? 0.4 : 0.2;
    const effectiveThickness = thickness ?? defaultThickness;

    // Translate normalized thickness to pixel range (1-20)
    const pixelThickness = useMemo(() => {
        return translateKnobThickness(effectiveThickness);
    }, [effectiveThickness]);

    // Translate normalized roundness to boolean (0 = square, >0 = round)
    const isRound = useMemo(() => {
        return translateKnobRoundness(roundness) !== 0;
    }, [roundness]);

    // Generate color variants
    const colorVariants = useMemo(
        () => generateColorVariants(color ?? getAdaptiveDefaultColor(), "transparency"),
        [color]
    );

    // Reusable ValueRing element for value indication
    // Note: Not memoized since normalizedValue changes frequently during interactions
    const valueRing = (
        <ValueRing
            cx={50}
            cy={50}
            radius={50}
            normalizedValue={normalizedValue}
            bipolar={bipolar}
            thickness={pixelThickness}
            roundness={isRound}
            openness={openness}
            rotation={rotation}
            fgArcStyle={{ stroke: colorVariants.primary }}
            bgArcStyle={{ stroke: colorVariants.primary50 }}
        />
    );

    // Render variant-specific content
    switch (variant) {
        case "plainCap":
            return (
                <g className={className}>
                    {valueRing}

                    <RotaryImage
                        cx={50}
                        cy={50}
                        radius={50 - pixelThickness - 6}
                        normalizedValue={normalizedValue}
                        openness={openness}
                        rotation={rotation}
                    >
                        <circle cx="50%" cy="50%" r="50%" fill="#4A4D50" />
                        <line
                            x1="50%"
                            y1="15%"
                            x2="50%"
                            y2="5%"
                            stroke="var(--audioui-nearwhite)"
                            strokeWidth={(50 - pixelThickness - 6) * 0.1}
                            strokeLinecap={isRound ? "round" : "square"}
                        />
                    </RotaryImage>
                </g>
            );

        case "iconCap":
            // iconCap inherits from plainCap and adds an overlay
            const iconRadius = (50 - pixelThickness - 6) * 0.35;
            // Get the adaptive color for the icon (icons use currentColor)
            const overlayContent = svgOverlay ? (
                svgOverlayRotary ? (
                    <RotaryImage
                        cx={50}
                        cy={50}
                        radius={iconRadius}
                        normalizedValue={normalizedValue}
                        openness={openness}
                        rotation={rotation}
                        style={{ color: "var(--audioui-nearwhite)" }}
                    >
                        {svgOverlay}
                    </RotaryImage>
                ) : (
                    <RadialImage cx={50} cy={50} radius={iconRadius} style={{ color: "var(--audioui-nearwhite)" }}>
                        {svgOverlay}
                    </RadialImage>
                )
            ) : null;

            return (
                <g className={className}>
                    {valueRing}
                    {/* PlainCap content */}
                    <RotaryImage
                        cx={50}
                        cy={50}
                        radius={50 - pixelThickness - 6}
                        normalizedValue={normalizedValue}
                        openness={openness}
                        rotation={rotation}
                    >
                        <circle cx="50%" cy="50%" r="50%" fill="#4A4D50" />
                        <line
                            x1="50%"
                            y1="15%"
                            x2="50%"
                            y2="5%"
                            stroke="var(--audioui-nearwhite)"
                            strokeWidth={(50 - pixelThickness - 6) * 0.1}
                            strokeLinecap={isRound ? "round" : "square"}
                        />
                    </RotaryImage>
                    {/* Icon overlay */}
                    {overlayContent}
                </g>
            );

        case "abstract":
        case "simplest":
        default:
            // Default variant and other variants use ValueRing only
            return <g className={className}>{valueRing}</g>;
    }
}

// Create memoized component
const MemoSvgKnob = React.memo(SvgKnob);

// Explicitly attach static properties to the memoized component
(MemoSvgKnob as any).viewBox = { width: 100, height: 100 };
(MemoSvgKnob as any).labelHeightUnits = 20;
(MemoSvgKnob as any).interaction = { mode: "both", direction: "circular" } as const;
(MemoSvgKnob as any).title = "Knob";
(MemoSvgKnob as any).description = "A rotary knob control with circular arc indicator";

export default MemoSvgKnob as unknown as ControlComponent<
    Omit<SvgKnobProps, "normalizedValue" | "className" | "style">
>;
