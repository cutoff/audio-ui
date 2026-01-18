/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    Slider,
    Knob,
    Button,
    CycleButton,
    OptionView,
    Keys,
    frequencyFormatter,
    percentageFormatter,
    ContinuousParameter,
} from "@cutoff/audio-ui-react";
import { Volume2 } from "lucide-react";
import { SineWaveIcon, SawWaveIcon, SquareWaveIcon, TriangleWaveIcon } from "@/components/wave-icons";
import { SynthEngine, SynthParams, WaveformType } from "./synth-engine";
import { useMidi } from "@/hooks/use-midi";

const INITIAL_PARAMS: SynthParams = {
    cutoff: 1000,
    resonance: 1,
    attack: 0.1,
    decay: 0.2,
    sustain: 0.5,
    release: 0.5,
    waveform: "sawtooth",
    gain: 0.3,
};

/**
 * WebAudio Example Page.
 * Demonstrates a virtual analog synthesizer implementation using AudioUI components
 * and WebAudio API. Includes oscillator controls, filter, ADSR envelope, and
 * an interactive 88-key keyboard with sustain pedal functionality.
 */
export default function WebAudioPage() {
    const [params, setParams] = useState<SynthParams>(INITIAL_PARAMS);
    const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
    const [sustainedNotes, setSustainedNotes] = useState<Set<number>>(new Set());
    const [isSustainActive, setIsSustainActive] = useState(false);
    const synthRef = useRef<SynthEngine | null>(null);
    const initialParamsRef = useRef(params);
    const prevSelectedInputRef = useRef<WebMidi.MIDIInput | null>(null);

    // Use global MIDI service
    const { selectedInput, addMessageListener } = useMidi();

    // Initialize synth engine
    useEffect(() => {
        if (!synthRef.current) {
            synthRef.current = new SynthEngine(initialParamsRef.current);
        }
    }, []);

    // Sync params to engine
    useEffect(() => {
        if (synthRef.current) {
            synthRef.current.updateParams(params);
            synthRef.current.updateGlobalParams();
        }
    }, [params]);

    const handleParamChange = useCallback(<K extends keyof SynthParams>(key: K, value: SynthParams[K]) => {
        setParams((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleNoteOn = useCallback((midi: number) => {
        setActiveNotes((prev) => new Set(prev).add(midi));
        // Remove from sustained notes if it was previously sustained
        setSustainedNotes((prev) => {
            const next = new Set(prev);
            next.delete(midi);
            return next;
        });
        if (synthRef.current) {
            synthRef.current.noteOn(midi);
        }
    }, []);

    const handleNoteOff = useCallback(
        (midi: number) => {
            setActiveNotes((prev) => {
                const next = new Set(prev);
                next.delete(midi);
                return next;
            });

            // If sustain is active, hold the note instead of releasing it
            if (isSustainActive) {
                setSustainedNotes((prev) => new Set(prev).add(midi));
            } else {
                if (synthRef.current) {
                    synthRef.current.noteOff(midi);
                }
            }
        },
        [isSustainActive]
    );

    const handleSustainChange = useCallback(
        (active: boolean) => {
            setIsSustainActive(active);

            if (!active) {
                // Release all sustained notes when sustain pedal is released
                sustainedNotes.forEach((midi) => {
                    if (synthRef.current) {
                        synthRef.current.noteOff(midi);
                    }
                });
                setSustainedNotes(new Set());
            }
        },
        [sustainedNotes]
    );

    // Handle MIDI messages from global service
    // Integrates MIDI keyboard input with the synthesizer, supporting note on/off and sustain pedal.
    // Only clears notes when a MIDI device is disconnected (not when WebMidi is disabled from the start),
    // allowing the on-screen keyboard to work independently when no MIDI device is connected.
    useEffect(() => {
        // Track transition from having a selected input to not having one
        // This prevents clearing notes when WebMidi is disabled but user is using on-screen keyboard
        const hadSelectedInput = prevSelectedInputRef.current !== null;
        const hasSelectedInput = selectedInput !== null;

        if (hadSelectedInput && !hasSelectedInput) {
            // MIDI device was disconnected - release all active notes from synth
            // This handles the case where MIDI was playing notes that need to be released when the device disconnects
            setActiveNotes((currentNotes) => {
                currentNotes.forEach((midiNote) => {
                    if (synthRef.current) {
                        synthRef.current.noteOff(midiNote);
                    }
                });
                return new Set();
            });
        }

        prevSelectedInputRef.current = selectedInput;

        if (!selectedInput) {
            // No MIDI input selected - don't register listener
            // On-screen keyboard continues to work independently
            return;
        }

        const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
            const data = event.data;

            // Note on message: status byte 0x90 (note on channel 1) with velocity > 0
            // MIDI status bytes: upper nibble (0xf0 mask) is message type, lower nibble is channel (0-15)
            // Channel 1 = 0x90, Channel 2 = 0x91, etc.
            if ((data[0] & 0xf0) === 0x90 && data[2] > 0) {
                const midiNote = data[1];
                handleNoteOn(midiNote);
            }

            // Note off message: status byte 0x80 (note off) or 0x90 with velocity 0
            // Some MIDI devices send note on with velocity 0 instead of note off for compatibility
            if ((data[0] & 0xf0) === 0x80 || ((data[0] & 0xf0) === 0x90 && data[2] === 0)) {
                const midiNote = data[1];
                handleNoteOff(midiNote);
            }

            // Sustain pedal: Control Change 64 (CC 64)
            // Status byte 0xB0 (control change channel 1), data[1] === 64 (CC number)
            // Value >= 64 = sustain on (pedal pressed), < 64 = sustain off (pedal released)
            // Standard MIDI convention: 0-63 = off, 64-127 = on
            if ((data[0] & 0xf0) === 0xb0 && data[1] === 64) {
                const isActive = data[2] >= 64;
                handleSustainChange(isActive);
            }
        };

        // Register message listener with automatic cleanup
        // The cleanup function returned by addMessageListener removes the listener on unmount
        const cleanup = addMessageListener(handleMidiMessage);

        return cleanup;
    }, [selectedInput, addMessageListener, handleNoteOn, handleNoteOff, handleSustainChange]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <header className="mb-12">
                <h1 className="text-4xl font-bold mb-2">WebAudio</h1>
                <p className="text-muted-foreground">
                    A simple monophonic synthesizer built with WebAudio and AudioUI components.
                </p>
            </header>

            <main className="bg-card border rounded-2xl shadow-lg p-8">
                {/* Top Control Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 items-stretch">
                    {/* Oscillator Section */}
                    <section className="flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-primary rounded-full"></div>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                Oscillator & Master
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 grid-rows-2 gap-8 h-80">
                            <CycleButton
                                label="Waveform"
                                value={params.waveform}
                                onChange={(e) => handleParamChange("waveform", e.value as WaveformType)}
                                options={[
                                    { value: "sine", label: "Sine" },
                                    { value: "sawtooth", label: "Saw" },
                                    { value: "square", label: "Square" },
                                    { value: "triangle", label: "Tri" },
                                ]}
                                adaptiveSize
                                className="h-full w-full"
                            >
                                <OptionView value="sine">
                                    <SineWaveIcon />
                                </OptionView>
                                <OptionView value="sawtooth">
                                    <SawWaveIcon />
                                </OptionView>
                                <OptionView value="square">
                                    <SquareWaveIcon />
                                </OptionView>
                                <OptionView value="triangle">
                                    <TriangleWaveIcon />
                                </OptionView>
                            </CycleButton>
                            <Knob
                                variant="iconCap"
                                label="Master"
                                value={params.gain}
                                min={0}
                                max={1}
                                step={0.01}
                                onChange={(e) => handleParamChange("gain", e.value)}
                                valueFormatter={(v, def) =>
                                    def.type === "continuous"
                                        ? percentageFormatter(
                                              v,
                                              (def as ContinuousParameter).min,
                                              (def as ContinuousParameter).max
                                          )
                                        : v.toString()
                                }
                                valueAsLabel="interactive"
                                adaptiveSize
                                className="h-full w-full"
                            >
                                <Volume2 size="100%" />
                            </Knob>
                        </div>
                    </section>

                    {/* Filter Section */}
                    <section className="flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-primary rounded-full"></div>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                Filter
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 grid-rows-2 gap-8 h-80">
                            <Knob
                                variant="plainCap"
                                label="Cutoff"
                                value={params.cutoff}
                                min={20}
                                max={10000}
                                scale="log"
                                onChange={(e) => handleParamChange("cutoff", e.value)}
                                valueFormatter={(v) => frequencyFormatter(v)}
                                valueAsLabel="interactive"
                                adaptiveSize
                                className="h-full w-full"
                            />
                            <Knob
                                variant="plainCap"
                                label="Resonance"
                                value={params.resonance}
                                min={0.1}
                                max={20}
                                step={0.1}
                                onChange={(e) => handleParamChange("resonance", e.value)}
                                valueFormatter={(v) => v.toFixed(1)}
                                valueAsLabel="interactive"
                                adaptiveSize
                                className="h-full w-full"
                            />
                        </div>
                    </section>

                    {/* Envelope Section */}
                    <section className="md:col-span-2 flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-primary rounded-full"></div>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                Envelope
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 grid-rows-2 sm:grid-cols-4 sm:grid-rows-1 gap-6 h-80">
                            <Slider
                                label="Attack"
                                value={params.attack}
                                min={0.001}
                                max={2}
                                step={0.01}
                                onChange={(e) => handleParamChange("attack", e.value)}
                                valueFormatter={(v) => `${v.toFixed(2)}s`}
                                valueAsLabel="interactive"
                                labelHeightUnits={25}
                                adaptiveSize
                                className="h-full w-full"
                            />
                            <Slider
                                label="Decay"
                                value={params.decay}
                                min={0.001}
                                max={2}
                                step={0.01}
                                onChange={(e) => handleParamChange("decay", e.value)}
                                valueFormatter={(v) => `${v.toFixed(2)}s`}
                                valueAsLabel="interactive"
                                labelHeightUnits={25}
                                adaptiveSize
                                className="h-full w-full"
                            />
                            <Slider
                                label="Sustain"
                                value={params.sustain}
                                min={0}
                                max={1}
                                step={0.01}
                                onChange={(e) => handleParamChange("sustain", e.value)}
                                valueFormatter={(v, def) =>
                                    def.type === "continuous"
                                        ? percentageFormatter(
                                              v,
                                              (def as ContinuousParameter).min,
                                              (def as ContinuousParameter).max
                                          )
                                        : v.toString()
                                }
                                valueAsLabel="interactive"
                                labelHeightUnits={25}
                                adaptiveSize
                                className="h-full w-full"
                            />
                            <Slider
                                label="Release"
                                value={params.release}
                                min={0.001}
                                max={3}
                                step={0.01}
                                onChange={(e) => handleParamChange("release", e.value)}
                                valueFormatter={(v) => `${v.toFixed(2)}s`}
                                valueAsLabel="interactive"
                                labelHeightUnits={25}
                                adaptiveSize
                                className="h-full w-full"
                            />
                        </div>
                    </section>
                </div>

                {/* Keyboard Section */}
                <section className="pt-8 border-t">
                    <div className="flex items-center gap-6 mb-8 justify-center">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Play Notes
                        </h2>

                        <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30">
                            <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                                Sustain
                            </span>
                            <Button
                                size="small"
                                className="w-6 h-6"
                                latch={true}
                                value={isSustainActive}
                                onChange={(e) => handleSustainChange(e.value)}
                            />
                        </div>
                    </div>

                    <div className="h-48">
                        <Keys
                            notesOn={Array.from(activeNotes)}
                            nbKeys={88}
                            octaveShift={0}
                            adaptiveSize
                            onChange={(e) => {
                                if (e.value.active) {
                                    handleNoteOn(e.value.note);
                                } else {
                                    handleNoteOff(e.value.note);
                                }
                            }}
                        />
                    </div>
                </section>
            </main>

            <footer className="mt-12 p-6 bg-muted/30 rounded-xl text-sm border">
                <h3 className="font-semibold mb-2 text-foreground">Design Details:</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-muted-foreground list-inside list-disc">
                    <li>
                        Uses <code>CycleButton</code> with themed wave icons for waveform selection.
                    </li>
                    <li>
                        Uses <code>Knob</code> with <code>plainCap</code> variant for filter cutoff and resonance.
                    </li>
                    <li>
                        Uses <code>Knob</code> with <code>iconCap</code> variant and volume icon for master gain.
                    </li>
                    <li>
                        Uses <code>Slider</code> for envelope ADSR parameters, grouped for better workflow.
                    </li>
                    <li>
                        Uses 88-key <code>Keys</code> component with interactive note playing and visualization.
                    </li>
                    <li>
                        Uses <code>Button</code> with <code>latch</code> prop as sustain pedal switch.
                    </li>
                    <li>
                        Grid layout for synth controls using <code>adaptiveSize</code> with constrained container
                        heights.
                    </li>
                    <li>WebAudio engine handles polyphony and ADSR envelope.</li>
                    <li>Supports MIDI keyboard input via global MIDI service (note on/off and sustain pedal).</li>
                    <li>On-screen keyboard and MIDI keyboard work simultaneously.</li>
                </ul>
            </footer>
        </div>
    );
}
