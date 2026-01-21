/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { useMemo, useCallback, useRef } from "react";
import { AudioParameter, AudioParameterConverter } from "@cutoff/audio-ui-core";
import { AudioControlEvent } from "../components/types";

export interface UseAudioParameterResult {
    /** The normalized value (0..1) for UI rendering */
    normalizedValue: number;
    /** Formatted string representation of the current value */
    formattedValue: string;
    /** The effective label to display (computed from userLabel, valueAsLabel, or parameter name) */
    effectiveLabel: string;
    /** The full parameter model instance */
    converter: AudioParameterConverter;
    /**
     * Set the value using a normalized (0..1) input.
     * Automatically denormalizes and calls onChange.
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

/**
 * Hook to manage audio parameter logic, normalization, and formatting.
 *
 * This is the primary hook for connecting audio parameter models to React components.
 * It handles all value conversions (real ↔ normalized ↔ MIDI) and provides formatted
 * display values. The hook ensures that all conversions go through the MIDI pivot,
 * maintaining consistency with hardware standards.
 *
 * The hook provides:
 * - `normalizedValue`: 0..1 value for UI rendering
 * - `formattedValue`: Formatted string for display
 * - `converter`: The AudioParameterConverter instance for advanced operations
 * - `setNormalizedValue`: Set value from normalized input (e.g., from UI slider)
 * - `adjustValue`: Adjust value relatively (e.g., from mouse wheel or drag)
 *
 * @param value The current real-world value (Source of Truth)
 * @param onChange Callback when value changes. Receives an AudioControlEvent with all value representations.
 * @param parameterDef The parameter definition (AudioParameter)
 * @param userValueFormatter Optional custom renderer for the value display. If provided and returns a value, it takes precedence over the default formatter.
 * @param userLabel Optional custom label. If provided and valueAsLabel is false, takes precedence over parameter name.
 * @param valueAsLabel When true, displays the formatted value as the label instead of the provided label or parameter name.
 * @returns Object containing normalizedValue, formattedValue, effectiveLabel, converter, setNormalizedValue, and adjustValue
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { normalizedValue, formattedValue, adjustValue } = useAudioParameter(
 *   volume,
 *   (e) => setVolume(e.value),
 *   volumeParam
 * );
 *
 * // With custom label and value formatter
 * const { normalizedValue, formattedValue, effectiveLabel, adjustValue } = useAudioParameter(
 *   volume,
 *   (e) => setVolume(e.value),
 *   volumeParam,
 *   (val) => `${val.toFixed(1)} dB`, // Custom formatter
 *   "Master Volume", // Custom label
 *   false // Don't use value as label
 * );
 *
 * // Use normalizedValue for rendering
 * <KnobView normalizedValue={normalizedValue} />
 *
 * // Use adjustValue for relative changes
 * <div onWheel={(e) => adjustValue(e.deltaY, 0.001)} />
 *
 * // Use effectiveLabel for display
 * <label>{effectiveLabel}</label>
 * ```
 */
export function useAudioParameter<T extends number | boolean | string>(
    value: T,
    onChange: undefined | ((event: AudioControlEvent<T>) => void),
    parameterDef: AudioParameter,
    userValueFormatter?: (value: T, parameterDef: AudioParameter) => string | undefined,
    userLabel?: string,
    valueAsLabel?: boolean
): UseAudioParameterResult {
    const converter = useMemo(() => {
        return new AudioParameterConverter(parameterDef);
    }, [parameterDef]);

    const normalizedValue = useMemo(() => {
        return converter.normalize(value);
    }, [value, converter]);

    // Track latest value in ref to avoid stale closures during rapid events (e.g., wheel)
    const valueRef = useRef(value);
    valueRef.current = value;

    const commitValue = useCallback(
        (newValue: T) => {
            if (!onChange) return;

            const normalized = converter.normalize(newValue);
            const midi = converter.toMidi(newValue);

            onChange({
                value: newValue,
                normalizedValue: normalized,
                midiValue: midi,
                parameter: parameterDef,
            });
        },
        [converter, onChange, parameterDef]
    );

    const setNormalizedValue = useCallback(
        (newNormal: number) => {
            if (!onChange) return;
            const clamped = Math.max(0, Math.min(1, newNormal));
            const realValue = converter.denormalize(clamped) as T;

            if (realValue !== valueRef.current) {
                valueRef.current = realValue;
                commitValue(realValue);
            }
        },
        [converter, onChange, commitValue]
    );

    const adjustValue = useCallback(
        (delta: number, sensitivity = 0.001) => {
            if (!onChange) return;

            // Use ref for calculation base to prevent stale closure jitter during rapid events
            const currentReal = valueRef.current as number;
            const currentNormal = converter.normalize(currentReal);

            const newNormal = Math.max(0, Math.min(1, currentNormal + delta * sensitivity));
            setNormalizedValue(newNormal);
        },
        [converter, onChange, setNormalizedValue]
    );

    // Custom valueFormatter takes precedence if provided and returns a value; otherwise fall back to default formatter
    const formattedValue = useMemo(() => {
        if (userValueFormatter) {
            const customValue = userValueFormatter(value, parameterDef);
            if (customValue !== undefined) {
                return customValue;
            }
        }
        return converter.format(value);
    }, [value, converter, userValueFormatter, parameterDef]);

    // Compute effective label: valueAsLabel takes precedence, then userLabel, then parameter name
    const effectiveLabel = useMemo(() => {
        if (valueAsLabel) {
            return formattedValue;
        }
        return userLabel ?? parameterDef.name;
    }, [valueAsLabel, formattedValue, userLabel, parameterDef.name]);

    // Get default normalized value
    const getDefaultNormalizedValue = useCallback(() => {
        if (parameterDef.type === "continuous") {
            if (parameterDef.defaultValue !== undefined) {
                return converter.normalize(parameterDef.defaultValue);
            }
            // If no defaultValue, use 0.0 for unipolar, 0.5 for bipolar
            const isBipolar = parameterDef.bipolar === true;
            return isBipolar ? 0.5 : 0.0;
        }
        // For non-continuous parameters, return 0.0
        return 0.0;
    }, [converter, parameterDef]);

    // Reset to default value
    const resetToDefault = useCallback(() => {
        if (!onChange) return;
        const defaultNormalized = getDefaultNormalizedValue();
        setNormalizedValue(defaultNormalized);
    }, [onChange, getDefaultNormalizedValue, setNormalizedValue]);

    return {
        normalizedValue,
        formattedValue,
        effectiveLabel,
        converter,
        setNormalizedValue,
        adjustValue,
        getDefaultNormalizedValue,
        resetToDefault,
    };
}
