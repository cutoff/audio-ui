import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioParam } from "./useAudioParam";
import { MidiParameter } from "../models/AudioParameter";

describe("useAudioParam", () => {
    describe("Continuous Parameter", () => {
        const param = MidiParameter.Standard7Bit("Test CC");
        // Range 0-127, Step 1

        it("initializes correctly", () => {
            const { result } = renderHook(() =>
                useAudioParam(64, undefined, param)
            );

            // 64 is approx 0.5039 of 127
            expect(result.current.normalizedValue).toBeCloseTo(64 / 127, 4);
            expect(result.current.displayValue).toBe("64");
        });

        it("updates via setNormalizedValue", () => {
            const onChange = vi.fn();
            const { result } = renderHook(() =>
                useAudioParam(64, onChange, param)
            );

            act(() => {
                result.current.setNormalizedValue(1.0);
            });

            expect(onChange).toHaveBeenCalledWith(127);
        });

        it("adjusts value relatively", () => {
            const onChange = vi.fn();
            const { result } = renderHook(() =>
                // Start at 0
                useAudioParam(0, onChange, param)
            );

            act(() => {
                // Increase by 10%
                result.current.adjustValue(0.1, 1.0);
            });

            // 0.1 of 127 is 12.7 -> Rounds to 13
            expect(onChange).toHaveBeenCalledWith(13);
        });
    });

    describe("Enum Parameter", () => {
        const param = MidiParameter.Selector("Wave", [
            { value: "sin", label: "Sine" },
            { value: "saw", label: "Saw" },
            { value: "sqr", label: "Square" }
        ]);

        it("initializes correctly", () => {
            const { result } = renderHook(() =>
                useAudioParam("saw", undefined, param)
            );
            expect(result.current.normalizedValue).toBe(0.5);
            expect(result.current.displayValue).toBe("Saw");
        });

        it("snaps to nearest option on setNormalizedValue", () => {
            const onChange = vi.fn();
            const { result } = renderHook(() =>
                useAudioParam("sin", onChange, param)
            );

            act(() => {
                // 0.9 -> should snap to 1.0 (sqr)
                result.current.setNormalizedValue(0.9);
            });

            expect(onChange).toHaveBeenCalledWith("sqr");
        });
    });
});

