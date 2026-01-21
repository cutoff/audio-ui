/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import type { MidiResolution } from "../types";

export type AudioParameterType = "continuous" | "boolean" | "discrete";

/**
 * A scale function that transforms normalized values (0..1) to scaled values (0..1)
 * Both forward and inverse must be provided for bidirectional conversion.
 *
 * The scale is applied in the normalized domain (0..1) to create non-linear mappings
 * between the real value domain and the normalized/MIDI domain.
 */
export interface ScaleFunction {
    /**
     * Transform normalized value (0..1) to scaled value (0..1)
     * Used when converting Real -> Normalized (in _normalizeReal)
     *
     * @param normalized - A value in the range [0, 1] representing position in real domain
     * @returns A scaled value in the range [0, 1] for MIDI quantization
     */
    forward: (normalized: number) => number;

    /**
     * Transform scaled value (0..1) back to normalized value (0..1)
     * Used when converting Normalized -> Real (in _denormalizeReal)
     *
     * @param scaled - A value in the range [0, 1] from MIDI domain
     * @returns A normalized value in the range [0, 1] for real domain conversion
     */
    inverse: (scaled: number) => number;

    /**
     * Optional name for debugging/documentation
     */
    name?: string;
}

/**
 * Predefined scale functions for common audio parameter transformations
 */
export const LinearScale: ScaleFunction = {
    forward: (n) => n,
    inverse: (s) => s,
    name: "linear",
};

export const LogScale: ScaleFunction = {
    forward: (n) => {
        // Formula: log(n * (e - 1) + 1) / log(e)
        // Maps 0 -> 0, 1 -> 1 with logarithmic distribution
        if (n <= 0) return 0;
        if (n >= 1) return 1;
        return Math.log(n * (Math.E - 1) + 1) / Math.log(Math.E);
    },
    inverse: (s) => {
        if (s <= 0) return 0;
        if (s >= 1) return 1;
        return (Math.pow(Math.E, s) - 1) / (Math.E - 1);
    },
    name: "log",
};

export const ExpScale: ScaleFunction = {
    forward: (n) => {
        // Formula: (e^n - 1) / (e - 1)
        // Maps 0 -> 0, 1 -> 1 with exponential distribution
        if (n <= 0) return 0;
        if (n >= 1) return 1;
        return (Math.pow(Math.E, n) - 1) / (Math.E - 1);
    },
    inverse: (s) => {
        if (s <= 0) return 0;
        if (s >= 1) return 1;
        return Math.log(s * (Math.E - 1) + 1) / Math.log(Math.E);
    },
    name: "exp",
};

export type ScaleType = ScaleFunction | "linear" | "log" | "exp";

/**
 * Definition for a single option in a discrete parameter.
 *
 * This type represents the parameter model definition (value, label, MIDI mapping).
 * It is separate from visual content, which is provided via React children in components.
 */
export interface DiscreteOption {
    /** The value associated with this option */
    value: number | string;
    /** The label for this option (used for display, accessibility, and parameter model) */
    label: string;
    /** Optional explicit MIDI value for custom mapping strategy */
    midiValue?: number;
}

interface BaseAudioParameter<T = number | boolean | string> {
    id: string;
    name: string; // 'title' in MIDI 2.0 PE
    type: AudioParameterType;

    // The physical MIDI resolution (7, 14 bits, etc.)
    // Default: 32 (High resolution for internal precision)
    midiResolution?: MidiResolution;
    /** Default value for the parameter */
    defaultValue?: T;
}

export interface ContinuousParameter extends BaseAudioParameter<number> {
    type: "continuous";
    min: number;
    max: number;
    step?: number; // Granularity of the REAL value (e.g. 0.1, or 1 for Integers)
    unit?: string; // "dB", "Hz"
    scale?: ScaleType;
    /** Whether the parameter operates in bipolar mode (centered around zero) */
    bipolar?: boolean;
}

export interface BooleanParameter extends BaseAudioParameter<boolean> {
    type: "boolean";
    mode?: "toggle" | "momentary";
    trueLabel?: string; // e.g. "On"
    falseLabel?: string;
}

export interface DiscreteParameter extends BaseAudioParameter<number | string> {
    type: "discrete";
    /** Array of option definitions (parameter model) */
    options: DiscreteOption[];

    midiMapping?: "spread" | "sequential" | "custom";
}

export type AudioParameter = ContinuousParameter | BooleanParameter | DiscreteParameter;

/**
 * Implementation class that handles normalization, denormalization, and MIDI conversion.
 *
 * ARCHITECTURE NOTE:
 * This class uses the MIDI Integer Value as the central "Pivot" / Source of Truth.
 *
 * Flow:
 * Real Value -> [Quantize] -> MIDI Integer -> [Normalize] -> Normalized Float (0..1)
 * Normalized Float -> [Scale] -> MIDI Integer -> [Convert] -> Real Value
 *
 * This ensures deterministic behavior and alignment with hardware standards.
 */
export class AudioParameterConverter {
    private maxMidi: number;
    private scaleFunction: ScaleFunction | null = null;

    constructor(public config: AudioParameter) {
        // Default to 32-bit resolution for high precision internal math
        // 32-bit = 4,294,967,296 steps (safe in JS Number 53-bit)
        const resolution = config.midiResolution ?? 32;
        this.maxMidi = Math.pow(2, resolution) - 1;

        if (config.type === "continuous") {
            const scale = (config as ContinuousParameter).scale;
            this.scaleFunction = this.resolveScale(scale);
        }
    }

    private resolveScale(scale?: ScaleType): ScaleFunction {
        if (!scale) return LinearScale;
        if (typeof scale === "string") {
            switch (scale) {
                case "linear":
                    return LinearScale;
                case "log":
                    return LogScale;
                case "exp":
                    return ExpScale;
                default:
                    return LinearScale;
            }
        }
        return scale; // Already a ScaleFunction
    }

    /**
     * [Internal] Pure math normalization from Real to 0..1.
     *
     * This is the first step in the conversion pipeline. It normalizes the real value
     * to 0..1 in the real domain, then applies scale transformation (if not linear).
     * The scale transformation happens in the normalized domain to create non-linear
     * mappings (e.g., logarithmic for volume, exponential for envelope curves).
     */
    private _normalizeReal(realValue: number | boolean | string): number {
        switch (this.config.type) {
            case "continuous": {
                const conf = this.config as ContinuousParameter;
                const val = realValue as number;

                const normalized = Math.max(0, Math.min(1, (val - conf.min) / (conf.max - conf.min)));

                if (this.scaleFunction && this.scaleFunction !== LinearScale) {
                    return this.scaleFunction.forward(normalized);
                }

                return normalized;
            }
            case "boolean": {
                return realValue ? 1.0 : 0.0;
            }
            case "discrete": {
                const conf = this.config as DiscreteParameter;
                const index = conf.options.findIndex((o) => o.value === realValue);
                if (index === -1) return 0;
                const count = conf.options.length;
                return count > 1 ? index / (count - 1) : 0;
            }
        }
    }

    /**
     * [Internal] Pure math denormalization from 0..1 to Real.
     *
     * This is the inverse of `_normalizeReal()`. It first applies the inverse scale
     * transformation (if not linear), then denormalizes to the real value domain.
     * Finally, it applies step quantization in the real domain (step is always linear,
     * regardless of scale type).
     */
    private _denormalizeReal(normalized: number): number | boolean | string {
        const clamped = Math.max(0, Math.min(1, normalized));

        switch (this.config.type) {
            case "continuous": {
                const conf = this.config as ContinuousParameter;

                let scaled = clamped;
                if (this.scaleFunction && this.scaleFunction !== LinearScale) {
                    scaled = this.scaleFunction.inverse(clamped);
                }

                let val = conf.min + scaled * (conf.max - conf.min);

                // Step quantization is always applied in the real value domain (after scale transformation).
                // This means step creates a linear grid in real units (e.g., 0.1 dB increments),
                // regardless of whether the scale is linear, logarithmic, or exponential.
                //
                // This design works well for:
                // - Linear scales: Natural 1:1 mapping
                // - Log/exp scales with linear units (dB, ms): Step still makes sense in real units
                //
                // For log scales with non-linear units (e.g., frequency in Hz), consider:
                // - Omitting step entirely for smooth control
                // - Using a very small step to allow fine control while providing some quantization
                if (conf.step) {
                    const steps = Math.round((val - conf.min) / conf.step);
                    val = conf.min + steps * conf.step;
                    // Fix floating point precision artifacts (e.g., 42.0000004 -> 42)
                    val = Math.round(val * 1e10) / 1e10;
                }

                return Math.max(conf.min, Math.min(conf.max, val));
            }
            case "boolean": {
                return clamped >= 0.5;
            }
            case "discrete": {
                const conf = this.config as DiscreteParameter;
                const count = conf.options.length;
                if (count === 0) return 0;
                const index = Math.round(clamped * (count - 1));
                return conf.options[index].value;
            }
        }
    }

    /**
     * Convert Real Value to MIDI Integer (The Pivot).
     *
     * This is the central conversion method that quantizes real-world values to MIDI integers.
     * The MIDI integer serves as the source of truth, ensuring deterministic behavior and
     * alignment with hardware standards.
     *
     * The conversion flow:
     * 1. Normalize the real value to 0..1 (applying scale transformation if needed)
     * 2. Quantize to the configured MIDI resolution (7-bit = 0-127, 14-bit = 0-16383, etc.)
     *
     * @param realValue The real-world value (number, boolean, or string depending on parameter type)
     * @returns The quantized MIDI integer value
     *
     * @example
     * ```ts
     * const converter = new AudioParameterConverter({
     *   type: "continuous",
     *   min: 0,
     *   max: 100,
     *   midiResolution: 7
     * });
     * converter.toMidi(50); // 64 (50% of 0-100 maps to 64 in 0-127 range)
     * ```
     */
    toMidi(realValue: number | boolean | string): number {
        switch (this.config.type) {
            case "continuous": {
                const norm = this._normalizeReal(realValue);
                return Math.round(norm * this.maxMidi);
            }
            case "boolean": {
                return realValue ? this.maxMidi : 0;
            }
            case "discrete": {
                const conf = this.config as DiscreteParameter;
                const mapping = conf.midiMapping ?? "spread";

                if (mapping === "custom") {
                    // Custom mapping: use explicit midiValue from option definition
                    const opt = conf.options.find((o) => o.value === realValue);
                    if (opt?.midiValue !== undefined) return opt.midiValue;
                }

                if (mapping === "sequential") {
                    // Sequential mapping: option index directly maps to MIDI value (0, 1, 2, ...)
                    const index = conf.options.findIndex((o) => o.value === realValue);
                    return index === -1 ? 0 : index;
                }

                // Spread mapping: distribute options evenly across MIDI range (default)
                // This provides maximum resolution for hardware controllers
                const norm = this._normalizeReal(realValue);
                return Math.round(norm * this.maxMidi);
            }
        }
    }

    /**
     * Convert MIDI Integer to Real Value.
     *
     * This method performs the inverse of `toMidi()`, converting a quantized MIDI integer
     * back to a real-world value. The conversion flow:
     * 1. Normalize the MIDI integer to 0..1
     * 2. Apply inverse scale transformation (if not linear)
     * 3. Denormalize to the real value domain
     * 4. Apply step quantization (if configured)
     *
     * @param midiValue The MIDI integer value (will be clamped to valid range)
     * @returns The real-world value (number, boolean, or string depending on parameter type)
     *
     * @example
     * ```ts
     * const converter = new AudioParameterConverter({
     *   type: "continuous",
     *   min: 0,
     *   max: 100,
     *   step: 1,
     *   midiResolution: 7
     * });
     * converter.fromMidi(64); // 50 (64/127 ≈ 0.5, maps to 50 in 0-100 range)
     * ```
     */
    fromMidi(midiValue: number): number | boolean | string {
        const clampedMidi = Math.max(0, Math.min(this.maxMidi, midiValue));

        switch (this.config.type) {
            case "continuous": {
                const norm = clampedMidi / this.maxMidi;
                return this._denormalizeReal(norm);
            }
            case "boolean": {
                // Threshold at 50%: < 50% is false, >= 50% is true
                const threshold = this.maxMidi / 2;
                return clampedMidi >= threshold;
            }
            case "discrete": {
                const conf = this.config as DiscreteParameter;
                const mapping = conf.midiMapping ?? "spread";

                if (mapping === "custom") {
                    // Custom mapping: find the option with the closest midiValue to the input
                    // This allows non-uniform spacing (e.g., some options closer together)
                    let bestOpt = conf.options[0];
                    let minDiff = Infinity;
                    for (const opt of conf.options) {
                        if (opt.midiValue !== undefined) {
                            const diff = Math.abs(opt.midiValue - clampedMidi);
                            if (diff < minDiff) {
                                minDiff = diff;
                                bestOpt = opt;
                            }
                        }
                    }
                    return bestOpt.value;
                }

                if (mapping === "sequential") {
                    // Sequential mapping: MIDI value directly maps to option index
                    const index = clampedMidi;
                    if (index >= 0 && index < conf.options.length) {
                        return conf.options[index].value;
                    }
                    // Clamp to last option if out of range
                    return conf.options[conf.options.length - 1]?.value ?? 0;
                }

                // Spread mapping: distribute MIDI range evenly across options (default)
                // This provides maximum resolution and smooth transitions
                const norm = clampedMidi / this.maxMidi;
                return this._denormalizeReal(norm);
            }
        }
    }

    normalize(realValue: number | boolean | string): number {
        const midi = this.toMidi(realValue);
        return midi / this.maxMidi;
    }

    denormalize(normalized: number): number | boolean | string {
        const midi = Math.round(normalized * this.maxMidi);
        return this.fromMidi(midi);
    }

    /**
     * Format a value for display as a string.
     *
     * This method generates a human-readable string representation of the value,
     * including appropriate units and precision based on the parameter configuration.
     *
     * - Continuous parameters: Includes unit suffix and precision based on step size
     * - Boolean parameters: Uses trueLabel/falseLabel or defaults to "On"/"Off"
     * - Discrete parameters: Returns the label of the matching option
     *
     * @param value The value to format (number, boolean, or string)
     * @returns Formatted string representation
     *
     * @example
     * ```ts
     * const converter = new AudioParameterConverter({
     *   type: "continuous",
     *   min: 0,
     *   max: 100,
     *   step: 0.1,
     *   unit: "dB"
     * });
     * converter.format(50.5); // "50.5 dB"
     *
     * const boolConverter = new AudioParameterConverter({
     *   type: "boolean",
     *   trueLabel: "Enabled",
     *   falseLabel: "Disabled"
     * });
     * boolConverter.format(true); // "Enabled"
     * ```
     */
    format(value: number | boolean | string): string {
        switch (this.config.type) {
            case "continuous": {
                const conf = this.config as ContinuousParameter;
                const val = value as number;
                const precision = conf.step ? Math.max(0, Math.ceil(Math.log10(1 / conf.step))) : 1;
                const fixed = val.toFixed(precision);
                return `${parseFloat(fixed).toString()}${conf.unit ? " " + conf.unit : ""}`;
            }
            case "boolean": {
                const conf = this.config as BooleanParameter;
                return (value ? conf.trueLabel : conf.falseLabel) ?? (value ? "On" : "Off");
            }
            case "discrete": {
                const conf = this.config as DiscreteParameter;
                const opt = conf.options.find((o) => o.value === value);
                return opt?.label ?? String(value);
            }
        }
    }

    /**
     * Get the maximum display text for sizing purposes.
     * Returns the longest formatted string among all possible values.
     * Useful for RadialText referenceText prop to ensure consistent sizing.
     *
     * @param options - Optional configuration
     * @param options.includeUnit - Whether to include the unit in the result (default: true).
     *                              Set to false when displaying value and unit on separate lines.
     * @returns The longest formatted display string
     *
     * @example
     * ```ts
     * const converter = new AudioParameterConverter(volumeParam);
     * // Single line with unit
     * <RadialText text={currentValue} referenceText={converter.getMaxDisplayText()} />
     *
     * // Multiline: value on first line, unit on second
     * <RadialText
     *   text={[formattedValue, unit]}
     *   referenceText={[converter.getMaxDisplayText({ includeUnit: false }), unit]}
     * />
     * ```
     */
    getMaxDisplayText(options?: { includeUnit?: boolean }): string {
        const includeUnit = options?.includeUnit ?? true;

        switch (this.config.type) {
            case "continuous": {
                const conf = this.config as ContinuousParameter;
                if (includeUnit) {
                    const minStr = this.format(conf.min);
                    const maxStr = this.format(conf.max);
                    // Return the longer string
                    return minStr.length >= maxStr.length ? minStr : maxStr;
                } else {
                    // Format without unit
                    const precision = conf.step ? Math.max(0, Math.ceil(Math.log10(1 / conf.step))) : 1;
                    const minFixed = conf.min.toFixed(precision);
                    const maxFixed = conf.max.toFixed(precision);
                    const minStr = parseFloat(minFixed).toString();
                    const maxStr = parseFloat(maxFixed).toString();
                    return minStr.length >= maxStr.length ? minStr : maxStr;
                }
            }
            case "boolean": {
                const conf = this.config as BooleanParameter;
                const trueStr = conf.trueLabel ?? "On";
                const falseStr = conf.falseLabel ?? "Off";
                return trueStr.length >= falseStr.length ? trueStr : falseStr;
            }
            case "discrete": {
                const conf = this.config as DiscreteParameter;
                let longest = "";
                for (const opt of conf.options) {
                    const label = opt.label ?? String(opt.value);
                    if (label.length > longest.length) {
                        longest = label;
                    }
                }
                return longest;
            }
        }
    }
}

/**
 * Configuration for creating a generic continuous control parameter (for knobs, sliders, etc.).
 */
export interface ContinuousControlConfig {
    id?: string;
    name?: string;
    label?: string;
    min?: number;
    max?: number;
    step?: number;
    bipolar?: boolean;
    unit?: string;
    defaultValue?: number;
    scale?: ScaleType;
    midiResolution?: MidiResolution;
}

/**
 * Factory for common AudioParameter configurations (including MIDI-flavoured presets).
 *
 * This factory provides convenient methods for creating standard parameter configurations
 * that match common MIDI and audio industry conventions. All factory methods generate
 * parameter IDs automatically from the name.
 */
export const AudioParameterFactory = {
    /**
     * Creates a standard 7-bit MIDI CC parameter (0-127).
     *
     * This is the most common MIDI control change format, used for most hardware controllers
     * and software synthesizers. The parameter uses 7-bit resolution (128 steps).
     *
     * @param name The parameter name (used to generate ID and name fields)
     * @returns A ContinuousParameter configured for 7-bit MIDI CC
     *
     * @example
     * ```ts
     * const volumeParam = AudioParameterFactory.createMidiStandard7Bit("Volume");
     * // { type: "continuous", min: 0, max: 127, step: 1, midiResolution: 7, ... }
     * ```
     */
    createMidiStandard7Bit: (name: string): ContinuousParameter => ({
        id: `cc-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        type: "continuous",
        min: 0,
        max: 127,
        step: 1,
        midiResolution: 7,
        unit: "",
    }),

    /**
     * Creates a standard 14-bit MIDI CC parameter (0-16383).
     *
     * This provides higher resolution than 7-bit CC, useful for parameters that require
     * fine-grained control. The parameter uses 14-bit resolution (16,384 steps).
     *
     * @param name The parameter name (used to generate ID and name fields)
     * @returns A ContinuousParameter configured for 14-bit MIDI CC
     *
     * @example
     * ```ts
     * const fineTuneParam = AudioParameterFactory.createMidiStandard14Bit("Fine Tune");
     * // { type: "continuous", min: 0, max: 16383, step: 1, midiResolution: 14, ... }
     * ```
     */
    createMidiStandard14Bit: (name: string): ContinuousParameter => ({
        id: `cc14-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        type: "continuous",
        min: 0,
        max: 16383,
        step: 1,
        midiResolution: 14,
        unit: "",
    }),

    /**
     * Creates a bipolar 7-bit MIDI CC parameter (-64 to 63, centered at 0).
     *
     * This is useful for parameters that have a center point, such as pan controls or
     * modulation depth. The range is symmetric around zero, with 64 steps in each direction.
     *
     * @param name The parameter name (used to generate ID and name fields)
     * @returns A ContinuousParameter configured for bipolar 7-bit MIDI CC
     *
     * @example
     * ```ts
     * const panParam = AudioParameterFactory.createMidiBipolar7Bit("Pan");
     * // { type: "continuous", min: -64, max: 63, step: 1, defaultValue: 0, ... }
     * ```
     */
    createMidiBipolar7Bit: (name: string): ContinuousParameter => ({
        id: `cc-bipolar-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        type: "continuous",
        min: -64,
        max: 63,
        step: 1,
        midiResolution: 7,
        unit: "",
        defaultValue: 0,
        bipolar: true,
    }),

    /**
     * Creates a bipolar 14-bit MIDI CC parameter (-8192 to 8191, centered at 0).
     *
     * This provides high-resolution bipolar control, useful for parameters that require
     * fine-grained adjustment around a center point. The range is symmetric around zero,
     * with 8,192 steps in each direction.
     *
     * @param name The parameter name (used to generate ID and name fields)
     * @returns A ContinuousParameter configured for bipolar 14-bit MIDI CC
     *
     * @example
     * ```ts
     * const finePanParam = AudioParameterFactory.createMidiBipolar14Bit("Fine Pan");
     * // { type: "continuous", min: -8192, max: 8191, step: 1, defaultValue: 0, ... }
     * ```
     */
    createMidiBipolar14Bit: (name: string): ContinuousParameter => ({
        id: `cc14-bipolar-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        type: "continuous",
        min: -8192,
        max: 8191,
        step: 1,
        midiResolution: 14,
        unit: "",
        defaultValue: 0,
        bipolar: true,
    }),

    /**
     * Creates a bipolar parameter with custom range (centered at 0).
     *
     * This is a flexible factory method for creating bipolar parameters with any range.
     * The parameter is symmetric around zero, useful for pan controls, modulation depth,
     * or any parameter that has a neutral center point.
     *
     * @param name The parameter name (used to generate ID and name fields)
     * @param range The range value (default: 100). The parameter will span from -range to +range
     * @param unit Optional unit suffix (e.g., "dB", "%")
     * @returns A ContinuousParameter configured for bipolar control
     *
     * @example
     * ```ts
     * const panParam = AudioParameterFactory.createBipolar("Pan", 100, "%");
     * // { type: "continuous", min: -100, max: 100, step: 1, defaultValue: 0, unit: "%", ... }
     *
     * const modDepthParam = AudioParameterFactory.createBipolar("Mod Depth", 50);
     * // { type: "continuous", min: -50, max: 50, step: 1, defaultValue: 0, ... }
     * ```
     */
    createBipolar: (name: string, range: number = 100, unit: string = ""): ContinuousParameter => ({
        id: `bipolar-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        type: "continuous",
        min: -range,
        max: range,
        step: 1,
        unit,
        defaultValue: 0,
        bipolar: true,
    }),

    /**
     * Creates a boolean switch parameter (Off/On).
     *
     * This factory method creates a boolean parameter suitable for on/off controls,
     * with support for both toggle (latch) and momentary modes.
     *
     * @param name The parameter name (used to generate ID and name fields)
     * @param mode The switch mode: "toggle" (latch) or "momentary" (only active while pressed)
     * @returns A BooleanParameter configured as a switch
     *
     * @example
     * ```ts
     * const powerParam = AudioParameterFactory.createSwitch("Power", "toggle");
     * // { type: "boolean", mode: "toggle", trueLabel: "On", falseLabel: "Off", ... }
     *
     * const recordParam = AudioParameterFactory.createSwitch("Record", "momentary");
     * // { type: "boolean", mode: "momentary", ... }
     * ```
     */
    createSwitch: (name: string, mode: "toggle" | "momentary" = "toggle"): BooleanParameter => ({
        id: `sw-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        type: "boolean",
        mode,
        defaultValue: false,
        trueLabel: "On",
        falseLabel: "Off",
        midiResolution: 7,
    }),

    /**
     * Creates a discrete (selector) parameter.
     *
     * This factory method creates a discrete parameter suitable for mode selectors,
     * preset switches, or any control that cycles through discrete options.
     *
     * @param name The parameter name (used to generate ID and name fields)
     * @param options Array of option objects, each with a value and label
     * @returns A DiscreteParameter configured as a selector
     *
     * @example
     * ```ts
     * const waveParam = AudioParameterFactory.createSelector("Waveform", [
     *   { value: "sine", label: "Sine" },
     *   { value: "square", label: "Square" },
     *   { value: "sawtooth", label: "Sawtooth" }
     * ]);
     * ```
     */
    createSelector: (name: string, options: Array<{ value: string | number; label: string }>): DiscreteParameter => ({
        id: `sel-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
        type: "discrete",
        options,
        defaultValue: options[0]?.value,
        midiResolution: 7,
        midiMapping: "spread",
    }),

    /**
     * Creates a generic continuous control parameter (for ad-hoc UI controls like Knob/Slider).
     *
     * This is the most flexible factory method, allowing you to specify all aspects of a
     * continuous parameter. It's useful when you need a parameter that doesn't fit the
     * standard MIDI presets.
     *
     * The method handles bipolar mode automatically: if `bipolar` is true, it adjusts
     * min/max to be symmetric around zero when only one boundary is provided. For default values:
     * - If `defaultValue` is provided, it is used (even when `bipolar=true`)
     * - If `defaultValue` is not provided and `bipolar=true`, the center of the range is calculated
     *   (0 for symmetric ranges, otherwise the midpoint)
     * - If `defaultValue` is not provided and `bipolar=false`, falls back to `min` or 0
     *
     * @param config Configuration object with optional fields for all parameter properties
     * @returns A ContinuousParameter configured according to the provided config
     *
     * @example
     * ```ts
     * const volumeParam = AudioParameterFactory.createControl({
     *   name: "Volume",
     *   min: 0,
     *   max: 100,
     *   step: 0.1,
     *   unit: "dB",
     *   scale: "log"
     * });
     *
     * const panParam = AudioParameterFactory.createControl({
     *   name: "Pan",
     *   bipolar: true,
     *   unit: "%"
     * });
     * // Automatically sets min: -100, max: 100, defaultValue: 0
     *
     * const customBipolarParam = AudioParameterFactory.createControl({
     *   name: "Custom",
     *   min: 0,
     *   max: 127,
     *   bipolar: true,
     *   defaultValue: 64
     * });
     * // Uses provided defaultValue: 64 (center of 0-127 range)
     * ```
     */
    createControl: (config: ContinuousControlConfig): ContinuousParameter => {
        const { id, name, label, min, max, step, bipolar, unit = "", defaultValue, scale, midiResolution } = config;

        let effectiveMin = min;
        let effectiveMax = max;
        let effectiveDefault = defaultValue;

        // Handle bipolar mode: ensure symmetric range around zero
        if (bipolar) {
            if (min === undefined && max === undefined) {
                // No range specified: default to -100 to 100
                effectiveMin = -100;
                effectiveMax = 100;
            } else if (min === undefined && max !== undefined) {
                // Only max specified: make symmetric (e.g., max=100 -> min=-100)
                effectiveMin = -max!;
            } else if (min !== undefined && max === undefined) {
                // Only min specified: make symmetric (e.g., min=-100 -> max=100)
                effectiveMax = -min!;
            }
            // Bipolar parameters default to center: use provided defaultValue if given,
            // otherwise calculate center of the range (which may not be 0 if range isn't symmetric)
            if (effectiveDefault === undefined) {
                const finalMin = effectiveMin ?? 0;
                const finalMax = effectiveMax ?? 100;
                // If range is symmetric around zero, default to 0; otherwise use center of range
                if (finalMin === -finalMax) {
                    effectiveDefault = 0;
                } else {
                    effectiveDefault = (finalMin + finalMax) / 2;
                }
            }
        } else {
            // Unipolar: use provided defaultValue or fall back to min or 0
            effectiveDefault = effectiveDefault ?? min ?? 0;
        }

        return {
            id: id ?? "adhoc-control",
            type: "continuous",
            name: name ?? label ?? "",
            min: effectiveMin ?? 0,
            max: effectiveMax ?? 100,
            step,
            unit,
            defaultValue: effectiveDefault,
            scale,
            midiResolution,
            bipolar: bipolar ?? false,
        };
    },
};
