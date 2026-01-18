/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useEffect, useState } from "react";
import { isNoteOn, Keys } from "@cutoff/audio-ui-react";
import ComponentSkeletonPage from "@/components/ComponentSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColorPickerField } from "@/components/ColorPickerField";
import { useMidi } from "@/hooks/use-midi";

// Define the NoteName type to match the one in the Keys component
type NoteName = "C" | "D" | "E" | "F" | "G" | "A" | "B";

export default function KeysPage() {
    const [nbKeys, setNbKeys] = useState<number>(61);
    const [startKey, setStartKey] = useState<NoteName>("C");
    const [octaveShift, setOctaveShift] = useState<number>(0);
    const [notesOn, setNotesOn] = useState<(string | number)[]>(["C4", 64, 67]);
    const [color, setColor] = useState<string | undefined>(undefined);
    const [roundness, setRoundness] = useState<number | undefined>(undefined);
    const [keyStyle, setKeyStyle] = useState<"theme" | "classic" | "classic-inverted">("theme");

    // Use global MIDI service
    const { selectedInput, addMessageListener } = useMidi();

    // Handle example clicks to update main component props
    const handleExampleClick = (num: 0 | 1 | 2 | 3 | 4 | 5): void => {
        switch (num) {
            case 0:
                // Default - matches main component preview
                setNbKeys(61);
                setStartKey("C");
                setOctaveShift(0);
                setKeyStyle("theme");
                setNotesOn(["C4", 64, 67]);
                setColor(undefined);
                setRoundness(undefined);
                break;
            case 1:
                // Classic Style
                setNbKeys(25);
                setStartKey("C");
                setOctaveShift(0);
                setKeyStyle("classic");
                setNotesOn(["C4", "E4", "G4"]);
                setColor(undefined);
                setRoundness(undefined);
                break;
            case 2:
                // Classic Inverted
                setNbKeys(25);
                setStartKey("C");
                setOctaveShift(0);
                setKeyStyle("classic-inverted");
                setNotesOn(["C4", "E4", "G4"]);
                setColor("#ff3366");
                setRoundness(undefined);
                break;
            case 3:
                // With Roundness
                setNbKeys(25);
                setStartKey("C");
                setOctaveShift(0);
                setKeyStyle("classic");
                setNotesOn([]);
                setColor("#33cc66");
                setRoundness(0.3);
                break;
            case 4:
                // Scale (C Major)
                setNbKeys(37);
                setStartKey("C");
                setOctaveShift(0);
                setKeyStyle("classic");
                setNotesOn(["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4"]);
                setColor("#9966ff");
                setRoundness(undefined);
                break;
            case 5:
                // Small (MIDI Notes)
                setNbKeys(13);
                setStartKey("C");
                setOctaveShift(0);
                setKeyStyle("theme");
                setNotesOn([60, 64, 67]);
                setColor("#ff9933");
                setRoundness(undefined);
                break;
        }
    };

    // Generate code snippet with dynamic notesOn array
    const codeString = `<Keys
  nbKeys={${nbKeys}}
  startKey="${startKey}"
  octaveShift={${octaveShift}}
  notesOn={[${notesOn.map((note) => (typeof note === "string" ? `"${note}"` : note)).join(", ")}]}${
      roundness !== undefined ? `\n  roundness={${roundness}}` : ""
  }${color !== undefined ? `\n  color="${color}"` : ""}${keyStyle !== "theme" ? `\n  keyStyle="${keyStyle}"` : ""}
/>`;

    const componentProps = {
        nbKeys,
        startKey,
        octaveShift,
        notesOn,
        color,
        roundness,
        keyStyle,
    };

    const properties = [
        <div key="nbKeys" className="grid gap-2">
            <Label htmlFor="nbKeysProp">Number of Keys (1-128)</Label>
            <Input
                id="nbKeysProp"
                type="number"
                min="1"
                max="128"
                value={nbKeys}
                onChange={(e) => setNbKeys(Math.max(1, Math.min(128, Number(e.target.value))))}
            />
        </div>,
        <div key="startKey" className="grid gap-2">
            <Label htmlFor="startKeyProp">Start Key</Label>
            <Select value={startKey} onValueChange={(value) => setStartKey(value as NoteName)}>
                <SelectTrigger id="startKeyProp">
                    <SelectValue placeholder="Select a start key" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="E">E</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                    <SelectItem value="G">G</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                </SelectContent>
            </Select>
        </div>,
        <div key="octaveShift" className="grid gap-2">
            <Label htmlFor="octaveShiftProp">Octave Shift</Label>
            <Input
                id="octaveShiftProp"
                type="number"
                min="-3"
                max="3"
                value={octaveShift}
                onChange={(e) => setOctaveShift(Math.max(-3, Math.min(3, Number(e.target.value))))}
            />
        </div>,
        <div key="color" className="grid gap-2">
            <ColorPickerField id="colorProp" label="Color" value={color} onChange={setColor} />
        </div>,
        <div key="roundness" className="grid gap-2">
            <Label htmlFor="roundnessProp">Roundness (0.0-1.0, optional)</Label>
            <Input
                id="roundnessProp"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={roundness ?? ""}
                placeholder="theme"
                onChange={(e) => {
                    const nextValue =
                        e.target.value === "" ? undefined : Math.max(0, Math.min(1, Number(e.target.value)));
                    setRoundness(nextValue);
                }}
            />
        </div>,
        <div key="keyStyle" className="grid gap-2">
            <Label htmlFor="keyStyleProp">Key Style</Label>
            <Select value={keyStyle} onValueChange={(value) => setKeyStyle(value as typeof keyStyle)}>
                <SelectTrigger id="keyStyleProp">
                    <SelectValue placeholder="Select key style" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="theme">Theme</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="classic-inverted">Classic Inverted</SelectItem>
                </SelectContent>
            </Select>
        </div>,
    ];

    // Handle MIDI messages from global service
    useEffect(() => {
        if (!selectedInput) {
            // Clear notes when no input is selected (device disconnected or deselected)
            setNotesOn([]);
            return;
        }

        const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
            const data = event.data;

            // Note on message: status byte 0x90 (note on channel 1) with velocity > 0
            // MIDI status bytes: upper nibble is message type, lower nibble is channel (0-15)
            if ((data[0] & 0xf0) === 0x90 && data[2] > 0) {
                const midiNote = data[1];

                setNotesOn((prev) => {
                    // Check if the note is already in the array (handles both string and number representations)
                    if (!isNoteOn(midiNote, prev)) {
                        return [...prev, midiNote];
                    }
                    return prev;
                });
            }

            // Note off message: status byte 0x80 (note off) or 0x90 with velocity 0
            // Some MIDI devices send note on with velocity 0 instead of note off
            if ((data[0] & 0xf0) === 0x80 || ((data[0] & 0xf0) === 0x90 && data[2] === 0)) {
                const midiNote = data[1];

                setNotesOn((prev) => {
                    // Filter out the note (handles both string and number representations)
                    return prev.filter((note) => !isNoteOn(note, [midiNote]));
                });
            }
        };

        // Register message listener with automatic cleanup
        // The cleanup function returned by addMessageListener removes the listener on unmount
        const cleanup = addMessageListener(handleMidiMessage);

        return cleanup;
    }, [selectedInput, addMessageListener]);

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Column - Using ComponentSkeletonPage */}
            <ComponentSkeletonPage
                componentName="Keys"
                codeSnippet={codeString}
                PageComponent={Keys}
                componentProps={componentProps}
                properties={properties}
            />

            {/* Right Column - Examples and MIDI Input */}
            <div className="w-full md:w-2/3 p-4 md:p-8">
                <div className="flex flex-col gap-6 md:gap-10">
                    {/* Examples Section */}
                    <div>
                        <h2 className="text-xl md:text-2xl font-medium mb-4 md:mb-6">Examples</h2>
                        <div className="flex flex-wrap gap-4 md:gap-8 justify-center md:justify-start">
                            <div className="flex flex-col items-center gap-2">
                                <Keys
                                    onClick={() => handleExampleClick(0)}
                                    nbKeys={61}
                                    startKey="C"
                                    keyStyle="theme"
                                    notesOn={["C4", 64, 67]}
                                    color={undefined}
                                    roundness={undefined}
                                    size="large"
                                    adaptiveSize={false}
                                />
                                <span className="text-xs text-muted-foreground text-center">Default</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Keys
                                    onClick={() => handleExampleClick(1)}
                                    nbKeys={25}
                                    startKey="C"
                                    keyStyle="classic"
                                    notesOn={["C4", "E4", "G4"]}
                                    color={undefined}
                                    size="large"
                                    adaptiveSize={false}
                                />
                                <span className="text-xs text-muted-foreground text-center">Classic Style</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Keys
                                    onClick={() => handleExampleClick(2)}
                                    nbKeys={25}
                                    startKey="C"
                                    keyStyle="classic-inverted"
                                    notesOn={["C4", "E4", "G4"]}
                                    color="#ff3366"
                                    size="large"
                                    adaptiveSize={false}
                                />
                                <span className="text-xs text-muted-foreground text-center">Classic Inverted</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Keys
                                    onClick={() => handleExampleClick(3)}
                                    nbKeys={25}
                                    startKey="C"
                                    keyStyle="classic"
                                    notesOn={[]}
                                    color="#33cc66"
                                    roundness={0.3}
                                    size="large"
                                    adaptiveSize={false}
                                />
                                <span className="text-xs text-muted-foreground text-center">With Roundness</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Keys
                                    onClick={() => handleExampleClick(4)}
                                    nbKeys={37}
                                    startKey="C"
                                    keyStyle="classic"
                                    notesOn={["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4"]}
                                    color="#9966ff"
                                    size="large"
                                    adaptiveSize={false}
                                />
                                <span className="text-xs text-muted-foreground text-center">Scale (C Major)</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Keys
                                    onClick={() => handleExampleClick(5)}
                                    nbKeys={13}
                                    startKey="C"
                                    keyStyle="theme"
                                    notesOn={[60, 64, 67]}
                                    color="#ff9933"
                                    size="large"
                                    adaptiveSize={false}
                                />
                                <span className="text-xs text-muted-foreground text-center">Small (MIDI Notes)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
