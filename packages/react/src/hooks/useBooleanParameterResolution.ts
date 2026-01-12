/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { useMemo } from "react";
import { BooleanParameter, AudioParameterFactory, MidiResolution } from "@cutoff/audio-ui-core";

export interface UseBooleanParameterResolutionProps {
    /** The parameter definition (Strict mode) */
    parameter?: BooleanParameter;
    /** Identifier for the parameter (used in Ad-Hoc mode) */
    paramId?: string;
    /** Label for the parameter (Ad-Hoc mode) */
    label?: string;
    /** Whether the button should latch (toggle between states) or momentary (only active while pressed) (Ad-Hoc mode) */
    latch?: boolean;
    /** MIDI resolution in bits (Ad-Hoc mode)
     * @default 7
     */
    midiResolution?: MidiResolution;
}

export interface UseBooleanParameterResolutionResult {
    /** The resolved BooleanParameter (derived from props or created from ad-hoc props) */
    derivedParameter: BooleanParameter;
}

/**
 * Hook to resolve a BooleanParameter from props.
 *
 * Supports two modes:
 * 1. Strict Mode (Parameter only): Model provided via parameter prop.
 * 2. Ad-Hoc Mode (Props only): Model created from individual props (label, latch, etc.).
 *
 * When `parameter` is provided, it takes precedence over ad-hoc props.
 *
 * @param props - Configuration object for parameter resolution
 * @param props.parameter - The parameter definition (Strict mode). When provided, takes precedence over ad-hoc props.
 * @param props.paramId - Identifier for the parameter (used in Ad-Hoc mode)
 * @param props.label - Label for the parameter (Ad-Hoc mode)
 * @param props.latch - Whether the button should latch (toggle) or be momentary (Ad-Hoc mode)
 * @param props.midiResolution - MIDI resolution in bits (Ad-Hoc mode, default: 7)
 * @returns Object containing the resolved BooleanParameter
 *
 * @example
 * ```tsx
 * // Strict mode: use provided parameter
 * const { derivedParameter } = useBooleanParameterResolution({
 *   parameter: powerParam
 * });
 *
 * // Ad-Hoc mode: create from props
 * const { derivedParameter } = useBooleanParameterResolution({
 *   paramId: "power",
 *   label: "Power",
 *   latch: true
 * });
 * ```
 */
export function useBooleanParameterResolution({
    parameter,
    paramId,
    label,
    latch,
    midiResolution = 7,
}: UseBooleanParameterResolutionProps): UseBooleanParameterResolutionResult {
    return useMemo(() => {
        let derivedParameter: BooleanParameter;

        if (parameter) {
            // Strict mode: use provided parameter
            derivedParameter = parameter;
        } else {
            // Ad-hoc mode: create parameter from props
            derivedParameter = AudioParameterFactory.createSwitch(label || "", latch ? "toggle" : "momentary");
            // Override id if paramId is provided (including empty string)
            if (paramId !== undefined) {
                derivedParameter = {
                    ...derivedParameter,
                    id: paramId,
                };
            }
            // Override midiResolution if provided
            if (midiResolution !== undefined) {
                derivedParameter = {
                    ...derivedParameter,
                    midiResolution,
                };
            }
        }

        return {
            derivedParameter,
        };
    }, [parameter, paramId, label, latch, midiResolution]);
}
