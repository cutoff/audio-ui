/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

/**
 * Global MIDI service state type.
 * Manages WebMidi API access, device enumeration, and message routing.
 */
export type MidiServiceState = {
    /** Whether WebMidi API is supported by the browser */
    isSupported: boolean;
    /** Whether WebMidi is currently enabled */
    isEnabled: boolean;
    /** List of available MIDI input devices */
    inputs: WebMidi.MIDIInput[];
    /** ID of the currently selected input device */
    selectedInputId: string | null;
    /** The currently selected input device object */
    selectedInput: WebMidi.MIDIInput | null;
    /** The MIDIAccess object */
    midiAccess: WebMidi.MIDIAccess | null;
    /** Enable WebMidi and initialize device enumeration */
    enable: () => Promise<void>;
    /** Disable WebMidi and clear all listeners */
    disable: () => void;
    /** Select a MIDI input device by ID */
    selectInput: (inputId: string | null) => void;
    /** Refresh the list of available MIDI input devices */
    refreshInputs: () => void;
    /** Register a message listener to receive MIDI messages */
    addMessageListener: (listener: (event: WebMidi.MIDIMessageEvent) => void) => void;
    /** Remove a registered message listener */
    removeMessageListener: (listener: (event: WebMidi.MIDIMessageEvent) => void) => void;
};

/**
 * Internal message listener registry.
 * Stores all registered listeners that should receive MIDI messages.
 */
const messageListeners = new Set<(event: WebMidi.MIDIMessageEvent) => void>();

/**
 * Internal message handler that routes messages to all registered listeners.
 * Wraps each listener call in a try-catch to prevent one failing listener from breaking others.
 *
 * @param event - The MIDI message event from the selected input device
 */
function handleMidiMessage(event: WebMidi.MIDIMessageEvent) {
    messageListeners.forEach((listener) => {
        try {
            listener(event);
        } catch (error) {
            console.error("Error in MIDI message listener:", error);
        }
    });
}

/**
 * Default MIDI service state implementation.
 * Provides WebMidi API access, device management, and message routing functionality.
 * Uses a global message listener registry to allow multiple components to listen to the same MIDI input.
 */
const defaultMidiService: MidiServiceState = {
    isSupported: typeof navigator !== "undefined" && typeof navigator.requestMIDIAccess === "function",
    isEnabled: false,
    inputs: [],
    selectedInputId: null,
    selectedInput: null,
    midiAccess: null,
    enable: async () => {
        if (!defaultMidiService.isSupported) {
            throw new Error("WebMidi API is not supported");
        }

        try {
            const midiAccess = await navigator.requestMIDIAccess();
            defaultMidiService.midiAccess = midiAccess;
            defaultMidiService.isEnabled = true;

            // Enumerate all available MIDI input devices
            // Include all devices regardless of connection state
            const inputs: WebMidi.MIDIInput[] = [];
            midiAccess.inputs.forEach((input) => {
                inputs.push(input);
            });
            defaultMidiService.inputs = inputs;

            // Listen for device connect/disconnect events
            // When devices are added or removed, refresh the inputs list and clear selection if the selected device disconnects
            midiAccess.addEventListener("statechange", (event) => {
                const midiConnectionEvent = event as WebMidi.MIDIConnectionEvent;
                if (midiConnectionEvent.port.type === "input") {
                    // Refresh the inputs list to reflect current device state
                    const updatedInputs: WebMidi.MIDIInput[] = [];
                    midiAccess.inputs.forEach((input) => {
                        updatedInputs.push(input);
                    });
                    defaultMidiService.inputs = updatedInputs;

                    // If the currently selected input was disconnected, clear the selection
                    // This prevents errors from trying to use a disconnected device
                    if (
                        midiConnectionEvent.port.state === "disconnected" &&
                        midiConnectionEvent.port.id === defaultMidiService.selectedInputId
                    ) {
                        defaultMidiService.selectInput(null);
                    }
                }
            });
        } catch (error) {
            console.error("Failed to access MIDI devices:", error);
            defaultMidiService.isEnabled = false;
            throw error;
        }
    },
    disable: () => {
        // Remove listener from selected input
        if (defaultMidiService.selectedInput) {
            defaultMidiService.selectedInput.removeEventListener("midimessage", handleMidiMessage);
        }

        defaultMidiService.isEnabled = false;
        defaultMidiService.selectedInputId = null;
        defaultMidiService.selectedInput = null;
        defaultMidiService.inputs = [];
        defaultMidiService.midiAccess = null;
    },
    selectInput: (inputId: string | null) => {
        // Remove listener from previously selected input to prevent duplicate listeners
        if (defaultMidiService.selectedInput) {
            defaultMidiService.selectedInput.removeEventListener("midimessage", handleMidiMessage);
        }

        defaultMidiService.selectedInputId = inputId;
        defaultMidiService.selectedInput = null;

        // Set up listener for the new selected input
        // Only attach listener if WebMidi is enabled and the input exists
        if (inputId && defaultMidiService.isEnabled && defaultMidiService.midiAccess) {
            const selectedInput = defaultMidiService.inputs.find((input) => input.id === inputId);
            if (selectedInput) {
                defaultMidiService.selectedInput = selectedInput;
                // Route all messages from this input to registered listeners via handleMidiMessage
                selectedInput.addEventListener("midimessage", handleMidiMessage);
            }
        }
    },
    refreshInputs: () => {
        // Refresh the list of available MIDI input devices
        // This is useful when the sheet opens to ensure we have the latest device list
        // Include all devices regardless of connection state
        if (defaultMidiService.isEnabled && defaultMidiService.midiAccess) {
            const updatedInputs: WebMidi.MIDIInput[] = [];
            defaultMidiService.midiAccess.inputs.forEach((input) => {
                updatedInputs.push(input);
            });
            defaultMidiService.inputs = updatedInputs;
        }
    },
    addMessageListener: (listener: (event: WebMidi.MIDIMessageEvent) => void) => {
        messageListeners.add(listener);
    },
    removeMessageListener: (listener: (event: WebMidi.MIDIMessageEvent) => void) => {
        messageListeners.delete(listener);
    },
};

/**
 * Global MIDI service state object.
 * Provides direct access to MIDI service from any component.
 * Similar pattern to audioUiThemeState for consistency.
 */
export const midiServiceState: { current: MidiServiceState } = {
    current: defaultMidiService,
};
