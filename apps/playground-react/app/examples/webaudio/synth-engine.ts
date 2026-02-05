/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

export type WaveformType = "sine" | "sawtooth" | "square" | "triangle";

export interface SynthParams {
    cutoff: number;
    resonance: number;
    attack: number;
    decay: number;
    sustain: number;
    release: number;
    waveform: WaveformType;
    gain: number;
    panning: number;
}

/**
 * WebAudio-based polyphonic synthesizer engine.
 * Handles oscillator generation, low-pass filtering, ADSR envelope management, and stereo panning.
 *
 * Supports multiple simultaneous voices (polyphony) with independent ADSR envelopes per voice.
 * Each voice has its own oscillator, filter, and gain node, allowing for complex sound layering.
 */
export class SynthEngine {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private panner: StereoPannerNode | null = null;
    private activeOscillators: Map<number, { osc: OscillatorNode; amp: GainNode; filter: BiquadFilterNode }> =
        new Map();
    private params: SynthParams;

    /**
     * Creates a new synthesizer engine with the specified initial parameters.
     * @param initialParams - Initial synthesizer parameters (cutoff, resonance, ADSR, waveform, gain, panning)
     */
    constructor(initialParams: SynthParams) {
        this.params = { ...initialParams };
    }

    /**
     * Initializes the WebAudio context and audio graph.
     * Creates the master gain node and stereo panner, connecting them to the audio destination.
     * This method is called lazily on first note playback to avoid blocking on page load.
     */
    private init() {
        if (this.ctx) return;

        const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioContextClass();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.params.gain;

        this.panner = this.ctx.createStereoPanner();
        this.panner.pan.value = this.params.panning;

        this.masterGain.connect(this.panner);
        this.panner.connect(this.ctx.destination);
    }

    /**
     * Updates synthesizer parameters with smooth transitions.
     * Uses `setTargetAtTime` for gain and panning to avoid audio glitches during parameter changes.
     * @param newParams - Partial parameter object containing the parameters to update
     */
    public updateParams(newParams: Partial<SynthParams>) {
        this.params = { ...this.params, ...newParams };

        if (this.ctx) {
            const now = this.ctx.currentTime;
            if (this.masterGain && newParams.gain !== undefined) {
                this.masterGain.gain.setTargetAtTime(newParams.gain, now, 0.05);
            }
            if (this.panner && newParams.panning !== undefined) {
                this.panner.pan.setTargetAtTime(newParams.panning, now, 0.05);
            }
        }
    }

    /**
     * Triggers a note on event for the specified MIDI note.
     * Creates a new voice with oscillator, filter, and ADSR envelope.
     * If a voice for this note already exists, it is stopped first (re-trigger behavior).
     * @param midiNote - MIDI note number (0-127, where 69 = A4 = 440Hz)
     */
    public noteOn(midiNote: number) {
        this.init();
        if (!this.ctx || !this.masterGain) return;

        if (this.ctx.state === "suspended") {
            this.ctx.resume();
        }

        // Stop existing voice for same note if any
        this.noteOff(midiNote);

        const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

        const osc = this.ctx.createOscillator();
        osc.type = this.params.waveform;
        osc.frequency.value = freq;

        const voiceFilter = this.ctx.createBiquadFilter();
        voiceFilter.type = "lowpass";
        voiceFilter.frequency.value = this.params.cutoff;
        voiceFilter.Q.value = this.params.resonance;

        const amp = this.ctx.createGain();
        amp.gain.value = 0;

        osc.connect(voiceFilter);
        voiceFilter.connect(amp);
        amp.connect(this.masterGain);

        const now = this.ctx.currentTime;
        amp.gain.setValueAtTime(0, now);
        amp.gain.linearRampToValueAtTime(1, now + this.params.attack);
        amp.gain.linearRampToValueAtTime(this.params.sustain, now + this.params.attack + this.params.decay);

        osc.start();
        this.activeOscillators.set(midiNote, { osc, amp, filter: voiceFilter });
    }

    /**
     * Triggers a note off event for the specified MIDI note.
     * Applies the release phase of the ADSR envelope and stops the oscillator after the release time.
     * @param midiNote - MIDI note number to release
     */
    public noteOff(midiNote: number) {
        if (!this.ctx) return;

        const voice = this.activeOscillators.get(midiNote);
        if (voice) {
            const now = this.ctx.currentTime;
            voice.amp.gain.cancelScheduledValues(now);
            voice.amp.gain.setValueAtTime(voice.amp.gain.value, now);
            voice.amp.gain.exponentialRampToValueAtTime(0.001, now + this.params.release + 0.01);
            voice.osc.stop(now + this.params.release + 0.1);
            this.activeOscillators.delete(midiNote);
        }
    }

    /**
     * Updates global parameters (cutoff, resonance, waveform) for all active voices.
     * Uses smooth transitions to avoid audio glitches when changing filter or waveform during playback.
     * This method is called when parameters change while notes are playing.
     */
    public updateGlobalParams() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        this.activeOscillators.forEach((voice) => {
            voice.filter.frequency.setTargetAtTime(this.params.cutoff, now, 0.05);
            voice.filter.Q.setTargetAtTime(this.params.resonance, now, 0.05);
            voice.osc.type = this.params.waveform;
        });
    }
}
