/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAdaptiveSize } from "./useAdaptiveSize";
import { getSizeClassForComponent, getSizeStyleForComponent } from "@cutoff/audio-ui-core";

describe("useAdaptiveSize", () => {
    describe("Adaptive Size Mode", () => {
        it("returns undefined for both class and style when adaptiveSize is true", () => {
            const { result } = renderHook(() => useAdaptiveSize(true, "normal", "knob"));

            expect(result.current.sizeClassName).toBeUndefined();
            expect(result.current.sizeStyle).toBeUndefined();
        });

        it("returns undefined regardless of size value when adaptiveSize is true", () => {
            const { result: result1 } = renderHook(() => useAdaptiveSize(true, "xsmall", "knob"));
            const { result: result2 } = renderHook(() => useAdaptiveSize(true, "xlarge", "knob"));

            expect(result1.current.sizeClassName).toBeUndefined();
            expect(result1.current.sizeStyle).toBeUndefined();
            expect(result2.current.sizeClassName).toBeUndefined();
            expect(result2.current.sizeStyle).toBeUndefined();
        });

        it("returns undefined for all component types when adaptiveSize is true", () => {
            const { result: knobResult } = renderHook(() => useAdaptiveSize(true, "normal", "knob"));
            const { result: buttonResult } = renderHook(() => useAdaptiveSize(true, "normal", "button"));
            const { result: keysResult } = renderHook(() => useAdaptiveSize(true, "normal", "keys"));
            const { result: sliderResult } = renderHook(() => useAdaptiveSize(true, "normal", "slider"));

            expect(knobResult.current.sizeClassName).toBeUndefined();
            expect(buttonResult.current.sizeClassName).toBeUndefined();
            expect(keysResult.current.sizeClassName).toBeUndefined();
            expect(sliderResult.current.sizeClassName).toBeUndefined();
        });
    });

    describe("Fixed Size Mode", () => {
        it("calls getSizeClassForComponent when adaptiveSize is false", () => {
            const { result } = renderHook(() => useAdaptiveSize(false, "normal", "knob"));

            expect(result.current.sizeClassName).toBe(getSizeClassForComponent("knob", "normal"));
        });

        it("calls getSizeStyleForComponent when adaptiveSize is false", () => {
            const { result } = renderHook(() => useAdaptiveSize(false, "normal", "knob"));

            expect(result.current.sizeStyle).toEqual(getSizeStyleForComponent("knob", "normal"));
        });

        it("handles all size values", () => {
            const sizes: Array<"xsmall" | "small" | "normal" | "large" | "xlarge"> = [
                "xsmall",
                "small",
                "normal",
                "large",
                "xlarge",
            ];

            sizes.forEach((size) => {
                const { result } = renderHook(() => useAdaptiveSize(false, size, "knob"));
                expect(result.current.sizeClassName).toBe(getSizeClassForComponent("knob", size));
                expect(result.current.sizeStyle).toEqual(getSizeStyleForComponent("knob", size));
            });
        });
    });

    describe("Component Types", () => {
        it("handles knob component type", () => {
            const { result } = renderHook(() => useAdaptiveSize(false, "normal", "knob"));

            expect(result.current.sizeClassName).toBe(getSizeClassForComponent("knob", "normal"));
            expect(result.current.sizeStyle).toEqual(getSizeStyleForComponent("knob", "normal"));
        });

        it("handles button component type", () => {
            const { result } = renderHook(() => useAdaptiveSize(false, "normal", "button"));

            expect(result.current.sizeClassName).toBe(getSizeClassForComponent("button", "normal"));
            expect(result.current.sizeStyle).toEqual(getSizeStyleForComponent("button", "normal"));
        });

        it("handles keys component type", () => {
            const { result } = renderHook(() => useAdaptiveSize(false, "normal", "keys"));

            expect(result.current.sizeClassName).toBe(getSizeClassForComponent("keys", "normal"));
            expect(result.current.sizeStyle).toEqual(getSizeStyleForComponent("keys", "normal"));
        });

        it("handles slider component type without orientation", () => {
            const { result } = renderHook(() => useAdaptiveSize(false, "normal", "slider"));

            expect(result.current.sizeClassName).toBe(getSizeClassForComponent("slider", "normal"));
            expect(result.current.sizeStyle).toEqual(getSizeStyleForComponent("slider", "normal"));
        });
    });

    describe("Slider Orientation", () => {
        it("calls getSizeClassForComponent with orientation when provided", () => {
            const { result: verticalResult } = renderHook(() => useAdaptiveSize(false, "normal", "slider", "vertical"));
            const { result: horizontalResult } = renderHook(() =>
                useAdaptiveSize(false, "normal", "slider", "horizontal")
            );

            expect(verticalResult.current.sizeClassName).toBe(getSizeClassForComponent("slider", "normal", "vertical"));
            expect(horizontalResult.current.sizeClassName).toBe(
                getSizeClassForComponent("slider", "normal", "horizontal")
            );
        });

        it("calls getSizeStyleForComponent with orientation when provided", () => {
            const { result: verticalResult } = renderHook(() => useAdaptiveSize(false, "normal", "slider", "vertical"));
            const { result: horizontalResult } = renderHook(() =>
                useAdaptiveSize(false, "normal", "slider", "horizontal")
            );

            expect(verticalResult.current.sizeStyle).toEqual(getSizeStyleForComponent("slider", "normal", "vertical"));
            expect(horizontalResult.current.sizeStyle).toEqual(
                getSizeStyleForComponent("slider", "normal", "horizontal")
            );
        });

        it("uses default orientation (vertical) when orientation is undefined", () => {
            const { result } = renderHook(() => useAdaptiveSize(false, "normal", "slider"));

            expect(result.current.sizeClassName).toBe(getSizeClassForComponent("slider", "normal", "vertical"));
            expect(result.current.sizeStyle).toEqual(getSizeStyleForComponent("slider", "normal", "vertical"));
        });

        it("ignores orientation for non-slider components", () => {
            const { result: knobResult } = renderHook(() => useAdaptiveSize(false, "normal", "knob", "vertical"));
            const { result: knobResultNoOrientation } = renderHook(() => useAdaptiveSize(false, "normal", "knob"));

            // Orientation should be ignored for knob, so results should be the same
            expect(knobResult.current.sizeClassName).toBe(knobResultNoOrientation.current.sizeClassName);
            expect(knobResult.current.sizeStyle).toEqual(knobResultNoOrientation.current.sizeStyle);
        });
    });

    describe("Memoization", () => {
        it("returns same object reference when dependencies don't change", () => {
            const { result, rerender } = renderHook(() => useAdaptiveSize(false, "normal", "knob"));

            const firstResult = result.current;
            rerender();
            const secondResult = result.current;

            // Same dependencies, should be same reference (memoized)
            expect(firstResult).toBe(secondResult);
        });

        it("returns new object when adaptiveSize changes", () => {
            const { result, rerender } = renderHook(
                ({ adaptiveSize }) => useAdaptiveSize(adaptiveSize, "normal", "knob"),
                { initialProps: { adaptiveSize: false } }
            );

            const firstResult = result.current;
            rerender({ adaptiveSize: true });
            const secondResult = result.current;

            expect(firstResult).not.toBe(secondResult);
            expect(secondResult.sizeClassName).toBeUndefined();
        });

        it("returns new object when size changes", () => {
            const { result, rerender } = renderHook(
                ({ size }: { size: "normal" | "large" }) => useAdaptiveSize(false, size, "knob"),
                { initialProps: { size: "normal" as const } }
            );

            const firstResult = result.current;
            rerender({ size: "large" });
            const secondResult = result.current;

            expect(firstResult).not.toBe(secondResult);
            expect(secondResult.sizeClassName).toBe(getSizeClassForComponent("knob", "large"));
        });

        it("returns new object when componentType changes", () => {
            const { result, rerender } = renderHook(
                ({ componentType }: { componentType: "knob" | "button" }) =>
                    useAdaptiveSize(false, "normal", componentType),
                { initialProps: { componentType: "knob" as const } }
            );

            const firstResult = result.current;
            rerender({ componentType: "button" });
            const secondResult = result.current;

            expect(firstResult).not.toBe(secondResult);
            expect(secondResult.sizeClassName).toBe(getSizeClassForComponent("button", "normal"));
        });

        it("returns new object when orientation changes", () => {
            const { result, rerender } = renderHook(
                ({ orientation }: { orientation: "vertical" | "horizontal" }) =>
                    useAdaptiveSize(false, "normal", "slider", orientation),
                { initialProps: { orientation: "vertical" as const } }
            );

            const firstResult = result.current;
            rerender({ orientation: "horizontal" });
            const secondResult = result.current;

            expect(firstResult).not.toBe(secondResult);
            expect(secondResult.sizeClassName).toBe(getSizeClassForComponent("slider", "normal", "horizontal"));
        });

        it("does not recalculate when unrelated props change", () => {
            const { result, rerender } = renderHook(
                ({ adaptiveSize, size, componentType }) => useAdaptiveSize(adaptiveSize, size, componentType),
                { initialProps: { adaptiveSize: false, size: "normal" as const, componentType: "knob" as const } }
            );

            const firstResult = result.current;
            // Change something unrelated (not a dependency)
            rerender({ adaptiveSize: false, size: "normal", componentType: "knob" });
            const secondResult = result.current;

            // Should be same reference (memoized)
            expect(firstResult).toBe(secondResult);
        });
    });

    describe("Default Parameters", () => {
        it("uses default adaptiveSize=false when not provided", () => {
            const { result } = renderHook(() => useAdaptiveSize(undefined, "normal", "knob"));

            // Should behave as if adaptiveSize=false
            expect(result.current.sizeClassName).toBeDefined();
            expect(result.current.sizeStyle).toBeDefined();
        });

        it("uses default size=normal when not provided", () => {
            const { result } = renderHook(() => useAdaptiveSize(false, undefined, "knob"));

            expect(result.current.sizeClassName).toBe(getSizeClassForComponent("knob", "normal"));
            expect(result.current.sizeStyle).toEqual(getSizeStyleForComponent("knob", "normal"));
        });
    });

    describe("Integration with Core Functions", () => {
        it("correctly integrates with getSizeClassForComponent for all component types", () => {
            const componentTypes: Array<"knob" | "button" | "keys" | "slider"> = ["knob", "button", "keys", "slider"];

            componentTypes.forEach((componentType) => {
                const { result } = renderHook(() => useAdaptiveSize(false, "normal", componentType));
                expect(result.current.sizeClassName).toBe(getSizeClassForComponent(componentType, "normal"));
            });
        });

        it("correctly integrates with getSizeStyleForComponent for all component types", () => {
            const componentTypes: Array<"knob" | "button" | "keys" | "slider"> = ["knob", "button", "keys", "slider"];

            componentTypes.forEach((componentType) => {
                const { result } = renderHook(() => useAdaptiveSize(false, "normal", componentType));
                expect(result.current.sizeStyle).toEqual(getSizeStyleForComponent(componentType, "normal"));
            });
        });

        it("correctly integrates with orientation for sliders", () => {
            const { result: verticalResult } = renderHook(() => useAdaptiveSize(false, "large", "slider", "vertical"));
            const { result: horizontalResult } = renderHook(() =>
                useAdaptiveSize(false, "large", "slider", "horizontal")
            );

            expect(verticalResult.current.sizeClassName).toBe(getSizeClassForComponent("slider", "large", "vertical"));
            expect(horizontalResult.current.sizeClassName).toBe(
                getSizeClassForComponent("slider", "large", "horizontal")
            );
            expect(verticalResult.current.sizeStyle).toEqual(getSizeStyleForComponent("slider", "large", "vertical"));
            expect(horizontalResult.current.sizeStyle).toEqual(
                getSizeStyleForComponent("slider", "large", "horizontal")
            );
        });
    });
});
