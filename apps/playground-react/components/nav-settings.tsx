/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import * as React from "react";
import { Moon, Monitor, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { themeColors, DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-react";
import { audioUiThemeState } from "@/app/providers";

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
 * Theme settings component for the sidebar footer.
 * Provides controls for theme color, roundness, and light/dark/system mode.
 * These settings affect only vector components (default theme/skin).
 * Raster components, primitives, and other specialized components are not controlled by these settings.
 * Always visible and fixed at the bottom of the sidebar.
 *
 * @returns Theme settings component
 */
export function NavSettings() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const [currentTheme, setCurrentTheme] = React.useState<string>(themeColors.default);
    const [roundnessValue, setRoundnessValue] = React.useState(DEFAULT_ROUNDNESS);

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

    // Toggle theme between light, dark, and system
    const toggleTheme = () => {
        if (theme === "light") setTheme("dark");
        else if (theme === "dark") setTheme("system");
        else setTheme("light");
    };

    // Set initial theme when component mounts
    React.useEffect(() => {
        // Use the adaptive default theme by default
        changeTheme(themeColors.default);
        // Sync roundness with CSS variable value
        const currentRoundness = audioUiThemeState.current.roundness;
        if (currentRoundness !== undefined) {
            setRoundnessValue(currentRoundness);
        }
        // Set mounted to true after component mounts to avoid hydration issues
        setMounted(true);
    }, []);

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Theme Settings</SidebarGroupLabel>
            <SidebarGroupContent className="px-2 pb-2 space-y-4">
                {/* Color Theme Selector */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-sidebar-foreground/70 px-2">Color</label>
                    <Select value={currentTheme} onValueChange={changeTheme}>
                        <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
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
                    <div className="flex items-center justify-between px-2">
                        <label className="text-xs font-medium text-sidebar-foreground/70">Roundness</label>
                        <Input
                            type="number"
                            value={roundnessValue}
                            onChange={(e) => changeRoundness(Number(e.target.value))}
                            min={0}
                            max={1}
                            step={0.01}
                            className="w-16 h-7 text-xs"
                        />
                    </div>
                    <div className="px-2">
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

                {/* Theme Mode Toggle */}
                {mounted && (
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-sidebar-foreground/70 px-2">Mode</label>
                        <div className="px-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleTheme}
                                title={`Current theme: ${theme}`}
                                className="w-full justify-start h-8"
                            >
                                {theme === "light" && <Sun className="h-4 w-4 mr-2" />}
                                {theme === "dark" && <Moon className="h-4 w-4 mr-2" />}
                                {(!theme || theme === "system") && <Monitor className="h-4 w-4 mr-2" />}
                                <span className="capitalize">{theme || "system"}</span>
                            </Button>
                        </div>
                    </div>
                )}
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
