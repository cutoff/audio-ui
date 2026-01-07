/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

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
 * Convert polar coordinates to Cartesian coordinates.
 *
 * This function is used extensively in circular controls (knobs, rotary switches) to position
 * elements around a circle. The angle system follows SVG conventions where 0° is at 3 o'clock
 * and angles increase clockwise.
 *
 * @param centerX - X coordinate of the center point
 * @param centerY - Y coordinate of the center point
 * @param radius - Radius from center
 * @param angleInDegrees - Angle in degrees (0° = 3 o'clock, increasing clockwise)
 * @returns Object with x and y Cartesian coordinates
 *
 * @example
 * ```ts
 * // Position at 12 o'clock (top center)
 * const { x, y } = polarToCartesian(50, 50, 30, 360);
 * // x ≈ 50, y ≈ 20
 * ```
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
 * Calculate a bounded ratio between 0 and 1 for a value within a min-max range.
 *
 * This utility ensures the value is clamped to the range before calculating the ratio,
 * preventing division by zero and handling edge cases gracefully.
 *
 * @param value - The value to convert to a ratio
 * @param min - The minimum value (corresponds to ratio = 0)
 * @param max - The maximum value (corresponds to ratio = 1)
 * @returns A ratio between 0 and 1 representing where value falls in the min-max range
 *
 * @example
 * ```ts
 * calculateBoundedRatio(50, 0, 100); // 0.5
 * calculateBoundedRatio(150, 0, 100); // 1.0 (clamped)
 * calculateBoundedRatio(-10, 0, 100); // 0.0 (clamped)
 * ```
 */
export const calculateBoundedRatio = (value: number, min: number, max: number): number => {
    const boundedValue = Math.max(min, Math.min(value, max));
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
    const boundedValue = Math.max(min, Math.min(value, max));

    const dimension = isHorizontal ? mainZone.w : mainZone.h;
    const position = isHorizontal ? mainZone.x : mainZone.y;

    if (center === undefined) {
        const ratio = calculateBoundedRatio(boundedValue, min, max);
        const size = dimension * ratio;

        if (isHorizontal) {
            return {
                x: position,
                w: size,
            };
        } else {
            // Vertical: fill from bottom to top (inverted position)
            return {
                y: position + (dimension - size),
                h: size,
            };
        }
    }

    const halfSize = dimension / 2;
    const centerPoint = position + halfSize;

    if (boundedValue >= center) {
        const bipolarRatio = calculateBoundedRatio(boundedValue, center, max);
        const bipolarSize = halfSize * bipolarRatio;

        if (isHorizontal) {
            return {
                x: centerPoint,
                w: bipolarSize,
            };
        } else {
            // Vertical: fill from center to top (inverted position)
            return {
                y: position + (halfSize - bipolarSize),
                h: bipolarSize,
            };
        }
    } else {
        // Value < center: invert ratio so min -> max fill, center -> min fill
        const bipolarRatio = 1 - calculateBoundedRatio(boundedValue, min, center);
        const bipolarSize = halfSize * bipolarRatio;

        if (isHorizontal) {
            // Horizontal: fill from center to left (DJ crossfader style)
            return {
                x: centerPoint - bipolarSize,
                w: bipolarSize,
            };
        } else {
            return {
                y: centerPoint,
                h: bipolarSize,
            };
        }
    }
};

/**
 * Result of arc angle calculations
 */
export interface ArcAngleResult {
    /** Normalized value (0-1, clamped) */
    normalizedValue: number;
    /** Openness in degrees (0-360, clamped) */
    openness: number;
    /** Start angle of the arc range in degrees (offset by rotation) */
    startAngle: number;
    /** End angle of the arc range in degrees (offset by rotation) */
    endAngle: number;
    /** Current angle in degrees based on normalized value (offset by rotation) */
    valueToAngle: number;
    /** Start angle for the value arc (foreground). Handles bipolar logic (starts at center) vs unipolar (starts at range start). */
    valueStartAngle: number;
}

/**
 * Calculates arc angles for rotary controls (ValueRing, RotaryImage components, or any other circular control).
 *
 * Calculates the angular range based on openness and converts a normalized value (0-1)
 * to an angle within that range.
 *
 * The angle system:
 * - 0 degrees is at 3 o'clock, increasing clockwise
 * - Standard knob (90° openness) goes from ~225° (7:30) to ~495° (4:30)
 * - 360° corresponds to UP (12 o'clock)
 *
 * @param normalizedValue Normalized value between 0 and 1
 * @param openness Openness of the arc in degrees (0-360, default 90)
 * @param rotation Rotation angle offset in degrees (default 0)
 * @param bipolar Whether to start the value arc from the center (12 o'clock) instead of the start angle (default false)
 * @param positions Optional number of discrete positions. When defined, the value will snap to the nearest position. Defaults to undefined (continuous mode).
 * @returns Calculated angles and normalized values
 */
export function calculateArcAngles(
    normalizedValue: number,
    openness: number = 90,
    rotation: number = 0,
    bipolar: boolean = false,
    positions?: number
): ArcAngleResult {
    const clampedValue = Math.max(0, Math.min(1, normalizedValue));

    let snappedValue = clampedValue;
    if (positions !== undefined && positions >= 1) {
        if (positions === 1) {
            snappedValue = 0.5;
        } else {
            // For N positions: positions 0 to N-1, position i maps to normalizedValue = i / (N - 1)
            const position = Math.round(clampedValue * (positions - 1));
            snappedValue = position / (positions - 1);
        }
    }

    const clampedOpenness = Math.max(0, Math.min(360, openness));

    // Calculate angular range: 0° is at 3 o'clock, increasing clockwise
    // Standard knob (90° openness) goes from ~225° (7:30) to ~495° (4:30)
    const start = 180 + clampedOpenness / 2;
    const end = 540 - clampedOpenness / 2;
    const maxStartAngle = start;
    const maxEndAngle = end;
    const maxArcAngle = end - start;

    const baseValueToAngle = snappedValue * maxArcAngle + maxStartAngle;

    const startAngle = maxStartAngle - rotation;
    const endAngle = maxEndAngle - rotation;

    // For bipolar: start at top (360°) minus rotation. For unipolar: start at min angle
    let valueStartAngle = startAngle;
    if (bipolar) {
        valueStartAngle = 360 - rotation;
    }

    const valueToAngle = baseValueToAngle - rotation;

    return {
        normalizedValue: snappedValue,
        openness: clampedOpenness,
        startAngle,
        endAngle,
        valueToAngle,
        valueStartAngle,
    };
}
