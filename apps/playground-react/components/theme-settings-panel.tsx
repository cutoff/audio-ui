/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import * as React from "react";
import Color from "color";
import { themeColors, themeColorsDirect, DEFAULT_ROUNDNESS, getThemeRoundness } from "@cutoff/audio-ui-react";
import { audioUiThemeState } from "@/app/providers";
import { useTheme } from "next-themes";

import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ColorPickerField } from "@/components/ColorPickerField";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ThemeColor = {
    id: string;
    name: string;
    value: string; // CSS color value to use
    displayColor: string; // Actual color value for display
};

/**
 * Gets the display color for a theme color option.
 * Uses themeColorsDirect to get the actual color value based on light/dark mode.
 *
 * @param themeId - The theme identifier (e.g., "default", "blue", "orange")
 * @param isDark - Whether dark mode is active
 * @returns The HSL color string for the theme in the current mode
 */
function getThemeDisplayColor(themeId: keyof typeof themeColorsDirect, isDark: boolean): string {
    const colorData = themeColorsDirect[themeId];
    if (themeId === "default") {
        return isDark ? colorData.dark : colorData.light;
    }
    // For non-default themes, use light value (they're similar in both modes)
    return colorData.light;
}

const themeColorOptions: ThemeColor[] = [
    { id: "default", name: "Default", value: themeColors.default, displayColor: "" },
    { id: "blue", name: "Blue", value: themeColors.blue, displayColor: "" },
    { id: "orange", name: "Orange", value: themeColors.orange, displayColor: "" },
    { id: "pink", name: "Pink", value: themeColors.pink, displayColor: "" },
    { id: "green", name: "Green", value: themeColors.green, displayColor: "" },
    { id: "purple", name: "Purple", value: themeColors.purple, displayColor: "" },
    { id: "yellow", name: "Yellow", value: themeColors.yellow, displayColor: "" },
];

/**
 * Reusable theme settings panel component.
 * Provides controls for theme color and roundness customization.
 * These settings affect only vector components (default theme/skin).
 * Raster components, primitives, and other specialized components are not controlled by these settings.
 * Settings persist across component remounts by reading from global state and CSS variables.
 * Can be used in sidebar, sheet, or any container.
 *
 * @returns Theme settings panel component with color selector and roundness slider
 */
export function ThemeSettingsPanel() {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    // Initialize state - stores the theme color value (CSS variable or custom color)
    const [currentTheme, setCurrentTheme] = React.useState<string>(() => {
        return audioUiThemeState.current.color || themeColors.default;
    });

    const [roundnessValue, setRoundnessValue] = React.useState(() => {
        return audioUiThemeState.current.roundness ?? getThemeRoundness() ?? DEFAULT_ROUNDNESS;
    });

    // Compute display colors for theme options based on current theme mode
    const themeOptionsWithColors = React.useMemo(() => {
        return themeColorOptions.map((option) => ({
            ...option,
            displayColor: getThemeDisplayColor(option.id as keyof typeof themeColorsDirect, isDark),
        }));
    }, [isDark]);

    // Check if the current theme matches one of the predefined options
    const selectedThemeOption = React.useMemo(() => {
        return themeOptionsWithColors.find((option) => option.value === currentTheme);
    }, [currentTheme, themeOptionsWithColors]);

    // Determine if current theme is custom
    const isCustom = !selectedThemeOption;

    // Get the display color for the current selection
    const currentDisplayColor = React.useMemo(() => {
        if (selectedThemeOption) {
            return selectedThemeOption.displayColor;
        }
        return currentTheme;
    }, [selectedThemeOption, currentTheme]);

    // Ensure default theme is set in global state and CSS on mount
    React.useEffect(() => {
        // If no theme is set in global state, initialize with default adaptive theme
        if (!audioUiThemeState.current.color) {
            audioUiThemeState.current.setColor(themeColors.default);
        } else if (audioUiThemeState.current.color !== currentTheme) {
            setCurrentTheme(audioUiThemeState.current.color);
        }

        const globalRoundness = audioUiThemeState.current.roundness ?? getThemeRoundness();
        if (globalRoundness !== null && globalRoundness !== undefined && globalRoundness !== roundnessValue) {
            setRoundnessValue(globalRoundness);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    const changeTheme = (themeColor: string) => {
        setCurrentTheme(themeColor);
        audioUiThemeState.current.setColor(themeColor);
    };

    const handleCustomColorChange = React.useCallback((color: string | undefined) => {
        if (color) {
            setCurrentTheme(color);
            audioUiThemeState.current.setColor(color);
        } else {
            // If custom color is cleared, revert to default theme
            setCurrentTheme(themeColors.default);
            audioUiThemeState.current.setColor(themeColors.default);
        }
    }, []);

    const changeRoundness = (value: number) => {
        const clamped = Math.max(0.0, Math.min(1.0, value));
        setRoundnessValue(clamped);
        audioUiThemeState.current.setRoundness(clamped);
    };

    const resetToDefaults = () => {
        setCurrentTheme(themeColors.default);
        audioUiThemeState.current.setColor(themeColors.default);
        setRoundnessValue(DEFAULT_ROUNDNESS);
        audioUiThemeState.current.setRoundness(DEFAULT_ROUNDNESS);
    };

    const [isCustomColorPickerOpen, setIsCustomColorPickerOpen] = React.useState(false);

    // Color label suffix
    const colorLabelSuffix = React.useMemo(() => {
        if (selectedThemeOption?.id === "default") {
            return " (Adaptive)";
        }
        try {
            const colorHex = Color(currentDisplayColor).hex();
            return ` (${colorHex})`;
        } catch {
            return "";
        }
    }, [selectedThemeOption, currentDisplayColor]);

    return (
        <div className="space-y-6 py-4">
            {/* Color Theme Selector */}
            <div className="space-y-2">
                <Label htmlFor="theme-color">Color{colorLabelSuffix}</Label>
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                        {themeOptionsWithColors.map((option) => {
                            const isSelected = currentTheme === option.value;
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => changeTheme(option.value)}
                                    className={cn(
                                        "group relative h-7 w-7 rounded-md transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                                        isSelected
                                            ? "border border-primary ring-2 ring-primary ring-offset-1"
                                            : "border-2 border-border hover:border-primary/50"
                                    )}
                                    style={{ backgroundColor: option.displayColor }}
                                    aria-label={`Select ${option.name} theme`}
                                    title={option.name}
                                >
                                    {isSelected && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-1.5 w-1.5 rounded-full bg-background shadow-sm" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                        {/* Custom color square with popover */}
                        <Popover open={isCustomColorPickerOpen} onOpenChange={setIsCustomColorPickerOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        "group relative h-7 w-7 rounded-md border-dashed transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                                        isCustom
                                            ? "border border-primary ring-2 ring-primary ring-offset-1"
                                            : "border-2 border-border hover:border-primary/50"
                                    )}
                                    style={{
                                        backgroundColor: isCustom ? currentDisplayColor : "transparent",
                                        backgroundImage: isCustom
                                            ? undefined
                                            : "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0L20 20M20 0L0 20' stroke='%23ccc' stroke-width='1'/%3E%3C/svg%3E\")",
                                    }}
                                    aria-label="Custom color"
                                    title="Custom color"
                                >
                                    {isCustom && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-1.5 w-1.5 rounded-full bg-background shadow-sm" />
                                        </div>
                                    )}
                                    {!isCustom && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg
                                                className="h-3 w-3 text-muted-foreground"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-3" align="start">
                                {isCustomColorPickerOpen && (
                                    <ColorPickerField
                                        key="color-picker"
                                        id="custom-theme-color"
                                        label="Custom Color"
                                        value={isCustom ? currentDisplayColor : undefined}
                                        onChange={(color) => {
                                            handleCustomColorChange(color);
                                            // Don't auto-close on change to allow dragging/selection
                                            if (!color) {
                                                setIsCustomColorPickerOpen(false);
                                            }
                                        }}
                                    />
                                )}
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
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

            {/* Reset Button */}
            <div className="pt-2">
                <Button variant="outline" onClick={resetToDefaults} className="w-full">
                    Reset
                </Button>
            </div>
        </div>
    );
}
