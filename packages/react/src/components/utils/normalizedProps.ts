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
 * Translate normalized roundness (0.0-1.0) to SvgKnob legacy value
 * - 0.0 = square (legacy: 0)
 * - >0.0 = round (legacy: any value > 0, typically 1+)
 */
export function translateKnobRoundness(normalized: number): number {
    const clamped = clampNormalized(normalized);
    return clamped === 0 ? 0 : 1; // Binary: square or round
}

/**
 * Translate normalized thickness (0.0-1.0) to SvgKnob legacy value
 * Legacy range: 1-20
 */
export function translateKnobThickness(normalized: number): number {
    const clamped = clampNormalized(normalized);
    // Linear mapping: 0.0 -> 1, 1.0 -> 20
    return Math.round(1 + clamped * 19);
}

/**
 * Translate normalized roundness (0.0-1.0) to SvgSlider legacy value
 * Legacy range: 0-20
 */
export function translateSliderRoundness(normalized: number): number {
    const clamped = clampNormalized(normalized);
    // Linear mapping: 0.0 -> 0, 1.0 -> 20
    return Math.round(clamped * 20);
}

/**
 * Translate normalized thickness (0.0-1.0) to SvgSlider legacy value
 * Legacy range: 1-50
 */
export function translateSliderThickness(normalized: number): number {
    const clamped = clampNormalized(normalized);
    // Linear mapping: 0.0 -> 1, 1.0 -> 50
    return Math.round(1 + clamped * 49);
}

/**
 * Translate normalized roundness (0.0-1.0) to SvgButton legacy value
 * Legacy range: 0-50
 */
export function translateButtonRoundness(normalized: number): number {
    const clamped = clampNormalized(normalized);
    // Linear mapping: 0.0 -> 0, 1.0 -> 50
    return Math.round(clamped * 50);
}

/**
 * Translate normalized roundness (0.0-1.0) to Keybed legacy value
 * Legacy range: 0-12
 */
export function translateKeybedRoundness(normalized: number): number {
    const clamped = clampNormalized(normalized);
    // Linear mapping: 0.0 -> 0, 1.0 -> 12
    return Math.round(clamped * 12);
}
