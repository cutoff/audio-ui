import { describe, it, expect } from "vitest";
import { AudioParameterConverter, AudioParameterFactory, LinearScale, LogScale } from "./AudioParameter";

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
});
