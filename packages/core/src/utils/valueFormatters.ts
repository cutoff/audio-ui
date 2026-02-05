/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

/**
 * Collection of reusable value formatters for control components
 */

/**
 * Calculates the center value for a range according to MIDI conventions.
 *
 * This is used for bipolar controls (pan, modulation depth) where the center point
 * represents zero or neutral. The formula ensures proper centering for both even
 * and odd ranges.
 *
 * @param min The minimum value
 * @param max The maximum value
 * @returns The center value according to MIDI conventions (floor((max - min + 1) / 2) + min)
 *
 * @example
 * ```ts
 * calculateCenterValue(-64, 63); // 0 (bipolar 7-bit MIDI)
 * calculateCenterValue(0, 100); // 50
 * ```
 */
export const calculateCenterValue = (min: number, max: number): number => {
    return Math.floor((max - min + 1) / 2) + min;
};

/**
 * Formats a value with a bipolar display (adds + sign for positive values).
 *
 * This is useful for displaying values that can be positive or negative, such as
 * pan controls or modulation depth. Zero and negative values are displayed as-is,
 * while positive values get a "+" prefix.
 *
 * @param value The value to format
 * @returns Formatted string with + prefix for positive values
 *
 * @example
 * ```ts
 * bipolarFormatter(50); // "+50"
 * bipolarFormatter(-50); // "-50"
 * bipolarFormatter(0); // "0"
 * ```
 */
export const bipolarFormatter = (value: number): string => {
    return value > 0 ? `+${value}` : value.toString();
};

/**
 * Formats a value with MIDI bipolar convention (shifts value by center value).
 *
 * This formatter is designed for MIDI-style bipolar parameters where the raw value
 * is in the range [min, max], but you want to display it as an offset from center.
 * For example, a pan control with range [0, 127] centered at 64 would display as
 * "+3" when the value is 67.
 *
 * @param value The value to format
 * @param min The minimum value
 * @param max The maximum value
 * @returns Formatted string with the value shifted by center value
 *
 * @example
 * ```ts
 * midiBipolarFormatter(67, 0, 127); // "+3" (67 - 64 = 3)
 * midiBipolarFormatter(60, 0, 127); // "-4" (60 - 64 = -4)
 * ```
 */
export const midiBipolarFormatter = (value: number, min: number, max: number): string => {
    const centerValue = calculateCenterValue(min, max);
    const shiftedValue = value - centerValue;
    return bipolarFormatter(shiftedValue);
};

/**
 * Creates a formatter function that appends a unit suffix to values.
 *
 * This is a higher-order function that returns a formatter. Useful for creating
 * reusable formatters for parameters with units (dB, Hz, ms, etc.).
 *
 * @param unit The unit to append (e.g., "dB", "Hz", "ms")
 * @returns A formatter function that appends the unit
 *
 * @example
 * ```ts
 * const dbFormatter = withUnit("dB");
 * dbFormatter(-6.0); // "-6.0dB"
 *
 * // Can be combined with other formatters
 * const formatter = combineFormatters(withPrecision(1), withUnit("Hz"));
 * formatter(440.5); // "440.5Hz"
 * ```
 */
export const withUnit = (unit: string) => {
    return (value: number): string => `${value}${unit}`;
};

/**
 * Creates a formatter function that formats values with fixed decimal precision.
 *
 * This is a higher-order function that returns a formatter. Useful for ensuring
 * consistent decimal display across your application.
 *
 * @param precision Number of decimal places (0-20)
 * @returns A formatter function that formats with the specified precision
 *
 * @example
 * ```ts
 * const twoDecimals = withPrecision(2);
 * twoDecimals(3.14159); // "3.14"
 *
 * // Can be combined with other formatters
 * const formatter = combineFormatters(withPrecision(1), withUnit("dB"));
 * formatter(-6.02); // "-6.0dB"
 * ```
 */
export const withPrecision = (precision: number) => {
    return (value: number): string => value.toFixed(precision);
};

/**
 * Combines multiple formatters into a single formatter function.
 *
 * Formatters are applied in sequence, with each formatter receiving the output
 * of the previous one (after parsing back to a number if needed). This allows
 * you to compose complex formatting pipelines.
 *
 * @param formatters Array of formatter functions to apply in sequence
 * @returns A formatter function that applies all formatters in sequence
 *
 * @example
 * ```ts
 * // Combine precision and unit formatting
 * const formatter = combineFormatters(
 *   withPrecision(1),
 *   withUnit("dB")
 * );
 * formatter(-6.02); // "-6.0dB"
 *
 * // Combine multiple transformations
 * const complexFormatter = combineFormatters(
 *   (v) => (v * 100).toString(), // Convert to percentage
 *   withUnit("%")
 * );
 * complexFormatter(0.5); // "50%"
 * ```
 */
export const combineFormatters = (...formatters: ((value: number, min?: number, max?: number) => string)[]) => {
    return (value: number, min?: number, max?: number): string => {
        let result: string | number = value;
        for (const formatter of formatters) {
            // If the result is already a string (from previous formatter),
            // convert back to number for the next formatter if possible
            if (typeof result === "string") {
                const parsed = parseFloat(result);
                if (!isNaN(parsed)) {
                    result = formatter(parsed, min, max);
                }
            } else {
                result = formatter(result, min, max);
            }
        }
        return result.toString();
    };
};

/**
 * Formats a value as a percentage based on its position in the min-max range.
 *
 * The percentage is calculated as: ((value - min) / (max - min)) * 100
 * and rounded to the nearest integer.
 *
 * @param value The value to format
 * @param min The minimum value (corresponds to 0%)
 * @param max The maximum value (corresponds to 100%)
 * @returns Formatted percentage string (e.g., "50%")
 *
 * @example
 * ```ts
 * percentageFormatter(50, 0, 100); // "50%"
 * percentageFormatter(25, 0, 100); // "25%"
 * percentageFormatter(75, 0, 200); // "38%" (75/200 = 37.5%, rounded to 38%)
 * ```
 */
export const percentageFormatter = (value: number, min: number, max: number): string => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `${Math.round(percentage)}%`;
};

/**
 * Formats a frequency value with appropriate units (Hz or kHz).
 *
 * Values >= 1000 Hz are displayed in kHz with one decimal place.
 * Values < 1000 Hz are displayed in Hz as integers.
 *
 * This is optimized for audio frequency display where values can range from
 * sub-audio (20 Hz) to ultrasonic (20 kHz+).
 *
 * @param value The frequency value in Hz
 * @returns Formatted string with appropriate units (Hz, kHz)
 *
 * @example
 * ```ts
 * frequencyFormatter(440); // "440Hz"
 * frequencyFormatter(1000); // "1.0kHz"
 * frequencyFormatter(15000); // "15.0kHz"
 * ```
 */
export const frequencyFormatter = (value: number): string => {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}kHz`;
    }
    return `${Math.round(value)}Hz`;
};
