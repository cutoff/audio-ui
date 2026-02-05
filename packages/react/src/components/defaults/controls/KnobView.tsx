/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo } from "react";
import { ControlComponent, KnobVariant } from "@/types";
import { translateKnobRoundness, translateKnobThickness } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";
import ValueRing from "@/primitives/svg/ValueRing";
import RotaryImage from "@/primitives/svg/RotaryImage";
import RadialImage from "@/primitives/svg/RadialImage";

/**
 * Props for the KnobView component
 */
export type KnobViewProps = {
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Whether to start the arc from center (bipolar mode) */
    bipolar?: boolean;
    /** Visual variant of the knob */
    variant?: KnobVariant;
    /** Thickness of the knob's stroke (normalized 0.0-1.0, maps to 1-20) */
    thickness?: number;
    /** Roundness for stroke linecap (normalized 0.0-1.0, 0.0 = square, >0.0 = round, or CSS variable string) */
    roundness?: number | string;
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
function KnobView({
    normalizedValue,
    bipolar = false,
    variant = "abstract",
    thickness,
    roundness,
    openness = 90,
    rotation = 0,
    color: _color, // Prefixed with _ to indicate intentionally unused (kept for API compatibility)
    className,
    svgOverlayRotary = false,
    svgOverlay,
}: KnobViewProps) {
    // Determine default thickness based on variant
    // abstract and simplest: 0.4 (8 units), others: 0.2 (4 units)
    const defaultThickness = variant === "abstract" || variant === "simplest" ? 0.4 : 0.2;
    const effectiveThickness = thickness ?? defaultThickness;

    // Translate normalized thickness to pixel range (1-20)
    const pixelThickness = useMemo(() => {
        return translateKnobThickness(effectiveThickness);
    }, [effectiveThickness]);

    // Translate normalized roundness to stroke-linecap value
    // When roundness is a CSS variable (from theme), use the corresponding linecap variable
    // which is automatically managed by the theme system based on the roundness value.
    // When roundness is a number, infer linecap: 0.0 = square, >0.0 = round
    const strokeLinecap = useMemo(() => {
        if (typeof roundness === "string") {
            // If it's a CSS variable for roundness, use the corresponding linecap variable
            // The linecap variable is automatically set by useThemableProps or setThemeRoundness
            // based on whether roundness is 0.0 (square) or >0.0 (round)
            if (roundness === "var(--audioui-roundness-knob)") {
                return "var(--audioui-linecap-knob)";
            }
            return "round"; // Fallback for other CSS variable strings
        }
        // For numeric roundness, infer linecap: 0 = square, >0 = round
        return translateKnobRoundness(roundness ?? DEFAULT_ROUNDNESS) !== 0 ? "round" : "square";
    }, [roundness]);

    // Reusable ValueRing element for value indication
    // Note: Not memoized since normalizedValue changes frequently during interactions
    // Use CSS variables for colors - CSS handles variant generation via color-mix
    const valueRing = (
        <ValueRing
            cx={50}
            cy={50}
            radius={50}
            normalizedValue={normalizedValue}
            bipolar={bipolar}
            thickness={pixelThickness}
            roundness={strokeLinecap}
            openness={openness}
            rotation={rotation}
            fgArcStyle={{ stroke: "var(--audioui-primary-color)" }}
            bgArcStyle={{ stroke: "var(--audioui-primary-50)" }}
        />
    );

    // Render variant-specific content
    const finalLinecap = typeof strokeLinecap === "string" ? strokeLinecap : (strokeLinecap as "round" | "square");
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
                        <circle cx="50%" cy="50%" r="50%" fill="var(--audioui-knob-cap-fill, #4a4d50)" />
                        <line
                            x1="50%"
                            y1="15%"
                            x2="50%"
                            y2="5%"
                            stroke="var(--audioui-nearwhite)"
                            strokeWidth={(50 - pixelThickness - 6) * 0.1}
                            // @ts-expect-error - strokeLinecap accepts CSS variables (strings) but React types are strict
                            strokeLinecap={finalLinecap}
                        />
                    </RotaryImage>
                </g>
            );

        case "iconCap": {
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
                        <circle cx="50%" cy="50%" r="50%" fill="var(--audioui-knob-cap-fill, #4a4d50)" />
                        <line
                            x1="50%"
                            y1="15%"
                            x2="50%"
                            y2="5%"
                            stroke="var(--audioui-nearwhite)"
                            strokeWidth={(50 - pixelThickness - 6) * 0.1}
                            // @ts-expect-error - strokeLinecap accepts CSS variables (strings) but React types are strict
                            strokeLinecap={finalLinecap}
                        />
                    </RotaryImage>
                    {/* Icon overlay */}
                    {overlayContent}
                </g>
            );
        }

        case "abstract":
        case "simplest":
        default:
            // Default variant and other variants use ValueRing only
            return <g className={className}>{valueRing}</g>;
    }
}

// Create memoized component
const MemoKnobView = React.memo(KnobView);

// Explicitly attach static properties to the memoized component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(MemoKnobView as any).viewBox = { width: 100, height: 100 };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(MemoKnobView as any).labelHeightUnits = 20;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(MemoKnobView as any).interaction = { mode: "both", direction: "circular" } as const;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(MemoKnobView as any).title = "Knob";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(MemoKnobView as any).description = "A rotary knob control with circular arc indicator";

export default MemoKnobView as unknown as ControlComponent<
    Omit<KnobViewProps, "normalizedValue" | "className" | "style">
>;
