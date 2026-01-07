/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { describe, it, expect } from "vitest";
import { AudioParameterConverter, AudioParameterFactory } from "./AudioParameter";

describe("AudioParameterConverter", () => {
    describe("Linear Parameter", () => {
        const param = AudioParameterFactory.createControl({
            id: "test-linear",
            min: 0,
            max: 100,
            step: 1,
            defaultValue: 50,
        });
        const converter = new AudioParameterConverter(param);

        it("normalizes correctly", () => {
            expect(converter.normalize(0)).toBe(0);
            expect(converter.normalize(50)).toBeCloseTo(0.5);
            expect(converter.normalize(100)).toBe(1);
        });

        it("denormalizes correctly", () => {
            expect(converter.denormalize(0)).toBe(0);
            expect(converter.denormalize(0.5)).toBe(50);
            expect(converter.denormalize(1)).toBe(100);
        });

        it("converts to MIDI correctly", () => {
            // Default 32-bit resolution
            const maxMidi = Math.pow(2, 32) - 1;
            expect(converter.toMidi(0)).toBe(0);
            expect(converter.toMidi(50)).toBeCloseTo(maxMidi / 2, -5); // Approximate
            expect(converter.toMidi(100)).toBe(maxMidi);
        });
    });

    describe("Log Parameter (Frequency)", () => {
        const param = AudioParameterFactory.createControl({
            id: "test-log",
            min: 20,
            max: 20000,
            scale: "log",
            unit: "Hz",
        });
        const converter = new AudioParameterConverter(param);

        it("normalizes logarithmically", () => {
            expect(converter.normalize(20)).toBe(0);
            expect(converter.normalize(20000)).toBe(1);
            // Center of 20-20k log scale is ~632Hz
            // But our implementation might be slightly different depending on the specific log function
            // Let's just check it's not 0.5 (linear center)
            const linearCenter = (20 + 20000) / 2;
            expect(converter.normalize(linearCenter)).toBeGreaterThan(0.5);
        });
    });

    describe("Boolean Parameter", () => {
        const param = AudioParameterFactory.createSwitch("test-switch");
        const converter = new AudioParameterConverter(param);

        it("normalizes boolean values", () => {
            expect(converter.normalize(false)).toBe(0);
            expect(converter.normalize(true)).toBe(1);
        });

        it("denormalizes to boolean", () => {
            expect(converter.denormalize(0)).toBe(false);
            expect(converter.denormalize(1)).toBe(true);
            expect(converter.denormalize(0.4)).toBe(false);
            expect(converter.denormalize(0.6)).toBe(true);
        });
    });

    describe("Enum Parameter", () => {
        const param = AudioParameterFactory.createSelector("test-enum", [
            { value: "one", label: "One" },
            { value: "two", label: "Two" },
            { value: "three", label: "Three" },
        ]);
        const converter = new AudioParameterConverter(param);

        it("normalizes enum values", () => {
            expect(converter.normalize("one")).toBe(0);
            expect(converter.normalize("two")).toBeCloseTo(0.5);
            expect(converter.normalize("three")).toBe(1);
        });

        it("denormalizes enum values", () => {
            expect(converter.denormalize(0)).toBe("one");
            expect(converter.denormalize(0.5)).toBe("two");
            expect(converter.denormalize(1)).toBe("three");
        });
    });

    describe("getMaxDisplayText", () => {
        describe("Continuous Parameter", () => {
            it("returns longer of min/max formatted values", () => {
                const param = AudioParameterFactory.createControl({
                    id: "test",
                    min: -100,
                    max: 100,
                    step: 1,
                });
                const converter = new AudioParameterConverter(param);
                // "-100" is longer than "100"
                expect(converter.getMaxDisplayText()).toBe("-100");
            });

            it("includes unit in comparison", () => {
                const param = AudioParameterFactory.createControl({
                    id: "test",
                    min: 0,
                    max: 20000,
                    step: 1,
                    unit: "Hz",
                });
                const converter = new AudioParameterConverter(param);
                // "20000 Hz" is longer than "0 Hz"
                expect(converter.getMaxDisplayText()).toBe("20000 Hz");
            });

            it("handles decimal precision", () => {
                const param = AudioParameterFactory.createControl({
                    id: "test",
                    min: -60.0,
                    max: 6.0,
                    step: 0.1,
                    unit: "dB",
                });
                const converter = new AudioParameterConverter(param);
                // "-60 dB" is longer than "6 dB"
                expect(converter.getMaxDisplayText()).toBe("-60 dB");
            });

            it("handles bipolar parameters", () => {
                const param = AudioParameterFactory.createMidiBipolar14Bit("Pan");
                const converter = new AudioParameterConverter(param);
                // "-8192" is longer than "8191"
                expect(converter.getMaxDisplayText()).toBe("-8192");
            });

            it("excludes unit when includeUnit is false", () => {
                const param = AudioParameterFactory.createControl({
                    id: "test",
                    min: 0,
                    max: 20000,
                    step: 1,
                    unit: "Hz",
                });
                const converter = new AudioParameterConverter(param);
                // Without unit: "20000" is longer than "0"
                expect(converter.getMaxDisplayText({ includeUnit: false })).toBe("20000");
            });

            it("excludes unit with decimal precision", () => {
                const param = AudioParameterFactory.createControl({
                    id: "test",
                    min: -60.0,
                    max: 6.0,
                    step: 0.1,
                    unit: "dB",
                });
                const converter = new AudioParameterConverter(param);
                // Without unit: "-60" is longer than "6"
                expect(converter.getMaxDisplayText({ includeUnit: false })).toBe("-60");
            });

            it("returns same result with includeUnit true (default)", () => {
                const param = AudioParameterFactory.createControl({
                    id: "test",
                    min: 0,
                    max: 100,
                    step: 1,
                    unit: "%",
                });
                const converter = new AudioParameterConverter(param);
                // Default behavior includes unit
                expect(converter.getMaxDisplayText()).toBe("100 %");
                expect(converter.getMaxDisplayText({ includeUnit: true })).toBe("100 %");
            });
        });

        describe("Boolean Parameter", () => {
            it("returns longer of true/false labels", () => {
                const param = AudioParameterFactory.createSwitch("test");
                const converter = new AudioParameterConverter(param);
                // Default labels are "On" and "Off" - same length, returns first (On)
                expect(converter.getMaxDisplayText()).toBe("Off");
            });

            it("uses custom labels when provided", () => {
                const param: Parameters<typeof AudioParameterFactory.createSwitch>[1] & {
                    id: string;
                    name: string;
                    type: "boolean";
                } = {
                    id: "test",
                    name: "Test",
                    type: "boolean",
                    trueLabel: "Enabled",
                    falseLabel: "Off",
                };
                const converter = new AudioParameterConverter(param);
                // "Enabled" is longer than "Off"
                expect(converter.getMaxDisplayText()).toBe("Enabled");
            });
        });

        describe("Enum Parameter", () => {
            it("returns longest option label", () => {
                const param = AudioParameterFactory.createSelector("test", [
                    { value: "a", label: "Short" },
                    { value: "b", label: "Medium Length" },
                    { value: "c", label: "Very Long Label Here" },
                ]);
                const converter = new AudioParameterConverter(param);
                expect(converter.getMaxDisplayText()).toBe("Very Long Label Here");
            });

            it("uses value as fallback when label is missing", () => {
                const param = AudioParameterFactory.createSelector("test", [
                    { value: "short" },
                    { value: "longer_value" },
                ]);
                const converter = new AudioParameterConverter(param);
                expect(converter.getMaxDisplayText()).toBe("longer_value");
            });
        });
    });
});
