/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import * as React from "react";
import { midiServiceState } from "@/lib/midi-service";

/**
 * Hook for accessing the global MIDI service.
 * Provides convenient access to MIDI service state and message listener registration.
 * Automatically syncs with the global service state via polling (since we're not using React Context).
 *
 * @returns Object containing MIDI service state and helper functions:
 *   - isSupported: Whether WebMidi API is supported
 *   - isEnabled: Whether WebMidi is currently enabled
 *   - inputs: List of available MIDI input devices
 *   - selectedInputId: ID of the currently selected input device
 *   - selectedInput: The currently selected input device object
 *   - service: Direct access to the MIDI service state object
 *   - addMessageListener: Helper function to register a message listener with automatic cleanup
 */
export function useMidi() {
    const [isSupported, setIsSupported] = React.useState(() => midiServiceState.current.isSupported);
    const [isEnabled, setIsEnabled] = React.useState(() => midiServiceState.current.isEnabled);
    const [inputs, setInputs] = React.useState(() => midiServiceState.current.inputs);
    const [selectedInputId, setSelectedInputId] = React.useState(() => midiServiceState.current.selectedInputId);
    const [selectedInput, setSelectedInput] = React.useState(() => midiServiceState.current.selectedInput);

    // Sync with global state via polling
    // We use polling instead of React Context to avoid unnecessary re-renders and keep the API simple
    React.useEffect(() => {
        const service = midiServiceState.current;

        // Initial sync on mount
        setIsSupported(service.isSupported);
        setIsEnabled(service.isEnabled);
        setInputs(service.inputs);
        setSelectedInputId(service.selectedInputId);
        setSelectedInput(service.selectedInput);

        // Poll for state changes every 100ms
        // Create new array reference to trigger React re-render when inputs change
        const interval = setInterval(() => {
            setIsEnabled(service.isEnabled);
            setInputs([...service.inputs]);
            setSelectedInputId(service.selectedInputId);
            setSelectedInput(service.selectedInput);
        }, 100);

        return () => clearInterval(interval);
    }, []);

    // Helper to register a message listener with automatic cleanup
    // Returns a cleanup function that can be used in useEffect
    const addMessageListener = React.useCallback((listener: (event: WebMidi.MIDIMessageEvent) => void) => {
        midiServiceState.current.addMessageListener(listener);
        return () => {
            midiServiceState.current.removeMessageListener(listener);
        };
    }, []);

    return {
        isSupported,
        isEnabled,
        inputs,
        selectedInputId,
        selectedInput,
        service: midiServiceState.current,
        addMessageListener,
    };
}
