import { useMemo, useCallback, useRef } from "react";
import { AudioParameter, AudioParameterImpl } from "../models/AudioParameter";

export interface UseAudioParamResult {
    /** The normalized value (0..1) for UI rendering */
    normalizedValue: number;
    /** Formatted string representation of the current value */
    displayValue: string;
    /** The full parameter model instance */
    param: AudioParameterImpl;
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
 * @param paramConfig The parameter definition
 */
export function useAudioParam<T extends number | boolean | string>(
    value: T,
    onChange: undefined | ((value: T) => void),
    paramConfig: AudioParameter
): UseAudioParamResult {
    // 1. Ensure we always have an instance with methods
    const param = useMemo(() => {
        return new AudioParameterImpl(paramConfig);
    }, [paramConfig]);

    // 2. Calculate normalized value for the View (0..1)
    const normalizedValue = useMemo(() => {
        return param.normalize(value);
    }, [value, param]);

    // 3. Track the latest value in a ref to avoid stale closures during rapid events (e.g. wheel)
    const valueRef = useRef(value);
    valueRef.current = value; // Sync with prop on every render

    // 4. Provide a setter that takes the normalized value (from UI) and updates the real value
    const setNormalizedValue = useCallback(
        (newNormal: number) => {
            if (!onChange) return;
            // Clamp to 0..1 before denormalizing
            const clamped = Math.max(0, Math.min(1, newNormal));
            const realValue = param.denormalize(clamped) as T;

            // Only fire if value actually changed
            if (realValue !== valueRef.current) {
                valueRef.current = realValue; // Optimistic update for subsequent calls in same tick
                onChange(realValue);
            }
        },
        [param, onChange]
    );

    // 5. Helper for incremental updates (wheel, keys)
    const adjustValue = useCallback(
        (delta: number, sensitivity = 0.001) => {
            if (!onChange) return;

            // Use Ref for calculation base to prevent stale closure jitter during rapid events
            const currentReal = valueRef.current;
            const currentNormal = param.normalize(currentReal);

            // For Enum/Boolean, we might want stepping logic, but normalize/denormalize handles it.
            // Adding delta to normalized value works generally if sensitivity is tuned.
            // For enums, sensitivity usually needs to be large enough to jump an index.

            const newNormal = Math.max(0, Math.min(1, currentNormal + delta * sensitivity));
            setNormalizedValue(newNormal);
        },
        [param, onChange, setNormalizedValue]
    );

    // 6. Format for display
    const displayValue = useMemo(() => {
        return param.format(value);
    }, [value, param]);

    return {
        normalizedValue,
        displayValue,
        param,
        setNormalizedValue,
        adjustValue,
    };
}
