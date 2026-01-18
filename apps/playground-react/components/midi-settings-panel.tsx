/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import * as React from "react";
import { midiServiceState } from "@/lib/midi-service";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

/**
 * MIDI settings panel component.
 * Provides controls for MIDI device selection and WebMidi enable/disable.
 * Can be used in sheet, sidebar, or any container.
 *
 * @returns MIDI settings panel component with device selector and enable toggle
 */
export function MidiSettingsPanel() {
    const [isEnabled, setIsEnabled] = React.useState(() => midiServiceState.current.isEnabled);
    const [inputs, setInputs] = React.useState(() => midiServiceState.current.inputs);
    const [selectedInputId, setSelectedInputId] = React.useState(() => midiServiceState.current.selectedInputId);
    const [isSupported, setIsSupported] = React.useState(() => midiServiceState.current.isSupported);

    // Sync with global state via polling
    // We use polling instead of React Context to avoid unnecessary re-renders and keep the API simple
    React.useEffect(() => {
        const service = midiServiceState.current;

        // Initial sync on mount
        setIsEnabled(service.isEnabled);
        setInputs(service.inputs);
        setSelectedInputId(service.selectedInputId);
        setIsSupported(service.isSupported);

        // Poll for state changes every 100ms
        // Create new array reference to trigger React re-render when inputs change
        const interval = setInterval(() => {
            setIsEnabled(service.isEnabled);
            setInputs([...service.inputs]);
            setSelectedInputId(service.selectedInputId);
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const handleEnableToggle = React.useCallback(async (enabled: boolean) => {
        const service = midiServiceState.current;

        if (enabled) {
            try {
                await service.enable();
                setIsEnabled(true);
                setInputs([...service.inputs]);
            } catch (error) {
                console.error("Failed to enable WebMidi:", error);
                setIsEnabled(false);
            }
        } else {
            service.disable();
            setIsEnabled(false);
            setInputs([]);
            setSelectedInputId(null);
        }
    }, []);

    const handleInputSelect = React.useCallback((inputId: string) => {
        const service = midiServiceState.current;
        if (inputId === "none") {
            service.selectInput(null);
            setSelectedInputId(null);
        } else {
            service.selectInput(inputId);
            setSelectedInputId(inputId);
        }
    }, []);

    if (!isSupported) {
        return (
            <div className="space-y-6 py-4">
                <div className="text-sm text-muted-foreground">
                    <p>WebMidi API is not supported in this browser.</p>
                </div>
            </div>
        );
    }

    const selectedInput = inputs.find((input) => input.id === selectedInputId);

    return (
        <div className="space-y-6 py-4">
            {/* Enable/Disable Toggle */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="midi-enable">Enable WebMidi</Label>
                    <Switch id="midi-enable" checked={isEnabled} onCheckedChange={handleEnableToggle} />
                </div>
                <p className="text-xs text-muted-foreground">
                    {isEnabled
                        ? "WebMidi is enabled. Select a device below to start receiving MIDI messages."
                        : "Enable WebMidi to access MIDI input devices."}
                </p>
            </div>

            {/* Device Selection */}
            {isEnabled && (
                <div className="space-y-2">
                    <Label htmlFor="midi-input">MIDI Input Device</Label>
                    <Select
                        value={selectedInputId || "none"}
                        onValueChange={handleInputSelect}
                        disabled={!isEnabled || inputs.length === 0}
                    >
                        <SelectTrigger id="midi-input" className="w-full">
                            <SelectValue placeholder="Select a MIDI input device" />
                        </SelectTrigger>
                        <SelectContent>
                            {inputs.length === 0 ? (
                                <SelectItem value="none" disabled>
                                    No MIDI devices found
                                </SelectItem>
                            ) : (
                                <>
                                    <SelectItem value="none">None</SelectItem>
                                    {inputs.map((input) => (
                                        <SelectItem key={input.id} value={input.id}>
                                            {input.name || `MIDI Input ${input.id}`}
                                        </SelectItem>
                                    ))}
                                </>
                            )}
                        </SelectContent>
                    </Select>
                    {selectedInput && (
                        <p className="text-xs text-muted-foreground">
                            Selected: <span className="font-medium">{selectedInput.name || selectedInput.id}</span>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
