export type AudioParameterType = "continuous" | "boolean" | "enum";
export type ScaleType = "linear" | "log" | "exp";

// Base properties common to all parameters
interface BaseAudioParameter {
    id: string;
    name: string; // 'title' in MIDI 2.0 PE
    type: AudioParameterType;

    // The physical MIDI resolution (7, 14 bits, etc.)
    // Default: 32 (High resolution for internal precision)
    midiResolution?: 7 | 8 | 14 | 16 | 32 | 64;
}

// 1. Continuous (Float/Int)
export interface ContinuousParameter extends BaseAudioParameter {
    type: "continuous";
    min: number;
    max: number;
    step?: number;        // Granularity of the REAL value (e.g. 0.1, or 1 for Integers)
    defaultValue?: number;
    unit?: string;        // "dB", "Hz"
    scale?: ScaleType;    // Default: "linear"
}

// 2. Boolean (Switch/Button)
export interface BooleanParameter extends BaseAudioParameter {
    type: "boolean";
    defaultValue?: boolean;
    mode?: "toggle" | "momentary";
    trueLabel?: string;  // e.g. "On"
    falseLabel?: string; // e.g. "Off"
}

// 3. Enumeration (Dropdown/Selector)
export interface EnumParameter extends BaseAudioParameter {
    type: "enum";
    defaultValue?: number | string;
    options: Array<{
        value: number | string;
        label: string;
        midiValue?: number; // Explicit MIDI value for custom mapping
    }>;

    // How 0..127 maps to the options
    midiMapping?: "spread" | "sequential" | "custom";
}

// The Union Type
export type AudioParameter = ContinuousParameter | BooleanParameter | EnumParameter;

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
export class AudioParameterImpl {
    private maxMidi: number;

    constructor(public config: AudioParameter) {
        // Default to 32-bit resolution if not specified for high precision internal math
        // 32-bit = 4,294,967,296 steps (Safe in JS Number 53-bit)
        const resolution = config.midiResolution ?? 32;
        this.maxMidi = Math.pow(2, resolution) - 1;
    }

    /**
     * [Internal] Pure math normalization from Real to 0..1
     */
    private _normalizeReal(realValue: number | boolean | string): number {
        switch (this.config.type) {
            case "continuous": {
                const conf = this.config as ContinuousParameter;
                const val = realValue as number;
                // TODO: Implement log/exp scaling
                return Math.max(0, Math.min(1, (val - conf.min) / (conf.max - conf.min)));
            }
            case "boolean": {
                return realValue ? 1.0 : 0.0;
            }
            case "enum": {
                const conf = this.config as EnumParameter;
                const index = conf.options.findIndex(o => o.value === realValue);
                if (index === -1) return 0;
                const count = conf.options.length;
                return count > 1 ? index / (count - 1) : 0;
            }
        }
    }

    /**
     * [Internal] Pure math denormalization from 0..1 to Real
     */
    private _denormalizeReal(normalized: number): number | boolean | string {
        const clamped = Math.max(0, Math.min(1, normalized));

        switch (this.config.type) {
            case "continuous": {
                const conf = this.config as ContinuousParameter;
                // TODO: Implement log/exp scaling
                let val = conf.min + clamped * (conf.max - conf.min);
                
                // Apply Step Grid
                if (conf.step) {
                    const steps = Math.round((val - conf.min) / conf.step);
                    val = conf.min + steps * conf.step;
                    // Fix floating point precision artifacts (e.g. 42.0000004 -> 42)
                    val = Math.round(val * 1e10) / 1e10;
                }
                
                return Math.max(conf.min, Math.min(conf.max, val));
            }
            case "boolean": {
                return clamped >= 0.5;
            }
            case "enum": {
                const conf = this.config as EnumParameter;
                const count = conf.options.length;
                if (count === 0) return 0; 
                const index = Math.round(clamped * (count - 1));
                return conf.options[index].value;
            }
        }
    }

    /**
     * Convert Real Value to MIDI Integer (The Pivot)
     * Quantizes the value to the configured resolution.
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
            case "enum": {
                const conf = this.config as EnumParameter;
                const mapping = conf.midiMapping ?? "spread";

                if (mapping === "custom") {
                    const opt = conf.options.find(o => o.value === realValue);
                    if (opt?.midiValue !== undefined) return opt.midiValue;
                }

                if (mapping === "sequential") {
                    const index = conf.options.findIndex(o => o.value === realValue);
                    return index === -1 ? 0 : index;
                }

                // Spread
                const norm = this._normalizeReal(realValue);
                return Math.round(norm * this.maxMidi);
            }
        }
    }

    /**
     * Convert MIDI Integer to Real Value
     */
    fromMidi(midiValue: number): number | boolean | string {
        // Clamp input
        const clampedMidi = Math.max(0, Math.min(this.maxMidi, midiValue));

        switch (this.config.type) {
            case "continuous": {
                const norm = clampedMidi / this.maxMidi;
                return this._denormalizeReal(norm);
            }
            case "boolean": {
                // Lenient: < 50% is false, >= 50% is true
                const threshold = this.maxMidi / 2;
                return clampedMidi >= threshold;
            }
            case "enum": {
                const conf = this.config as EnumParameter;
                const mapping = conf.midiMapping ?? "spread";

                if (mapping === "custom") {
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
                    const index = clampedMidi;
                    if (index >= 0 && index < conf.options.length) {
                        return conf.options[index].value;
                    }
                    return conf.options[conf.options.length - 1]?.value ?? 0;
                }

                // Spread
                const norm = clampedMidi / this.maxMidi;
                return this._denormalizeReal(norm);
            }
        }
    }

    /**
     * Normalize a real-world value to 0..1 range via MIDI pivot
     */
    normalize(realValue: number | boolean | string): number {
        const midi = this.toMidi(realValue);
        return midi / this.maxMidi;
    }

    /**
     * Denormalize a 0..1 value to real-world value via MIDI pivot
     */
    denormalize(normalized: number): number | boolean | string {
        const midi = Math.round(normalized * this.maxMidi);
        return this.fromMidi(midi);
    }

    /**
     * Format the value for display
     */
    format(value: number | boolean | string): string {
        switch (this.config.type) {
            case "continuous": {
                const conf = this.config as ContinuousParameter;
                const val = value as number;
                const precision = conf.step
                    ? Math.max(0, Math.ceil(Math.log10(1 / conf.step)))
                    : 1; 
                const fixed = val.toFixed(precision);
                return `${parseFloat(fixed).toString()}${conf.unit ? ' ' + conf.unit : ''}`;
            }
            case "boolean": {
                const conf = this.config as BooleanParameter;
                return (value ? conf.trueLabel : conf.falseLabel) ?? (value ? "On" : "Off");
            }
            case "enum": {
                const conf = this.config as EnumParameter;
                const opt = conf.options.find(o => o.value === value);
                return opt?.label ?? String(value);
            }
        }
    }
}

/**
 * Factory for common parameter configurations
 */
export const MidiParameter = {
    /**
     * Standard 7-bit CC (0-127)
     */
    Standard7Bit: (name: string): ContinuousParameter => ({
        id: `cc-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        type: "continuous",
        min: 0,
        max: 127,
        step: 1,
        midiResolution: 7,
        unit: ""
    }),

    /**
     * Standard 14-bit CC (0-16383)
     */
    Standard14Bit: (name: string): ContinuousParameter => ({
        id: `cc14-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        type: "continuous",
        min: 0,
        max: 16383,
        step: 1,
        midiResolution: 14,
        unit: ""
    }),

    /**
     * Boolean Switch (Off/On)
     */
    Switch: (name: string, mode: "toggle" | "momentary" = "toggle"): BooleanParameter => ({
        id: `sw-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        type: "boolean",
        mode,
        defaultValue: false,
        trueLabel: "On",
        falseLabel: "Off",
        midiResolution: 7
    }),

    /**
     * Selector (Enumeration)
     */
    Selector: (name: string, options: Array<{ value: string | number, label: string }>): EnumParameter => ({
        id: `sel-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name,
        type: "enum",
        options,
        defaultValue: options[0]?.value,
        midiResolution: 7,
        midiMapping: "spread"
    })
};

