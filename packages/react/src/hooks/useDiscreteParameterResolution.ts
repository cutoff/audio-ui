/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import React, { useMemo } from "react";
import { DiscreteParameter, DiscreteOption, MidiResolution } from "@cutoff/audio-ui-core";
import { OptionViewProps } from "@/primitives/controls/OptionView";

export interface UseDiscreteParameterResolutionProps {
    /** Child elements (OptionView components) for visual content mapping (Hybrid mode)
     *
     * **Visual Content Only**: Children provide ReactNodes for rendering (icons, text, custom components).
     * They do NOT define the parameter model - use `options` prop or `parameter` prop for that.
     *
     * When both `options` and `children` are provided, children are matched to options by value
     * to create the visual content map.
     */
    children?: React.ReactNode;
    /** Option definitions for the parameter model (Ad-Hoc mode)
     *
     * **Parameter Model Only**: This prop defines the parameter structure (value, label, midiValue).
     * It does NOT provide visual content - use `children` (OptionView components) for that.
     *
     * When both `options` and `children` are provided:
     * - `options` defines the parameter model
     * - `children` provide visual content (matched by value)
     */
    options?: DiscreteOption[];
    /** Identifier for the parameter (used in Ad-Hoc mode) */
    paramId?: string;
    /** The parameter definition (Strict or Hybrid mode) */
    parameter?: DiscreteParameter;
    /** Default value (Ad-Hoc mode) or override for parameter default */
    defaultValue?: string | number;
    /** Label for the parameter (Ad-Hoc mode) */
    label?: string;
    /** MIDI resolution in bits (Ad-Hoc mode)
     * @default 7
     */
    midiResolution?: MidiResolution;
    /** MIDI mapping strategy (Ad-Hoc mode)
     * @default "spread"
     */
    midiMapping?: "spread" | "sequential" | "custom";
}

export interface UseDiscreteParameterResolutionResult {
    /** The resolved DiscreteParameter (derived from props or children) */
    derivedParameter: DiscreteParameter;
    /** Map of values to visual content (ReactNodes) from children */
    visualContentMap: Map<string | number, React.ReactNode>;
    /** The effective default value (resolved from parameter, prop, or first option) */
    effectiveDefaultValue: string | number;
}

/**
 * Hook to resolve a DiscreteParameter and visual content from props and/or children.
 *
 * **Important: Options vs Children**
 *
 * - **`options` prop**: Defines the parameter model (value, label, midiValue). Used for parameter structure.
 * - **`children` (OptionView components)**: Provides visual content (ReactNodes) for rendering. Used for display.
 *
 * These serve different purposes and can be used together:
 * - Use `options` when you have data-driven option definitions
 * - Use `children` when you want to provide custom visual content (icons, styled text, etc.)
 * - Use both: `options` for the model, `children` for visuals (matched by value)
 *
 * Supports four modes of operation:
 * 1. **Ad-Hoc Mode (Options prop)**: Model from `options` prop, visual from `children` (if provided) or default rendering
 * 2. **Ad-Hoc Mode (Children only)**: Model inferred from OptionView children, visual from children
 * 3. **Strict Mode (Parameter only)**: Model from `parameter` prop, visual via `renderOption` callback
 * 4. **Hybrid Mode (Parameter + Children)**: Model from `parameter` prop, visual from children (matched by value)
 *
 * @param props - Configuration object for discrete parameter resolution
 * @param props.options - Option definitions for parameter model (Ad-Hoc mode). Takes precedence over children for model.
 * @param props.children - Child elements (OptionView components) for visual content mapping (Hybrid/Ad-Hoc mode)
 * @param props.paramId - Identifier for the parameter (used in Ad-Hoc mode)
 * @param props.parameter - The parameter definition (Strict or Hybrid mode)
 * @param props.defaultValue - Default value (Ad-Hoc mode) or override for parameter default
 * @param props.label - Label for the parameter (Ad-Hoc mode)
 * @param props.midiResolution - MIDI resolution in bits (Ad-Hoc mode, default: 7)
 * @param props.midiMapping - MIDI mapping strategy (Ad-Hoc mode, default: "spread")
 * @returns Object containing the resolved DiscreteParameter, visual content map, and effective default value
 *
 * @example
 * ```tsx
 * // Ad-Hoc Mode with options prop (data-driven)
 * const { derivedParameter } = useDiscreteParameterResolution({
 *   options: [
 *     { value: "sine", label: "Sine Wave" },
 *     { value: "square", label: "Square Wave" }
 *   ],
 *   paramId: "waveform"
 * });
 *
 * // Ad-Hoc Mode with children (visual content)
 * const { derivedParameter, visualContentMap } = useDiscreteParameterResolution({
 *   children: [
 *     <OptionView value="sine"><SineIcon /></OptionView>,
 *     <OptionView value="square"><SquareIcon /></OptionView>
 *   ],
 *   paramId: "waveform"
 * });
 *
 * // Hybrid: options for model, children for visuals
 * const { derivedParameter, visualContentMap } = useDiscreteParameterResolution({
 *   options: [
 *     { value: "sine", label: "Sine Wave", midiValue: 0 },
 *     { value: "square", label: "Square Wave", midiValue: 1 }
 *   ],
 *   children: [
 *     <OptionView value="sine"><SineIcon /></OptionView>,
 *     <OptionView value="square"><SquareIcon /></OptionView>
 *   ],
 *   paramId: "waveform"
 * });
 *
 * // Strict Mode
 * const result = useDiscreteParameterResolution({
 *   parameter: myDiscreteParameter,
 *   defaultValue: "custom"
 * });
 * ```
 */
export function useDiscreteParameterResolution({
    children,
    options,
    paramId,
    parameter,
    defaultValue,
    label,
    midiResolution = 7,
    midiMapping = "spread",
}: UseDiscreteParameterResolutionProps): UseDiscreteParameterResolutionResult {
    return useMemo(() => {
        // Build visual content map from children (always extract visual content if children provided)
        const optionEls = React.Children.toArray(children).filter(
            React.isValidElement
        ) as React.ReactElement<OptionViewProps>[];

        const visualContentMap = new Map<string | number, React.ReactNode>();

        optionEls.forEach((child, index) => {
            const val = child.props.value !== undefined ? child.props.value : index;
            if (child.props.children) {
                visualContentMap.set(val, child.props.children);
            }
        });

        // Determine parameter model
        let param: DiscreteParameter;
        let effectiveDefaultValue: string | number;

        if (parameter) {
            // Strict mode: use provided parameter
            param = parameter;
            effectiveDefaultValue =
                defaultValue !== undefined
                    ? defaultValue
                    : (parameter.defaultValue ?? parameter.options[0]?.value ?? "");
        } else if (options && options.length > 0) {
            // Ad-hoc mode with options prop: use options for parameter model
            effectiveDefaultValue = defaultValue !== undefined ? defaultValue : options[0].value;

            param = {
                id: paramId ?? "adhoc-discrete",
                type: "discrete",
                name: label || "",
                options,
                defaultValue: effectiveDefaultValue,
                midiResolution,
                midiMapping,
            };
        } else {
            // Ad-hoc mode with children only: infer parameter model from children
            const getLabel = (child: React.ReactElement<OptionViewProps>, val: string | number): string => {
                if (child.props.label) return child.props.label;
                if (typeof child.props.children === "string") return child.props.children;
                if (typeof child.props.children === "number") return String(child.props.children);
                // Fallback for icons/elements: use the value key as string
                return String(val);
            };

            const inferredOptions = optionEls.map((child, index) => {
                const val = child.props.value !== undefined ? child.props.value : index;
                return {
                    value: val,
                    label: getLabel(child, val),
                };
            });

            if (inferredOptions.length === 0) {
                inferredOptions.push({ value: 0, label: "None" });
            }

            effectiveDefaultValue = defaultValue !== undefined ? defaultValue : inferredOptions[0].value;

            param = {
                id: paramId ?? "adhoc-discrete",
                type: "discrete",
                name: label || "",
                options: inferredOptions,
                defaultValue: effectiveDefaultValue,
                midiResolution,
                midiMapping,
            };
        }

        return {
            derivedParameter: param,
            visualContentMap: visualContentMap,
            effectiveDefaultValue,
        };
    }, [parameter, options, children, label, paramId, defaultValue, midiResolution, midiMapping]);
}
