/**
 * Collection of reusable value formatters for control components
 */

/**
 * Calculates the center value for a range
 * @param min The minimum value
 * @param max The maximum value
 * @returns The center value according to MIDI conventions (floor((max - min + 1) / 2) + min)
 */
export const calculateCenterValue = (min: number, max: number): number => {
    return Math.floor((max - min + 1) / 2) + min;
};

/**
 * Formats a value with a bipolar display (adds + sign for positive values)
 * @param value The value to format
 * @returns Formatted string with + prefix for positive values
 */
export const bipolarFormatter = (value: number): string => {
    return value > 0 ? `+${value}` : value.toString();
};

/**
 * Formats a value with MIDI bipolar convention (shifts value by center value)
 * @param value The value to format
 * @param min The minimum value
 * @param max The maximum value
 * @returns Formatted string with the value shifted by center value
 */
export const midiBipolarFormatter = (value: number, min: number, max: number): string => {
    const centerValue = calculateCenterValue(min, max);
    const shiftedValue = value - centerValue;
    return bipolarFormatter(shiftedValue);
};

/**
 * Adds a unit suffix to the value
 * @param unit The unit to append (e.g., "dB", "Hz")
 * @returns A formatter function that appends the unit
 */
export const withUnit = (unit: string) => {
    return (value: number): string => `${value}${unit}`;
};

/**
 * Formats a value with fixed precision
 * @param precision Number of decimal places
 * @returns A formatter function that formats with the specified precision
 */
export const withPrecision = (precision: number) => {
    return (value: number): string => value.toFixed(precision);
};

/**
 * Combines multiple formatters into a single formatter
 * @param formatters Array of formatter functions to apply in sequence
 * @returns A formatter function that applies all formatters in sequence
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
 * Formats a value as a percentage
 * @param value The value to format
 * @param min The minimum value
 * @param max The maximum value
 * @returns Formatted percentage string
 */
export const percentageFormatter = (value: number, min: number, max: number): string => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `${Math.round(percentage)}%`;
};

/**
 * Formats a value with a logarithmic scale (useful for frequencies)
 * @param value The value to format
 * @returns Formatted string with appropriate units (Hz, kHz)
 */
export const frequencyFormatter = (value: number): string => {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}kHz`;
    }
    return `${Math.round(value)}Hz`;
};
