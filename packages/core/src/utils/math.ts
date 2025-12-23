/**
 * Shared SVG helper utilities for audio-ui components
 */

/**
 * Represents the dimensions and position of a rectangular zone within the SVG
 */
export type Zone = {
    /** X coordinate of the zone */
    x: number;
    /** Y coordinate of the zone */
    y: number;
    /** Width of the zone */
    w: number;
    /** Height of the zone */
    h: number;
};

/**
 * Represents the dimensions of the filled portion of the slider
 */
export type FilledZone = {
    /** X coordinate where the fill starts (for horizontal) */
    x?: number;
    /** Y coordinate where the fill starts (for vertical) */
    y?: number;
    /** Width of the filled area (for horizontal) */
    w?: number;
    /** Height of the filled area (for vertical) */
    h?: number;
};

/**
 * Convert polar coordinates to Cartesian coordinates
 *
 * @param centerX - X coordinate of the center point
 * @param centerY - Y coordinate of the center point
 * @param radius - Radius from center
 * @param angleInDegrees - Angle in degrees
 * @returns Object with x and y Cartesian coordinates
 */
export const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
): { x: number; y: number } => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
};

/**
 * Helper function to calculate a bounded ratio between 0 and 1
 *
 * @param value - The value to convert to a ratio
 * @param min - The minimum value (corresponds to ratio = 0)
 * @param max - The maximum value (corresponds to ratio = 1)
 * @returns A ratio between 0 and 1 representing where value falls in the min-max range
 */
export const calculateBoundedRatio = (value: number, min: number, max: number): number => {
    // Ensure value is within bounds
    const boundedValue = Math.max(min, Math.min(value, max));
    // Calculate ratio and ensure it's between 0 and 1
    const ratio = (boundedValue - min) / (max - min);
    return Math.max(0, Math.min(ratio, 1));
};

/**
 * Calculates the filled zone dimensions for a slider
 *
 * This function determines how to draw the filled portion of a slider based on:
 * - The slider's orientation (horizontal or vertical)
 * - Whether it's in bipolar mode (has a center point)
 * - The current value relative to min, max, and center
 *
 * @param mainZone - The dimensions of the slider's background
 * @param value - The current value (will be bounded to min-max range)
 * @param min - The minimum value
 * @param max - The maximum value
 * @param center - Optional center point for bipolar mode
 * @param isHorizontal - Whether the slider is horizontal (false = vertical)
 * @returns Dimensions of the filled portion (x,w for horizontal; y,h for vertical)
 *
 * For horizontal sliders:
 * - Normal mode: Fills from left edge, growing rightward as value increases
 * - Bipolar mode:
 *   - When value > center: Fills from center, growing rightward
 *   - When value < center: Fills from center, growing leftward (DJ crossfader style)
 *
 * For vertical sliders:
 * - Normal mode: Fills from bottom edge, growing upward as value increases
 * - Bipolar mode:
 *   - When value > center: Fills from center, growing upward
 *   - When value < center: Fills from center, growing downward
 */
export const computeFilledZone = (
    mainZone: Zone,
    value: number,
    min: number,
    max: number,
    center?: number,
    isHorizontal: boolean = false
): FilledZone => {
    // Ensure value is within bounds (min-max range)
    const boundedValue = Math.max(min, Math.min(value, max));

    // Select the dimension and position properties based on orientation
    const dimension = isHorizontal ? mainZone.w : mainZone.h;
    const position = isHorizontal ? mainZone.x : mainZone.y;

    // Normal mode (no center point)
    if (center === undefined) {
        // Calculate the ratio and size
        const ratio = calculateBoundedRatio(boundedValue, min, max);
        const size = dimension * ratio;

        if (isHorizontal) {
            // Horizontal: Fill from left to right
            return {
                x: position,
                w: size,
            };
        } else {
            // Vertical: Fill from bottom to top (inverted position)
            return {
                y: position + (dimension - size),
                h: size,
            };
        }
    }

    // Bipolar mode calculations
    const halfSize = dimension / 2;
    const centerPoint = position + halfSize;

    if (boundedValue >= center) {
        // Value >= center (right/upper half)
        const bipolarRatio = calculateBoundedRatio(boundedValue, center, max);
        const bipolarSize = halfSize * bipolarRatio;

        if (isHorizontal) {
            // Horizontal: Fill from center to right
            return {
                x: centerPoint,
                w: bipolarSize,
            };
        } else {
            // Vertical: Fill from center to top (inverted position)
            return {
                y: position + (halfSize - bipolarSize),
                h: bipolarSize,
            };
        }
    } else {
        // Value < center (left/lower half)
        // For this case, we need to invert the ratio because:
        // - When value = min: We want bipolarRatio = 1 (maximum fill)
        // - When value = center: We want bipolarRatio = 0 (minimum fill)
        // The inversion (1 - ratio) achieves this transformation efficiently
        const bipolarRatio = 1 - calculateBoundedRatio(boundedValue, min, center);
        const bipolarSize = halfSize * bipolarRatio;

        if (isHorizontal) {
            // Horizontal: Fill from center to left (DJ crossfader style)
            return {
                x: centerPoint - bipolarSize,
                w: bipolarSize,
            };
        } else {
            // Vertical: Fill from center to bottom
            return {
                y: centerPoint,
                h: bipolarSize,
            };
        }
    }
};
