import React from "react";
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEnumParameterResolution } from "./useEnumParameterResolution";
import Option from "../components/primitives/controls/Option";
import { EnumParameter } from "@cutoff/audio-ui-core";

describe("useEnumParameterResolution", () => {
    describe("Ad-Hoc Mode (Children only)", () => {
        it("infers parameter options from Option children", () => {
            const children = [
                <Option key="1" value="a" label="Option A">
                    A
                </Option>,
                <Option key="2" value="b" label="Option B">
                    B
                </Option>,
            ];

            const { result } = renderHook(() => useEnumParameterResolution({ children, paramId: "test-param" }));

            const { derivedParameter, visualContentMap, defaultVal } = result.current;

            expect(derivedParameter.id).toBe("test-param");
            expect(derivedParameter.type).toBe("enum");
            expect(derivedParameter.options).toHaveLength(2);
            expect(derivedParameter.options[0]).toEqual({ value: "a", label: "Option A" });
            expect(derivedParameter.options[1]).toEqual({ value: "b", label: "Option B" });

            // Check inferred default value (first option)
            expect(defaultVal).toBe("a");

            // Check visual content map
            expect(visualContentMap.get("a")).toBe("A");
            expect(visualContentMap.get("b")).toBe("B");
        });

        it("infers labels from children text if label prop missing", () => {
            const children = [
                <Option key="1" value={0}>
                    Zero
                </Option>,
                <Option key="2" value={1}>
                    One
                </Option>,
            ];

            const { result } = renderHook(() => useEnumParameterResolution({ children }));

            const { derivedParameter } = result.current;
            expect(derivedParameter.options[0].label).toBe("Zero");
            expect(derivedParameter.options[1].label).toBe("One");
        });

        it("falls back to stringified value if no label or text content", () => {
            const children = [<Option key="1" value={10} />];

            const { result } = renderHook(() => useEnumParameterResolution({ children }));
            expect(result.current.derivedParameter.options[0].label).toBe("10");
        });

        it("respects provided defaultValue", () => {
            const children = [
                <Option key="1" value="a">
                    A
                </Option>,
                <Option key="2" value="b">
                    B
                </Option>,
            ];

            const { result } = renderHook(() => useEnumParameterResolution({ children, defaultValue: "b" }));
            expect(result.current.defaultVal).toBe("b");
            expect(result.current.derivedParameter.defaultValue).toBe("b");
        });

        it("handles empty children gracefully", () => {
            const { result } = renderHook(() => useEnumParameterResolution({ children: [] }));

            expect(result.current.derivedParameter.options).toHaveLength(1);
            expect(result.current.derivedParameter.options[0]).toEqual({ value: 0, label: "None" });
            expect(result.current.defaultVal).toBe(0);
        });

        it("filters out invalid children", () => {
            const children = [
                <Option key="1" value="a">
                    A
                </Option>,
                null,
                false,
                "Just Text", // Should be ignored as it's not an Option element
            ];

            const { result } = renderHook(() => useEnumParameterResolution({ children }));

            expect(result.current.derivedParameter.options).toHaveLength(1);
            expect(result.current.derivedParameter.options[0].value).toBe("a");
        });

        it("uses index as value when value prop is missing", () => {
            const children = [<Option key="0">First</Option>, <Option key="1">Second</Option>];

            const { result } = renderHook(() => useEnumParameterResolution({ children }));

            expect(result.current.derivedParameter.options[0].value).toBe(0);
            expect(result.current.derivedParameter.options[1].value).toBe(1);
        });

        it("respects paramId and label props", () => {
            const children = [
                <Option key="1" value="a">
                    A
                </Option>,
            ];
            const { result } = renderHook(() =>
                useEnumParameterResolution({
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
        const param: EnumParameter = {
            id: "strict-param",
            type: "enum",
            name: "Strict",
            defaultValue: "x",
            options: [
                { value: "x", label: "X" },
                { value: "y", label: "Y" },
            ],
        };

        it("uses provided parameter directly", () => {
            const { result } = renderHook(() => useEnumParameterResolution({ parameter: param }));

            expect(result.current.derivedParameter).toBe(param);
            expect(result.current.defaultVal).toBe("x");
            expect(result.current.visualContentMap.size).toBe(0);
        });

        it("overrides defaultValue if provided", () => {
            const { result } = renderHook(() => useEnumParameterResolution({ parameter: param, defaultValue: "y" }));
            expect(result.current.defaultVal).toBe("y");
        });
    });

    describe("Hybrid Mode (Parameter + Children)", () => {
        const param: EnumParameter = {
            id: "hybrid-param",
            type: "enum",
            name: "Hybrid",
            defaultValue: 1,
            options: [
                { value: 1, label: "One" },
                { value: 2, label: "Two" },
            ],
        };

        it("uses parameter for model but extracts visual content from children", () => {
            const children = [
                <Option key="1" value={1}>
                    <span>Visual One</span>
                </Option>,
                <Option key="2" value={2}>
                    <span>Visual Two</span>
                </Option>,
            ];

            const { result } = renderHook(() => useEnumParameterResolution({ parameter: param, children }));

            expect(result.current.derivedParameter).toBe(param);

            // Visual map should be populated
            const content1 = result.current.visualContentMap.get(1) as React.ReactElement;
            const content2 = result.current.visualContentMap.get(2) as React.ReactElement;

            expect(content1.type).toBe("span");
            expect(content1.props.children).toBe("Visual One");
        });

        it("matches visual content by value even if order differs", () => {
            const children = [
                <Option key="2" value={2}>
                    <span>Two</span>
                </Option>,
                <Option key="1" value={1}>
                    <span>One</span>
                </Option>,
            ];

            const { result } = renderHook(() => useEnumParameterResolution({ parameter: param, children }));

            expect(result.current.visualContentMap.get(1)).not.toBeUndefined();
            expect(result.current.visualContentMap.get(2)).not.toBeUndefined();
        });
    });
});
