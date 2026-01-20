/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

/**
 * Shared SVG helper utilities for audio-ui components
 */

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
 *
 * @example
 * ```ts
 * // Standard knob at 50% value
 * const result = calculateArcAngles(0.5, 90);
 * // result.valueToAngle = 360 (12 o'clock)
 * // result.startAngle = 225 (7:30)
 * // result.endAngle = 495 (4:30)
 *
 * // Bipolar knob (pan control) at center
 * const bipolar = calculateArcAngles(0.5, 90, 0, true);
 * // bipolar.valueStartAngle = 360 (starts from center)
 *
 * // Discrete positions (5-way switch)
 * const discrete = calculateArcAngles(0.37, 90, 0, false, 5);
 * // discrete.normalizedValue = 0.25 (snapped to nearest position)
 * ```
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

/**
 * Calculates the cursor Y position for linear controls (sliders, faders).
 *
 * The cursor represents the current value position along a linear strip.
 * The strip extends along the Y-axis (in unrotated coordinate space) from
 * (cy - length/2) to (cy + length/2).
 *
 * The cursor position is independent of bipolar mode - it always maps:
 * - value 0 = bottom (cy + length/2)
 * - value 1 = top (cy - length/2)
 *
 * Bipolar mode only affects how the rectangle is drawn (from center vs from bottom),
 * not the cursor position itself.
 *
 * @param cy Y coordinate of the strip center point
 * @param length Length of the strip
 * @param normalizedValue Normalized value between 0 and 1
 * @returns Y coordinate of the cursor center
 *
 * @example
 * ```ts
 * // Cursor moves from bottom to top based on value
 * const cursorY = calculateLinearPosition(150, 260, 0.65);
 * // cursorY = 31 (65% from bottom to top)
 * ```
 */
export function calculateLinearPosition(cy: number, length: number, normalizedValue: number): number {
    // Clamp normalized value to valid range [0, 1]
    const clampedValue = Math.max(0, Math.min(1, normalizedValue));

    // Cursor position: value 0 maps to bottom (cy + length/2), value 1 maps to top (cy - length/2)
    // Interpolate from bottom to top
    const bottomY = cy + length / 2;
    return bottomY - clampedValue * length;
}
