import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioParameter } from "./useAudioParameter";
import { AudioParameterFactory } from "@cutoff/audio-ui-core";

describe("useAudioParameter", () => {
    describe("Continuous Parameter", () => {
        const param = AudioParameterFactory.createMidiStandard7Bit("Test CC");
        // Range 0-127, Step 1

        it("initializes correctly", () => {
            const { result } = renderHook(() => useAudioParameter(64, undefined, param));

            // 64 is approx 0.5039 of 127
            expect(result.current.normalizedValue).toBeCloseTo(64 / 127, 4);
            expect(result.current.displayValue).toBe("64");
        });

        it("updates via setNormalizedValue", () => {
            const onChange = vi.fn();
            const { result } = renderHook(() => useAudioParameter(64, onChange, param));

            act(() => {
                result.current.setNormalizedValue(1.0);
            });

            expect(onChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: 127,
                    normalizedValue: 1,
                    midiValue: 127,
                })
            );
        });

        it("adjusts value relatively", () => {
            const onChange = vi.fn();
            const { result } = renderHook(() =>
                // Start at 0
                useAudioParameter(0, onChange, param)
            );

            act(() => {
                // Increase by 10%
                result.current.adjustValue(0.1, 1.0);
            });

            // 0.1 of 127 is 12.7 -> Rounds to 13
            expect(onChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: 13,
                })
            );
        });

        it("uses custom valueFormatter when provided", () => {
            const valueFormatter = vi.fn((value: number) => `Custom: ${value}`);
            const { result } = renderHook(() => useAudioParameter(64, undefined, param, valueFormatter));

            expect(valueFormatter).toHaveBeenCalledWith(64, param);
            expect(result.current.displayValue).toBe("Custom: 64");
        });

        it("falls back to default formatter when valueFormatter returns undefined", () => {
            const valueFormatter = vi.fn(() => undefined);
            const { result } = renderHook(() => useAudioParameter(64, undefined, param, valueFormatter));

            expect(valueFormatter).toHaveBeenCalledWith(64, param);
            expect(result.current.displayValue).toBe("64"); // Default formatter
        });
    });

    describe("Enum Parameter", () => {
        const param = AudioParameterFactory.createSelector("Wave", [
            { value: "sin", label: "Sine" },
            { value: "saw", label: "Saw" },
            { value: "sqr", label: "Square" },
        ]);

        it("initializes correctly", () => {
            const { result } = renderHook(() => useAudioParameter("saw", undefined, param));
            // Enum parameters (7-bit resolution) are quantized.
            // "saw" is index 1 of 3 (0, 1, 2). Normalized ideal is 0.5.
            // MIDI conversion: round(0.5 * 127) = 64.
            // Final normalized: 64 / 127 ≈ 0.5039...
            expect(result.current.normalizedValue).toBeCloseTo(64 / 127, 4);
            expect(result.current.displayValue).toBe("Saw");
        });

        it("snaps to nearest option on setNormalizedValue", () => {
            const onChange = vi.fn();
            const { result } = renderHook(() => useAudioParameter("sin", onChange, param));

            act(() => {
                // 0.9 -> should snap to 1.0 (sqr)
                result.current.setNormalizedValue(0.9);
            });

            expect(onChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: "sqr",
                })
            );
        });
    });
});
