<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 See LICENSE.md for details.
-->

# Playground App MIDI Service

This document explains the MIDI service implementation in the playground application and how to integrate MIDI keyboard input into components.

## Overview

The playground app provides a global MIDI service that manages WebMidi API access, device enumeration, and message routing. The service allows multiple components to listen to the same MIDI input device simultaneously, enabling MIDI keyboard integration across different parts of the application.

## Architecture

### Global Service Pattern

The MIDI service follows the same global state pattern as the theme system (`audioUiThemeState`), using a global object that can be accessed from any component without React Context overhead.

**Location**: `lib/midi-service.ts`

```typescript
export const midiServiceState: { current: MidiServiceState } = {
  current: defaultMidiService,
};
```

### Service State

The `MidiServiceState` type provides:

- **Device Management**: `isSupported`, `isEnabled`, `inputs`, `selectedInputId`, `selectedInput`
- **Control Methods**: `enable()`, `disable()`, `selectInput()`
- **Message Routing**: `addMessageListener()`, `removeMessageListener()`

### Message Listener Registry

The service uses an internal message listener registry to route MIDI messages from the selected input device to all registered listeners:

```typescript
const messageListeners = new Set<(event: WebMidi.MIDIMessageEvent) => void>();
```

**Key Features**:

- Multiple components can register listeners for the same MIDI input
- Messages are routed to all registered listeners automatically
- Error handling prevents one failing listener from breaking others
- Automatic cleanup when devices disconnect

## React Hook Integration

### useMidi Hook

The `useMidi` hook provides convenient React integration with the global MIDI service.

**Location**: `hooks/use-midi.tsx`

```typescript
const { selectedInput, addMessageListener } = useMidi();
```

**Returns**:

- `isSupported`: Whether WebMidi API is supported by the browser
- `isEnabled`: Whether WebMidi is currently enabled
- `inputs`: List of available MIDI input devices
- `selectedInputId`: ID of the currently selected input device
- `selectedInput`: The currently selected input device object
- `service`: Direct access to the MIDI service state object
- `addMessageListener`: Helper function that returns a cleanup function for use in `useEffect`

**State Synchronization**:

The hook uses polling (100ms interval) to sync with global state instead of React Context. This approach:

- Avoids unnecessary re-renders
- Keeps the API simple
- Works with the global state pattern

### Message Listener Registration

The `addMessageListener` helper returns a cleanup function that can be used directly in `useEffect`:

```typescript
useEffect(() => {
  if (!selectedInput) {
    return;
  }

  const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
    const data = event.data;
    // Handle MIDI messages
  };

  const cleanup = addMessageListener(handleMidiMessage);
  return cleanup;
}, [selectedInput, addMessageListener]);
```

## MIDI Message Handling

### Message Format

MIDI messages are received as `WebMidi.MIDIMessageEvent` objects with a `data` property containing a `Uint8Array`:

```typescript
const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
  const data = event.data;
  // data[0]: Status byte (message type + channel)
  // data[1]: First data byte (e.g., note number, CC number)
  // data[2]: Second data byte (e.g., velocity, CC value)
};
```

### Common Message Types

#### Note On (0x90)

Status byte `0x90` (note on, channel 1) with velocity > 0:

```typescript
if ((data[0] & 0xf0) === 0x90 && data[2] > 0) {
  const midiNote = data[1]; // Note number (0-127)
  const velocity = data[2]; // Velocity (1-127)
  // Handle note on
}
```

**MIDI Status Byte Format**:

- Upper nibble (0xf0 mask): Message type
  - `0x90`: Note on
  - `0x80`: Note off
  - `0xB0`: Control change
- Lower nibble: Channel (0-15)
  - Channel 1 = `0x90`, Channel 2 = `0x91`, etc.

#### Note Off (0x80 or 0x90 with velocity 0)

Some MIDI devices send note on with velocity 0 instead of note off:

```typescript
if ((data[0] & 0xf0) === 0x80 || ((data[0] & 0xf0) === 0x90 && data[2] === 0)) {
  const midiNote = data[1];
  // Handle note off
}
```

#### Control Change (0xB0)

Control Change messages for parameters like sustain pedal:

```typescript
if ((data[0] & 0xf0) === 0xb0 && data[1] === 64) {
  // CC 64 = Sustain pedal
  const isActive = data[2] >= 64; // 0-63 = off, 64-127 = on
  // Handle sustain pedal
}
```

**Common Control Change Numbers**:

- CC 64: Sustain pedal
- CC 1: Modulation wheel
- CC 7: Volume
- CC 10: Pan

## Integration Examples

### Basic Integration

Minimal example of integrating MIDI input into a component:

```typescript
"use client";

import { useMidi } from "@/hooks/use-midi";

export default function MyComponent() {
    const { selectedInput, addMessageListener } = useMidi();

    useEffect(() => {
        if (!selectedInput) {
            return;
        }

        const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
            const data = event.data;

            // Note on
            if ((data[0] & 0xf0) === 0x90 && data[2] > 0) {
                const midiNote = data[1];
                console.log("Note on:", midiNote);
            }

            // Note off
            if ((data[0] & 0xf0) === 0x80 || ((data[0] & 0xf0) === 0x90 && data[2] === 0)) {
                const midiNote = data[1];
                console.log("Note off:", midiNote);
            }
        };

        const cleanup = addMessageListener(handleMidiMessage);
        return cleanup;
    }, [selectedInput, addMessageListener]);

    return <div>My Component</div>;
}
```

### WebAudio Synthesizer Integration

Complete example from the WebAudio example page:

```typescript
"use client";

import { useMidi } from "@/hooks/use-midi";
import { useState, useRef, useEffect, useCallback } from "react";

export default function WebAudioPage() {
    const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
    const [isSustainActive, setIsSustainActive] = useState(false);
    const synthRef = useRef<SynthEngine | null>(null);
    const prevSelectedInputRef = useRef<WebMidi.MIDIInput | null>(null);

    const { selectedInput, addMessageListener } = useMidi();

    const handleNoteOn = useCallback((midi: number) => {
        setActiveNotes((prev) => new Set(prev).add(midi));
        if (synthRef.current) {
            synthRef.current.noteOn(midi);
        }
    }, []);

    const handleNoteOff = useCallback((midi: number) => {
        setActiveNotes((prev) => {
            const next = new Set(prev);
            next.delete(midi);
            return next;
        });
        if (synthRef.current && !isSustainActive) {
            synthRef.current.noteOff(midi);
        }
    }, [isSustainActive]);

    const handleSustainChange = useCallback((active: boolean) => {
        setIsSustainActive(active);
        // Release sustained notes when sustain is released
    }, []);

    // Handle MIDI messages
    useEffect(() => {
        // Only clear notes when transitioning from having a device to not having one
        // This prevents clearing notes when WebMidi is disabled but user is using on-screen keyboard
        const hadSelectedInput = prevSelectedInputRef.current !== null;
        const hasSelectedInput = selectedInput !== null;

        if (hadSelectedInput && !hasSelectedInput) {
            // MIDI device was disconnected - release all active notes
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
            return;
        }

        const handleMidiMessage = (event: WebMidi.MIDIMessageEvent) => {
            const data = event.data;

            // Note on
            if ((data[0] & 0xf0) === 0x90 && data[2] > 0) {
                const midiNote = data[1];
                handleNoteOn(midiNote);
            }

            // Note off
            if ((data[0] & 0xf0) === 0x80 || ((data[0] & 0xf0) === 0x90 && data[2] === 0)) {
                const midiNote = data[1];
                handleNoteOff(midiNote);
            }

            // Sustain pedal (CC 64)
            if ((data[0] & 0xf0) === 0xb0 && data[1] === 64) {
                const isActive = data[2] >= 64;
                handleSustainChange(isActive);
            }
        };

        const cleanup = addMessageListener(handleMidiMessage);
        return cleanup;
    }, [selectedInput, addMessageListener, handleNoteOn, handleNoteOff, handleSustainChange]);

    return (
        <div>
            {/* Component UI */}
        </div>
    );
}
```

**Key Points**:

- Track previous `selectedInput` to detect device disconnection
- Only clear notes when device disconnects (not when WebMidi is disabled from start)
- Both MIDI and on-screen keyboard can work simultaneously
- Handler functions are memoized with `useCallback` to prevent unnecessary re-renders

## UI Components

### MidiSettingsButton

The MIDI settings button is available in the app header (via `app/layout.tsx`).

**Location**: `components/midi-settings-button.tsx`

**Features**:

- Only renders if WebMidi is supported
- Responsive: right-side sheet on desktop, bottom sheet on mobile
- No overlay to allow real-time preview while settings are open
- Opens `MidiSettingsPanel` in a sheet

### MidiSettingsPanel

The settings panel provides device selection and enable/disable controls.

**Location**: `components/midi-settings-panel.tsx`

**Features**:

- Enable/disable WebMidi toggle
- Device selection dropdown
- Shows selected device name
- Handles device connect/disconnect events
- Polls global state for updates

## Device Management

### Enabling WebMidi

Users enable WebMidi via the settings panel. The service:

1. Requests MIDI access via `navigator.requestMIDIAccess()`
2. Enumerates all available input devices
3. Sets up device connect/disconnect listeners
4. Updates the `inputs` array automatically when devices are added/removed

### Device Selection

Users select a device from the dropdown. The service:

1. Removes listener from previously selected device
2. Attaches listener to the new selected device
3. Routes all messages to registered listeners via `handleMidiMessage`

### Device Disconnection

When a device disconnects:

1. The service detects the disconnection via `statechange` event
2. Refreshes the `inputs` array
3. Clears selection if the selected device disconnected
4. Components should handle cleanup in their `useEffect` hooks

## Best Practices

### 1. Handle Missing Input Gracefully

Always check if `selectedInput` exists before registering listeners:

```typescript
useEffect(() => {
  if (!selectedInput) {
    // Handle case when no device is selected
    return;
  }
  // Register listener
}, [selectedInput]);
```

### 2. Clean Up on Device Disconnection

Track previous `selectedInput` to detect disconnection and clean up state:

```typescript
const prevSelectedInputRef = useRef<WebMidi.MIDIInput | null>(null);

useEffect(() => {
  const hadSelectedInput = prevSelectedInputRef.current !== null;
  const hasSelectedInput = selectedInput !== null;

  if (hadSelectedInput && !hasSelectedInput) {
    // Device was disconnected - clean up
  }

  prevSelectedInputRef.current = selectedInput;
}, [selectedInput]);
```

### 3. Don't Clear Notes When WebMidi is Disabled

Only clear notes when a device disconnects, not when WebMidi is disabled from the start. This allows on-screen keyboard to work independently:

```typescript
// ❌ Bad: Clears notes whenever selectedInput is null
if (!selectedInput) {
  setActiveNotes(new Set());
  return;
}

// ✅ Good: Only clears on device disconnection
const hadSelectedInput = prevSelectedInputRef.current !== null;
if (hadSelectedInput && !selectedInput) {
  // Device disconnected - clear notes
}
```

### 4. Memoize Handler Functions

Use `useCallback` to prevent unnecessary re-renders:

```typescript
const handleNoteOn = useCallback((midi: number) => {
  // Handle note on
}, []);

// Include in useEffect dependencies
useEffect(() => {
  // ...
}, [selectedInput, addMessageListener, handleNoteOn]);
```

### 5. Support Both Input Methods

MIDI and on-screen keyboard can work simultaneously. Both should call the same handler functions:

```typescript
// On-screen keyboard
<Keys
    onChange={(e) => {
        if (e.value.active) {
            handleNoteOn(e.value.note);
        } else {
            handleNoteOff(e.value.note);
        }
    }}
/>

// MIDI keyboard (via message listener)
// Calls the same handleNoteOn/handleNoteOff functions
```

## Troubleshooting

### MIDI Messages Not Received

1. **Check WebMidi is enabled**: Verify `isEnabled` is `true` in the service
2. **Check device is selected**: Verify `selectedInput` is not `null`
3. **Check listener is registered**: Ensure `addMessageListener` is called and cleanup is returned
4. **Check browser support**: Verify `isSupported` is `true`

### Notes Not Clearing on Device Disconnect

Ensure you're tracking the transition from having a device to not having one:

```typescript
// Track previous state
const prevSelectedInputRef = useRef<WebMidi.MIDIInput | null>(null);

// Only clear on transition
if (prevSelectedInputRef.current !== null && selectedInput === null) {
  // Device disconnected
}
```

### On-Screen Keyboard Not Working When WebMidi is Disabled

Don't clear notes when `selectedInput` is `null` if it was never set. Only clear on device disconnection:

```typescript
// ❌ Bad: Clears notes when WebMidi is disabled
if (!selectedInput) {
  setActiveNotes(new Set());
}

// ✅ Good: Only clears on disconnection
const hadSelectedInput = prevSelectedInputRef.current !== null;
if (hadSelectedInput && !selectedInput) {
  setActiveNotes(new Set());
}
```

### Multiple Components Receiving Messages

This is expected behavior. The service routes messages to all registered listeners. If you need exclusive access, consider:

1. Using a single component that manages state and passes it down via props
2. Using a state management solution (Redux, Zustand, etc.)
3. Implementing message filtering in your listener

## Related Files

- **Service Implementation**: `lib/midi-service.ts`
- **React Hook**: `hooks/use-midi.tsx`
- **Settings Button**: `components/midi-settings-button.tsx`
- **Settings Panel**: `components/midi-settings-panel.tsx`
- **Example Integration**: `app/examples/webaudio/page.tsx`
- **Keys Example**: `app/vector-components/keys/page.tsx`

## WebMidi API Reference

For detailed information about the WebMidi API:

- [MDN WebMidi API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)
- [MIDI Message Format](https://www.midi.org/specifications-old/item/table-1-summary-of-midi-message)
- [Control Change Numbers](https://www.midi.org/specifications-old/item/table-3-control-change-messages-data-bytes-2)
