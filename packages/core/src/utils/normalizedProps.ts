/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

/**
 * Utility functions for translating normalized (0.0-1.0) roundness and thickness values
 * to component-specific legacy ranges.
 *
 * All components accept normalized values (0.0-1.0) and translate them internally
 * to their legacy ranges for rendering.
 */

/**
 * Clamp a value to the 0.0-1.0 range
 */
export function clampNormalized(value: number): number {
    return Math.max(0.0, Math.min(1.0, value));
}

/**
 * Translate normalized roundness (0.0-1.0) to SvgKnob legacy value.
 * 0.0 = square (legacy: 0), >0.0 = round (legacy: 1+)
 */
export function translateKnobRoundness(normalized: number): number {
    const clamped = clampNormalized(normalized);
    return clamped === 0 ? 0 : 1;
}

export function translateKnobThickness(normalized: number): number {
    const clamped = clampNormalized(normalized);
    return Math.round(1 + clamped * 19);
}

export function translateSliderRoundness(normalized: number): number {
    const clamped = clampNormalized(normalized);
    return Math.round(clamped * 20);
}

export function translateSliderThickness(normalized: number): number {
    const clamped = clampNormalized(normalized);
    return Math.round(1 + clamped * 49);
}

export function translateButtonRoundness(normalized: number): number {
    const clamped = clampNormalized(normalized);
    return Math.round(clamped * 50);
}

export function translateKeybedRoundness(normalized: number): number {
    const clamped = clampNormalized(normalized);
    return Math.round(clamped * 12);
}
