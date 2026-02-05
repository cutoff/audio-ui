/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDiscreteParameterResolution } from "./useDiscreteParameterResolution";
import OptionView from "../components/primitives/controls/OptionView";
import { DiscreteParameter } from "@cutoff/audio-ui-core";

describe("useDiscreteParameterResolution", () => {
    describe("Ad-Hoc Mode (Children only)", () => {
        it("infers parameter options from OptionView children", () => {
            const children = [
                <OptionView key="1" value="a" label="Option A">
                    A
                </OptionView>,
                <OptionView key="2" value="b" label="Option B">
                    B
                </OptionView>,
            ];

            const { result } = renderHook(() => useDiscreteParameterResolution({ children, paramId: "test-param" }));

            const { derivedParameter, visualContentMap, effectiveDefaultValue } = result.current;

            expect(derivedParameter.id).toBe("test-param");
            expect(derivedParameter.type).toBe("discrete");
            expect(derivedParameter.options).toHaveLength(2);
            expect(derivedParameter.options[0]).toEqual({ value: "a", label: "Option A" });
            expect(derivedParameter.options[1]).toEqual({ value: "b", label: "Option B" });

            // Check inferred default value (first option)
            expect(effectiveDefaultValue).toBe("a");

            // Check visual content map
            expect(visualContentMap.get("a")).toBe("A");
            expect(visualContentMap.get("b")).toBe("B");
        });

        it("infers labels from children text if label prop missing", () => {
            const children = [
                <OptionView key="1" value={0}>
                    Zero
                </OptionView>,
                <OptionView key="2" value={1}>
                    One
                </OptionView>,
            ];

            const { result } = renderHook(() => useDiscreteParameterResolution({ children }));

            const { derivedParameter } = result.current;
            expect(derivedParameter.options[0].label).toBe("Zero");
            expect(derivedParameter.options[1].label).toBe("One");
        });

        it("falls back to stringified value if no label or text content", () => {
            const children = [<OptionView key="1" value={10} />];

            const { result } = renderHook(() => useDiscreteParameterResolution({ children }));
            expect(result.current.derivedParameter.options[0].label).toBe("10");
        });

        it("respects provided defaultValue", () => {
            const children = [
                <OptionView key="1" value="a">
                    A
                </OptionView>,
                <OptionView key="2" value="b">
                    B
                </OptionView>,
            ];

            const { result } = renderHook(() => useDiscreteParameterResolution({ children, defaultValue: "b" }));
            expect(result.current.effectiveDefaultValue).toBe("b");
            expect(result.current.derivedParameter.defaultValue).toBe("b");
        });

        it("handles empty children gracefully", () => {
            const { result } = renderHook(() => useDiscreteParameterResolution({ children: [] }));

            expect(result.current.derivedParameter.options).toHaveLength(1);
            expect(result.current.derivedParameter.options[0]).toEqual({ value: 0, label: "None" });
            expect(result.current.effectiveDefaultValue).toBe(0);
        });

        it("filters out invalid children", () => {
            const children = [
                <OptionView key="1" value="a">
                    A
                </OptionView>,
                null,
                false,
                "Just Text", // Should be ignored as it's not an OptionView element
            ];

            const { result } = renderHook(() => useDiscreteParameterResolution({ children }));

            expect(result.current.derivedParameter.options).toHaveLength(1);
            expect(result.current.derivedParameter.options[0].value).toBe("a");
        });

        it("uses index as value when value prop is missing", () => {
            const children = [<OptionView key="0">First</OptionView>, <OptionView key="1">Second</OptionView>];

            const { result } = renderHook(() => useDiscreteParameterResolution({ children }));

            expect(result.current.derivedParameter.options[0].value).toBe(0);
            expect(result.current.derivedParameter.options[1].value).toBe(1);
        });

        it("respects paramId and label props", () => {
            const children = [
                <OptionView key="1" value="a">
                    A
                </OptionView>,
            ];
            const { result } = renderHook(() =>
                useDiscreteParameterResolution({
                    children,
                    paramId: "custom-id",
                    label: "Custom Param Label",
                })
            );

            expect(result.current.derivedParameter.id).toBe("custom-id");
            expect(result.current.derivedParameter.name).toBe("Custom Param Label");
        });
    });

    describe("Strict Mode (Parameter only)", () => {
        const param: DiscreteParameter = {
            id: "strict-param",
            type: "discrete",
            name: "Strict",
            defaultValue: "x",
            options: [
                { value: "x", label: "X" },
                { value: "y", label: "Y" },
            ],
        };

        it("uses provided parameter directly", () => {
            const { result } = renderHook(() => useDiscreteParameterResolution({ parameter: param }));

            expect(result.current.derivedParameter).toBe(param);
            expect(result.current.effectiveDefaultValue).toBe("x");
            expect(result.current.visualContentMap.size).toBe(0);
        });

        it("overrides defaultValue if provided", () => {
            const { result } = renderHook(() =>
                useDiscreteParameterResolution({ parameter: param, defaultValue: "y" })
            );
            expect(result.current.effectiveDefaultValue).toBe("y");
        });
    });

    describe("Hybrid Mode (Parameter + Children)", () => {
        const param: DiscreteParameter = {
            id: "hybrid-param",
            type: "discrete",
            name: "Hybrid",
            defaultValue: 1,
            options: [
                { value: 1, label: "One" },
                { value: 2, label: "Two" },
            ],
        };

        it("uses parameter for model but extracts visual content from children", () => {
            const children = [
                <OptionView key="1" value={1}>
                    <span>Visual One</span>
                </OptionView>,
                <OptionView key="2" value={2}>
                    <span>Visual Two</span>
                </OptionView>,
            ];

            const { result } = renderHook(() => useDiscreteParameterResolution({ parameter: param, children }));

            expect(result.current.derivedParameter).toBe(param);

            // Visual map should be populated
            const content1 = result.current.visualContentMap.get(1) as React.ReactElement;
            const _content2 = result.current.visualContentMap.get(2) as React.ReactElement;

            expect(content1.type).toBe("span");
            expect(content1.props.children).toBe("Visual One");
        });

        it("matches visual content by value even if order differs", () => {
            const children = [
                <OptionView key="2" value={2}>
                    <span>Two</span>
                </OptionView>,
                <OptionView key="1" value={1}>
                    <span>One</span>
                </OptionView>,
            ];

            const { result } = renderHook(() => useDiscreteParameterResolution({ parameter: param, children }));

            expect(result.current.visualContentMap.get(1)).not.toBeUndefined();
            expect(result.current.visualContentMap.get(2)).not.toBeUndefined();
        });
    });
});
