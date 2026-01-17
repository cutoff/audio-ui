/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
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
    displayColor: string; // Actual color value for display (resolved from CSS variable or direct value)
};

/**
 * Resolves a CSS variable to its computed color value.
 * If the value is not a CSS variable, returns it as-is.
 *
 * @param cssValue - CSS color value (may be a CSS variable like "var(--audioui-theme-blue)" or a direct color)
 * @returns The computed color value as an RGB string (e.g., "rgb(255, 0, 0)") or the original value if not a CSS variable
 */
function resolveColorValue(cssValue: string): string {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return cssValue;
    }

    // If it's a CSS variable, resolve it
    if (cssValue.startsWith("var(")) {
        // Create a temporary element to compute the CSS variable
        const tempEl = document.createElement("div");
        tempEl.style.color = cssValue;
        tempEl.style.position = "absolute";
        tempEl.style.visibility = "hidden";
        document.body.appendChild(tempEl);
        const computedColor = window.getComputedStyle(tempEl).color;
        document.body.removeChild(tempEl);
        return computedColor || cssValue;
    }

    return cssValue;
}

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

/**
 * Checks if a color value matches a predefined theme color.
 *
 * @param colorValue - The color value to check (CSS variable or direct color)
 * @param themeValue - The predefined theme color value to match against
 * @returns True if the color value matches the theme value
 */
function matchesThemeColor(colorValue: string, themeValue: string): boolean {
    return colorValue === themeValue;
}

/**
 * Checks if a color value is a custom color (not a predefined theme).
 *
 * @param colorValue - The color value to check
 * @returns True if the color is not one of the predefined theme colors
 */
function isCustomColor(colorValue: string): boolean {
    return !Object.values(themeColors).some((themeValue) => matchesThemeColor(colorValue, themeValue));
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
 * These settings affect only default components (default theme/skin).
 * Generic components, primitives, and other specialized components are not controlled by these settings.
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
        // If global state has a color, use it; otherwise default to adaptive theme
        return audioUiThemeState.current.color || themeColors.default;
    });
    const [customColor, setCustomColor] = React.useState<string | undefined>(() => {
        // If current theme is a custom color, extract it
        if (currentTheme && isCustomColor(currentTheme)) {
            return resolveColorValue(currentTheme);
        }
        return undefined;
    });
    // Keep a ref to the current custom color to use in stable callbacks
    const customColorRef = React.useRef(customColor);
    React.useEffect(() => {
        customColorRef.current = customColor;
    }, [customColor]);

    const [isCustomColorPickerOpen, setIsCustomColorPickerOpen] = React.useState(false);
    // Store a stable initial color for the picker when opening from a predefined theme
    // Using a ref to avoid triggering re-renders that could cause infinite loops
    const pickerInitialColorRef = React.useRef<string | undefined>(undefined);
    // Flag to ignore the first onChange call from ColorPicker (it fires during initialization)
    const isInitializingRef = React.useRef(false);
    const [roundnessValue, setRoundnessValue] = React.useState(() => {
        // Try to get from global state first, then CSS variable, then default
        return audioUiThemeState.current.roundness ?? getThemeRoundness() ?? DEFAULT_ROUNDNESS;
    });

    // Compute display colors for theme options based on current theme mode
    const themeOptionsWithColors = React.useMemo(() => {
        return themeColorOptions.map((option) => ({
            ...option,
            displayColor: getThemeDisplayColor(option.id as keyof typeof themeColorsDirect, isDark),
        }));
    }, [isDark]);

    // Get the currently selected theme option (if it's a predefined theme)
    const selectedThemeOption = React.useMemo(() => {
        return themeOptionsWithColors.find((option) => matchesThemeColor(currentTheme, option.value));
    }, [currentTheme, themeOptionsWithColors]);

    // Get the display color for the current selection
    const currentDisplayColor = React.useMemo(() => {
        if (selectedThemeOption) {
            return selectedThemeOption.displayColor;
        }
        if (customColor) {
            return customColor;
        }
        // Fallback: resolve the CSS variable
        return resolveColorValue(currentTheme);
    }, [selectedThemeOption, customColor, currentTheme]);

    // Get the color label suffix (for display in the label)
    const colorLabelSuffix = React.useMemo(() => {
        if (matchesThemeColor(currentTheme, themeColors.default)) {
            return " (Adaptive)";
        }
        try {
            const colorHex = Color(currentDisplayColor).hex();
            return ` (${colorHex})`;
        } catch {
            return "";
        }
    }, [currentTheme, currentDisplayColor]);

    // Ensure default theme is set in global state and CSS on mount
    React.useEffect(() => {
        // If no theme is set in global state, initialize with default adaptive theme
        if (!audioUiThemeState.current.color) {
            audioUiThemeState.current.setColor(themeColors.default);
            // State is already initialized with default, so no need to update it
        } else if (audioUiThemeState.current.color !== currentTheme) {
            // Sync with global state if it changed
            setCurrentTheme(audioUiThemeState.current.color);
            // Update custom color if it's a custom color
            if (isCustomColor(audioUiThemeState.current.color)) {
                setCustomColor(resolveColorValue(audioUiThemeState.current.color));
            } else {
                setCustomColor(undefined);
            }
        }

        const globalRoundness = audioUiThemeState.current.roundness ?? getThemeRoundness();
        if (globalRoundness !== null && globalRoundness !== undefined && globalRoundness !== roundnessValue) {
            setRoundnessValue(globalRoundness);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    /**
     * Changes the theme to a predefined theme color.
     * Clears any custom color selection when switching to a predefined theme.
     *
     * @param themeColor - The predefined theme color value (CSS variable)
     */
    const changeTheme = (themeColor: string) => {
        setCurrentTheme(themeColor);
        setCustomColor(undefined); // Clear custom color when selecting a predefined theme
        audioUiThemeState.current.setColor(themeColor);
    };

    /**
     * Handles changes to the custom color from the color picker.
     * Uses refs to maintain a stable callback reference and prevent infinite update loops.
     * Ignores onChange calls during ColorPicker initialization.
     *
     * @param color - The new custom color value (hex string) or undefined to clear
     */
    const handleCustomColorChange = React.useCallback((color: string | undefined) => {
        // Ignore onChange calls during initialization to prevent infinite loops
        if (isInitializingRef.current) {
            return;
        }

        const currentCustomColor = customColorRef.current;

        if (color) {
            // Only update if the color actually changed to prevent loops
            if (color !== currentCustomColor) {
                setCustomColor(color);
                setCurrentTheme(color);
                audioUiThemeState.current.setColor(color);
            }
        } else {
            // If custom color is cleared, revert to default theme
            if (currentCustomColor !== undefined) {
                setCustomColor(undefined);
                setCurrentTheme(themeColors.default);
                audioUiThemeState.current.setColor(themeColors.default);
            }
        }
    }, []);

    /**
     * Changes the theme roundness value.
     * Clamps the value to the valid range of 0.0-1.0.
     *
     * @param value - The roundness value (will be clamped to 0.0-1.0)
     */
    const changeRoundness = (value: number) => {
        const clamped = Math.max(0.0, Math.min(1.0, value));
        setRoundnessValue(clamped);
        audioUiThemeState.current.setRoundness(clamped);
    };

    /**
     * Reset theme settings to their default values.
     * Restores both theme color (to default adaptive theme) and roundness (to DEFAULT_ROUNDNESS).
     * Updates both local component state and global theme state.
     */
    const resetToDefaults = () => {
        setCurrentTheme(themeColors.default);
        setCustomColor(undefined);
        audioUiThemeState.current.setColor(themeColors.default);
        setRoundnessValue(DEFAULT_ROUNDNESS);
        audioUiThemeState.current.setRoundness(DEFAULT_ROUNDNESS);
    };

    return (
        <div className="space-y-6 py-4">
            {/* Color Theme Selector */}
            <div className="space-y-2">
                <Label htmlFor="theme-color">Color{colorLabelSuffix}</Label>
                <div className="space-y-3">
                    {/* Flow layout of colored squares */}
                    <div className="flex flex-wrap gap-1.5">
                        {themeOptionsWithColors.map((option) => {
                            const isSelected = matchesThemeColor(currentTheme, option.value);
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
                        <Popover
                            open={isCustomColorPickerOpen}
                            onOpenChange={(open) => {
                                setIsCustomColorPickerOpen(open);
                                // When opening, capture the current display color as initial value if no custom color is set
                                // Use ref to avoid state updates that could trigger re-renders
                                if (open && !customColor) {
                                    // Capture the current display color at the moment the popover opens
                                    const snapshotColor = selectedThemeOption
                                        ? selectedThemeOption.displayColor
                                        : customColor || resolveColorValue(currentTheme);
                                    pickerInitialColorRef.current = snapshotColor;
                                    // Set flag to ignore the first onChange call (ColorPicker fires onChange during init)
                                    isInitializingRef.current = true;
                                    // Clear the flag after a short delay to allow initialization to complete
                                    setTimeout(() => {
                                        isInitializingRef.current = false;
                                    }, 100);
                                } else if (!open) {
                                    pickerInitialColorRef.current = undefined;
                                    isInitializingRef.current = false;
                                }
                            }}
                        >
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className={cn(
                                        "group relative h-7 w-7 rounded-md border-dashed transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                                        isCustomColor(currentTheme)
                                            ? "border border-primary ring-2 ring-primary ring-offset-1"
                                            : "border-2 border-border hover:border-primary/50"
                                    )}
                                    style={{
                                        backgroundColor: customColor || "transparent",
                                        backgroundImage: customColor
                                            ? undefined
                                            : "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0L20 20M20 0L0 20' stroke='%23ccc' stroke-width='1'/%3E%3C/svg%3E\")",
                                    }}
                                    aria-label="Custom color"
                                    title="Custom color"
                                >
                                    {isCustomColor(currentTheme) && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-1.5 w-1.5 rounded-full bg-background shadow-sm" />
                                        </div>
                                    )}
                                    {!isCustomColor(currentTheme) && (
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
                                        // Only use customColor if it's set, otherwise use the ref value
                                        // The ref value is set once when popover opens and doesn't change
                                        value={customColor || pickerInitialColorRef.current}
                                        onChange={(color) => {
                                            handleCustomColorChange(color);
                                            // If color is cleared, close the popover
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
