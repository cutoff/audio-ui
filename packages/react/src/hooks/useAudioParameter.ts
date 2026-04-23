/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { useMemo, useCallback, useRef } from "react";
import { AudioParameter, AudioParameterConverter } from "@cutoff/audio-ui-core";
import { AudioControlEvent } from "../components/types";

export interface UseAudioParameterResult<T extends number | boolean | string = number | boolean | string> {
    /** The resolved real-world value (derived from whichever input channel was supplied). */
    realValue: T;
    /** The normalized value (0..1) for UI rendering */
    normalizedValue: number;
    /** Formatted string representation of the current value */
    formattedValue: string;
    /** The effective label to display (computed from userLabel, valueAsLabel, or parameter name) */
    effectiveLabel: string;
    /** The full parameter model instance */
    converter: AudioParameterConverter;
    /**
     * Dispatch a new real-value directly through the paired callback for the active channel.
     * Useful for boolean / discrete controls whose interactions produce full real-values (not deltas).
     */
    commitValue: (newRealValue: T) => void;
    /**
     * Set the value using a normalized (0..1) input.
     * Automatically denormalizes and dispatches the paired callback matching the active channel.
     */
    setNormalizedValue: (normalized: number) => void;
    /**
     * Adjust the value relatively (e.g. from mouse wheel or drag).
     * @param delta The amount to change (in normalized units, typically small like 0.01)
     * @param sensitivity Optional multiplier (default 1.0)
     */
    adjustValue: (delta: number, sensitivity?: number) => void;
    /**
     * Get the default normalized value (0..1).
     * Returns the normalized defaultValue from the parameter if defined,
     * otherwise returns 0.0 for unipolar or 0.5 for bipolar parameters.
     */
    getDefaultNormalizedValue: () => number;
    /**
     * Reset the value to the default value.
     * Uses the parameter's defaultValue if defined, otherwise uses 0.0 for unipolar or 0.5 for bipolar.
     */
    resetToDefault: () => void;
}

type ActiveChannel = "value" | "normalized" | "midi";

/**
 * Options for {@link useAudioParameter}. Supply exactly one input channel
 * (`value` | `normalizedValue` | `midiValue`) and — optionally — its matching paired callback.
 */
export interface UseAudioParameterOptions<T extends number | boolean | string> {
    /** Real-world value input (Hz, dB, boolean state, option value, ...). */
    value?: T;
    /** Normalized 0..1 input. Takes precedence after `value`. */
    normalizedValue?: number;
    /** MIDI integer input. Takes precedence after `normalizedValue`. */
    midiValue?: number;
    /** Paired callback for `value` input. First arg: new real value. Second arg: full event. */
    onValueChange?: (value: T, event: AudioControlEvent<T>) => void;
    /** Paired callback for `normalizedValue` input. First arg: new normalized value. Second arg: full event. */
    onNormalizedValueChange?: (value: number, event: AudioControlEvent<T>) => void;
    /** Paired callback for `midiValue` input. First arg: new MIDI integer. Second arg: full event. */
    onMidiValueChange?: (value: number, event: AudioControlEvent<T>) => void;
    /** Parameter definition driving conversions and defaults. */
    parameter: AudioParameter;
    /** Optional custom renderer for the value display. If it returns a string, overrides the default formatter. */
    userValueFormatter?: (value: T, parameterDef: AudioParameter) => string | undefined;
    /** Optional custom label. Takes precedence over parameter name when `valueAsLabel` is false. */
    userLabel?: string;
    /** When true, displays the formatted value as the label instead of the provided label or parameter name. */
    valueAsLabel?: boolean;
}

/**
 * Hook to manage audio parameter logic, normalization, formatting, and paired-channel dispatch.
 *
 * Resolves the effective real value from whichever input channel was supplied
 * (precedence: `value` > `normalizedValue` > `midiValue`), converts to a canonical
 * real + normalized + MIDI triple via {@link AudioParameterConverter}, and — on interaction —
 * fires the single paired callback matching the active channel. Every callback receives
 * `(representationValue, event)` where `event` is the full {@link AudioControlEvent}
 * with all three representations populated.
 *
 * @example
 * ```tsx
 * const { normalizedValue, formattedValue, adjustValue } = useAudioParameter({
 *   value: cutoffHz,
 *   onValueChange: setCutoffHz,
 *   parameter: cutoffParam,
 * });
 * ```
 */
export function useAudioParameter<T extends number | boolean | string>(
    options: UseAudioParameterOptions<T>
): UseAudioParameterResult<T> {
    const {
        value,
        normalizedValue: inputNormalized,
        midiValue: inputMidi,
        onValueChange,
        onNormalizedValueChange,
        onMidiValueChange,
        parameter,
        userValueFormatter,
        userLabel,
        valueAsLabel,
    } = options;

    const converter = useMemo(() => {
        return new AudioParameterConverter(parameter);
    }, [parameter]);

    // Resolve the effective real value and note which channel is active.
    // Precedence: value > normalizedValue > midiValue (silent; TypeScript's discriminated union
    // prevents multi-channel inputs under strict mode; this path is only reachable in loose TS / JS).
    const { realValue, normalizedValue, activeChannel } = useMemo(() => {
        if (value !== undefined) {
            return {
                realValue: value,
                normalizedValue: converter.normalize(value),
                activeChannel: "value" as ActiveChannel,
            };
        }
        if (inputNormalized !== undefined) {
            return {
                realValue: converter.denormalize(inputNormalized) as T,
                normalizedValue: inputNormalized,
                activeChannel: "normalized" as ActiveChannel,
            };
        }
        if (inputMidi !== undefined) {
            const maxMidi = Math.pow(2, parameter.midiResolution ?? 32) - 1;
            return {
                realValue: converter.fromMidi(inputMidi) as T,
                normalizedValue: inputMidi / maxMidi,
                activeChannel: "midi" as ActiveChannel,
            };
        }
        // No input provided — fall back to the parameter's normalized default (0.0).
        // Callers (control primitives) typically ensure one of the three inputs is supplied.
        return {
            realValue: converter.denormalize(0) as T,
            normalizedValue: 0,
            activeChannel: "value" as ActiveChannel,
        };
    }, [value, inputNormalized, inputMidi, converter, parameter.midiResolution]);

    // Track latest real value in ref to avoid stale closures during rapid events (e.g., wheel).
    const realValueRef = useRef(realValue);
    realValueRef.current = realValue;

    const hasCallback = !!(onValueChange ?? onNormalizedValueChange ?? onMidiValueChange);

    const commitValue = useCallback(
        (newRealValue: T) => {
            if (!hasCallback) return;

            const newNormalized = converter.normalize(newRealValue);
            const newMidi = converter.toMidi(newRealValue);

            const event: AudioControlEvent<T> = {
                value: newRealValue,
                normalizedValue: newNormalized,
                midiValue: newMidi,
                parameter,
            };

            // Fire the single paired callback matching the active channel.
            switch (activeChannel) {
                case "value":
                    onValueChange?.(newRealValue, event);
                    break;
                case "normalized":
                    onNormalizedValueChange?.(newNormalized, event);
                    break;
                case "midi":
                    onMidiValueChange?.(newMidi, event);
                    break;
            }
        },
        [converter, parameter, activeChannel, hasCallback, onValueChange, onNormalizedValueChange, onMidiValueChange]
    );

    const setNormalizedValue = useCallback(
        (newNormal: number) => {
            if (!hasCallback) return;
            const clamped = Math.max(0, Math.min(1, newNormal));
            const newReal = converter.denormalize(clamped) as T;

            if (newReal !== realValueRef.current) {
                realValueRef.current = newReal;
                commitValue(newReal);
            }
        },
        [converter, hasCallback, commitValue]
    );

    const adjustValue = useCallback(
        (delta: number, sensitivity = 0.001) => {
            if (!hasCallback) return;

            // Use ref for calculation base to prevent stale closure jitter during rapid events.
            const currentReal = realValueRef.current as number;
            const currentNormal = converter.normalize(currentReal);

            const newNormal = Math.max(0, Math.min(1, currentNormal + delta * sensitivity));
            setNormalizedValue(newNormal);
        },
        [converter, hasCallback, setNormalizedValue]
    );

    const formattedValue = useMemo(() => {
        if (userValueFormatter) {
            const customValue = userValueFormatter(realValue, parameter);
            if (customValue !== undefined) {
                return customValue;
            }
        }
        return converter.format(realValue);
    }, [realValue, converter, userValueFormatter, parameter]);

    const effectiveLabel = useMemo(() => {
        if (valueAsLabel) {
            return formattedValue;
        }
        return userLabel ?? parameter.name;
    }, [valueAsLabel, formattedValue, userLabel, parameter.name]);

    const getDefaultNormalizedValue = useCallback(() => {
        if (parameter.type === "continuous") {
            if (parameter.defaultValue !== undefined) {
                return converter.normalize(parameter.defaultValue);
            }
            const isBipolar = parameter.bipolar === true;
            return isBipolar ? 0.5 : 0.0;
        }
        return 0.0;
    }, [converter, parameter]);

    const resetToDefault = useCallback(() => {
        if (!hasCallback) return;
        const defaultNormalized = getDefaultNormalizedValue();
        setNormalizedValue(defaultNormalized);
    }, [hasCallback, getDefaultNormalizedValue, setNormalizedValue]);

    return {
        realValue,
        normalizedValue,
        formattedValue,
        effectiveLabel,
        converter,
        commitValue,
        setNormalizedValue,
        adjustValue,
        getDefaultNormalizedValue,
        resetToDefault,
    };
}
