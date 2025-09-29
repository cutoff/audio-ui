"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { audioUiThemeState } from "@/app/providers";

// Define types for components and theme colors
type Page = {
    name: string;
    path: string;
};

type ThemeColor = {
    color: string;
    name: string;
    cssVar: string;
};

// List of components to display in the sidebar
const controls: Page[] = [
    { name: "Knob", path: "/controls/knob" },
    { name: "Slider (vertical)", path: "/controls/vslider" },
    { name: "Slider (horizontal)", path: "/controls/hslider" },
    { name: "Button", path: "/controls/button" },
    // More components can be added here in the future
];

// List of device pages
const devices: Page[] = [
    { name: "Keybed", path: "/devices/keybed" },
    // More device pages can be added here in the future
];

// List of example pages
const layouts: Page[] = [
    { name: "Control Surface", path: "/examples/control-surface" },
    // More example pages can be added here in the future
];

// Theme color options
const themeColors: ThemeColor[] = [
    { color: "bg-zinc-900 dark:bg-zinc-50", name: "Default (Adaptive)", cssVar: "--theme-default-primary" },
    { color: "bg-blue-500", name: "Blue", cssVar: "--theme-blue-primary" },
    { color: "bg-orange-500", name: "Orange", cssVar: "--theme-orange-primary" },
    { color: "bg-pink-500", name: "Pink", cssVar: "--theme-pink-primary" },
    { color: "bg-green-500", name: "Green", cssVar: "--theme-green-primary" },
    { color: "bg-purple-500", name: "Purple", cssVar: "--theme-purple-primary" },
    { color: "bg-yellow-500", name: "Yellow", cssVar: "--theme-yellow-primary" },
];

export default function SideBar() {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [currentTheme, setCurrentTheme] = useState("--theme-default-primary");
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [roundnessValue, setRoundnessValue] = useState(12);

    // Function to change theme color
    const changeTheme = (themeCssVar: string) => {
        document.documentElement.style.setProperty("--primary-color", `var(${themeCssVar})`);
        document.documentElement.style.setProperty("--primary-color-50", `var(${themeCssVar}-50)`);
        document.documentElement.style.setProperty("--primary-color-20", `var(${themeCssVar}-20)`);
        setCurrentTheme(themeCssVar);

        // Ensure inline-colored components derive from the current primary CSS variable
        audioUiThemeState.current.setColor("var(--primary-color)");
    };

    // Function to change roundness
    const changeRoundness = (value: number) => {
        setRoundnessValue(value);
        audioUiThemeState.current.setRoundness(value);
    };

    // Toggle between light and dark mode
    const toggleDarkMode = (checked: boolean) => {
        setTheme(checked ? "dark" : "light");
    };

    // Set initial theme when component mounts
    useEffect(() => {
        // Use the new adaptive default theme by default
        changeTheme("--theme-default-primary");
        // Set mounted to true after component mounts to avoid hydration issues
        setMounted(true);
    }, []);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile toggle button - only visible on small screens */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className="dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700 bg-zinc-200 border-zinc-300 hover:bg-zinc-300"
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Overlay for mobile - only appears when sidebar is open */}
            {isOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}

            {/* Sidebar */}
            <div
                className={`
          fixed md:sticky top-0 z-40
          h-screen md:h-screen bg-sidebar-background border-r border-sidebar-border p-4 flex flex-col
          w-64 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
            >
                <div className="flex-shrink-0">
                    <Link
                        href="/"
                        className="block text-2xl font-bold mb-6 text-sidebar-primary hover:text-primary-color transition-colors"
                    >
                        AudioUI
                    </Link>
                </div>

                <div className="flex-grow overflow-y-auto">
                    <h2 className="text-xl font-medium mb-4 text-sidebar-primary">Controls</h2>
                    <nav className="space-y-2 mb-6">
                        {controls.map((page) => (
                            <Link
                                key={page.name}
                                href={page.path}
                                className={`block px-3 py-2 rounded-md transition-colors ${
                                    pathname === page.path
                                        ? "bg-sidebar-selected-bg text-sidebar-selected-text border-l-4 border-primary"
                                        : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-primary-foreground"
                                }`}
                            >
                                {page.name}
                            </Link>
                        ))}
                    </nav>

                    <h2 className="text-xl font-medium mb-4 text-sidebar-primary">Devices</h2>
                    <nav className="space-y-2 mb-6">
                        {devices.map((page) => (
                            <Link
                                key={page.name}
                                href={page.path}
                                className={`block px-3 py-2 rounded-md transition-colors ${
                                    pathname === page.path
                                        ? "bg-sidebar-selected-bg text-sidebar-selected-text border-l-4 border-primary"
                                        : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-primary-foreground"
                                }`}
                            >
                                {page.name}
                            </Link>
                        ))}
                    </nav>

                    <h2 className="text-xl font-medium mb-4 text-sidebar-primary">Examples</h2>
                    <nav className="space-y-2 mb-6">
                        {layouts.map((page) => (
                            <Link
                                key={page.name}
                                href={page.path}
                                className={`block px-3 py-2 rounded-md transition-colors ${
                                    pathname === page.path
                                        ? "bg-sidebar-selected-bg text-sidebar-selected-text border-l-4 border-primary"
                                        : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-primary-foreground"
                                }`}
                            >
                                {page.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Theme Selector at the bottom of sidebar */}
                <div className="flex-shrink-0 mt-auto pt-4 border-t border-sidebar-border">
                    {/* Color Theme Selector */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                        <span className="text-sm text-sidebar-foreground flex items-center h-9 px-3 leading-none">
                            Color
                        </span>
                        <Select value={currentTheme} onValueChange={(value) => changeTheme(value)}>
                            <SelectTrigger className="w-[120px] bg-sidebar-accent border-sidebar-border">
                                <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                                {themeColors.map((themeColor) => (
                                    <SelectItem
                                        key={themeColor.cssVar}
                                        value={themeColor.cssVar}
                                        className="inline-flex items-center"
                                    >
                                        <div
                                            className={`w-4 h-4 rounded-full ${themeColor.color} inline-block align-middle mr-2`}
                                        ></div>
                                        <span className="align-middle">{themeColor.name}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Roundness Selector */}
                    <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-sidebar-foreground flex items-center h-9 px-3 leading-none">
                                Roundness
                            </span>
                            <Input
                                type="number"
                                value={roundnessValue}
                                onChange={(e) => changeRoundness(Number(e.target.value))}
                                min={0}
                                max={50}
                                className="w-[70px] h-9 bg-sidebar-accent border-sidebar-border"
                            />
                        </div>
                        <div className="px-3">
                            <Slider
                                value={[roundnessValue]}
                                onValueChange={(values) => changeRoundness(values[0])}
                                min={0}
                                max={50}
                                step={1}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Dark/Light Mode Switch */}
                    {mounted && (
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-sidebar-foreground flex items-center h-9 px-3 leading-none">
                                Mode
                            </span>
                            <div className="flex items-center gap-2">
                                <Sun className="h-4 w-4 text-sidebar-foreground" />
                                <Switch checked={theme === "dark"} onCheckedChange={toggleDarkMode} />
                                <Moon className="h-4 w-4 text-sidebar-foreground" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
