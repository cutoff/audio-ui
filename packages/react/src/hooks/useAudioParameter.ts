import { useMemo, useCallback, useRef } from "react";
import { AudioParameter, AudioParameterConverter } from "@cutoff/audio-ui-core";
import { AudioControlEvent } from "../components/types";

export interface UseAudioParameterResult {
    /** The normalized value (0..1) for UI rendering */
    normalizedValue: number;
    /** Formatted string representation of the current value */
    displayValue: string;
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
}

/**
 * Hook to manage audio parameter logic, normalization, and formatting.
 *
 * @param value The current real-world value (Source of Truth)
 * @param onChange Callback when value changes
 * @param parameterDef The parameter definition
 * @param valueFormatter Optional custom renderer for the value display. If provided and returns a value, it takes precedence over the default formatter.
 */
export function useAudioParameter<T extends number | boolean | string>(
    value: T,
    onChange: undefined | ((event: AudioControlEvent<T>) => void),
    parameterDef: AudioParameter,
    valueFormatter?: (value: T, parameterDef: AudioParameter) => string | undefined
): UseAudioParameterResult {
    // 1. Ensure we always have an instance with methods
    const converter = useMemo(() => {
        return new AudioParameterConverter(parameterDef);
    }, [parameterDef]);

    // 2. Calculate normalized value for the View (0..1)
    const normalizedValue = useMemo(() => {
        return converter.normalize(value);
    }, [value, converter]);

    // 3. Track the latest value in a ref to avoid stale closures during rapid events (e.g. wheel)
    const valueRef = useRef(value);
    valueRef.current = value; // Sync with prop on every render

    // Helper to commit value changes
    const commitValue = useCallback(
        (newValue: T) => {
            if (!onChange) return;

            // Compute all representations at the source of truth
            // normalize() accepts T (number | boolean | string)
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

    // 4. Provide a setter that takes the normalized value (from UI) and updates the real value
    const setNormalizedValue = useCallback(
        (newNormal: number) => {
            if (!onChange) return;
            // Clamp to 0..1 before denormalizing
            const clamped = Math.max(0, Math.min(1, newNormal));
            const realValue = converter.denormalize(clamped) as T;

            // Only fire if value actually changed
            if (realValue !== valueRef.current) {
                valueRef.current = realValue; // Optimistic update
                commitValue(realValue);
            }
        },
        [converter, onChange, commitValue]
    );

    // 5. Helper for incremental updates (wheel, keys)
    const adjustValue = useCallback(
        (delta: number, sensitivity = 0.001) => {
            if (!onChange) return;

            // Use Ref for calculation base to prevent stale closure jitter during rapid events
            const currentReal = valueRef.current as number;
            const currentNormal = converter.normalize(currentReal);

            const newNormal = Math.max(0, Math.min(1, currentNormal + delta * sensitivity));
            setNormalizedValue(newNormal);
        },
        [converter, onChange, setNormalizedValue]
    );

    // 6. Format for display
    // Custom valueFormatter takes precedence if provided and returns a value; otherwise fall back to default formatter
    const displayValue = useMemo(() => {
        if (valueFormatter) {
            const customValue = valueFormatter(value, parameterDef);
            if (customValue !== undefined) {
                return customValue;
            }
        }
        return converter.format(value);
    }, [value, converter, valueFormatter, parameterDef]);

    return {
        normalizedValue,
        displayValue,
        converter,
        setNormalizedValue,
        adjustValue,
    };
}
