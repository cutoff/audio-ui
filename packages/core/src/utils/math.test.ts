import { describe, it, expect } from "vitest";
import { polarToCartesian, calculateArcPath, calculateBoundedRatio, computeFilledZone } from "./math";

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

    describe("calculateArcPath", () => {
        it("creates arc path for 0-90 degrees", () => {
            const path = calculateArcPath(0, 90, 50);
            expect(path).toContain("M");
            expect(path).toContain("A");
        });

        it("swaps angles when start > end", () => {
            const path1 = calculateArcPath(90, 0, 50);
            const path2 = calculateArcPath(0, 90, 50);
            expect(path1).toBe(path2);
        });

        it("handles full circle (0-360)", () => {
            const path = calculateArcPath(0, 360, 50);
            expect(path).toContain("M");
            expect(path).toContain("A");
        });

        it("uses large arc flag for angles > 180", () => {
            const path = calculateArcPath(0, 270, 50);
            expect(path).toContain("1"); // large arc flag
        });

        it("uses small arc flag for angles <= 180", () => {
            const path = calculateArcPath(0, 90, 50);
            expect(path).toContain("0"); // small arc flag
        });

        it("handles different radius values", () => {
            const path1 = calculateArcPath(0, 90, 25);
            const path2 = calculateArcPath(0, 90, 50);
            expect(path1).not.toBe(path2);
            expect(path1).toContain("25");
            expect(path2).toContain("50");
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
});
