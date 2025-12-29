import { useMemo } from "react";

export interface UseArcAngleResult {
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
 * Hook to calculate arc angles for rotary controls (ValueRing, Rotary components, or any other circular control).
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
export function useArcAngle(
    normalizedValue: number,
    openness: number = 90,
    rotation: number = 0,
    bipolar: boolean = false,
    positions?: number
): UseArcAngleResult {
    // Clamp inputs - NO MEMO needed for value as it changes frequently (e.g. during animation)
    const clampedValue = Math.max(0, Math.min(1, normalizedValue));

    // Snap to discrete positions if specified
    const snappedValue = useMemo(() => {
        if (positions === undefined || positions < 1) {
            return clampedValue;
        }
        if (positions === 1) {
            // Single position: always center (0.5)
            return 0.5;
        }
        // For N positions, we have positions 0 to N-1
        // Position i maps to normalizedValue = i / (N - 1)
        // Snap to nearest position
        const position = Math.round(clampedValue * (positions - 1));
        return position / (positions - 1);
    }, [clampedValue, positions]);

    const clampedOpenness = useMemo(() => {
        return Math.max(0, Math.min(360, openness));
    }, [openness]);

    // Calculate angular range based on openness
    // 0 degrees is at 3 o'clock, increasing clockwise.
    // Standard knob (90 openness) goes from approx 225 deg (7:30) to 495 deg (4:30).
    const { maxStartAngle, maxEndAngle, maxArcAngle } = useMemo(() => {
        const start = 180 + clampedOpenness / 2;
        const end = 540 - clampedOpenness / 2;
        return {
            maxStartAngle: start,
            maxEndAngle: end,
            maxArcAngle: end - start,
        };
    }, [clampedOpenness]);

    // Convert normalized value (0-1) to an angle in degrees
    // Use snappedValue for angle calculation when positions are defined
    // NO MEMO needed as snappedValue changes often
    const baseValueToAngle = snappedValue * maxArcAngle + maxStartAngle;

    // Calculate rotated angles (offset by rotation)
    // These are the angles that should be used by components
    const startAngle = useMemo(() => {
        return maxStartAngle - rotation;
    }, [maxStartAngle, rotation]);

    const endAngle = useMemo(() => {
        return maxEndAngle - rotation;
    }, [maxEndAngle, rotation]);

    // Calculate start angle for the value arc
    // For bipolar: start at top (360) minus rotation. For unipolar: start at min angle.
    const valueStartAngle = useMemo(() => {
        if (bipolar) {
            // 360 is top/center
            return 360 - rotation;
        }
        return startAngle;
    }, [bipolar, rotation, startAngle]);

    // NO MEMO needed as baseValueToAngle changes often
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
