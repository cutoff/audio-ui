/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import * as React from "react";
import { midiServiceState } from "@/lib/midi-service";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface MidiSettingsPanelProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

/**
 * MIDI settings panel component.
 * Provides controls for MIDI device selection and WebMidi enable/disable.
 * Uses a vertical toggle group with "Disabled" as the default option.
 * Automatically enables WebMIDI when the sheet opens for the first time.
 * Applies device selection or disables WebMIDI when the sheet closes.
 *
 * @param props - Component props
 * @param props.open - Whether the sheet is open
 * @param props.onOpenChange - Callback when sheet open state changes (currently unused, reserved for future use)
 * @returns MIDI settings panel component with device toggle group
 */
export function MidiSettingsPanel({ open }: MidiSettingsPanelProps) {
    const [, setIsEnabled] = React.useState(() => midiServiceState.current.isEnabled);
    const [inputs, setInputs] = React.useState(() => midiServiceState.current.inputs);
    const [selectedInputId, setSelectedInputId] = React.useState(() => midiServiceState.current.selectedInputId);
    const [isSupported, setIsSupported] = React.useState(() => midiServiceState.current.isSupported);
    const [pendingSelection, setPendingSelection] = React.useState<string | null | undefined>(undefined);

    // Sync with global state - only poll when sheet is open
    // We use polling instead of React Context to avoid unnecessary re-renders and keep the API simple
    React.useEffect(() => {
        const service = midiServiceState.current;

        // Initial sync on mount
        setIsEnabled(service.isEnabled);
        setInputs(service.inputs);
        setSelectedInputId(service.selectedInputId);
        setIsSupported(service.isSupported);

        // Only poll when sheet is open to refresh device list in real-time
        if (!open) {
            return;
        }

        // Immediate sync when sheet opens (before first poll interval)
        setIsEnabled(service.isEnabled);
        setInputs([...service.inputs]);
        setSelectedInputId(service.selectedInputId);

        // Poll every 50ms when sheet is open to detect device connect/disconnect
        // Create new array reference to trigger React re-render when inputs change
        const interval = setInterval(() => {
            setIsEnabled(service.isEnabled);
            setInputs([...service.inputs]);
            setSelectedInputId(service.selectedInputId);
        }, 50);

        return () => clearInterval(interval);
    }, [open]);

    // Auto-enable WebMIDI when sheet opens for the first time and refresh device list
    React.useEffect(() => {
        if (!open) {
            return;
        }

        const service = midiServiceState.current;

        // Initialize pending selection to current state when sheet opens
        setPendingSelection(service.selectedInputId);

        if (!service.isEnabled) {
            // First time opening - enable WebMIDI
            service
                .enable()
                .then(() => {
                    // After enabling, refresh the inputs list to ensure we have the latest devices
                    service.refreshInputs();
                    // Force immediate state update after enabling
                    setIsEnabled(service.isEnabled);
                    setInputs([...service.inputs]);
                    setSelectedInputId(service.selectedInputId);
                })
                .catch((error) => {
                    console.error("Failed to enable WebMidi:", error);
                });
        } else {
            // Sheet opened and WebMIDI is already enabled - refresh device list immediately
            service.refreshInputs();
            setInputs([...service.inputs]);
            setSelectedInputId(service.selectedInputId);
        }
    }, [open, selectedInputId]);

    // Apply pending selection when sheet closes
    React.useEffect(() => {
        if (!open && pendingSelection !== undefined) {
            const service = midiServiceState.current;
            // Apply pending selection
            if (pendingSelection === null) {
                // "Disabled" selected - disable WebMIDI
                service.disable();
            } else {
                // Device selected - ensure WebMIDI is enabled and select the device
                if (!service.isEnabled) {
                    service
                        .enable()
                        .then(() => {
                            service.selectInput(pendingSelection);
                        })
                        .catch((error) => {
                            console.error("Failed to enable WebMidi:", error);
                        });
                } else {
                    service.selectInput(pendingSelection);
                }
            }
            // Reset pending selection after applying
            setPendingSelection(undefined);
        }
    }, [open, pendingSelection]);

    const handleToggleChange = React.useCallback((value: string) => {
        // Update pending selection (not applied until sheet closes)
        // Handle empty string (deselection) by defaulting to "disabled"
        if (!value || value === "disabled") {
            setPendingSelection(null);
        } else {
            setPendingSelection(value);
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

    // Determine the current toggle value (use pending selection if set, otherwise current state)
    const currentToggleValue =
        pendingSelection !== undefined
            ? pendingSelection === null
                ? "disabled"
                : pendingSelection
            : selectedInputId === null
              ? "disabled"
              : selectedInputId;

    return (
        <div className="space-y-6 py-4">
            <ToggleGroup
                type="single"
                value={currentToggleValue}
                onValueChange={handleToggleChange}
                className="flex flex-col gap-2 w-full"
            >
                <ToggleGroupItem value="disabled" className="w-full justify-start">
                    Disabled
                </ToggleGroupItem>
                {inputs.length === 0 ? (
                    <ToggleGroupItem value="no-devices" disabled className="w-full justify-start">
                        No MIDI devices found
                    </ToggleGroupItem>
                ) : (
                    inputs.map((input) => (
                        <ToggleGroupItem key={input.id} value={input.id} className="w-full justify-start">
                            {input.name || `MIDI Input ${input.id}`}
                        </ToggleGroupItem>
                    ))
                )}
            </ToggleGroup>
        </div>
    );
}
