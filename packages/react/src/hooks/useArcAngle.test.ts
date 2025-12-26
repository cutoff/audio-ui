import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useArcAngle } from "./useArcAngle";

describe("useArcAngle", () => {
    it("calculates correct angles for default openness (90)", () => {
        const { result } = renderHook(() => useArcAngle(0.5, 90));

        // For openness 90 with default rotation (0):
        // start = 180 + 45 = 225
        // end = 540 - 45 = 495
        expect(result.current.startAngle).toBe(225);
        expect(result.current.endAngle).toBe(495);
    });

    it("calculates correct value-to-angle conversion for center value", () => {
        const { result } = renderHook(() => useArcAngle(0.5, 90));

        // value 0.5 -> angle = 225 + 0.5 * 270 = 360
        expect(result.current.valueToAngle).toBe(360);
    });

    it("calculates correct value-to-angle conversion for min value", () => {
        const { result } = renderHook(() => useArcAngle(0, 90));

        // value 0 -> angle = 225
        expect(result.current.valueToAngle).toBe(225);
    });

    it("calculates correct value-to-angle conversion for max value", () => {
        const { result } = renderHook(() => useArcAngle(1, 90));

        // value 1 -> angle = 495
        expect(result.current.valueToAngle).toBe(495);
    });

    it("clamps normalized value to 0-1 range", () => {
        const { result: resultNegative } = renderHook(() => useArcAngle(-0.5, 90));
        expect(resultNegative.current.normalizedValue).toBe(0);

        const { result: resultOver } = renderHook(() => useArcAngle(1.5, 90));
        expect(resultOver.current.normalizedValue).toBe(1);
    });

    it("clamps openness to 0-360 range", () => {
        const { result: resultNegative } = renderHook(() => useArcAngle(0.5, -10));
        expect(resultNegative.current.openness).toBe(0);

        const { result: resultOver } = renderHook(() => useArcAngle(0.5, 400));
        expect(resultOver.current.openness).toBe(360);
    });

    it("handles different openness values", () => {
        const { result: result180 } = renderHook(() => useArcAngle(0.5, 180));

        // For openness 180 with default rotation (0):
        // start = 180 + 90 = 270
        // end = 540 - 90 = 450
        expect(result180.current.startAngle).toBe(270);
        expect(result180.current.endAngle).toBe(450);
    });

    it("handles closed arc (openness 0)", () => {
        const { result } = renderHook(() => useArcAngle(0.5, 0));

        // For openness 0 with default rotation (0):
        // start = 180
        // end = 540
        expect(result.current.startAngle).toBe(180);
        expect(result.current.endAngle).toBe(540);
    });

    it("handles full circle (openness 360)", () => {
        const { result } = renderHook(() => useArcAngle(0.5, 360));

        // For openness 360 with default rotation (0):
        // start = 360
        // end = 360
        expect(result.current.startAngle).toBe(360);
        expect(result.current.endAngle).toBe(360);
    });

    it("uses default openness of 90 when not provided", () => {
        const { result } = renderHook(() => useArcAngle(0.5));

        expect(result.current.openness).toBe(90);
        expect(result.current.startAngle).toBe(225);
        expect(result.current.endAngle).toBe(495);
    });

    it("handles custom rotation", () => {
        const { result } = renderHook(() => useArcAngle(0.5, 90, 180));

        // For openness 90 with rotation 180:
        // base start = 225, rotated = 225 - 180 = 45
        // base end = 495, rotated = 495 - 180 = 315
        // value 0.5 -> base angle = 360, rotated = 360 - 180 = 180
        expect(result.current.startAngle).toBe(45);
        expect(result.current.endAngle).toBe(315);
        expect(result.current.valueToAngle).toBe(180);
    });
});
