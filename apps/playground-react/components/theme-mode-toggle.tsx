/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import * as React from "react";
import { Moon, Monitor, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Theme mode toggle button component for the header.
 * Cycles through System → Light → Dark → System.
 *
 * @returns Theme mode toggle button component
 */
export function ThemeModeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Toggle theme between system, light, and dark
    const toggleTheme = () => {
        if (theme === "system" || !theme) setTheme("light");
        else if (theme === "light") setTheme("dark");
        else setTheme("system");
    };

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-9 w-9" disabled>
                <Monitor className="h-4 w-4" />
                <span className="sr-only">Theme Mode</span>
            </Button>
        );
    }

    const currentTheme = theme || "system";
    const icon =
        currentTheme === "light" ? (
            <Sun className="h-4 w-4" />
        ) : currentTheme === "dark" ? (
            <Moon className="h-4 w-4" />
        ) : (
            <Monitor className="h-4 w-4" />
        );

    const tooltipText = currentTheme === "light" ? "Light Mode" : currentTheme === "dark" ? "Dark Mode" : "System Mode";

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme} title={tooltipText}>
                        {icon}
                        <span className="sr-only">Theme Mode: {tooltipText}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
