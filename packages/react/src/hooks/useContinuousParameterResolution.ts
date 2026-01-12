/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { useMemo } from "react";
import { ContinuousParameter, AudioParameterFactory, ScaleType, MidiResolution } from "@cutoff/audio-ui-core";

export interface UseContinuousParameterResolutionProps {
    /** The parameter definition (Strict mode) */
    parameter?: ContinuousParameter;
    /** Identifier for the parameter (used in Ad-Hoc mode) */
    paramId?: string;
    /** Label for the parameter (Ad-Hoc mode) */
    label?: string;
    /** Minimum value (Ad-Hoc mode) */
    min?: number;
    /** Maximum value (Ad-Hoc mode) */
    max?: number;
    /** Step size for value adjustments (Ad-Hoc mode) */
    step?: number;
    /** Whether the parameter operates in bipolar mode (Ad-Hoc mode) */
    bipolar?: boolean;
    /** Unit suffix for the value (Ad-Hoc mode, e.g. "dB", "Hz") */
    unit?: string;
    /** Scale function or shortcut for the parameter (Ad-Hoc mode) */
    scale?: ScaleType;
    /** MIDI resolution in bits (Ad-Hoc mode)
     * @default 32
     */
    midiResolution?: MidiResolution;
    /** Default value for the parameter (Ad-Hoc mode) */
    defaultValue?: number;
}

export interface UseContinuousParameterResolutionResult {
    /** The resolved ContinuousParameter (derived from props or created from ad-hoc props) */
    derivedParameter: ContinuousParameter;
}

/**
 * Hook to resolve a ContinuousParameter from props.
 *
 * Supports two modes:
 * 1. Strict Mode (Parameter only): Model provided via parameter prop.
 * 2. Ad-Hoc Mode (Props only): Model created from individual props (min, max, step, etc.).
 *
 * When `parameter` is provided, it takes precedence over ad-hoc props.
 *
 * @param props - Configuration object for parameter resolution
 * @param props.parameter - The parameter definition (Strict mode). When provided, takes precedence over ad-hoc props.
 * @param props.paramId - Identifier for the parameter (used in Ad-Hoc mode)
 * @param props.label - Label for the parameter (Ad-Hoc mode)
 * @param props.min - Minimum value (Ad-Hoc mode)
 * @param props.max - Maximum value (Ad-Hoc mode)
 * @param props.step - Step size for value adjustments (Ad-Hoc mode)
 * @param props.bipolar - Whether the parameter operates in bipolar mode (Ad-Hoc mode)
 * @param props.unit - Unit suffix for the value (Ad-Hoc mode, e.g. "dB", "Hz")
 * @param props.scale - Scale function or shortcut for the parameter (Ad-Hoc mode)
 * @param props.midiResolution - MIDI resolution in bits (Ad-Hoc mode, default: 32)
 * @param props.defaultValue - Default value for the parameter (Ad-Hoc mode)
 * @returns Object containing the resolved ContinuousParameter
 *
 * @example
 * ```tsx
 * // Strict mode: use provided parameter
 * const { derivedParameter } = useContinuousParameterResolution({
 *   parameter: volumeParam
 * });
 *
 * // Ad-Hoc mode: create from props
 * const { derivedParameter } = useContinuousParameterResolution({
 *   paramId: "volume",
 *   label: "Volume",
 *   min: 0,
 *   max: 100,
 *   step: 1,
 *   unit: "%"
 * });
 * ```
 */
export function useContinuousParameterResolution({
    parameter,
    paramId,
    label,
    min,
    max,
    step,
    bipolar,
    unit,
    scale,
    midiResolution = 32,
    defaultValue,
}: UseContinuousParameterResolutionProps): UseContinuousParameterResolutionResult {
    return useMemo(() => {
        let derivedParameter: ContinuousParameter;

        if (parameter) {
            // Strict mode: use provided parameter
            derivedParameter = parameter;
        } else {
            // Ad-hoc mode: create parameter from props
            derivedParameter = AudioParameterFactory.createControl({
                id: paramId ?? "adhoc-continuous",
                label,
                min,
                max,
                step,
                bipolar,
                unit,
                scale,
                midiResolution,
                defaultValue,
            });
        }

        return {
            derivedParameter,
        };
    }, [parameter, paramId, label, min, max, step, bipolar, unit, scale, midiResolution, defaultValue]);
}
