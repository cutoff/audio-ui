/**
 * SVG Text Measurement Utilities
 *
 * Provides efficient text measurement for SVG elements with global caching.
 * Designed for high-performance scenarios with many text elements (e.g., 100+ knobs).
 *
 * Key features:
 * - Global cache survives component unmounts
 * - Lazy initialization of measurement SVG element
 * - Supports multiline text with configurable line spacing
 * - Works with arbitrary font styles
 */

/** Text metrics returned from measurement */
export interface TextMetrics {
    /** Total width of the text block */
    width: number;
    /** Total height of the text block */
    height: number;
}

/** Style properties relevant for text measurement */
export interface TextMeasurementStyle {
    fontFamily?: string;
    fontSize?: string | number;
    fontWeight?: string | number;
    fontStyle?: string;
    letterSpacing?: string | number;
}

/** Default line spacing multiplier */
const DEFAULT_LINE_SPACING = 1.2;

/** Default reference text when none provided */
export const DEFAULT_REFERENCE_TEXT = "-127";

/** Global cache for text metrics - survives component unmounts */
const textMetricsCache = new Map<string, TextMetrics>();

/** Lazily initialized measurement SVG element */
let measurementSvg: SVGSVGElement | null = null;

/**
 * Generate a cache key from text lines and style properties.
 * Only includes style properties that affect text measurement.
 */
function getCacheKey(lines: string[], style: TextMeasurementStyle, lineSpacing: number): string {
    const styleKey = [
        style.fontFamily ?? "",
        style.fontSize ?? "",
        style.fontWeight ?? "",
        style.fontStyle ?? "",
        style.letterSpacing ?? "",
    ].join("|");
    return `${lines.join("\n")}::${styleKey}::${lineSpacing}`;
}

/**
 * Get or create the hidden SVG element used for text measurement.
 * The element is created once and reused for all measurements.
 */
function getMeasurementSvg(): SVGSVGElement {
    if (measurementSvg && document.body.contains(measurementSvg)) {
        return measurementSvg;
    }

    measurementSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    measurementSvg.setAttribute("aria-hidden", "true");
    measurementSvg.style.cssText =
        "position:absolute;top:-9999px;left:-9999px;width:0;height:0;overflow:hidden;pointer-events:none;visibility:hidden";
    document.body.appendChild(measurementSvg);
    return measurementSvg;
}

/**
 * Apply style properties to an SVG text element.
 */
function applyTextStyle(textEl: SVGTextElement, style: TextMeasurementStyle): void {
    if (style.fontFamily) {
        textEl.style.fontFamily = style.fontFamily;
    }
    if (style.fontSize !== undefined) {
        textEl.style.fontSize = typeof style.fontSize === "number" ? `${style.fontSize}px` : style.fontSize;
    }
    if (style.fontWeight !== undefined) {
        textEl.style.fontWeight = String(style.fontWeight);
    }
    if (style.fontStyle) {
        textEl.style.fontStyle = style.fontStyle;
    }
    if (style.letterSpacing !== undefined) {
        textEl.style.letterSpacing =
            typeof style.letterSpacing === "number" ? `${style.letterSpacing}px` : style.letterSpacing;
    }
}

/**
 * Measure SVG text dimensions with caching.
 *
 * @param lines - Array of text lines to measure
 * @param style - Font style properties affecting measurement
 * @param lineSpacing - Line spacing multiplier (default 1.2)
 * @returns TextMetrics with width and height
 *
 * @example
 * ```ts
 * const metrics = measureSvgText(["16383", "Hz"], { fontFamily: "monospace" });
 * console.log(metrics.width, metrics.height);
 * ```
 */
export function measureSvgText(
    lines: string[],
    style: TextMeasurementStyle = {},
    lineSpacing: number = DEFAULT_LINE_SPACING
): TextMetrics {
    // Handle empty input
    if (lines.length === 0 || lines.every((line) => line === "")) {
        return { width: 0, height: 0 };
    }

    // Check cache first
    const cacheKey = getCacheKey(lines, style, lineSpacing);
    const cached = textMetricsCache.get(cacheKey);
    if (cached) {
        return cached;
    }

    // Get measurement SVG
    const svg = getMeasurementSvg();

    // Create text element
    const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textEl.setAttribute("x", "0");
    textEl.setAttribute("y", "0");
    textEl.setAttribute("dominant-baseline", "hanging");

    // Apply styles
    applyTextStyle(textEl, style);

    // Determine base font size for line height calculation
    const baseFontSize = style.fontSize
        ? typeof style.fontSize === "number"
            ? style.fontSize
            : parseFloat(style.fontSize) || 16
        : 16;

    const lineHeight = baseFontSize * lineSpacing;

    // Add tspans for each line
    lines.forEach((line, index) => {
        const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.setAttribute("x", "0");
        tspan.setAttribute("dy", index === 0 ? "0" : String(lineHeight));
        tspan.textContent = line;
        textEl.appendChild(tspan);
    });

    // Add to DOM, measure, remove
    svg.appendChild(textEl);
    const bbox = textEl.getBBox();
    svg.removeChild(textEl);

    // Calculate metrics
    // For multiline, height is based on line count and line height
    const metrics: TextMetrics = {
        width: bbox.width,
        height: lines.length === 1 ? bbox.height : (lines.length - 1) * lineHeight + baseFontSize,
    };

    // Cache and return
    textMetricsCache.set(cacheKey, metrics);
    return metrics;
}

/**
 * Calculate the scale factor needed to fit text within a target size.
 *
 * @param metrics - Measured text dimensions
 * @param targetWidth - Target width to fit within
 * @param targetHeight - Target height to fit within
 * @returns Scale factor (can be > 1 for upscaling)
 */
export function calculateTextScale(metrics: TextMetrics, targetWidth: number, targetHeight: number): number {
    if (metrics.width === 0 || metrics.height === 0) {
        return 1;
    }

    const scaleX = targetWidth / metrics.width;
    const scaleY = targetHeight / metrics.height;

    // Use the smaller scale to ensure text fits in both dimensions
    return Math.min(scaleX, scaleY);
}

/**
 * Clear the text metrics cache.
 * Useful for testing or when font resources change.
 */
export function clearTextMetricsCache(): void {
    textMetricsCache.clear();
}

/**
 * Get the current cache size.
 * Useful for debugging and monitoring.
 */
export function getTextMetricsCacheSize(): number {
    return textMetricsCache.size;
}
