"use client";

import React, { CSSProperties, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
    measureSvgText,
    calculateTextScale,
    DEFAULT_REFERENCE_TEXT,
    TextMeasurementStyle,
} from "@cutoff/audio-ui-core";

export type RadialTextProps = {
    /** X coordinate of the center point */
    cx: number;
    /** Y coordinate of the center point */
    cy: number;
    /** Radius the text should fit within */
    radius: number;
    /** Text content to display. String for single line, array for multiline */
    text: string | string[];
    /**
     * Reference text for sizing. The component sizes itself to fit this text.
     * Use the longest expected content (e.g., max value + unit).
     * If omitted, defaults to "-127" as a sensible default for numeric displays.
     */
    referenceText?: string | string[];
    /**
     * Padding factor (0-1). Text fits within radius * padding.
     * Default: 0.85 (15% margin from edge)
     */
    padding?: number;
    /** Text anchor alignment (default "middle") */
    textAnchor?: "start" | "middle" | "end";
    /** Line spacing multiplier for multiline text (default 1.2) */
    lineSpacing?: number;
    /** Additional CSS class name */
    className?: string;
    /** Inline styles - font-family, font-weight, etc. are respected for measurement */
    style?: CSSProperties;
};

/** Base font size used for measurement and rendering */
const BASE_FONT_SIZE = 16;

/**
 * Extract measurement-relevant style properties from CSSProperties.
 */
function extractMeasurementStyle(style?: CSSProperties): TextMeasurementStyle {
    if (!style) return { fontSize: BASE_FONT_SIZE };
    return {
        fontFamily: style.fontFamily as string | undefined,
        fontSize: style.fontSize ?? BASE_FONT_SIZE,
        fontWeight: style.fontWeight,
        fontStyle: style.fontStyle,
        letterSpacing: style.letterSpacing,
    };
}

/**
 * A primitive component that displays text at radial coordinates with automatic sizing.
 *
 * The text is centered at (cx, cy) and scaled to fit within the specified radius.
 * Supports multiline text via an array of strings.
 *
 * Key features:
 * - Automatic text fitting based on referenceText measurement
 * - Global font metrics caching for performance
 * - GPU-accelerated scaling via CSS transform
 * - Supports arbitrary font styling
 *
 * This component renders a <g> element containing a <text> element (with <tspan> for multiline).
 * It is designed to work alongside Ring and Rotary components in composing knobs.
 *
 * @example
 * ```tsx
 * // Basic usage with dynamic value
 * <RadialText
 *   cx={50} cy={50} radius={30}
 *   text={currentValue}
 *   referenceText="100"
 * />
 *
 * // Multiline with value and unit
 * <RadialText
 *   cx={50} cy={50} radius={30}
 *   text={[formattedValue, "dB"]}
 *   referenceText={["-60.0", "dB"]}
 * />
 * ```
 */
function RadialText({
    cx,
    cy,
    radius,
    text,
    referenceText,
    padding = 0.85,
    textAnchor = "middle",
    lineSpacing = 1.2,
    className,
    style,
}: RadialTextProps) {
    // Normalize text to array for consistent handling
    const textLines = useMemo(() => {
        return Array.isArray(text) ? text : [text];
    }, [text]);

    // Normalize reference text - use provided, or default
    const referenceLines = useMemo(() => {
        if (referenceText) {
            return Array.isArray(referenceText) ? referenceText : [referenceText];
        }
        return [DEFAULT_REFERENCE_TEXT];
    }, [referenceText]);

    // Extract measurement-relevant styles
    const measurementStyle = useMemo(() => extractMeasurementStyle(style), [style]);

    // Track if measurement has been done for current reference
    const measurementKey = useRef<string>("");

    // Scale factor for fitting text
    const [scale, setScale] = useState(1);

    // Calculate line height
    const lineHeight = useMemo(() => {
        const fontSize =
            typeof measurementStyle.fontSize === "number"
                ? measurementStyle.fontSize
                : parseFloat(String(measurementStyle.fontSize)) || BASE_FONT_SIZE;
        return fontSize * lineSpacing;
    }, [measurementStyle.fontSize, lineSpacing]);

    // Measure reference text and calculate scale
    useLayoutEffect(() => {
        // Create a key to track if we need to re-measure
        const currentKey = `${referenceLines.join("|")}::${JSON.stringify(measurementStyle)}::${radius}::${padding}`;

        if (measurementKey.current === currentKey) {
            return; // Already measured for this configuration
        }

        const metrics = measureSvgText(referenceLines, measurementStyle, lineSpacing);

        if (metrics.width > 0 && metrics.height > 0) {
            const targetDiameter = radius * 2 * padding;
            const newScale = calculateTextScale(metrics, targetDiameter, targetDiameter);
            setScale(newScale);
        }

        measurementKey.current = currentKey;
    }, [referenceLines, measurementStyle, lineSpacing, radius, padding]);

    // Warn in development if text is longer than reference
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((import.meta as any).env?.DEV) {
        const textStr = textLines.join("");
        const refStr = referenceLines.join("");
        if (textStr.length > refStr.length) {
            console.warn(
                `[RadialText] Text "${textStr}" is longer than referenceText "${refStr}". ` +
                    `This may cause overflow. Consider updating referenceText to match the longest expected content.`
            );
        }
    }

    // Get base font size for rendering
    const baseFontSize = useMemo(() => {
        return typeof measurementStyle.fontSize === "number"
            ? measurementStyle.fontSize
            : parseFloat(String(measurementStyle.fontSize)) || BASE_FONT_SIZE;
    }, [measurementStyle.fontSize]);

    // Calculate vertical offset for centering multiline text
    // Note: We add a small baseline correction (0.1em) to compensate for the fact that
    // most fonts have more ascender height than descender height. This is especially
    // noticeable with numeric text (0-9, .) which has no descenders at all.
    // The "central" baseline centers on the em-box, but the visual center of glyphs
    // is typically slightly higher. This correction shifts text down to appear visually centered.
    const baselineCorrection = baseFontSize * 0.1;

    const verticalOffset = useMemo(() => {
        if (textLines.length === 1) {
            return baselineCorrection;
        }
        // Total height of the text block (from first line middle to last line middle)
        const totalHeight = (textLines.length - 1) * lineHeight;
        // Shift first line up by half the total height to center the block
        // Then add baseline correction to shift everything down slightly
        return -totalHeight / 2 + baselineCorrection;
    }, [textLines.length, lineHeight, baselineCorrection]);

    // Combine user styles with transform
    // Note: We intentionally do NOT use transformBox: "fill-box" here.
    // In SVG, the default transform-origin is relative to the SVG coordinate system,
    // which is what we want for centering at (cx, cy). Using "fill-box" would make
    // the origin relative to the element's bounding box, breaking the centering.
    const textStyle = useMemo((): CSSProperties => {
        return {
            ...style,
            transform: `scale(${scale})`,
            transformOrigin: `${cx}px ${cy}px`,
        };
    }, [style, scale, cx, cy]);

    return (
        <text
            x={cx}
            y={cy}
            textAnchor={textAnchor}
            dominantBaseline="central"
            fontSize={baseFontSize}
            className={className}
            style={textStyle}
        >
            {textLines.map((line, index) => (
                <tspan key={index} x={cx} dy={index === 0 ? verticalOffset : lineHeight}>
                    {line}
                </tspan>
            ))}
        </text>
    );
}

export default React.memo(RadialText);
