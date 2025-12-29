/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
    measureSvgText,
    calculateTextScale,
    clearTextMetricsCache,
    getTextMetricsCacheSize,
    DEFAULT_REFERENCE_TEXT,
} from "./textMeasurement";

// Mock getBBox since jsdom doesn't support SVG measurements
const mockGetBBox = vi.fn(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 20,
}));

// Store original methods
const originalCreateElementNS = document.createElementNS.bind(document);

describe("textMeasurement", () => {
    beforeEach(() => {
        // Clear cache before each test
        clearTextMetricsCache();

        // Mock createElementNS to add getBBox to text elements
        vi.spyOn(document, "createElementNS").mockImplementation((ns, tag) => {
            const element = originalCreateElementNS(ns, tag);
            if (tag === "text") {
                (element as SVGTextElement).getBBox = mockGetBBox;
            }
            return element;
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        clearTextMetricsCache();
    });

    describe("DEFAULT_REFERENCE_TEXT", () => {
        it("should be a sensible default value", () => {
            expect(DEFAULT_REFERENCE_TEXT).toBe("-127");
        });
    });

    describe("measureSvgText", () => {
        it("should return zero metrics for empty input", () => {
            const metrics = measureSvgText([]);
            expect(metrics.width).toBe(0);
            expect(metrics.height).toBe(0);
        });

        it("should return zero metrics for empty strings", () => {
            const metrics = measureSvgText(["", ""]);
            expect(metrics.width).toBe(0);
            expect(metrics.height).toBe(0);
        });

        it("should measure single line text", () => {
            mockGetBBox.mockReturnValueOnce({ x: 0, y: 0, width: 50, height: 16 });

            const metrics = measureSvgText(["Hello"]);

            expect(metrics.width).toBe(50);
            expect(metrics.height).toBe(16);
        });

        it("should measure multiline text", () => {
            mockGetBBox.mockReturnValueOnce({ x: 0, y: 0, width: 80, height: 40 });

            const metrics = measureSvgText(["Line 1", "Line 2"], { fontSize: 16 }, 1.2);

            expect(metrics.width).toBe(80);
            // Height for 2 lines: (2-1) * lineHeight + fontSize = 1 * 19.2 + 16 = 35.2
            expect(metrics.height).toBeCloseTo(35.2, 1);
        });

        it("should cache measurements", () => {
            mockGetBBox.mockReturnValue({ x: 0, y: 0, width: 100, height: 20 });

            // First call - should measure
            measureSvgText(["Test"]);
            expect(getTextMetricsCacheSize()).toBe(1);

            // Second call with same params - should use cache
            measureSvgText(["Test"]);
            expect(getTextMetricsCacheSize()).toBe(1);

            // Different text - should measure again
            measureSvgText(["Different"]);
            expect(getTextMetricsCacheSize()).toBe(2);
        });

        it("should create different cache entries for different styles", () => {
            mockGetBBox.mockReturnValue({ x: 0, y: 0, width: 100, height: 20 });

            measureSvgText(["Test"], { fontFamily: "Arial" });
            measureSvgText(["Test"], { fontFamily: "Helvetica" });

            expect(getTextMetricsCacheSize()).toBe(2);
        });

        it("should respect font size in style", () => {
            mockGetBBox.mockReturnValue({ x: 0, y: 0, width: 100, height: 24 });

            const metrics = measureSvgText(["Test"], { fontSize: 24 });

            expect(metrics.height).toBe(24);
        });

        it("should handle numeric and string font sizes", () => {
            mockGetBBox.mockReturnValue({ x: 0, y: 0, width: 100, height: 20 });

            // Numeric font size
            measureSvgText(["Test"], { fontSize: 16 });

            // String font size
            measureSvgText(["Test"], { fontSize: "16px" });

            // Both should work without errors
            expect(getTextMetricsCacheSize()).toBe(2);
        });
    });

    describe("calculateTextScale", () => {
        it("should return 1 for zero-size metrics", () => {
            expect(calculateTextScale({ width: 0, height: 0 }, 100, 100)).toBe(1);
            expect(calculateTextScale({ width: 0, height: 50 }, 100, 100)).toBe(1);
            expect(calculateTextScale({ width: 50, height: 0 }, 100, 100)).toBe(1);
        });

        it("should calculate scale to fit width", () => {
            const scale = calculateTextScale({ width: 200, height: 50 }, 100, 100);
            expect(scale).toBe(0.5); // 100 / 200 = 0.5
        });

        it("should calculate scale to fit height", () => {
            const scale = calculateTextScale({ width: 50, height: 200 }, 100, 100);
            expect(scale).toBe(0.5); // 100 / 200 = 0.5
        });

        it("should use smaller scale when both dimensions need scaling", () => {
            const scale = calculateTextScale({ width: 200, height: 400 }, 100, 100);
            expect(scale).toBe(0.25); // min(100/200, 100/400) = min(0.5, 0.25) = 0.25
        });

        it("should allow upscaling when text is smaller than target", () => {
            const scale = calculateTextScale({ width: 50, height: 25 }, 100, 100);
            expect(scale).toBe(2); // min(100/50, 100/25) = min(2, 4) = 2
        });

        it("should handle non-square targets", () => {
            const scale = calculateTextScale({ width: 100, height: 50 }, 200, 100);
            expect(scale).toBe(2); // min(200/100, 100/50) = min(2, 2) = 2
        });
    });

    describe("clearTextMetricsCache", () => {
        it("should clear all cached metrics", () => {
            mockGetBBox.mockReturnValue({ x: 0, y: 0, width: 100, height: 20 });

            measureSvgText(["Test 1"]);
            measureSvgText(["Test 2"]);
            expect(getTextMetricsCacheSize()).toBe(2);

            clearTextMetricsCache();
            expect(getTextMetricsCacheSize()).toBe(0);
        });
    });

    describe("getTextMetricsCacheSize", () => {
        it("should return 0 for empty cache", () => {
            expect(getTextMetricsCacheSize()).toBe(0);
        });

        it("should return correct count after measurements", () => {
            mockGetBBox.mockReturnValue({ x: 0, y: 0, width: 100, height: 20 });

            measureSvgText(["A"]);
            measureSvgText(["B"]);
            measureSvgText(["C"]);

            expect(getTextMetricsCacheSize()).toBe(3);
        });
    });
});
