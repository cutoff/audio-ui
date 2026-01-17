/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import * as React from "react";
import { themeColors, DEFAULT_ROUNDNESS, getThemeRoundness } from "@cutoff/audio-ui-react";
import { audioUiThemeState } from "@/app/providers";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ThemeColor = {
    color: string; // Tailwind class for display
    name: string;
    value: string; // CSS color value to use
};

const themeColorOptions: ThemeColor[] = [
    { color: "bg-zinc-900 dark:bg-zinc-50", name: "Default (Adaptive)", value: themeColors.default },
    { color: "bg-blue-500", name: "Blue", value: themeColors.blue },
    { color: "bg-orange-500", name: "Orange", value: themeColors.orange },
    { color: "bg-pink-500", name: "Pink", value: themeColors.pink },
    { color: "bg-green-500", name: "Green", value: themeColors.green },
    { color: "bg-purple-500", name: "Purple", value: themeColors.purple },
    { color: "bg-yellow-500", name: "Yellow", value: themeColors.yellow },
];

/**
 * Reusable theme settings panel component.
 * Provides controls for theme color and roundness customization.
 * These settings affect only default components (default theme/skin).
 * Generic components, primitives, and other specialized components are not controlled by these settings.
 * Settings persist across component remounts by reading from global state and CSS variables.
 * Can be used in sidebar, sheet, or any container.
 *
 * @returns Theme settings panel component with color selector and roundness slider
 */
export function ThemeSettingsPanel() {
    // Initialize state - always start with default theme to ensure Select has a valid value
    // The state stores the theme color variable name (e.g., "var(--audioui-theme-default)")
    const [currentTheme, setCurrentTheme] = React.useState<string>(() => {
        // If global state has a color, use it; otherwise default to adaptive theme
        return audioUiThemeState.current.color || themeColors.default;
    });
    const [roundnessValue, setRoundnessValue] = React.useState(() => {
        // Try to get from global state first, then CSS variable, then default
        return audioUiThemeState.current.roundness ?? getThemeRoundness() ?? DEFAULT_ROUNDNESS;
    });

    // Ensure default theme is set in global state and CSS on mount
    React.useEffect(() => {
        // If no theme is set in global state, initialize with default adaptive theme
        if (!audioUiThemeState.current.color) {
            audioUiThemeState.current.setColor(themeColors.default);
            // State is already initialized with default, so no need to update it
        } else if (audioUiThemeState.current.color !== currentTheme) {
            // Sync with global state if it changed
            setCurrentTheme(audioUiThemeState.current.color);
        }

        const globalRoundness = audioUiThemeState.current.roundness ?? getThemeRoundness();
        if (globalRoundness !== null && globalRoundness !== undefined && globalRoundness !== roundnessValue) {
            setRoundnessValue(globalRoundness);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    // Function to change theme color
    const changeTheme = (themeColor: string) => {
        setCurrentTheme(themeColor);
        audioUiThemeState.current.setColor(themeColor);
    };

    // Function to change roundness (clamp to 0.0-1.0)
    const changeRoundness = (value: number) => {
        const clamped = Math.max(0.0, Math.min(1.0, value));
        setRoundnessValue(clamped);
        audioUiThemeState.current.setRoundness(clamped);
    };

    return (
        <div className="space-y-6 py-4">
            {/* Color Theme Selector */}
            <div className="space-y-2">
                <Label htmlFor="theme-color">Color</Label>
                <Select value={currentTheme} onValueChange={changeTheme}>
                    <SelectTrigger id="theme-color" className="h-9 w-full">
                        <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent
                        position="popper"
                        className="w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
                    >
                        {themeColorOptions.map((themeColor) => (
                            <SelectItem
                                key={themeColor.value}
                                value={themeColor.value}
                                className="inline-flex items-center"
                            >
                                <div
                                    className={`w-4 h-4 rounded-full ${themeColor.color} inline-block align-middle mr-2`}
                                />
                                <span className="align-middle">{themeColor.name}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Roundness Selector */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="roundness">Roundness</Label>
                    <Input
                        id="roundness"
                        type="number"
                        value={roundnessValue}
                        onChange={(e) => changeRoundness(Number(e.target.value))}
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-20 h-8 text-sm"
                    />
                </div>
                <Slider
                    value={[roundnessValue]}
                    onValueChange={(values) => changeRoundness(values[0])}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                />
            </div>
        </div>
    );
}
