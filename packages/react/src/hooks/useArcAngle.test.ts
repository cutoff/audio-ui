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

    it("handles bipolar mode correctly", () => {
        // Default bipolar=false (unipolar)
        const { result: resultUnipolar } = renderHook(() => useArcAngle(0.5, 90, 0, false));
        // Unipolar starts at startAngle (225 for 90 openness)
        expect(resultUnipolar.current.valueStartAngle).toBe(resultUnipolar.current.startAngle);
        expect(resultUnipolar.current.valueStartAngle).toBe(225);

        // bipolar=true
        const { result: resultBipolar } = renderHook(() => useArcAngle(0.5, 90, 0, true));
        // Bipolar starts at center (360)
        expect(resultBipolar.current.valueStartAngle).toBe(360);
    });

    it("handles bipolar mode with rotation", () => {
        // bipolar=true, rotation=180
        const { result } = renderHook(() => useArcAngle(0.5, 90, 180, true));
        // Center 360 - rotation 180 = 180
        expect(result.current.valueStartAngle).toBe(180);
    });

    describe("discrete positions", () => {
        it("snaps to nearest position with 5 positions", () => {
            // 5 positions: 0, 0.25, 0.5, 0.75, 1.0
            const { result: result1 } = renderHook(() => useArcAngle(0.1, 90, 0, false, 5));
            expect(result1.current.normalizedValue).toBe(0); // Snaps to position 0

            const { result: result2 } = renderHook(() => useArcAngle(0.3, 90, 0, false, 5));
            expect(result2.current.normalizedValue).toBe(0.25); // Snaps to position 1

            const { result: result3 } = renderHook(() => useArcAngle(0.5, 90, 0, false, 5));
            expect(result3.current.normalizedValue).toBe(0.5); // Snaps to position 2

            const { result: result4 } = renderHook(() => useArcAngle(0.7, 90, 0, false, 5));
            expect(result4.current.normalizedValue).toBe(0.75); // Snaps to position 3

            const { result: result5 } = renderHook(() => useArcAngle(0.9, 90, 0, false, 5));
            expect(result5.current.normalizedValue).toBe(1.0); // Snaps to position 4
        });

        it("handles single position (always center)", () => {
            const { result } = renderHook(() => useArcAngle(0.3, 90, 0, false, 1));
            expect(result.current.normalizedValue).toBe(0.5);
        });

        it("handles two positions (binary)", () => {
            // 2 positions: 0, 1.0
            const { result: result1 } = renderHook(() => useArcAngle(0.3, 90, 0, false, 2));
            expect(result1.current.normalizedValue).toBe(0); // Snaps to position 0

            const { result: result2 } = renderHook(() => useArcAngle(0.7, 90, 0, false, 2));
            expect(result2.current.normalizedValue).toBe(1.0); // Snaps to position 1
        });

        it("works with bipolar mode and discrete positions", () => {
            // 5 positions in bipolar mode
            const { result: resultCenter } = renderHook(() => useArcAngle(0.5, 90, 0, true, 5));
            expect(resultCenter.current.normalizedValue).toBe(0.5);
            expect(resultCenter.current.valueStartAngle).toBe(360); // Bipolar starts at center

            const { result: resultMin } = renderHook(() => useArcAngle(0.1, 90, 0, true, 5));
            expect(resultMin.current.normalizedValue).toBe(0);
            expect(resultMin.current.valueStartAngle).toBe(360); // Still starts at center for bipolar

            const { result: resultMax } = renderHook(() => useArcAngle(0.9, 90, 0, true, 5));
            expect(resultMax.current.normalizedValue).toBe(1.0);
            expect(resultMax.current.valueStartAngle).toBe(360); // Still starts at center for bipolar
        });

        it("works with unipolar mode and discrete positions", () => {
            // 5 positions in unipolar mode
            const { result: resultMin } = renderHook(() => useArcAngle(0.1, 90, 0, false, 5));
            expect(resultMin.current.normalizedValue).toBe(0);
            expect(resultMin.current.valueStartAngle).toBe(225); // Unipolar starts at startAngle

            const { result: resultMax } = renderHook(() => useArcAngle(0.9, 90, 0, false, 5));
            expect(resultMax.current.normalizedValue).toBe(1.0);
            expect(resultMax.current.valueStartAngle).toBe(225); // Unipolar starts at startAngle
        });

        it("maintains continuous mode when positions is undefined", () => {
            const { result } = renderHook(() => useArcAngle(0.37, 90, 0, false, undefined));
            expect(result.current.normalizedValue).toBe(0.37); // No snapping
        });

        it("maintains continuous mode when positions is less than 1", () => {
            const { result } = renderHook(() => useArcAngle(0.37, 90, 0, false, 0));
            expect(result.current.normalizedValue).toBe(0.37); // No snapping
        });

        it("calculates correct angles for discrete positions", () => {
            // 5 positions, position 2 (0.5) should map to angle 360 for 90 openness
            const { result } = renderHook(() => useArcAngle(0.5, 90, 0, false, 5));
            expect(result.current.normalizedValue).toBe(0.5);
            expect(result.current.valueToAngle).toBe(360);
        });
    });
});
