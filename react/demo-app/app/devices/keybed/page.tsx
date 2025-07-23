"use client"

import React, { useState, useEffect } from "react";
import { Keybed } from "@cutoff/audio-ui-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function KeybedPage() {
  const [midiInputs, setMidiInputs] = useState<WebMidi.MIDIInput[]>([]);
  const [selectedInputId, setSelectedInputId] = useState<string>("");
  const [notesOn, setNotesOn] = useState<string[]>([]);
  const [webMidiSupported, setWebMidiSupported] = useState<boolean>(true);

  // Initialize WebMIDI
  useEffect(() => {
    if (typeof navigator.requestMIDIAccess !== 'function') {
      setWebMidiSupported(false);
      return;
    }

    const initWebMidi = async () => {
      try {
        const midiAccess = await navigator.requestMIDIAccess();
        
        // Get all MIDI inputs
        const inputs: WebMidi.MIDIInput[] = [];
        midiAccess.inputs.forEach(input => {
          inputs.push(input);
        });
        
        setMidiInputs(inputs);
        
        // Listen for state changes (device connect/disconnect)
        midiAccess.addEventListener('statechange', (event) => {
          const midiConnectionEvent = event as WebMidi.MIDIConnectionEvent;
          if (midiConnectionEvent.port.type === 'input') {
            // Refresh the inputs list
            const updatedInputs: WebMidi.MIDIInput[] = [];
            midiAccess.inputs.forEach(input => {
              updatedInputs.push(input);
            });
            setMidiInputs(updatedInputs);
            
            // If the currently selected input was disconnected, clear the selection
            if (midiConnectionEvent.port.state === 'disconnected' && 
                midiConnectionEvent.port.id === selectedInputId) {
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
    midiInputs.forEach(input => {
      input.removeEventListener('midimessage', handleMidiMessage);
    });
    setNotesOn([]);

    // Set up listener for the selected input
    if (selectedInputId) {
      const selectedInput = midiInputs.find(input => input.id === selectedInputId);
      if (selectedInput) {
        selectedInput.addEventListener('midimessage', handleMidiMessage);
      }
    }

    // Cleanup function
    return () => {
      midiInputs.forEach(input => {
        input.removeEventListener('midimessage', handleMidiMessage);
      });
    };
  }, [selectedInputId, midiInputs]);

  // Handle MIDI messages
  const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
    const data = event.data;
    
    // Note on message (status byte: 0x90)
    if ((data[0] & 0xF0) === 0x90 && data[2] > 0) {
      const midiNote = data[1];
      const noteName = midiNoteToNoteName(midiNote);
      
      setNotesOn(prev => {
        if (!prev.includes(noteName)) {
          return [...prev, noteName];
        }
        return prev;
      });
    }
    
    // Note off message (status byte: 0x80 or 0x90 with velocity 0)
    if ((data[0] & 0xF0) === 0x80 || ((data[0] & 0xF0) === 0x90 && data[2] === 0)) {
      const midiNote = data[1];
      const noteName = midiNoteToNoteName(midiNote);
      
      setNotesOn(prev => prev.filter(note => note !== noteName));
    }
  };

  // Convert MIDI note number to note name (considering MIDI note 60 as C4)
  const midiNoteToNoteName = (midiNote: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1; // MIDI note 60 is C4, so we subtract 1 from the octave calculation
    const noteName = noteNames[midiNote % 12];
    return `${noteName}${octave}`;
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <h1 className="text-2xl font-medium mb-6">Keybed</h1>
      
      {!webMidiSupported ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>WebMIDI Not Supported</AlertTitle>
          <AlertDescription>
            Your browser does not support WebMIDI. Please use a browser that supports WebMIDI, such as Chrome, Edge, or Opera.
            Safari does not currently support WebMIDI.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select MIDI Input</label>
          <Select
            value={selectedInputId}
            onValueChange={setSelectedInputId}
          >
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Select a MIDI input device" />
            </SelectTrigger>
            <SelectContent>
              {midiInputs.length === 0 ? (
                <SelectItem value="none" disabled>No MIDI devices found</SelectItem>
              ) : (
                midiInputs.map(input => (
                  <SelectItem key={input.id} value={input.id}>
                    {input.name || `MIDI Input ${input.id}`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="mt-8">
        <Keybed
          nbKeys={88}
          startKey="A"
          notesOn={notesOn}
          size="large"
        />
      </div>
      
      <div className="mt-6 text-sm text-muted-foreground">
        <p>Connect a MIDI keyboard and select it from the dropdown to play notes.</p>
        <p className="mt-2">Active notes: {notesOn.join(', ') || 'None'}</p>
      </div>
    </div>
  );
}
