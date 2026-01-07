/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { describe, it, expect } from "vitest";
import { polarToCartesian, calculateBoundedRatio, computeFilledZone, calculateArcAngles } from "./math";

describe("math", () => {
    describe("polarToCartesian", () => {
        it("converts polar coordinates to Cartesian at origin", () => {
            const result = polarToCartesian(0, 0, 10, 0);
            expect(result.x).toBeCloseTo(0);
            expect(result.y).toBeCloseTo(-10);
        });

        it("converts polar coordinates to Cartesian at center", () => {
            // 90 degrees: after subtracting 90, becomes 0 radians (pointing right)
            const result = polarToCartesian(50, 50, 10, 90);
            expect(result.x).toBeCloseTo(60); // 50 + 10*cos(0) = 60
            expect(result.y).toBeCloseTo(50); // 50 + 10*sin(0) = 50
        });

        it("handles 180 degrees correctly", () => {
            // 180 degrees: after subtracting 90, becomes 90 degrees = π/2 radians (pointing down)
            const result = polarToCartesian(50, 50, 10, 180);
            expect(result.x).toBeCloseTo(50); // 50 + 10*cos(π/2) = 50
            expect(result.y).toBeCloseTo(60); // 50 + 10*sin(π/2) = 60
        });

        it("handles 270 degrees correctly", () => {
            // 270 degrees: after subtracting 90, becomes 180 degrees = π radians (pointing left)
            const result = polarToCartesian(50, 50, 10, 270);
            expect(result.x).toBeCloseTo(40); // 50 + 10*cos(π) = 40
            expect(result.y).toBeCloseTo(50); // 50 + 10*sin(π) = 50
        });

        it("handles 360 degrees correctly", () => {
            // 360 degrees: after subtracting 90, becomes 270 degrees = 3π/2 radians (pointing up)
            const result = polarToCartesian(50, 50, 10, 360);
            expect(result.x).toBeCloseTo(50); // 50 + 10*cos(3π/2) = 50
            expect(result.y).toBeCloseTo(40); // 50 + 10*sin(3π/2) = 40
        });

        it("handles negative angles", () => {
            // -90 degrees: after subtracting 90, becomes -180 degrees = -π radians (pointing left)
            const result = polarToCartesian(50, 50, 10, -90);
            expect(result.x).toBeCloseTo(40); // 50 + 10*cos(-π) = 40
            expect(result.y).toBeCloseTo(50); // 50 + 10*sin(-π) = 50
        });
    });

    describe("calculateBoundedRatio", () => {
        it("calculates ratio for value at minimum", () => {
            expect(calculateBoundedRatio(0, 0, 100)).toBe(0);
        });

        it("calculates ratio for value at maximum", () => {
            expect(calculateBoundedRatio(100, 0, 100)).toBe(1);
        });

        it("calculates ratio for value at center", () => {
            expect(calculateBoundedRatio(50, 0, 100)).toBe(0.5);
        });

        it("clamps values below minimum to 0", () => {
            expect(calculateBoundedRatio(-10, 0, 100)).toBe(0);
        });

        it("clamps values above maximum to 1", () => {
            expect(calculateBoundedRatio(110, 0, 100)).toBe(1);
        });

        it("handles negative ranges", () => {
            expect(calculateBoundedRatio(-50, -100, 0)).toBe(0.5);
            expect(calculateBoundedRatio(-100, -100, 0)).toBe(0);
            expect(calculateBoundedRatio(0, -100, 0)).toBe(1);
        });

        it("handles non-zero minimum", () => {
            expect(calculateBoundedRatio(25, 20, 30)).toBe(0.5);
            expect(calculateBoundedRatio(20, 20, 30)).toBe(0);
            expect(calculateBoundedRatio(30, 20, 30)).toBe(1);
        });
    });

    describe("computeFilledZone", () => {
        const mainZone = { x: 0, y: 0, w: 100, h: 100 };

        describe("horizontal slider - normal mode", () => {
            it("fills from left edge at minimum value", () => {
                const result = computeFilledZone(mainZone, 0, 0, 100, undefined, true);
                expect(result.x).toBe(0);
                expect(result.w).toBe(0);
                expect(result.y).toBeUndefined();
                expect(result.h).toBeUndefined();
            });

            it("fills halfway at center value", () => {
                const result = computeFilledZone(mainZone, 50, 0, 100, undefined, true);
                expect(result.x).toBe(0);
                expect(result.w).toBe(50);
            });

            it("fills completely at maximum value", () => {
                const result = computeFilledZone(mainZone, 100, 0, 100, undefined, true);
                expect(result.x).toBe(0);
                expect(result.w).toBe(100);
            });

            it("clamps values above maximum", () => {
                const result = computeFilledZone(mainZone, 150, 0, 100, undefined, true);
                expect(result.w).toBe(100);
            });

            it("clamps values below minimum", () => {
                const result = computeFilledZone(mainZone, -10, 0, 100, undefined, true);
                expect(result.w).toBe(0);
            });
        });

        describe("vertical slider - normal mode", () => {
            it("fills from bottom edge at minimum value", () => {
                const result = computeFilledZone(mainZone, 0, 0, 100, undefined, false);
                expect(result.y).toBe(100);
                expect(result.h).toBe(0);
                expect(result.x).toBeUndefined();
                expect(result.w).toBeUndefined();
            });

            it("fills halfway at center value", () => {
                const result = computeFilledZone(mainZone, 50, 0, 100, undefined, false);
                expect(result.y).toBe(50);
                expect(result.h).toBe(50);
            });

            it("fills completely at maximum value", () => {
                const result = computeFilledZone(mainZone, 100, 0, 100, undefined, false);
                expect(result.y).toBe(0);
                expect(result.h).toBe(100);
            });
        });

        describe("horizontal slider - bipolar mode", () => {
            const center = 50;

            it("fills from center to right when value > center", () => {
                const result = computeFilledZone(mainZone, 75, 0, 100, center, true);
                expect(result.x).toBe(50); // center point
                expect(result.w).toBeGreaterThan(0);
                expect(result.w).toBeLessThan(50);
            });

            it("fills from center to left when value < center", () => {
                const result = computeFilledZone(mainZone, 25, 0, 100, center, true);
                expect(result.x).toBeLessThan(50);
                expect(result.w).toBeGreaterThan(0);
                expect(result.w).toBeLessThan(50);
            });

            it("fills completely to right at maximum", () => {
                const result = computeFilledZone(mainZone, 100, 0, 100, center, true);
                expect(result.x).toBe(50);
                expect(result.w).toBe(50);
            });

            it("fills completely to left at minimum", () => {
                const result = computeFilledZone(mainZone, 0, 0, 100, center, true);
                expect(result.x).toBe(0);
                expect(result.w).toBe(50);
            });

            it("has zero width at center value", () => {
                const result = computeFilledZone(mainZone, 50, 0, 100, center, true);
                expect(result.x).toBe(50);
                expect(result.w).toBe(0);
            });
        });

        describe("vertical slider - bipolar mode", () => {
            const center = 50;

            it("fills from center to top when value > center", () => {
                const result = computeFilledZone(mainZone, 75, 0, 100, center, false);
                expect(result.y).toBeLessThan(50);
                expect(result.h).toBeGreaterThan(0);
                expect(result.h).toBeLessThan(50);
            });

            it("fills from center to bottom when value < center", () => {
                const result = computeFilledZone(mainZone, 25, 0, 100, center, false);
                expect(result.y).toBe(50);
                expect(result.h).toBeGreaterThan(0);
                expect(result.h).toBeLessThan(50);
            });

            it("fills completely to top at maximum", () => {
                const result = computeFilledZone(mainZone, 100, 0, 100, center, false);
                expect(result.y).toBe(0);
                expect(result.h).toBe(50);
            });

            it("fills completely to bottom at minimum", () => {
                const result = computeFilledZone(mainZone, 0, 0, 100, center, false);
                expect(result.y).toBe(50);
                expect(result.h).toBe(50);
            });

            it("has zero height at center value", () => {
                const result = computeFilledZone(mainZone, 50, 0, 100, center, false);
                expect(result.y).toBe(50);
                expect(result.h).toBe(0);
            });
        });

        describe("edge cases", () => {
            it("handles zero-sized zone", () => {
                const zeroZone = { x: 0, y: 0, w: 0, h: 0 };
                const result = computeFilledZone(zeroZone, 50, 0, 100, undefined, true);
                expect(result.w).toBe(0);
            });

            it("handles very small zone", () => {
                const smallZone = { x: 0, y: 0, w: 1, h: 1 };
                const result = computeFilledZone(smallZone, 50, 0, 100, undefined, true);
                expect(result.w).toBeGreaterThanOrEqual(0);
                expect(result.w).toBeLessThanOrEqual(1);
            });

            it("handles non-zero positioned zone", () => {
                const offsetZone = { x: 10, y: 20, w: 100, h: 100 };
                const result = computeFilledZone(offsetZone, 50, 0, 100, undefined, true);
                expect(result.x).toBe(10);
                expect(result.w).toBe(50);
            });
        });
    });

    describe("calculateArcAngles", () => {
        it("calculates correct angles for default openness (90)", () => {
            const result = calculateArcAngles(0.5, 90);

            // For openness 90 with default rotation (0):
            // start = 180 + 45 = 225
            // end = 540 - 45 = 495
            expect(result.startAngle).toBe(225);
            expect(result.endAngle).toBe(495);
        });

        it("calculates correct value-to-angle conversion for center value", () => {
            const result = calculateArcAngles(0.5, 90);

            // value 0.5 -> angle = 225 + 0.5 * 270 = 360
            expect(result.valueToAngle).toBe(360);
        });

        it("calculates correct value-to-angle conversion for min value", () => {
            const result = calculateArcAngles(0, 90);

            // value 0 -> angle = 225
            expect(result.valueToAngle).toBe(225);
        });

        it("calculates correct value-to-angle conversion for max value", () => {
            const result = calculateArcAngles(1, 90);

            // value 1 -> angle = 495
            expect(result.valueToAngle).toBe(495);
        });

        it("clamps normalized value to 0-1 range", () => {
            const resultNegative = calculateArcAngles(-0.5, 90);
            expect(resultNegative.normalizedValue).toBe(0);

            const resultOver = calculateArcAngles(1.5, 90);
            expect(resultOver.normalizedValue).toBe(1);
        });

        it("clamps openness to 0-360 range", () => {
            const resultNegative = calculateArcAngles(0.5, -10);
            expect(resultNegative.openness).toBe(0);

            const resultOver = calculateArcAngles(0.5, 400);
            expect(resultOver.openness).toBe(360);
        });

        it("handles different openness values", () => {
            const result180 = calculateArcAngles(0.5, 180);

            // For openness 180 with default rotation (0):
            // start = 180 + 90 = 270
            // end = 540 - 90 = 450
            expect(result180.startAngle).toBe(270);
            expect(result180.endAngle).toBe(450);
        });

        it("handles closed arc (openness 0)", () => {
            const result = calculateArcAngles(0.5, 0);

            // For openness 0 with default rotation (0):
            // start = 180
            // end = 540
            expect(result.startAngle).toBe(180);
            expect(result.endAngle).toBe(540);
        });

        it("handles full circle (openness 360)", () => {
            const result = calculateArcAngles(0.5, 360);

            // For openness 360 with default rotation (0):
            // start = 360
            // end = 360
            expect(result.startAngle).toBe(360);
            expect(result.endAngle).toBe(360);
        });

        it("uses default openness of 90 when not provided", () => {
            const result = calculateArcAngles(0.5);

            expect(result.openness).toBe(90);
            expect(result.startAngle).toBe(225);
            expect(result.endAngle).toBe(495);
        });

        it("handles custom rotation", () => {
            const result = calculateArcAngles(0.5, 90, 180);

            // For openness 90 with rotation 180:
            // base start = 225, rotated = 225 - 180 = 45
            // base end = 495, rotated = 495 - 180 = 315
            // value 0.5 -> base angle = 360, rotated = 360 - 180 = 180
            expect(result.startAngle).toBe(45);
            expect(result.endAngle).toBe(315);
            expect(result.valueToAngle).toBe(180);
        });

        it("handles bipolar mode correctly", () => {
            // Default bipolar=false (unipolar)
            const resultUnipolar = calculateArcAngles(0.5, 90, 0, false);
            // Unipolar starts at startAngle (225 for 90 openness)
            expect(resultUnipolar.valueStartAngle).toBe(resultUnipolar.startAngle);
            expect(resultUnipolar.valueStartAngle).toBe(225);

            // bipolar=true
            const resultBipolar = calculateArcAngles(0.5, 90, 0, true);
            // Bipolar starts at center (360)
            expect(resultBipolar.valueStartAngle).toBe(360);
        });

        it("handles bipolar mode with rotation", () => {
            // bipolar=true, rotation=180
            const result = calculateArcAngles(0.5, 90, 180, true);
            // Center 360 - rotation 180 = 180
            expect(result.valueStartAngle).toBe(180);
        });

        describe("discrete positions", () => {
            it("snaps to nearest position with 5 positions", () => {
                // 5 positions: 0, 0.25, 0.5, 0.75, 1.0
                const result1 = calculateArcAngles(0.1, 90, 0, false, 5);
                expect(result1.normalizedValue).toBe(0); // Snaps to position 0

                const result2 = calculateArcAngles(0.3, 90, 0, false, 5);
                expect(result2.normalizedValue).toBe(0.25); // Snaps to position 1

                const result3 = calculateArcAngles(0.5, 90, 0, false, 5);
                expect(result3.normalizedValue).toBe(0.5); // Snaps to position 2

                const result4 = calculateArcAngles(0.7, 90, 0, false, 5);
                expect(result4.normalizedValue).toBe(0.75); // Snaps to position 3

                const result5 = calculateArcAngles(0.9, 90, 0, false, 5);
                expect(result5.normalizedValue).toBe(1.0); // Snaps to position 4
            });

            it("handles single position (always center)", () => {
                const result = calculateArcAngles(0.3, 90, 0, false, 1);
                expect(result.normalizedValue).toBe(0.5);
            });

            it("handles two positions (binary)", () => {
                // 2 positions: 0, 1.0
                const result1 = calculateArcAngles(0.3, 90, 0, false, 2);
                expect(result1.normalizedValue).toBe(0); // Snaps to position 0

                const result2 = calculateArcAngles(0.7, 90, 0, false, 2);
                expect(result2.normalizedValue).toBe(1.0); // Snaps to position 1
            });

            it("works with bipolar mode and discrete positions", () => {
                // 5 positions in bipolar mode
                const resultCenter = calculateArcAngles(0.5, 90, 0, true, 5);
                expect(resultCenter.normalizedValue).toBe(0.5);
                expect(resultCenter.valueStartAngle).toBe(360); // Bipolar starts at center

                const resultMin = calculateArcAngles(0.1, 90, 0, true, 5);
                expect(resultMin.normalizedValue).toBe(0);
                expect(resultMin.valueStartAngle).toBe(360); // Still starts at center for bipolar

                const resultMax = calculateArcAngles(0.9, 90, 0, true, 5);
                expect(resultMax.normalizedValue).toBe(1.0);
                expect(resultMax.valueStartAngle).toBe(360); // Still starts at center for bipolar
            });

            it("works with unipolar mode and discrete positions", () => {
                // 5 positions in unipolar mode
                const resultMin = calculateArcAngles(0.1, 90, 0, false, 5);
                expect(resultMin.normalizedValue).toBe(0);
                expect(resultMin.valueStartAngle).toBe(225); // Unipolar starts at startAngle

                const resultMax = calculateArcAngles(0.9, 90, 0, false, 5);
                expect(resultMax.normalizedValue).toBe(1.0);
                expect(resultMax.valueStartAngle).toBe(225); // Unipolar starts at startAngle
            });

            it("maintains continuous mode when positions is undefined", () => {
                const result = calculateArcAngles(0.37, 90, 0, false, undefined);
                expect(result.normalizedValue).toBe(0.37); // No snapping
            });

            it("maintains continuous mode when positions is less than 1", () => {
                const result = calculateArcAngles(0.37, 90, 0, false, 0);
                expect(result.normalizedValue).toBe(0.37); // No snapping
            });

            it("calculates correct angles for discrete positions", () => {
                // 5 positions, position 2 (0.5) should map to angle 360 for 90 openness
                const result = calculateArcAngles(0.5, 90, 0, false, 5);
                expect(result.normalizedValue).toBe(0.5);
                expect(result.valueToAngle).toBe(360);
            });
        });
    });
});
