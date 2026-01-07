/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import React, { useMemo } from "react";
import { EnumParameter } from "@cutoff/audio-ui-core";
import { OptionProps } from "@/primitives/controls/Option";

export interface UseEnumParameterResolutionProps {
    /** Child elements (Option components) to parse in Ad-Hoc or Hybrid mode */
    children?: React.ReactNode;
    /** Identifier for the parameter (used in Ad-Hoc mode) */
    paramId?: string;
    /** The parameter definition (Strict or Hybrid mode) */
    parameter?: EnumParameter;
    /** Default value (Ad-Hoc mode) or override for parameter default */
    defaultValue?: string | number;
    /** Label for the parameter (Ad-Hoc mode) */
    label?: string;
}

export interface UseEnumParameterResolutionResult {
    /** The resolved EnumParameter (derived from props or children) */
    derivedParameter: EnumParameter;
    /** Map of values to visual content (ReactNodes) from children */
    visualContentMap: Map<string | number, React.ReactNode>;
    /** The effective default value (resolved from parameter, prop, or first option) */
    effectiveDefaultValue: string | number;
}

/**
 * Hook to resolve an EnumParameter and visual content from props and/or children.
 *
 * Supports three modes of operation:
 * 1. Ad-Hoc Mode (Children only): Model inferred from Option children.
 * 2. Strict Mode (Parameter only): Model provided via parameter prop. View via renderOption.
 * 3. Hybrid Mode (Parameter + Children): Model from parameter, View from children (matched by value).
 *
 * @param props - Configuration object for enum parameter resolution
 * @param props.children - Child elements (Option components) to parse in Ad-Hoc or Hybrid mode
 * @param props.paramId - Identifier for the parameter (used in Ad-Hoc mode)
 * @param props.parameter - The parameter definition (Strict or Hybrid mode)
 * @param props.defaultValue - Default value (Ad-Hoc mode) or override for parameter default
 * @param props.label - Label for the parameter (Ad-Hoc mode)
 * @returns Object containing the resolved EnumParameter, visual content map, and effective default value
 *
 * @example
 * ```tsx
 * // Ad-Hoc Mode
 * const { derivedParameter, visualContentMap, effectiveDefaultValue } = useEnumParameterResolution({
 *   children: [
 *     <Option value="sine">Sine</Option>,
 *     <Option value="square">Square</Option>
 *   ],
 *   paramId: "waveform"
 * });
 *
 * // Strict Mode
 * const result = useEnumParameterResolution({
 *   parameter: myEnumParameter,
 *   defaultValue: "custom"
 * });
 * ```
 */
export function useEnumParameterResolution({
    children,
    paramId,
    parameter,
    defaultValue,
    label,
}: UseEnumParameterResolutionProps): UseEnumParameterResolutionResult {
    return useMemo(() => {
        // Build visual content map from children
        const optionEls = React.Children.toArray(children).filter(
            React.isValidElement
        ) as React.ReactElement<OptionProps>[];

        const visualContentMap = new Map<string | number, React.ReactNode>();

        // Extract label for parameter model
        const getLabel = (child: React.ReactElement<OptionProps>, val: string | number): string => {
            if (child.props.label) return child.props.label;
            if (typeof child.props.children === "string") return child.props.children;
            if (typeof child.props.children === "number") return String(child.props.children);
            // Fallback for icons/elements: use the value key as string
            return String(val);
        };

        optionEls.forEach((child, index) => {
            const val = child.props.value !== undefined ? child.props.value : index;
            if (child.props.children) {
                visualContentMap.set(val, child.props.children);
            }
        });

        // Determine parameter model
        let param: EnumParameter;
        let effectiveDefaultValue: string | number;

        if (parameter) {
            // Strict mode: use provided parameter
            param = parameter;
            effectiveDefaultValue =
                defaultValue !== undefined
                    ? defaultValue
                    : (parameter.defaultValue ?? parameter.options[0]?.value ?? "");
        } else {
            // Ad-hoc mode: infer parameter from children
            const options = optionEls.map((child, index) => {
                const val = child.props.value !== undefined ? child.props.value : index;
                return {
                    value: val,
                    label: getLabel(child, val),
                };
            });

            if (options.length === 0) {
                options.push({ value: 0, label: "None" });
            }

            effectiveDefaultValue = defaultValue !== undefined ? defaultValue : options[0].value;

            param = {
                id: paramId ?? "adhoc-enum",
                type: "enum",
                name: label || "",
                options,
                defaultValue: effectiveDefaultValue,
                midiResolution: 7,
                midiMapping: "spread",
            };
        }

        return {
            derivedParameter: param,
            visualContentMap: visualContentMap,
            effectiveDefaultValue,
        };
    }, [parameter, children, label, paramId, defaultValue]);
}
