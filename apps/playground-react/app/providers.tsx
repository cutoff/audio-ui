/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { setThemeRoundness, getThemeColor, getThemeRoundness, DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-react";

// Global state for audio UI theme
export type AudioUiThemeState = {
    color: string | undefined;
    roundness: number;
    setColor: (color: string) => void;
    setRoundness: (roundness: number) => void;
};

// Create a default state with setters that use CSS variables
export const defaultAudioUiTheme: AudioUiThemeState = {
    color: undefined,
    roundness: DEFAULT_ROUNDNESS,
    setColor: (color: string) => {
        if (typeof document !== "undefined") {
            document.documentElement.style.setProperty("--audioui-primary-color", color);
        }
    },
    setRoundness: (roundness: number) => {
        setThemeRoundness(roundness);
    },
};

// Create a global context to access this state from the sidebar
export const audioUiThemeState: { current: AudioUiThemeState } = {
    current: defaultAudioUiTheme,
};

// This component initializes theme CSS variables on mount
function ThemeInitializer({ children }: { children: React.ReactNode }) {
    // Set initial theme values on mount
    useEffect(() => {
        setThemeRoundness(DEFAULT_ROUNDNESS);

        // Update global state with current values
        audioUiThemeState.current = {
            color: getThemeColor() ?? undefined,
            roundness: getThemeRoundness() ?? DEFAULT_ROUNDNESS,
            setColor: (color: string) => {
                if (typeof document !== "undefined") {
                    document.documentElement.style.setProperty("--audioui-primary-color", color);
                }
                audioUiThemeState.current.color = color;
            },
            setRoundness: (roundness: number) => {
                setThemeRoundness(roundness);
                audioUiThemeState.current.roundness = roundness;
            },
        };
    }, []);

    return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
            <ThemeInitializer>{children}</ThemeInitializer>
        </ThemeProvider>
    );
}
