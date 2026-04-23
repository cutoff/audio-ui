/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioParameter } from "./useAudioParameter";
import { AudioParameterFactory } from "@cutoff/audio-ui-core";

describe("useAudioParameter", () => {
    describe("Continuous Parameter — value channel", () => {
        const param = AudioParameterFactory.createMidiStandard7Bit("Test CC");
        // Range 0-127, Step 1

        it("initializes correctly", () => {
            const { result } = renderHook(() => useAudioParameter<number>({ value: 64, parameter: param }));

            // 64 is approx 0.5039 of 127
            expect(result.current.normalizedValue).toBeCloseTo(64 / 127, 4);
            expect(result.current.formattedValue).toBe("64");
            expect(result.current.realValue).toBe(64);
        });

        it("fires onValueChange via setNormalizedValue", () => {
            const onValueChange = vi.fn();
            const { result } = renderHook(() =>
                useAudioParameter<number>({ value: 64, onValueChange, parameter: param })
            );

            act(() => {
                result.current.setNormalizedValue(1.0);
            });

            expect(onValueChange).toHaveBeenCalledTimes(1);
            expect(onValueChange.mock.calls[0][0]).toBe(127);
            expect(onValueChange.mock.calls[0][1]).toEqual(
                expect.objectContaining({
                    value: 127,
                    normalizedValue: 1,
                    midiValue: 127,
                })
            );
        });

        it("adjusts value relatively via adjustValue", () => {
            const onValueChange = vi.fn();
            const { result } = renderHook(() =>
                useAudioParameter<number>({ value: 0, onValueChange, parameter: param })
            );

            act(() => {
                result.current.adjustValue(0.1, 1.0);
            });

            // 0.1 of 127 is 12.7 -> Rounds to 13
            expect(onValueChange.mock.calls[0][0]).toBe(13);
            expect(onValueChange.mock.calls[0][1]).toEqual(expect.objectContaining({ value: 13 }));
        });

        it("uses custom valueFormatter when provided", () => {
            const userValueFormatter = vi.fn((value: number) => `Custom: ${value}`);
            const { result } = renderHook(() =>
                useAudioParameter<number>({ value: 64, parameter: param, userValueFormatter })
            );

            expect(userValueFormatter).toHaveBeenCalledWith(64, param);
            expect(result.current.formattedValue).toBe("Custom: 64");
        });

        it("falls back to default formatter when valueFormatter returns undefined", () => {
            const userValueFormatter = vi.fn(() => undefined);
            const { result } = renderHook(() =>
                useAudioParameter<number>({ value: 64, parameter: param, userValueFormatter })
            );

            expect(userValueFormatter).toHaveBeenCalledWith(64, param);
            expect(result.current.formattedValue).toBe("64"); // Default formatter
        });
    });

    describe("Continuous Parameter — normalizedValue channel", () => {
        const param = AudioParameterFactory.createMidiStandard7Bit("Cutoff");

        it("resolves real and normalized from a normalizedValue input", () => {
            const { result } = renderHook(() => useAudioParameter<number>({ normalizedValue: 0.5, parameter: param }));

            // Passed-through normalized stays authoritative at 0.5 (no round-trip)
            expect(result.current.normalizedValue).toBeCloseTo(0.5, 4);
            // Real value is denormalize(0.5) — round(0.5 * 127) = 64
            expect(result.current.realValue).toBe(64);
        });

        it("fires onNormalizedValueChange — not onValueChange — when bound via normalizedValue", () => {
            const onValueChange = vi.fn();
            const onNormalizedValueChange = vi.fn();
            const { result } = renderHook(() =>
                useAudioParameter<number>({
                    normalizedValue: 0.5,
                    onValueChange,
                    onNormalizedValueChange,
                    parameter: param,
                })
            );

            act(() => {
                result.current.setNormalizedValue(1.0);
            });

            expect(onValueChange).not.toHaveBeenCalled();
            expect(onNormalizedValueChange).toHaveBeenCalledTimes(1);
            expect(onNormalizedValueChange.mock.calls[0][0]).toBe(1);
            expect(onNormalizedValueChange.mock.calls[0][1]).toEqual(
                expect.objectContaining({
                    value: 127,
                    normalizedValue: 1,
                    midiValue: 127,
                })
            );
        });
    });

    describe("Continuous Parameter — midiValue channel", () => {
        const param = AudioParameterFactory.createMidiStandard7Bit("CC 7");

        it("resolves real and normalized from a midiValue input", () => {
            const { result } = renderHook(() => useAudioParameter<number>({ midiValue: 64, parameter: param }));

            // Normalized computed as 64 / maxMidi (maxMidi = 2^32-1 by default MIDI resolution).
            // For MIDI-standard 7-bit, midiResolution is explicit 7 -> maxMidi = 127.
            expect(result.current.normalizedValue).toBeCloseTo(64 / 127, 4);
            expect(result.current.realValue).toBe(64);
        });

        it("fires onMidiValueChange when bound via midiValue", () => {
            const onMidiValueChange = vi.fn();
            const { result } = renderHook(() =>
                useAudioParameter<number>({ midiValue: 64, onMidiValueChange, parameter: param })
            );

            act(() => {
                result.current.setNormalizedValue(1.0);
            });

            expect(onMidiValueChange).toHaveBeenCalledTimes(1);
            expect(onMidiValueChange.mock.calls[0][0]).toBe(127);
            expect(onMidiValueChange.mock.calls[0][1]).toEqual(
                expect.objectContaining({
                    value: 127,
                    normalizedValue: 1,
                    midiValue: 127,
                })
            );
        });
    });

    describe("Discrete Parameter", () => {
        const param = AudioParameterFactory.createSelector("Wave", [
            { value: "sin", label: "Sine" },
            { value: "saw", label: "Saw" },
            { value: "sqr", label: "Square" },
        ]);

        it("initializes correctly", () => {
            const { result } = renderHook(() => useAudioParameter<string | number>({ value: "saw", parameter: param }));
            // Discrete parameters (7-bit resolution) are quantized.
            // "saw" is index 1 of 3 (0, 1, 2). Normalized ideal is 0.5.
            // MIDI conversion: round(0.5 * 127) = 64.
            // Final normalized: 64 / 127 ≈ 0.5039...
            expect(result.current.normalizedValue).toBeCloseTo(64 / 127, 4);
            expect(result.current.formattedValue).toBe("Saw");
        });

        it("snaps to nearest option on setNormalizedValue and fires onValueChange", () => {
            const onValueChange = vi.fn();
            const { result } = renderHook(() =>
                useAudioParameter<string | number>({ value: "sin", onValueChange, parameter: param })
            );

            act(() => {
                // 0.9 -> should snap to 1.0 (sqr)
                result.current.setNormalizedValue(0.9);
            });

            expect(onValueChange).toHaveBeenCalledTimes(1);
            expect(onValueChange.mock.calls[0][0]).toBe("sqr");
            expect(onValueChange.mock.calls[0][1]).toEqual(expect.objectContaining({ value: "sqr" }));
        });

        it("commits discrete values directly via commitValue", () => {
            const onValueChange = vi.fn();
            const { result } = renderHook(() =>
                useAudioParameter<string | number>({ value: "sin", onValueChange, parameter: param })
            );

            act(() => {
                result.current.commitValue("sqr");
            });

            expect(onValueChange).toHaveBeenCalledTimes(1);
            expect(onValueChange.mock.calls[0][0]).toBe("sqr");
        });
    });
});
