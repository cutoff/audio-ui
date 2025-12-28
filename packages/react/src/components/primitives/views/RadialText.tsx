"use client";

import React, { CSSProperties, useMemo } from "react";

export type RadialTextProps = {
    /** X coordinate of the center point */
    cx: number;
    /** Y coordinate of the center point */
    cy: number;
    /** Radius the text should fit within */
    radius: number;
    /** Text content. String for single line, array of strings for multiline */
    text: string | string[];
    /** Font size scaling factor relative to radius (default 0.3) */
    fontSizeScale?: number;
    /** Text anchor alignment (default "middle") */
    textAnchor?: "start" | "middle" | "end";
    /** Dominant baseline alignment (default "middle") */
    dominantBaseline?: "auto" | "middle" | "hanging" | "central" | "text-before-edge" | "text-after-edge";
    /** Line spacing multiplier for multiline text (default 1.2) */
    lineSpacing?: number;
    /** Additional CSS class name */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
};

/**
 * A primitive component that displays static text at radial coordinates.
 * The text is centered at (cx, cy) and sized to fit within the specified radius.
 * Supports multiline text via an array of strings.
 * 
 * This component renders a <text> element (with <tspan> for multiline).
 * It is designed to work alongside Ring and Rotary components in composing knobs.
 * 
 * Note: It is the user's responsibility to ensure text fits within the radius.
 * The component sizes text based on radius but does not prevent overflow.
 */
function RadialText({
    cx,
    cy,
    radius,
    text,
    fontSizeScale = 0.3,
    textAnchor = "middle",
    dominantBaseline = "middle",
    lineSpacing = 1.2,
    className,
    style,
}: RadialTextProps) {
    // Calculate font size based on radius
    const fontSize = useMemo(() => {
        return radius * fontSizeScale;
    }, [radius, fontSizeScale]);

    // Normalize text to array for consistent handling
    const textLines = useMemo(() => {
        return Array.isArray(text) ? text : [text];
    }, [text]);

    // Calculate line height for multiline spacing
    const lineHeight = useMemo(() => {
        return fontSize * lineSpacing;
    }, [fontSize, lineSpacing]);

    // Calculate vertical offset for centering multiline text
    // With dominantBaseline="middle", the text element's y is the middle of the first line
    // To center all lines around cy, we need to shift the first line up by half the total block height
    const verticalOffset = useMemo(() => {
        if (textLines.length === 1) {
            return 0;
        }
        // Total height of the text block (from first line middle to last line middle)
        const totalHeight = (textLines.length - 1) * lineHeight;
        // Shift first line up by half the total height to center the block
        return -totalHeight / 2;
    }, [textLines.length, lineHeight]);

    return (
        <text
            x={cx}
            y={cy}
            textAnchor={textAnchor}
            dominantBaseline={dominantBaseline}
            fontSize={fontSize}
            className={className}
            style={style}
        >
            {textLines.map((line, index) => (
                <tspan
                    key={index}
                    x={cx}
                    dy={index === 0 ? verticalOffset : lineHeight}
                    textAnchor={textAnchor}
                >
                    {line}
                </tspan>
            ))}
        </text>
    );
}

export default React.memo(RadialText);

