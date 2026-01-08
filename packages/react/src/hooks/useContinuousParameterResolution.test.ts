/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useContinuousParameterResolution } from "./useContinuousParameterResolution";
import { AudioParameterFactory, ContinuousParameter } from "@cutoff/audio-ui-core";

describe("useContinuousParameterResolution", () => {
    describe("Strict Mode (Parameter Provided)", () => {
        it("returns the provided parameter directly", () => {
            const providedParam: ContinuousParameter = AudioParameterFactory.createControl({
                id: "test-param",
                name: "Test Parameter",
                min: 0,
                max: 100,
                step: 1,
                unit: "%",
            });

            const { result } = renderHook(() =>
                useContinuousParameterResolution({
                    parameter: providedParam,
                })
            );

            expect(result.current.derivedParameter).toBe(providedParam);
            expect(result.current.derivedParameter.id).toBe("test-param");
            expect(result.current.derivedParameter.name).toBe("Test Parameter");
            expect(result.current.derivedParameter.min).toBe(0);
            expect(result.current.derivedParameter.max).toBe(100);
        });

        it("ignores ad-hoc props when parameter is provided", () => {
            const providedParam: ContinuousParameter = AudioParameterFactory.createControl({
                id: "provided",
                name: "Provided",
                min: 0,
                max: 100,
            });

            const { result } = renderHook(() =>
                useContinuousParameterResolution({
                    parameter: providedParam,
                    paramId: "ignored",
                    label: "Ignored",
                    min: 999,
                    max: 888,
                    step: 0.5,
                    unit: "Hz",
                })
            );

            expect(result.current.derivedParameter).toBe(providedParam);
            expect(result.current.derivedParameter.id).toBe("provided");
            expect(result.current.derivedParameter.name).toBe("Provided");
            expect(result.current.derivedParameter.min).toBe(0);
            expect(result.current.derivedParameter.max).toBe(100);
        });
    });

    describe("Ad-Hoc Mode (Props Only)", () => {
        it("creates parameter from minimal props", () => {
            const { result } = renderHook(() =>
                useContinuousParameterResolution({
                    paramId: "volume",
                    label: "Volume",
                    min: 0,
                    max: 100,
                })
            );

            expect(result.current.derivedParameter.type).toBe("continuous");
            expect(result.current.derivedParameter.id).toBe("volume");
            expect(result.current.derivedParameter.name).toBe("Volume");
            expect(result.current.derivedParameter.min).toBe(0);
            expect(result.current.derivedParameter.max).toBe(100);
        });

        it("creates parameter with all props", () => {
            const { result } = renderHook(() =>
                useContinuousParameterResolution({
                    paramId: "frequency",
                    label: "Frequency",
                    min: 20,
                    max: 20000,
                    step: 0.1,
                    unit: "Hz",
                    scale: "log",
                })
            );

            expect(result.current.derivedParameter.id).toBe("frequency");
            expect(result.current.derivedParameter.name).toBe("Frequency");
            expect(result.current.derivedParameter.min).toBe(20);
            expect(result.current.derivedParameter.max).toBe(20000);
            expect(result.current.derivedParameter.step).toBe(0.1);
            expect(result.current.derivedParameter.unit).toBe("Hz");
            expect(result.current.derivedParameter.scale).toBe("log");
        });

        it("uses default id when paramId is not provided", () => {
            const { result } = renderHook(() =>
                useContinuousParameterResolution({
                    min: 0,
                    max: 100,
                })
            );

            expect(result.current.derivedParameter.id).toBe("adhoc-continuous");
        });

        it("handles bipolar mode", () => {
            const { result } = renderHook(() =>
                useContinuousParameterResolution({
                    paramId: "pan",
                    label: "Pan",
                    bipolar: true,
                    unit: "%",
                })
            );

            expect(result.current.derivedParameter.min).toBe(-100);
            expect(result.current.derivedParameter.max).toBe(100);
            expect(result.current.derivedParameter.defaultValue).toBe(0);
        });

        it("handles scale function object", () => {
            const customScale = {
                forward: (n: number) => n * n,
                inverse: (s: number) => Math.sqrt(s),
                name: "quadratic",
            };

            const { result } = renderHook(() =>
                useContinuousParameterResolution({
                    paramId: "custom",
                    min: 0,
                    max: 100,
                    scale: customScale,
                })
            );

            expect(result.current.derivedParameter.scale).toBe(customScale);
        });

        it("handles scale string shortcuts", () => {
            const { result: linearResult } = renderHook(() =>
                useContinuousParameterResolution({
                    paramId: "linear",
                    min: 0,
                    max: 100,
                    scale: "linear",
                })
            );

            expect(linearResult.current.derivedParameter.scale).toBe("linear");

            const { result: logResult } = renderHook(() =>
                useContinuousParameterResolution({
                    paramId: "log",
                    min: 0,
                    max: 100,
                    scale: "log",
                })
            );

            expect(logResult.current.derivedParameter.scale).toBe("log");

            const { result: expResult } = renderHook(() =>
                useContinuousParameterResolution({
                    paramId: "exp",
                    min: 0,
                    max: 100,
                    scale: "exp",
                })
            );

            expect(expResult.current.derivedParameter.scale).toBe("exp");
        });
    });

    describe("Memoization", () => {
        it("returns same parameter object when props don't change", () => {
            const { result, rerender } = renderHook(() =>
                useContinuousParameterResolution({
                    paramId: "test",
                    min: 0,
                    max: 100,
                })
            );

            const firstParameter = result.current.derivedParameter;

            rerender();

            expect(result.current.derivedParameter).toBe(firstParameter);
        });

        it("recalculates when parameter changes", () => {
            const param1: ContinuousParameter = AudioParameterFactory.createControl({
                id: "param1",
                name: "Param 1",
                min: 0,
                max: 100,
            });

            const param2: ContinuousParameter = AudioParameterFactory.createControl({
                id: "param2",
                name: "Param 2",
                min: 0,
                max: 200,
            });

            const { result, rerender } = renderHook(
                ({ parameter }) =>
                    useContinuousParameterResolution({
                        parameter,
                    }),
                {
                    initialProps: { parameter: param1 },
                }
            );

            const firstParameter = result.current.derivedParameter;
            expect(firstParameter).toBe(param1);

            rerender({ parameter: param2 });

            expect(result.current.derivedParameter).toBe(param2);
            expect(result.current.derivedParameter).not.toBe(firstParameter);
        });

        it("recalculates when ad-hoc props change", () => {
            const { result, rerender } = renderHook(
                ({ min, max }) =>
                    useContinuousParameterResolution({
                        paramId: "test",
                        min,
                        max,
                    }),
                {
                    initialProps: { min: 0, max: 100 },
                }
            );

            const firstParameter = result.current.derivedParameter;
            expect(firstParameter.max).toBe(100);

            rerender({ min: 0, max: 200 });

            expect(result.current.derivedParameter).not.toBe(firstParameter);
            expect(result.current.derivedParameter.max).toBe(200);
        });

        it("recalculates when paramId changes", () => {
            const { result, rerender } = renderHook(
                ({ paramId }) =>
                    useContinuousParameterResolution({
                        paramId,
                        min: 0,
                        max: 100,
                    }),
                {
                    initialProps: { paramId: "param1" },
                }
            );

            const firstParameter = result.current.derivedParameter;
            expect(firstParameter.id).toBe("param1");

            rerender({ paramId: "param2" });

            expect(result.current.derivedParameter).not.toBe(firstParameter);
            expect(result.current.derivedParameter.id).toBe("param2");
        });

        it("recalculates when label changes", () => {
            const { result, rerender } = renderHook(
                ({ label }) =>
                    useContinuousParameterResolution({
                        paramId: "test",
                        label,
                        min: 0,
                        max: 100,
                    }),
                {
                    initialProps: { label: "Volume" },
                }
            );

            const firstParameter = result.current.derivedParameter;
            expect(firstParameter.name).toBe("Volume");

            rerender({ label: "Gain" });

            expect(result.current.derivedParameter).not.toBe(firstParameter);
            expect(result.current.derivedParameter.name).toBe("Gain");
        });

        it("recalculates when step changes", () => {
            const { result, rerender } = renderHook(
                ({ step }) =>
                    useContinuousParameterResolution({
                        paramId: "test",
                        min: 0,
                        max: 100,
                        step,
                    }),
                {
                    initialProps: { step: 1 },
                }
            );

            const firstParameter = result.current.derivedParameter;
            expect(firstParameter.step).toBe(1);

            rerender({ step: 0.1 });

            expect(result.current.derivedParameter).not.toBe(firstParameter);
            expect(result.current.derivedParameter.step).toBe(0.1);
        });

        it("recalculates when bipolar changes", () => {
            const { result, rerender } = renderHook(
                ({ bipolar }) =>
                    useContinuousParameterResolution({
                        paramId: "test",
                        // Don't provide min/max to allow bipolar to set symmetric range
                        bipolar,
                    }),
                {
                    initialProps: { bipolar: false },
                }
            );

            const firstParameter = result.current.derivedParameter;
            // Defaults when not bipolar: min: 0, max: 100
            expect(firstParameter.min).toBe(0);
            expect(firstParameter.max).toBe(100);

            rerender({ bipolar: true });

            expect(result.current.derivedParameter).not.toBe(firstParameter);
            // Bipolar mode with no min/max: defaults to -100 to 100
            expect(result.current.derivedParameter.min).toBe(-100);
            expect(result.current.derivedParameter.max).toBe(100);
        });

        it("recalculates when unit changes", () => {
            const { result, rerender } = renderHook(
                ({ unit }) =>
                    useContinuousParameterResolution({
                        paramId: "test",
                        min: 0,
                        max: 100,
                        unit,
                    }),
                {
                    initialProps: { unit: "%" },
                }
            );

            const firstParameter = result.current.derivedParameter;
            expect(firstParameter.unit).toBe("%");

            rerender({ unit: "dB" });

            expect(result.current.derivedParameter).not.toBe(firstParameter);
            expect(result.current.derivedParameter.unit).toBe("dB");
        });

        it("recalculates when scale changes", () => {
            const { result, rerender } = renderHook(
                ({ scale }) =>
                    useContinuousParameterResolution({
                        paramId: "test",
                        min: 0,
                        max: 100,
                        scale,
                    }),
                {
                    initialProps: { scale: "linear" },
                }
            );

            const firstParameter = result.current.derivedParameter;
            expect(firstParameter.scale).toBe("linear");

            rerender({ scale: "log" });

            expect(result.current.derivedParameter).not.toBe(firstParameter);
            expect(result.current.derivedParameter.scale).toBe("log");
        });
    });

    describe("Edge Cases", () => {
        it("handles undefined parameter prop", () => {
            const { result } = renderHook(() =>
                useContinuousParameterResolution({
                    parameter: undefined,
                    paramId: "test",
                    min: 0,
                    max: 100,
                })
            );

            expect(result.current.derivedParameter.type).toBe("continuous");
            expect(result.current.derivedParameter.id).toBe("test");
        });

        it("handles missing min and max in ad-hoc mode", () => {
            const { result } = renderHook(() =>
                useContinuousParameterResolution({
                    paramId: "test",
                })
            );

            // Factory defaults: min: 0, max: 100
            expect(result.current.derivedParameter.min).toBe(0);
            expect(result.current.derivedParameter.max).toBe(100);
        });

        it("handles missing label in ad-hoc mode", () => {
            const { result } = renderHook(() =>
                useContinuousParameterResolution({
                    paramId: "test",
                    min: 0,
                    max: 100,
                })
            );

            expect(result.current.derivedParameter.name).toBe("");
        });

        it("handles empty string props", () => {
            const { result } = renderHook(() =>
                useContinuousParameterResolution({
                    paramId: "",
                    label: "",
                    unit: "",
                    min: 0,
                    max: 100,
                })
            );

            // Empty string is not nullish, so it's used as-is (factory uses id ?? "adhoc-control")
            expect(result.current.derivedParameter.id).toBe("");
            expect(result.current.derivedParameter.name).toBe("");
            expect(result.current.derivedParameter.unit).toBe("");
        });

        it("handles zero values", () => {
            const { result } = renderHook(() =>
                useContinuousParameterResolution({
                    paramId: "zero",
                    min: 0,
                    max: 0,
                    step: 0,
                })
            );

            expect(result.current.derivedParameter.min).toBe(0);
            expect(result.current.derivedParameter.max).toBe(0);
            expect(result.current.derivedParameter.step).toBe(0);
        });

        it("handles negative values", () => {
            const { result } = renderHook(() =>
                useContinuousParameterResolution({
                    paramId: "negative",
                    min: -100,
                    max: -10,
                })
            );

            expect(result.current.derivedParameter.min).toBe(-100);
            expect(result.current.derivedParameter.max).toBe(-10);
        });

        it("handles very large values", () => {
            const { result } = renderHook(() =>
                useContinuousParameterResolution({
                    paramId: "large",
                    min: 0,
                    max: 1e6,
                })
            );

            expect(result.current.derivedParameter.min).toBe(0);
            expect(result.current.derivedParameter.max).toBe(1e6);
        });
    });

    describe("Integration with AudioParameterFactory", () => {
        it("creates parameter that matches factory output", () => {
            const factoryParam = AudioParameterFactory.createControl({
                id: "factory",
                name: "Factory",
                min: 0,
                max: 100,
                step: 1,
                unit: "%",
            });

            const { result } = renderHook(() =>
                useContinuousParameterResolution({
                    paramId: "factory",
                    label: "Factory",
                    min: 0,
                    max: 100,
                    step: 1,
                    unit: "%",
                })
            );

            expect(result.current.derivedParameter.id).toBe(factoryParam.id);
            expect(result.current.derivedParameter.name).toBe(factoryParam.name);
            expect(result.current.derivedParameter.min).toBe(factoryParam.min);
            expect(result.current.derivedParameter.max).toBe(factoryParam.max);
            expect(result.current.derivedParameter.step).toBe(factoryParam.step);
            expect(result.current.derivedParameter.unit).toBe(factoryParam.unit);
        });
    });
});
