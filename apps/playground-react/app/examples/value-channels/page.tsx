/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import { useState } from "react";
import { Knob, AudioControlEvent } from "@cutoff/audio-ui-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type Triple = { value: number; normalized: number; midi: number };

const initialTriple: Triple = { value: 50, normalized: 0.5, midi: 64 };

const snapshotFromEvent = (event: AudioControlEvent<number>): Triple => ({
    value: event.value,
    normalized: event.normalizedValue,
    midi: event.midiValue,
});

function Snippet({ code }: { code: string }) {
    return (
        <div className="w-64 rounded border border-zinc-300/70 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-900/80 overflow-hidden">
            <SyntaxHighlighter
                language="tsx"
                style={oneDark}
                customStyle={{
                    margin: 0,
                    padding: "0.6rem 0.75rem",
                    background: "transparent",
                    fontSize: "11px",
                    lineHeight: 1.45,
                }}
                codeTagProps={{ style: { background: "transparent", fontFamily: "var(--font-mono, monospace)" } }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}

type ReadoutRow = { label: string; value: string; emphasis?: "driver" | "derived" };

function Readout({ title, rows }: { title: string; rows: ReadoutRow[] }) {
    return (
        <div className="w-64 text-xs bg-zinc-50 dark:bg-zinc-900/50 rounded border border-zinc-200/70 dark:border-zinc-800/50 p-3 font-mono">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">{title}</div>
            {rows.map((row, i) => (
                <div
                    key={i}
                    className={
                        row.emphasis === "driver"
                            ? "font-bold text-foreground"
                            : row.emphasis === "derived"
                              ? "text-muted-foreground"
                              : ""
                    }
                >
                    {row.label}: {row.value}
                </div>
            ))}
        </div>
    );
}

export default function ValueChannelsPage() {
    // Real value channel: stored as a domain value (treat as Hz for the scenario).
    const [cutoffHz, setCutoffHz] = useState(50);
    const [cutoffTriple, setCutoffTriple] = useState<Triple>(initialTriple);

    // Normalized channel: stored as 0..1 (DAW automation native representation).
    const [automation, setAutomation] = useState(0.5);
    const [automationTriple, setAutomationTriple] = useState<Triple>(initialTriple);

    // MIDI channel: stored as 0..127 integer (hardware CC native representation).
    const [cc, setCc] = useState(64);
    const [ccTriple, setCcTriple] = useState<Triple>(initialTriple);

    return (
        <div className="container mx-auto px-4 py-8 select-none">
            <h1 className="text-3xl font-bold mb-2">Value Channels</h1>
            <p className="text-muted-foreground mb-6 max-w-3xl">
                Every parameter-bound control exposes three mutually-exclusive input/output channels. Each column binds
                through a different one — real-value, normalized (0..1), or MIDI integer (0..127). The callback’s second{" "}
                <code>event</code> argument always carries the full triple, so code that needs a sibling representation
                reads it directly from the event — no conversion code at the call site.
            </p>
            <p className="text-muted-foreground mb-10 max-w-3xl">
                Pick the channel that matches how your app already stores the value:{" "}
                <strong>real-value</strong> for domain code (Hz, dB, %), <strong>normalized</strong> for DAW / JUCE
                WebUI automation, <strong>MIDI</strong> for WebMIDI and hardware-controller mappings.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                {/* ── Real value / Synth Control ─────────────────────────────── */}
                <div className="flex flex-col items-center gap-3">
                    <h2 className="text-lg font-semibold">Synth Control</h2>
                    <p className="text-xs text-muted-foreground text-center max-w-[16rem]">
                        Store the domain value, echo MIDI out to hardware.
                    </p>
                    <Snippet
                        code={`<Knob
  value={cutoffHz}
  onValueChange={(hz, event) => {
    setCutoffHz(hz);
    midiOut.sendCC(event.midiValue);
  }}
/>`}
                    />
                    <Knob
                        min={0}
                        max={100}
                        value={cutoffHz}
                        onValueChange={(hz, event) => {
                            setCutoffHz(hz);
                            setCutoffTriple(snapshotFromEvent(event));
                        }}
                        label="Cutoff"
                        valueAsLabel="interactive"
                    />
                    <Readout
                        title="driver → derived"
                        rows={[
                            { label: "cutoffHz", value: cutoffTriple.value.toFixed(2), emphasis: "driver" },
                            {
                                label: "midiOut.sendCC",
                                value: String(cutoffTriple.midi),
                                emphasis: "derived",
                            },
                            {
                                label: "DAW reads",
                                value: cutoffTriple.normalized.toFixed(4),
                                emphasis: "derived",
                            },
                        ]}
                    />
                </div>

                {/* ── Normalized / Automation Lane ───────────────────────────── */}
                <div className="flex flex-col items-center gap-3">
                    <h2 className="text-lg font-semibold">Automation Lane</h2>
                    <p className="text-xs text-muted-foreground text-center max-w-[16rem]">
                        Store 0..1 for the DAW, show the real value to the user.
                    </p>
                    <Snippet
                        code={`<Knob
  normalizedValue={automation}
  onNormalizedValueChange={(n, event) => {
    setAutomation(n);
    setDisplay(event.value);
  }}
/>`}
                    />
                    <Knob
                        min={0}
                        max={100}
                        normalizedValue={automation}
                        onNormalizedValueChange={(n, event) => {
                            setAutomation(n);
                            setAutomationTriple(snapshotFromEvent(event));
                        }}
                        label="Auto"
                        valueAsLabel="interactive"
                    />
                    <Readout
                        title="driver → derived"
                        rows={[
                            { label: "automation", value: automationTriple.normalized.toFixed(4), emphasis: "driver" },
                            {
                                label: "user sees",
                                value: automationTriple.value.toFixed(2),
                                emphasis: "derived",
                            },
                            {
                                label: "MIDI CC",
                                value: String(automationTriple.midi),
                                emphasis: "derived",
                            },
                        ]}
                    />
                </div>

                {/* ── MIDI / Hardware CC ─────────────────────────────────────── */}
                <div className="flex flex-col items-center gap-3">
                    <h2 className="text-lg font-semibold">Hardware CC</h2>
                    <p className="text-xs text-muted-foreground text-center max-w-[16rem]">
                        Store the 7-bit CC, route the real value to the audio engine.
                    </p>
                    <Snippet
                        code={`<Knob
  midiValue={cc}
  onMidiValueChange={(m, event) => {
    setCc(m);
    engine.setParam(event.value);
  }}
/>`}
                    />
                    <Knob
                        min={0}
                        max={100}
                        midiValue={cc}
                        onMidiValueChange={(m, event) => {
                            setCc(m);
                            setCcTriple(snapshotFromEvent(event));
                        }}
                        label="CC"
                        valueAsLabel="interactive"
                    />
                    <Readout
                        title="driver → derived"
                        rows={[
                            { label: "cc", value: String(ccTriple.midi), emphasis: "driver" },
                            {
                                label: "engine.setParam",
                                value: ccTriple.value.toFixed(2),
                                emphasis: "derived",
                            },
                            {
                                label: "DAW reads",
                                value: ccTriple.normalized.toFixed(4),
                                emphasis: "derived",
                            },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}
