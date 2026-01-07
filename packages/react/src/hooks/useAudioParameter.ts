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
 * This is the primary hook for connecting audio parameter models to React components.
 * It handles all value conversions (real ↔ normalized ↔ MIDI) and provides formatted
 * display values. The hook ensures that all conversions go through the MIDI pivot,
 * maintaining consistency with hardware standards.
 *
 * The hook provides:
 * - `normalizedValue`: 0..1 value for UI rendering
 * - `displayValue`: Formatted string for display
 * - `converter`: The AudioParameterConverter instance for advanced operations
 * - `setNormalizedValue`: Set value from normalized input (e.g., from UI slider)
 * - `adjustValue`: Adjust value relatively (e.g., from mouse wheel or drag)
 *
 * @param value The current real-world value (Source of Truth)
 * @param onChange Callback when value changes. Receives an AudioControlEvent with all value representations.
 * @param parameterDef The parameter definition (AudioParameter)
 * @param valueFormatter Optional custom renderer for the value display. If provided and returns a value, it takes precedence over the default formatter.
 * @returns Object containing normalizedValue, displayValue, converter, setNormalizedValue, and adjustValue
 *
 * @example
 * ```tsx
 * const { normalizedValue, displayValue, adjustValue } = useAudioParameter(
 *   volume,
 *   (e) => setVolume(e.value),
 *   volumeParam
 * );
 *
 * // Use normalizedValue for rendering
 * <SvgKnob normalizedValue={normalizedValue} />
 *
 * // Use adjustValue for relative changes
 * <div onWheel={(e) => adjustValue(e.deltaY, 0.001)} />
 * ```
 */
export function useAudioParameter<T extends number | boolean | string>(
    value: T,
    onChange: undefined | ((event: AudioControlEvent<T>) => void),
    parameterDef: AudioParameter,
    valueFormatter?: (value: T, parameterDef: AudioParameter) => string | undefined
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
