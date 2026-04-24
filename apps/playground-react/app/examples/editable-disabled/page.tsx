/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { Button, CycleButton, Knob, Keys, Slider } from "@cutoff/audio-ui-react";

function useAnimatedValue(min: number, max: number, periodMs: number, active: boolean) {
    const [value, setValue] = useState((min + max) / 2);
    const rafRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!active) return;
        const start = performance.now();
        const tick = (now: number) => {
            const elapsed = now - start;
            const phase = (elapsed % periodMs) / periodMs;
            const centered = (Math.sin(phase * Math.PI * 2) + 1) / 2;
            setValue(min + centered * (max - min));
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
        };
    }, [active, min, max, periodMs]);

    return value;
}

function useBooleanPulse(periodMs: number, active: boolean) {
    const [value, setValue] = useState(false);
    useEffect(() => {
        if (!active) return;
        const id = window.setInterval(() => setValue((v) => !v), periodMs);
        return () => window.clearInterval(id);
    }, [active, periodMs]);
    return value;
}

function useCyclingValue<T>(options: T[], periodMs: number, active: boolean) {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (!active) return;
        const id = window.setInterval(() => setIndex((i) => (i + 1) % options.length), periodMs);
        return () => window.clearInterval(id);
    }, [active, options.length, periodMs]);
    return options[index];
}

function Row({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
            <div className="grid grid-cols-3 gap-8 items-start">{children}</div>
        </div>
    );
}

function Cell({
    heading,
    hint,
    children,
}: {
    heading: string;
    hint: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="text-sm font-medium">{heading}</div>
            <div className="text-[11px] text-muted-foreground text-center max-w-[12rem]">{hint}</div>
            <div className="w-32 h-32">{children}</div>
        </div>
    );
}

export default function EditableDisabledPage() {
    const [animate, setAnimate] = useState(true);

    // External "automation" streams that drive non-editable / disabled controls
    const animatedKnob = useAnimatedValue(0, 100, 4000, animate);
    const animatedSlider = useAnimatedValue(-60, 0, 5000, animate);
    const animatedToggle = useBooleanPulse(1500, animate);
    const animatedCycle = useCyclingValue(["sine", "square", "saw", "triangle"], 2500, animate);
    const animatedNotes = useCyclingValue([[60], [64], [67], [72]], 900, animate);

    // Interactive (baseline) states
    const [editableKnob, setEditableKnob] = useState(42);
    const [editableSlider, setEditableSlider] = useState(-12);
    const [editableToggle, setEditableToggle] = useState(false);
    const [editableCycle, setEditableCycle] = useState<string | number>("sine");
    const [editableNotes, setEditableNotes] = useState<number[]>([]);

    return (
        <div className="p-8 flex flex-col gap-8">
            <header className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold">editable / disabled</h1>
                <p className="text-sm text-muted-foreground max-w-2xl">
                    Explicit <code className="font-mono">editable</code> and{" "}
                    <code className="font-mono">disabled</code> props govern user-gesture editability.{" "}
                    <code className="font-mono">editable=false</code> blocks user gestures but keeps the value
                    alive (automation, MIDI, external state still drive the visual).{" "}
                    <code className="font-mono">disabled=true</code> is stronger — it also suppresses callbacks
                    and removes the control from the tab order.
                </p>
                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={animate}
                        onChange={(e) => setAnimate(e.target.checked)}
                    />
                    Simulate external automation
                </label>
            </header>

            <Row title="Knob">
                <Cell heading="Editable (default)" hint="Drag / wheel / keyboard change the value.">
                    <Knob
                        min={0}
                        max={100}
                        value={editableKnob}
                        onValueChange={setEditableKnob}
                        label="Volume"
                    />
                </Cell>
                <Cell heading="editable=false" hint="User gestures blocked; external value still drives visual.">
                    <Knob min={0} max={100} value={animatedKnob} editable={false} label="Volume" />
                </Cell>
                <Cell heading="disabled" hint="Fully inert at the UI layer; callbacks suppressed.">
                    <Knob min={0} max={100} value={animatedKnob} disabled label="Volume" />
                </Cell>
            </Row>

            <Row title="Slider">
                <Cell heading="Editable (default)" hint="Drag / wheel / keyboard change the value.">
                    <Slider
                        min={-60}
                        max={0}
                        value={editableSlider}
                        onValueChange={setEditableSlider}
                        label="Fader"
                    />
                </Cell>
                <Cell heading="editable=false" hint="User gestures blocked; external value still drives visual.">
                    <Slider min={-60} max={0} value={animatedSlider} editable={false} label="Fader" />
                </Cell>
                <Cell heading="disabled" hint="Fully inert at the UI layer; callbacks suppressed.">
                    <Slider min={-60} max={0} value={animatedSlider} disabled label="Fader" />
                </Cell>
            </Row>

            <Row title="Button">
                <Cell heading="Editable (default)" hint="Click or Space/Enter toggles the value.">
                    <Button
                        latch
                        value={editableToggle}
                        onValueChange={setEditableToggle}
                        label="Mute"
                    />
                </Cell>
                <Cell heading="editable=false" hint="User gestures blocked; external value still drives visual.">
                    <Button latch value={animatedToggle} editable={false} label="Mute" />
                </Cell>
                <Cell heading="disabled" hint="Fully inert at the UI layer; callbacks suppressed.">
                    <Button latch value={animatedToggle} disabled label="Mute" />
                </Cell>
            </Row>

            <Row title="CycleButton">
                <Cell heading="Editable (default)" hint="Click cycles; arrow keys step.">
                    <CycleButton
                        value={editableCycle}
                        onValueChange={setEditableCycle}
                        options={[
                            { value: "sine", label: "Sine" },
                            { value: "square", label: "Square" },
                            { value: "saw", label: "Saw" },
                            { value: "triangle", label: "Triangle" },
                        ]}
                        label="Wave"
                    />
                </Cell>
                <Cell heading="editable=false" hint="User gestures blocked; external value still drives visual.">
                    <CycleButton
                        value={animatedCycle}
                        editable={false}
                        options={[
                            { value: "sine", label: "Sine" },
                            { value: "square", label: "Square" },
                            { value: "saw", label: "Saw" },
                            { value: "triangle", label: "Triangle" },
                        ]}
                        label="Wave"
                    />
                </Cell>
                <Cell heading="disabled" hint="Fully inert at the UI layer; callbacks suppressed.">
                    <CycleButton
                        value={animatedCycle}
                        disabled
                        options={[
                            { value: "sine", label: "Sine" },
                            { value: "square", label: "Square" },
                            { value: "saw", label: "Saw" },
                            { value: "triangle", label: "Triangle" },
                        ]}
                        label="Wave"
                    />
                </Cell>
            </Row>

            <div className="flex flex-col gap-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Keys</div>
                <div className="grid grid-cols-3 gap-8 items-start">
                    <div className="flex flex-col gap-2">
                        <div className="text-sm font-medium">Editable (default)</div>
                        <div className="text-[11px] text-muted-foreground">
                            Click/touch triggers notes. In-flight notes release on pointer up.
                        </div>
                        <Keys
                            nbKeys={24}
                            notesOn={editableNotes}
                            onNoteChange={(note) => {
                                setEditableNotes((prev) =>
                                    note.active
                                        ? [...prev, note.note]
                                        : prev.filter((n) => n !== note.note)
                                );
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="text-sm font-medium">editable=false</div>
                        <div className="text-[11px] text-muted-foreground">
                            Note triggers blocked; external highlights still animate via notesOn.
                        </div>
                        <Keys nbKeys={24} editable={false} notesOn={animatedNotes} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="text-sm font-medium">disabled</div>
                        <div className="text-[11px] text-muted-foreground">
                            Fully inert; highlights still animate via notesOn.
                        </div>
                        <Keys nbKeys={24} disabled notesOn={animatedNotes} />
                    </div>
                </div>
            </div>
        </div>
    );
}
