/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

// @vitest-environment jsdom

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useBooleanParameterResolution } from "./useBooleanParameterResolution";
import { AudioParameterFactory, BooleanParameter } from "@cutoff/audio-ui-core";

describe("useBooleanParameterResolution", () => {
    describe("Strict Mode (Parameter Provided)", () => {
        it("returns the provided parameter directly", () => {
            const providedParam: BooleanParameter = AudioParameterFactory.createSwitch("Test Parameter", "toggle");

            const { result } = renderHook(() =>
                useBooleanParameterResolution({
                    parameter: providedParam,
                })
            );

            expect(result.current.derivedParameter).toBe(providedParam);
            expect(result.current.derivedParameter.id).toBe(providedParam.id);
            expect(result.current.derivedParameter.name).toBe("Test Parameter");
            expect(result.current.derivedParameter.type).toBe("boolean");
            expect(result.current.derivedParameter.mode).toBe("toggle");
        });

        it("ignores ad-hoc props when parameter is provided", () => {
            const providedParam: BooleanParameter = AudioParameterFactory.createSwitch("Provided", "momentary");

            const { result } = renderHook(() =>
                useBooleanParameterResolution({
                    parameter: providedParam,
                    paramId: "ignored",
                    label: "Ignored",
                    latch: true,
                })
            );

            expect(result.current.derivedParameter).toBe(providedParam);
            expect(result.current.derivedParameter.id).toBe(providedParam.id);
            expect(result.current.derivedParameter.name).toBe("Provided");
            expect(result.current.derivedParameter.mode).toBe("momentary");
        });
    });

    describe("Ad-Hoc Mode (Props Only)", () => {
        it("creates parameter from minimal props", () => {
            const { result } = renderHook(() =>
                useBooleanParameterResolution({
                    paramId: "power",
                    label: "Power",
                })
            );

            expect(result.current.derivedParameter.type).toBe("boolean");
            expect(result.current.derivedParameter.id).toBe("power");
            expect(result.current.derivedParameter.name).toBe("Power");
            expect(result.current.derivedParameter.mode).toBe("momentary");
        });

        it("creates parameter with all props", () => {
            const { result } = renderHook(() =>
                useBooleanParameterResolution({
                    paramId: "record",
                    label: "Record",
                    latch: true,
                })
            );

            expect(result.current.derivedParameter.id).toBe("record");
            expect(result.current.derivedParameter.name).toBe("Record");
            expect(result.current.derivedParameter.mode).toBe("toggle");
        });

        it("uses default id when paramId is not provided", () => {
            const { result } = renderHook(() =>
                useBooleanParameterResolution({
                    label: "Test",
                })
            );

            // Factory creates id from name: "sw-test"
            expect(result.current.derivedParameter.id).toBe("sw-test");
        });

        it("handles toggle mode (latch: true)", () => {
            const { result } = renderHook(() =>
                useBooleanParameterResolution({
                    paramId: "toggle",
                    label: "Toggle",
                    latch: true,
                })
            );

            expect(result.current.derivedParameter.mode).toBe("toggle");
        });

        it("handles momentary mode (latch: false)", () => {
            const { result } = renderHook(() =>
                useBooleanParameterResolution({
                    paramId: "momentary",
                    label: "Momentary",
                    latch: false,
                })
            );

            expect(result.current.derivedParameter.mode).toBe("momentary");
        });

        it("defaults to momentary mode when latch is not provided", () => {
            const { result } = renderHook(() =>
                useBooleanParameterResolution({
                    paramId: "default",
                    label: "Default",
                })
            );

            expect(result.current.derivedParameter.mode).toBe("momentary");
        });
    });

    describe("Memoization", () => {
        it("returns same parameter object when props don't change", () => {
            const { result, rerender } = renderHook(() =>
                useBooleanParameterResolution({
                    paramId: "test",
                    label: "Test",
                    latch: false,
                })
            );

            const firstParameter = result.current.derivedParameter;

            rerender();

            expect(result.current.derivedParameter).toBe(firstParameter);
        });

        it("recalculates when parameter changes", () => {
            const param1: BooleanParameter = AudioParameterFactory.createSwitch("Param 1", "toggle");
            const param2: BooleanParameter = AudioParameterFactory.createSwitch("Param 2", "momentary");

            const { result, rerender } = renderHook(
                ({ parameter }) =>
                    useBooleanParameterResolution({
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

        it("recalculates when paramId changes", () => {
            const { result, rerender } = renderHook(
                ({ paramId }) =>
                    useBooleanParameterResolution({
                        paramId,
                        label: "Test",
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
                    useBooleanParameterResolution({
                        paramId: "test",
                        label,
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

        it("recalculates when latch changes", () => {
            const { result, rerender } = renderHook(
                ({ latch }) =>
                    useBooleanParameterResolution({
                        paramId: "test",
                        label: "Test",
                        latch,
                    }),
                {
                    initialProps: { latch: false },
                }
            );

            const firstParameter = result.current.derivedParameter;
            expect(firstParameter.mode).toBe("momentary");

            rerender({ latch: true });

            expect(result.current.derivedParameter).not.toBe(firstParameter);
            expect(result.current.derivedParameter.mode).toBe("toggle");
        });
    });

    describe("Edge Cases", () => {
        it("handles undefined parameter prop", () => {
            const { result } = renderHook(() =>
                useBooleanParameterResolution({
                    parameter: undefined,
                    paramId: "test",
                    label: "Test",
                })
            );

            expect(result.current.derivedParameter.type).toBe("boolean");
            expect(result.current.derivedParameter.id).toBe("test");
        });

        it("handles missing label in ad-hoc mode", () => {
            const { result } = renderHook(() =>
                useBooleanParameterResolution({
                    paramId: "test",
                })
            );

            expect(result.current.derivedParameter.name).toBe("");
        });

        it("handles empty string props", () => {
            const { result } = renderHook(() =>
                useBooleanParameterResolution({
                    paramId: "",
                    label: "",
                })
            );

            // Empty string is not nullish, so it's used as-is
            expect(result.current.derivedParameter.id).toBe("");
            expect(result.current.derivedParameter.name).toBe("");
        });

        it("handles paramId override in ad-hoc mode", () => {
            const { result } = renderHook(() =>
                useBooleanParameterResolution({
                    paramId: "custom-id",
                    label: "Test Button",
                })
            );

            // paramId should override factory-generated id
            expect(result.current.derivedParameter.id).toBe("custom-id");
            expect(result.current.derivedParameter.name).toBe("Test Button");
        });
    });

    describe("Integration with AudioParameterFactory", () => {
        it("creates parameter that matches factory output", () => {
            const factoryParam = AudioParameterFactory.createSwitch("Factory", "toggle");

            const { result } = renderHook(() =>
                useBooleanParameterResolution({
                    paramId: factoryParam.id,
                    label: "Factory",
                    latch: true,
                })
            );

            expect(result.current.derivedParameter.type).toBe(factoryParam.type);
            expect(result.current.derivedParameter.name).toBe(factoryParam.name);
            expect(result.current.derivedParameter.mode).toBe(factoryParam.mode);
            expect(result.current.derivedParameter.defaultValue).toBe(factoryParam.defaultValue);
            expect(result.current.derivedParameter.midiResolution).toBe(factoryParam.midiResolution);
        });
    });
});
