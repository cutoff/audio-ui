/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { describe, it, expect } from "vitest";
import { calculateArcPath } from "./svg";

describe("svg", () => {
    describe("calculateArcPath", () => {
        it("creates correct arc path for 0-90 degrees (small arc)", () => {
            const path = calculateArcPath(50, 50, 0, 90, 50);
            // Function uses endAngle for start point, startAngle for end point
            // 0° = top (50, 0), 90° = right (100, 50)
            // Start point: angle 90° (right) = (100, 50)
            // End point: angle 0° (top) = (50, 0)
            expect(path).toBe("M 100 50 A 50 50 0 0 0 50 0");
        });

        it("creates correct arc path for 0-180 degrees (small arc)", () => {
            const path = calculateArcPath(50, 50, 0, 180, 50);
            // Function uses endAngle for start point, startAngle for end point
            // 0° = top (50, 0), 180° = bottom (50, 100)
            // Start point: angle 180° (bottom) = (50, 100)
            // End point: angle 0° (top) = (50, 0)
            expect(path).toBe("M 50 100 A 50 50 0 0 0 50 0");
        });

        it("creates correct arc path for 0-270 degrees (large arc)", () => {
            const path = calculateArcPath(50, 50, 0, 270, 50);
            // Function uses endAngle for start point, startAngle for end point
            // 0° = top (50, 0), 270° = left (0, 50)
            // Start point: angle 270° (left) = (0, 50)
            // End point: angle 0° (top) = (50, 0)
            // Large arc flag = 1 because 270° > 180°
            expect(path).toBe("M 0 50 A 50 50 0 1 0 50 0");
        });

        it("creates correct arc path for full circle (0-360)", () => {
            const path = calculateArcPath(50, 50, 0, 360, 50);
            // Function uses endAngle for start point, startAngle for end point
            // 0° = top (50, 0), 360° = top (50, 0) - same point
            // Start point: angle 360° (top) = (50, 0)
            // End point: angle 0° (top) = (50, 0)
            // Large arc flag = 1 because 360° > 180°
            expect(path).toBe("M 50 0 A 50 50 0 1 0 50 0");
        });

        it("swaps angles when start > end and produces identical result", () => {
            const path1 = calculateArcPath(50, 50, 90, 0, 50);
            const path2 = calculateArcPath(50, 50, 0, 90, 50);
            expect(path1).toBe(path2);
            expect(path1).toBe("M 100 50 A 50 50 0 0 0 50 0");
        });

        it("uses large arc flag (1) for angles > 180 degrees", () => {
            const path = calculateArcPath(50, 50, 0, 270, 50);
            // The 8th token (index 7) should be "1" for large arc
            // Format: M x y A rx ry x-axis-rotation large-arc-flag sweep-flag x y
            const parts = path.split(" ");
            expect(parts[7]).toBe("1");
        });

        it("uses small arc flag (0) for angles <= 180 degrees", () => {
            const path = calculateArcPath(50, 50, 0, 90, 50);
            // The 8th token (index 7) should be "0" for small arc
            // Format: M x y A rx ry x-axis-rotation large-arc-flag sweep-flag x y
            const parts = path.split(" ");
            expect(parts[7]).toBe("0");
        });

        it("handles different radius values correctly", () => {
            const path25 = calculateArcPath(50, 50, 0, 90, 25);
            const path50 = calculateArcPath(50, 50, 0, 90, 50);

            // Both should have correct radius values in the path
            expect(path25).toContain("25 25"); // radius appears twice in arc command
            expect(path50).toContain("50 50");

            // Paths should be different
            expect(path25).not.toBe(path50);
        });

        it("handles different center coordinates correctly", () => {
            const pathOrigin = calculateArcPath(0, 0, 0, 90, 50);
            const pathCenter = calculateArcPath(50, 50, 0, 90, 50);

            // Paths should be different
            expect(pathOrigin).not.toBe(pathCenter);

            // Origin path should start at different coordinates
            expect(pathOrigin).toMatch(/^M \d+ \d+/);
            expect(pathCenter).toMatch(/^M \d+ \d+/);
        });

        it("rounds coordinates to 4 decimal places maximum", () => {
            // Use a case that might produce many decimal places
            const path = calculateArcPath(33.333, 66.666, 45.123, 135.789, 25.555);

            // Extract all numbers from the path
            const numbers = path.split(" ").filter((p) => !isNaN(parseFloat(p)));

            numbers.forEach((num) => {
                if (num.includes(".")) {
                    const decimalPlaces = num.split(".")[1].length;
                    expect(decimalPlaces).toBeLessThanOrEqual(4);
                }
            });
        });

        it("produces valid SVG path format", () => {
            const path = calculateArcPath(50, 50, 0, 90, 50);

            // Should start with "M" (move to)
            expect(path).toMatch(/^M /);

            // Should contain "A" (arc command)
            expect(path).toMatch(/ A /);

            // Should have correct number of tokens: M x y A rx ry x-axis-rotation large-arc-flag sweep-flag x y
            // Format: "M 100 50 A 50 50 0 0 0 50 0" = 11 space-separated tokens
            const parts = path.split(" ");
            expect(parts.length).toBe(11); // 11 tokens total (including spaces create tokens)
        });

        it("handles negative angles correctly", () => {
            const path = calculateArcPath(50, 50, -90, 0, 50);
            // Should handle negative angles by converting them
            expect(path).toMatch(/^M /);
            expect(path).toMatch(/ A /);
        });
    });
});
