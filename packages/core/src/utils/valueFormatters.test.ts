/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { describe, it, expect } from "vitest";
import {
    calculateCenterValue,
    bipolarFormatter,
    midiBipolarFormatter,
    withUnit,
    withPrecision,
    combineFormatters,
    percentageFormatter,
    frequencyFormatter,
} from "./valueFormatters";

describe("valueFormatters", () => {
    describe("calculateCenterValue", () => {
        it("calculates center for 0-127 range (MIDI)", () => {
            expect(calculateCenterValue(0, 127)).toBe(64);
        });

        it("calculates center for 0-100 range", () => {
            expect(calculateCenterValue(0, 100)).toBe(50);
        });

        it("calculates center for 1-10 range", () => {
            expect(calculateCenterValue(1, 10)).toBe(6); // floor((10-1+1)/2) + 1 = floor(5) + 1 = 6
        });

        it("calculates center for negative ranges", () => {
            // floor((50 - (-50) + 1) / 2) + (-50) = floor(101/2) + (-50) = 50 + (-50) = 0
            expect(calculateCenterValue(-50, 50)).toBe(0);
        });

        it("handles single value range", () => {
            expect(calculateCenterValue(5, 5)).toBe(5); // floor((5-5+1)/2) + 5 = floor(0.5) + 5 = 0 + 5 = 5
        });

        it("handles small ranges", () => {
            expect(calculateCenterValue(0, 1)).toBe(1); // floor((1-0+1)/2) + 0 = floor(1) + 0 = 1
        });
    });

    describe("bipolarFormatter", () => {
        it("adds + prefix for positive values", () => {
            expect(bipolarFormatter(5)).toBe("+5");
            expect(bipolarFormatter(100)).toBe("+100");
            expect(bipolarFormatter(0.5)).toBe("+0.5");
        });

        it("does not add prefix for zero", () => {
            expect(bipolarFormatter(0)).toBe("0");
        });

        it("does not add prefix for negative values", () => {
            expect(bipolarFormatter(-5)).toBe("-5");
            expect(bipolarFormatter(-100)).toBe("-100");
        });
    });

    describe("midiBipolarFormatter", () => {
        it("formats value shifted by center for 0-127 range", () => {
            const result = midiBipolarFormatter(64, 0, 127);
            expect(result).toBe("0"); // 64 - 64 = 0
        });

        it("formats value above center with + prefix", () => {
            const result = midiBipolarFormatter(100, 0, 127);
            expect(result).toBe("+36"); // 100 - 64 = 36
        });

        it("formats value below center without + prefix", () => {
            const result = midiBipolarFormatter(32, 0, 127);
            expect(result).toBe("-32"); // 32 - 64 = -32
        });

        it("handles different ranges", () => {
            const result = midiBipolarFormatter(75, 0, 100);
            expect(result).toBe("+25"); // 75 - 50 = 25
        });

        it("handles value at minimum", () => {
            const result = midiBipolarFormatter(0, 0, 127);
            expect(result).toBe("-64"); // 0 - 64 = -64
        });

        it("handles value at maximum", () => {
            const result = midiBipolarFormatter(127, 0, 127);
            expect(result).toBe("+63"); // 127 - 64 = 63
        });
    });

    describe("withUnit", () => {
        it("creates formatter that appends unit", () => {
            const formatter = withUnit("dB");
            expect(formatter(0)).toBe("0dB");
            expect(formatter(-10)).toBe("-10dB");
            expect(formatter(5.5)).toBe("5.5dB");
        });

        it("handles different units", () => {
            const hzFormatter = withUnit("Hz");
            expect(hzFormatter(440)).toBe("440Hz");

            const percentFormatter = withUnit("%");
            expect(percentFormatter(50)).toBe("50%");
        });

        it("handles zero and negative values", () => {
            const formatter = withUnit("dB");
            expect(formatter(0)).toBe("0dB");
            expect(formatter(-20)).toBe("-20dB");
        });
    });

    describe("withPrecision", () => {
        it("creates formatter with specified decimal places", () => {
            const formatter = withPrecision(2);
            expect(formatter(5.123)).toBe("5.12");
            expect(formatter(10.999)).toBe("11.00");
        });

        it("handles zero precision", () => {
            const formatter = withPrecision(0);
            expect(formatter(5.7)).toBe("6");
            expect(formatter(5.4)).toBe("5");
        });

        it("handles high precision", () => {
            const formatter = withPrecision(4);
            expect(formatter(3.14159265)).toBe("3.1416");
        });

        it("handles integers", () => {
            const formatter = withPrecision(2);
            expect(formatter(5)).toBe("5.00");
        });
    });

    describe("combineFormatters", () => {
        it("combines multiple formatters in sequence", () => {
            const formatter = combineFormatters(withPrecision(1), withUnit("dB"));
            expect(formatter(5.67)).toBe("5.7dB");
        });

        it("handles formatters that return strings", () => {
            // When bipolarFormatter returns "+5", combineFormatters parses it back to 5
            // then withUnit("dB") formats it as "5dB" (the + sign is lost during parsing)
            const formatter = combineFormatters(bipolarFormatter, withUnit("dB"));
            expect(formatter(5)).toBe("5dB");
        });

        it("handles formatters with min/max parameters", () => {
            // When percentageFormatter returns "50%", combineFormatters parses it back to 50
            // then the second formatter formats it as "(50)" (the % sign is lost during parsing)
            const formatter = combineFormatters(
                (v, min, max) => percentageFormatter(v, min || 0, max || 100),
                (v) => `(${v})`
            );
            expect(formatter(50, 0, 100)).toBe("(50)");
        });

        it("handles empty formatter list", () => {
            const formatter = combineFormatters();
            expect(formatter(5)).toBe("5");
        });

        it("handles single formatter", () => {
            const formatter = combineFormatters(withUnit("Hz"));
            expect(formatter(440)).toBe("440Hz");
        });

        it("parses string results back to numbers when possible", () => {
            const formatter = combineFormatters(
                (v) => v.toString(),
                (v) => v.toFixed(1), // v is already a number after parsing
                withUnit("dB")
            );
            expect(formatter(5.67)).toBe("5.7dB");
        });
    });

    describe("percentageFormatter", () => {
        it("formats value as percentage", () => {
            expect(percentageFormatter(50, 0, 100)).toBe("50%");
            expect(percentageFormatter(25, 0, 100)).toBe("25%");
        });

        it("handles value at minimum", () => {
            expect(percentageFormatter(0, 0, 100)).toBe("0%");
        });

        it("handles value at maximum", () => {
            expect(percentageFormatter(100, 0, 100)).toBe("100%");
        });

        it("handles non-zero minimum", () => {
            expect(percentageFormatter(25, 20, 30)).toBe("50%"); // (25-20)/(30-20) * 100 = 50%
        });

        it("rounds to nearest integer", () => {
            expect(percentageFormatter(33.3, 0, 100)).toBe("33%");
            expect(percentageFormatter(33.7, 0, 100)).toBe("34%");
        });

        it("handles negative ranges", () => {
            expect(percentageFormatter(0, -50, 50)).toBe("50%"); // (0-(-50))/(50-(-50)) * 100 = 50%
        });
    });

    describe("frequencyFormatter", () => {
        it("formats frequencies below 1000 Hz", () => {
            expect(frequencyFormatter(440)).toBe("440Hz");
            expect(frequencyFormatter(20)).toBe("20Hz");
            expect(frequencyFormatter(999)).toBe("999Hz");
        });

        it("formats frequencies at or above 1000 Hz as kHz", () => {
            expect(frequencyFormatter(1000)).toBe("1.0kHz");
            expect(frequencyFormatter(2000)).toBe("2.0kHz");
            expect(frequencyFormatter(15000)).toBe("15.0kHz");
        });

        it("formats frequencies with one decimal place for kHz", () => {
            expect(frequencyFormatter(1234)).toBe("1.2kHz");
            expect(frequencyFormatter(5678)).toBe("5.7kHz");
        });

        it("handles very high frequencies", () => {
            expect(frequencyFormatter(20000)).toBe("20.0kHz");
            expect(frequencyFormatter(100000)).toBe("100.0kHz");
        });

        it("handles edge case at 999 Hz", () => {
            expect(frequencyFormatter(999)).toBe("999Hz");
        });

        it("handles edge case at 1000 Hz", () => {
            expect(frequencyFormatter(1000)).toBe("1.0kHz");
        });
    });
});
