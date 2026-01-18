/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
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
}

/**
 * WebAudio-based monophonic synthesizer engine.
 * Handles oscillator generation, low-pass filtering, and ADSR envelope management.
 */
export class SynthEngine {
    private ctx: AudioContext | null = null;
    private filter: BiquadFilterNode | null = null;
    private output: GainNode | null = null;
    private masterGain: GainNode | null = null;
    private activeOscillators: Map<number, { osc: OscillatorNode; amp: GainNode; filter: BiquadFilterNode }> =
        new Map();
    private params: SynthParams;

    constructor(initialParams: SynthParams) {
        this.params = { ...initialParams };
    }

    private init() {
        if (this.ctx) return;

        const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioContextClass();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.params.gain;
        this.masterGain.connect(this.ctx.destination);
    }

    public updateParams(newParams: Partial<SynthParams>) {
        this.params = { ...this.params, ...newParams };

        if (this.ctx && this.masterGain) {
            const now = this.ctx.currentTime;
            if (newParams.gain !== undefined) {
                this.masterGain.gain.setTargetAtTime(newParams.gain, now, 0.05);
            }
        }
    }

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
