"use client";

import React, { useEffect, useState } from "react";
import { isNoteOn, Keybed, noteNumToNote } from "@cutoff/audio-ui-react";
import ComponentSkeletonPage from "@/components/ComponentSkeletonPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";

// Define the NoteName type to match the one in the Keybed component
type NoteName = "C" | "D" | "E" | "F" | "G" | "A" | "B";

export default function KeybedPage() {
    const [nbKeys, setNbKeys] = useState<number>(61);
    const [startKey, setStartKey] = useState<NoteName>("C");
    const [octaveShift, setOctaveShift] = useState<number>(0);
    const [notesOn, setNotesOn] = useState<(string | number)[]>(["C4", 64, 67]);
    const [color, setColor] = useState<string | undefined>("#3399ff"); // Default blue color
    const [roundness, setRoundness] = useState<number | undefined>(undefined);

    // MIDI related state
    const [midiInputs, setMidiInputs] = useState<WebMidi.MIDIInput[]>([]);
    const [selectedInputId, setSelectedInputId] = useState<string>("");
    const [webMidiSupported, setWebMidiSupported] = useState<boolean>(true);

    // Generate code snippet with dynamic notesOn array
    const codeString = `<Keybed
  nbKeys={${nbKeys}}
  startKey="${startKey}"
  octaveShift={${octaveShift}}
  notesOn={[${notesOn.map((note) => (typeof note === "string" ? `"${note}"` : note)).join(", ")}]}${
        roundness !== undefined ? `\n  roundness={${roundness}}` : ""
    }
  color="${color}"
/>`;

    const componentProps = {
        nbKeys,
        startKey,
        octaveShift,
        notesOn,
        color,
        roundness,
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
            <ColorPicker id="colorProp" label="Color" value={color} onChange={setColor} />
        </div>,
        <div key="roundness" className="grid gap-2">
            <Label htmlFor="roundnessProp">Roundness (optional)</Label>
            <Input
                id="roundnessProp"
                type="number"
                min="0"
                max="50"
                value={roundness ?? ""}
                placeholder="theme"
                onChange={(e) => {
                    const nextValue = e.target.value === "" ? undefined : Math.max(0, Math.min(50, Number(e.target.value)));
                    setRoundness(nextValue);
                }}
            />
        </div>,
    ];

    // Initialize WebMIDI
    useEffect(() => {
        if (typeof navigator.requestMIDIAccess !== "function") {
            setWebMidiSupported(false);
            return;
        }

        const initWebMidi = async () => {
            try {
                const midiAccess = await navigator.requestMIDIAccess();

                // Get all MIDI inputs
                const inputs: WebMidi.MIDIInput[] = [];
                midiAccess.inputs.forEach((input) => {
                    inputs.push(input);
                });

                setMidiInputs(inputs);

                // Listen for state changes (device connect/disconnect)
                midiAccess.addEventListener("statechange", (event) => {
                    const midiConnectionEvent = event as WebMidi.MIDIConnectionEvent;
                    if (midiConnectionEvent.port.type === "input") {
                        // Refresh the inputs list
                        const updatedInputs: WebMidi.MIDIInput[] = [];
                        midiAccess.inputs.forEach((input) => {
                            updatedInputs.push(input);
                        });
                        setMidiInputs(updatedInputs);

                        // If the currently selected input was disconnected, clear the selection
                        if (
                            midiConnectionEvent.port.state === "disconnected" &&
                            midiConnectionEvent.port.id === selectedInputId
                        ) {
                            setSelectedInputId("");
                            setNotesOn([]);
                        }
                    }
                });
            } catch (error) {
                console.error("Failed to access MIDI devices:", error);
                setWebMidiSupported(false);
            }
        };

        initWebMidi();
    }, [selectedInputId]);

    // Handle MIDI input selection
    useEffect(() => {
        // Clear previous listeners and notes
        midiInputs.forEach((input) => {
            input.removeEventListener("midimessage", handleMidiMessage);
        });

        // Only clear notes if we're changing inputs
        if (selectedInputId !== "") {
            setNotesOn([]);
        }

        // Set up listener for the selected input
        if (selectedInputId) {
            const selectedInput = midiInputs.find((input) => input.id === selectedInputId);
            if (selectedInput) {
                selectedInput.addEventListener("midimessage", handleMidiMessage);
            }
        }

        // Cleanup function
        return () => {
            midiInputs.forEach((input) => {
                input.removeEventListener("midimessage", handleMidiMessage);
            });
        };
    }, [selectedInputId, midiInputs]);

    // Handle MIDI messages
    const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
        const data = event.data;

        // Note on message (status byte: 0x90)
        if ((data[0] & 0xf0) === 0x90 && data[2] > 0) {
            const midiNote = data[1];

            setNotesOn((prev) => {
                // Check if the note is already in the array (either as string or number)
                if (!isNoteOn(midiNote, prev)) {
                    return [...prev, midiNote];
                }
                return prev;
            });
        }

        // Note off message (status byte: 0x80 or 0x90 with velocity 0)
        if ((data[0] & 0xf0) === 0x80 || ((data[0] & 0xf0) === 0x90 && data[2] === 0)) {
            const midiNote = data[1];

            setNotesOn((prev) => {
                // Filter out the note (need to check both string and number representations)
                return prev.filter((note) => !isNoteOn(note, [midiNote]));
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Column - Using ComponentSkeletonPage */}
            <ComponentSkeletonPage
                componentName="Keybed"
                codeSnippet={codeString}
                PageComponent={Keybed}
                componentProps={componentProps}
                properties={properties}
            />

            {/* Right Column - Original Keybed Page Content */}
            <div className="w-full md:w-2/3 p-4 md:p-8">
                <div className="flex flex-col gap-6">
                    {!webMidiSupported ? (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>WebMIDI Not Supported</AlertTitle>
                            <AlertDescription>
                                Your browser does not support WebMIDI. Please use a browser that supports WebMIDI, such
                                as Chrome, Edge, or Opera. Safari does not currently support WebMIDI.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div>
                            <h2 className="text-xl md:text-2xl font-medium mb-4">MIDI Input</h2>
                            <label className="block text-sm font-medium mb-2">Select MIDI Input</label>
                            <Select value={selectedInputId} onValueChange={setSelectedInputId}>
                                <SelectTrigger className="w-full md:w-80">
                                    <SelectValue placeholder="Select a MIDI input device" />
                                </SelectTrigger>
                                <SelectContent>
                                    {midiInputs.length === 0 ? (
                                        <SelectItem value="none" disabled>
                                            No MIDI devices found
                                        </SelectItem>
                                    ) : (
                                        midiInputs.map((input) => (
                                            <SelectItem key={input.id} value={input.id}>
                                                {input.name || `MIDI Input ${input.id}`}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div>
                        <h2 className="text-xl md:text-2xl font-medium mb-4">Keybed Sizes</h2>
                        <div className="flex flex-col flex-wrap gap-4 mb-6">
                            <Keybed
                                nbKeys={nbKeys}
                                startKey={startKey}
                                octaveShift={octaveShift}
                                notesOn={notesOn}
                                size="xsmall"
                                color="#3399ff" // Blue
                                roundness={roundness}
                            />
                            <Keybed
                                nbKeys={nbKeys}
                                startKey={startKey}
                                octaveShift={octaveShift}
                                notesOn={notesOn}
                                size="small"
                                color="#ff3366" // Pink
                                roundness={roundness}
                            />
                            <Keybed
                                nbKeys={nbKeys}
                                startKey={startKey}
                                octaveShift={octaveShift}
                                notesOn={notesOn}
                                size="normal"
                                color="#33cc66" // Green
                                roundness={roundness}
                            />
                            <Keybed
                                nbKeys={nbKeys}
                                startKey={startKey}
                                octaveShift={octaveShift}
                                notesOn={notesOn}
                                size="large"
                                color="#9966ff" // Purple
                                roundness={roundness}
                            />
                            <Keybed
                                nbKeys={nbKeys}
                                startKey={startKey}
                                octaveShift={octaveShift}
                                notesOn={notesOn}
                                size="xlarge"
                                color="#ff9933" // Orange
                                roundness={roundness}
                            />
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        <p>Connect a MIDI keyboard and select it from the dropdown to play notes.</p>
                        <p className="mt-2">
                            Active notes:{" "}
                            {notesOn
                                .map((note) => (typeof note === "number" ? noteNumToNote(note) : note))
                                .join(", ") || "None"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
