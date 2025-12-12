"use client";

import React, { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { AudioUiProvider, useAudioUiTheme, DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-react";

// Global state for audio UI theme
export type AudioUiThemeState = {
    color: string | undefined;
    roundness: number;
    setColor: (color: string) => void;
    setRoundness: (roundness: number) => void;
};

// Create a default state with no-op setters
export const defaultAudioUiTheme: AudioUiThemeState = {
    color: undefined,
    roundness: DEFAULT_ROUNDNESS,
    setColor: () => {},
    setRoundness: () => {},
};

// Create a global context to access this state from the sidebar
export const audioUiThemeState: { current: AudioUiThemeState } = {
    current: defaultAudioUiTheme,
};

// This component connects the AudioUiProvider's context to the global audioUiThemeState
function ThemeConnector({ children }: { children: React.ReactNode }) {
    // Get the actual theme context from AudioUiProvider
    const { color, roundness, setColor, setRoundness } = useAudioUiTheme();

    // Update the global reference with the actual context values and setters
    useEffect(() => {
        audioUiThemeState.current = {
            color, // Can be undefined - components will use adaptive default
            roundness: roundness ?? DEFAULT_ROUNDNESS,
            setColor,
            setRoundness,
        };
    }, [color, roundness, setColor, setRoundness]);

    return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
            <AudioUiProvider initialRoundness={DEFAULT_ROUNDNESS}>
                <ThemeConnector>{children}</ThemeConnector>
            </AudioUiProvider>
        </ThemeProvider>
    );
}
