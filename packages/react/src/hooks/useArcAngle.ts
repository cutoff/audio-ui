/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { useMemo } from "react";
import { calculateArcAngles, ArcAngleResult } from "@cutoff/audio-ui-core";

export type UseArcAngleResult = ArcAngleResult;

/**
 * Hook to calculate arc angles for rotary controls (ValueRing, RotaryImage components, or any other circular control).
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
    return useMemo(() => {
        return calculateArcAngles(normalizedValue, openness, rotation, bipolar, positions);
    }, [normalizedValue, openness, rotation, bipolar, positions]);
}
