/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { describe, it, expect } from "vitest";
import {
    clampNormalized,
    translateKnobRoundness,
    translateKnobThickness,
    translateSliderRoundness,
    translateSliderThickness,
    translateButtonRoundness,
    translateKeybedRoundness,
} from "./normalizedProps";

describe("normalizedProps", () => {
    describe("clampNormalized", () => {
        it("returns value unchanged when within 0-1 range", () => {
            expect(clampNormalized(0)).toBe(0);
            expect(clampNormalized(0.5)).toBe(0.5);
            expect(clampNormalized(1)).toBe(1);
        });

        it("clamps values below 0 to 0", () => {
            expect(clampNormalized(-0.1)).toBe(0);
            expect(clampNormalized(-10)).toBe(0);
        });

        it("clamps values above 1 to 1", () => {
            expect(clampNormalized(1.1)).toBe(1);
            expect(clampNormalized(10)).toBe(1);
        });

        it("handles edge cases", () => {
            expect(clampNormalized(0.0)).toBe(0);
            expect(clampNormalized(1.0)).toBe(1);
            expect(clampNormalized(0.0001)).toBe(0.0001);
            expect(clampNormalized(0.9999)).toBe(0.9999);
        });
    });

    describe("translateKnobRoundness", () => {
        it("returns 0 for normalized 0 (square)", () => {
            expect(translateKnobRoundness(0)).toBe(0);
        });

        it("returns 1 for any value > 0 (round)", () => {
            expect(translateKnobRoundness(0.1)).toBe(1);
            expect(translateKnobRoundness(0.5)).toBe(1);
            expect(translateKnobRoundness(1)).toBe(1);
        });

        it("clamps values outside range", () => {
            expect(translateKnobRoundness(-0.1)).toBe(0);
            expect(translateKnobRoundness(1.1)).toBe(1);
        });
    });

    describe("translateKnobThickness", () => {
        it("returns 1 for normalized 0", () => {
            expect(translateKnobThickness(0)).toBe(1);
        });

        it("returns 20 for normalized 1", () => {
            expect(translateKnobThickness(1)).toBe(20);
        });

        it("returns 10.5 rounded to 11 for normalized 0.5", () => {
            expect(translateKnobThickness(0.5)).toBe(11);
        });

        it("maps linearly across the range", () => {
            expect(translateKnobThickness(0.25)).toBe(6); // 1 + 0.25 * 19 = 5.75 -> 6
            expect(translateKnobThickness(0.75)).toBe(15); // 1 + 0.75 * 19 = 15.25 -> 15
        });

        it("clamps values outside range", () => {
            expect(translateKnobThickness(-0.1)).toBe(1);
            expect(translateKnobThickness(1.1)).toBe(20);
        });
    });

    describe("translateSliderRoundness", () => {
        it("returns 0 for normalized 0", () => {
            expect(translateSliderRoundness(0)).toBe(0);
        });

        it("returns 20 for normalized 1", () => {
            expect(translateSliderRoundness(1)).toBe(20);
        });

        it("returns 10 for normalized 0.5", () => {
            expect(translateSliderRoundness(0.5)).toBe(10);
        });

        it("maps linearly across the range", () => {
            expect(translateSliderRoundness(0.25)).toBe(5);
            expect(translateSliderRoundness(0.75)).toBe(15);
        });

        it("clamps values outside range", () => {
            expect(translateSliderRoundness(-0.1)).toBe(0);
            expect(translateSliderRoundness(1.1)).toBe(20);
        });
    });

    describe("translateSliderThickness", () => {
        it("returns 1 for normalized 0", () => {
            expect(translateSliderThickness(0)).toBe(1);
        });

        it("returns 50 for normalized 1", () => {
            expect(translateSliderThickness(1)).toBe(50);
        });

        it("returns 25.5 rounded to 26 for normalized 0.5", () => {
            expect(translateSliderThickness(0.5)).toBe(26); // 1 + 0.5 * 49 = 25.5 -> 26
        });

        it("maps linearly across the range", () => {
            expect(translateSliderThickness(0.25)).toBe(13); // 1 + 0.25 * 49 = 13.25 -> 13
            expect(translateSliderThickness(0.75)).toBe(38); // 1 + 0.75 * 49 = 37.75 -> 38
        });

        it("clamps values outside range", () => {
            expect(translateSliderThickness(-0.1)).toBe(1);
            expect(translateSliderThickness(1.1)).toBe(50);
        });
    });

    describe("translateButtonRoundness", () => {
        it("returns 0 for normalized 0", () => {
            expect(translateButtonRoundness(0)).toBe(0);
        });

        it("returns 50 for normalized 1", () => {
            expect(translateButtonRoundness(1)).toBe(50);
        });

        it("returns 25 for normalized 0.5", () => {
            expect(translateButtonRoundness(0.5)).toBe(25);
        });

        it("maps linearly across the range", () => {
            expect(translateButtonRoundness(0.25)).toBe(13); // 0.25 * 50 = 12.5 -> 13
            expect(translateButtonRoundness(0.75)).toBe(38); // 0.75 * 50 = 37.5 -> 38
        });

        it("clamps values outside range", () => {
            expect(translateButtonRoundness(-0.1)).toBe(0);
            expect(translateButtonRoundness(1.1)).toBe(50);
        });
    });

    describe("translateKeybedRoundness", () => {
        it("returns 0 for normalized 0", () => {
            expect(translateKeybedRoundness(0)).toBe(0);
        });

        it("returns 12 for normalized 1", () => {
            expect(translateKeybedRoundness(1)).toBe(12);
        });

        it("returns 6 for normalized 0.5", () => {
            expect(translateKeybedRoundness(0.5)).toBe(6);
        });

        it("maps linearly across the range", () => {
            expect(translateKeybedRoundness(0.25)).toBe(3);
            expect(translateKeybedRoundness(0.75)).toBe(9);
        });

        it("clamps values outside range", () => {
            expect(translateKeybedRoundness(-0.1)).toBe(0);
            expect(translateKeybedRoundness(1.1)).toBe(12);
        });
    });
});
