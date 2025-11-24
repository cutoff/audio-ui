import { describe, it, expect } from "vitest";
import { AudioParameterImpl, MidiParameter, ContinuousParameter, EnumParameter } from "./AudioParameter";

describe("AudioParameterImpl", () => {
    describe("Continuous Parameter (High Res / Default)", () => {
        const volumeParam: ContinuousParameter = {
            id: "vol",
            name: "Volume",
            type: "continuous",
            min: -60,
            max: 6,
            step: 0.5,
            unit: "dB",
            // midiResolution default is 32-bit
        };
        const impl = new AudioParameterImpl(volumeParam);

        it("normalizes correctly", () => {
            expect(impl.normalize(-60)).toBe(0);
            expect(impl.normalize(6)).toBe(1);
            expect(impl.normalize(-27)).toBeCloseTo(0.5, 5); // High res should be very close
        });

        it("denormalizes correctly", () => {
            expect(impl.denormalize(0)).toBe(-60);
            expect(impl.denormalize(1)).toBe(6);
            expect(impl.denormalize(0.5)).toBe(-27);
        });

        it("handles stepping in denormalize", () => {
            // -59.9 -> -60
            expect(impl.denormalize(0.001)).toBe(-60);

            // Test a value that would fall between steps
            // Range is 66. 0.1 normalized = -60 + 6.6 = -53.4
            // Should round to -53.5
            const norm = (-53.5 - -60) / 66 + 0.0001;
            expect(impl.denormalize(norm)).toBe(-53.5);
        });

        it("formats output", () => {
            expect(impl.format(-6.0)).toBe("-6 dB");
        });
    });

    describe("Continuous Parameter (7-bit MIDI Quantization)", () => {
        const lowResParam: ContinuousParameter = {
            id: "vol-low",
            name: "Volume Low",
            type: "continuous",
            min: -60,
            max: 6,
            step: 0.5,
            unit: "dB",
            midiResolution: 7, // Explicit 7-bit
        };
        const impl = new AudioParameterImpl(lowResParam);

        it("quantizes normalization", () => {
            // Center (-27) is exactly 0.5 in Float.
            // 0.5 * 127 = 63.5 -> Rounds to 64.
            // 64 / 127 = 0.503937...
            expect(impl.normalize(-27)).not.toBe(0.5);
            expect(impl.normalize(-27)).toBeCloseTo(64/127, 5);
        });

        it("converts to MIDI (7-bit)", () => {
            expect(impl.toMidi(-60)).toBe(0);
            expect(impl.toMidi(6)).toBe(127);
            expect(impl.toMidi(-27)).toBe(64); // 63.5 rounds up
        });

        it("converts from MIDI (7-bit)", () => {
            expect(impl.fromMidi(0)).toBe(-60);
            expect(impl.fromMidi(127)).toBe(6);
        });
    });

    describe("Boolean Parameter", () => {
        const switchParam = MidiParameter.Switch("Mute");
        const impl = new AudioParameterImpl(switchParam);

        it("normalizes correctly", () => {
            expect(impl.normalize(false)).toBe(0);
            expect(impl.normalize(true)).toBe(1);
        });

        it("denormalizes correctly", () => {
            expect(impl.denormalize(0)).toBe(false);
            expect(impl.denormalize(1)).toBe(true);
            expect(impl.denormalize(0.49)).toBe(false);
            expect(impl.denormalize(0.5)).toBe(true);
        });

        it("converts to MIDI", () => {
            expect(impl.toMidi(false)).toBe(0);
            expect(impl.toMidi(true)).toBe(127);
        });

        it("converts from MIDI (Lenient)", () => {
            expect(impl.fromMidi(0)).toBe(false);
            expect(impl.fromMidi(63)).toBe(false);
            expect(impl.fromMidi(64)).toBe(true);
            expect(impl.fromMidi(127)).toBe(true);
        });
    });

    describe("Enum Parameter", () => {
        const waveformParam: EnumParameter = {
            id: "wave",
            name: "Waveform",
            type: "enum",
            options: [
                { value: "sine", label: "Sine" },
                { value: "saw", label: "Saw" },
                { value: "square", label: "Square" },
            ],
            midiResolution: 7,
            midiMapping: "spread",
        };
        const impl = new AudioParameterImpl(waveformParam);

        it("normalizes correctly (spread)", () => {
            expect(impl.normalize("sine")).toBe(0);
            // "saw" is index 1. 1/2 = 0.5.
            // MIDI: 0.5 * 127 = 63.5 -> 64.
            // Norm: 64/127 = 0.5039...
            // BUT wait, toMidi for Enum (Spread) uses `round(norm * maxMidi)`.
            // Normalize uses `toMidi / maxMidi`.
            // So it will be quantized.
            expect(impl.normalize("saw")).toBeCloseTo(64/127, 5);
            expect(impl.normalize("square")).toBe(1);
        });

        it("denormalizes correctly (spread)", () => {
            expect(impl.denormalize(0)).toBe("sine");
            expect(impl.denormalize(0.2)).toBe("sine");
            expect(impl.denormalize(0.5)).toBe("saw"); // 64/127 maps to index 1
            expect(impl.denormalize(0.8)).toBe("square");
            expect(impl.denormalize(1)).toBe("square");
        });

        it("converts to MIDI (Spread)", () => {
            expect(impl.toMidi("sine")).toBe(0);
            expect(impl.toMidi("saw")).toBe(64);
            expect(impl.toMidi("square")).toBe(127);
        });

        it("converts from MIDI (Spread)", () => {
            expect(impl.fromMidi(0)).toBe("sine");
            expect(impl.fromMidi(64)).toBe("saw");
            expect(impl.fromMidi(127)).toBe("square");
        });

        describe("Sequential Mapping", () => {
            const seqParam: EnumParameter = {
                ...waveformParam,
                midiMapping: "sequential",
            };
            const seqImpl = new AudioParameterImpl(seqParam);

            it("converts to MIDI (Sequential)", () => {
                expect(seqImpl.toMidi("sine")).toBe(0);
                expect(seqImpl.toMidi("saw")).toBe(1);
                expect(seqImpl.toMidi("square")).toBe(2);
            });

            it("converts from MIDI (Sequential)", () => {
                expect(seqImpl.fromMidi(0)).toBe("sine");
                expect(seqImpl.fromMidi(1)).toBe("saw");
                expect(seqImpl.fromMidi(2)).toBe("square");
            });
        });

        describe("Custom Mapping", () => {
            const customParam: EnumParameter = {
                ...waveformParam,
                midiMapping: "custom",
                options: [
                    { value: "sine", label: "Sine", midiValue: 10 },
                    { value: "saw", label: "Saw", midiValue: 50 },
                    { value: "square", label: "Square", midiValue: 90 },
                ],
            };
            const customImpl = new AudioParameterImpl(customParam);

            it("converts to MIDI (Custom)", () => {
                expect(customImpl.toMidi("sine")).toBe(10);
                expect(customImpl.toMidi("saw")).toBe(50);
                expect(customImpl.toMidi("square")).toBe(90);
            });

            it("converts from MIDI (Custom - Closest Match)", () => {
                // Exact matches
                expect(customImpl.fromMidi(10)).toBe("sine");
                expect(customImpl.fromMidi(50)).toBe("saw");

                // Close matches
                expect(customImpl.fromMidi(12)).toBe("sine"); // closer to 10
                expect(customImpl.fromMidi(40)).toBe("saw"); // closer to 50 than 10
                expect(customImpl.fromMidi(127)).toBe("square"); // closer to 90
            });
        });
    });
});
