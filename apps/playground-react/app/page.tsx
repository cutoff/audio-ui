/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Sliders,
    Layers,
    Box,
    Layout,
    Sparkles,
    ExternalLink,
    Github,
    MessageSquare,
    Palette,
    Sun,
    Moon,
    Monitor,
    Sidebar,
    MousePointer2,
} from "lucide-react";

const sections = [
    {
        name: "Vector Components",
        url: "/vector-components",
        icon: Sliders,
        description: "6 production-ready components (Knob, Slider, Button, etc.) that respond to theme settings.",
    },
    {
        name: "Raster Components",
        url: "/raster-components",
        icon: Layers,
        description: "Image and filmstrip-based controls with custom visuals (not theme-controlled).",
    },
    {
        name: "Primitives",
        url: "/primitives",
        icon: Box,
        description: "Low-level building blocks for composing custom controls.",
    },
    {
        name: "Layout & Sizing",
        url: "/layout/sizing",
        icon: Layout,
        description: "Size system and grid layout demonstrations.",
    },
    {
        name: "Examples",
        url: "/examples/control-surface",
        icon: Sparkles,
        description: "Live demos: Control Surface, WebAudio, Customization, and more.",
    },
];

/**
 * Playground home page.
 * Provides quick navigation to all component sections with external resource links and getting started guidance.
 *
 * @returns {JSX.Element} Home page component
 */
export default function Home() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Hero Section */}
            <div className="flex flex-col gap-4 mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">AudioUI Playground</h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                    Interactive testing environment for AudioUI components
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
                    <span>For documentation, visit</span>
                    <Button asChild variant="link" size="sm" className="h-auto p-0 text-sm">
                        <a
                            href="https://cutoff.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1"
                        >
                            cutoff.dev
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </Button>
                    <span>•</span>
                    <Button asChild variant="link" size="sm" className="h-auto p-0 text-sm">
                        <a
                            href="https://github.com/cutoff/audio-ui"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1"
                        >
                            <Github className="h-3 w-3" />
                            View source
                        </a>
                    </Button>
                    <span>•</span>
                    <Button asChild variant="link" size="sm" className="h-auto p-0 text-sm">
                        <a
                            href="https://discord.gg/7RB6t2xqYW"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1"
                        >
                            <MessageSquare className="h-3 w-3" />
                            Join Discord
                        </a>
                    </Button>
                </div>
            </div>

            {/* Getting Started Section */}
            <section className="mb-16">
                <Card className="border-primary/20 shadow-lg">
                    <CardHeader className="pb-6">
                        <CardTitle className="text-2xl">Getting Started</CardTitle>
                        <CardDescription className="text-base">
                            Essential tips for exploring the playground
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Navigation */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <div className="rounded-lg bg-primary/10 p-3">
                                    <Sidebar className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="font-semibold text-base">Navigation</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Use the sidebar to explore all components and examples. Each section contains
                                    detailed demonstrations with live, interactive controls.
                                </p>
                            </div>
                        </div>

                        {/* Theme Settings */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <div className="rounded-lg bg-primary/10 p-3">
                                    <Palette className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <h3 className="font-semibold text-base">Theme Customization</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Click the <Palette className="inline h-4 w-4 mx-1 align-text-bottom text-primary" />{" "}
                                    icon in the header to customize colors and roundness for vector components.
                                </p>
                                <p className="text-xs text-muted-foreground/80 leading-relaxed pl-4 border-l-2 border-muted">
                                    Note: Raster components and primitives use custom visuals and are not controlled by
                                    theme settings.
                                </p>
                            </div>
                        </div>

                        {/* Light/Dark Mode */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <div className="rounded-lg bg-primary/10 p-3 relative">
                                    <Sun className="h-5 w-5 text-primary absolute inset-0 m-auto opacity-0 dark:opacity-100 transition-opacity" />
                                    <Moon className="h-5 w-5 text-primary absolute inset-0 m-auto opacity-100 dark:opacity-0 transition-opacity" />
                                    <div className="h-5 w-5 opacity-0">
                                        <Monitor className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="font-semibold text-base">Light / Dark Mode</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Toggle between{" "}
                                    <span className="inline-flex items-center gap-1">
                                        <Monitor className="inline h-3.5 w-3.5 align-text-bottom" />
                                        System
                                    </span>
                                    ,{" "}
                                    <span className="inline-flex items-center gap-1">
                                        <Sun className="inline h-3.5 w-3.5 align-text-bottom" />
                                        Light
                                    </span>
                                    , and{" "}
                                    <span className="inline-flex items-center gap-1">
                                        <Moon className="inline h-3.5 w-3.5 align-text-bottom" />
                                        Dark
                                    </span>{" "}
                                    modes using the theme toggle in the header.
                                </p>
                            </div>
                        </div>

                        {/* Interaction */}
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1">
                                <div className="rounded-lg bg-primary/10 p-3">
                                    <MousePointer2 className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                            <div className="flex-1 space-y-1">
                                <h3 className="font-semibold text-base">Interactive Controls</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    All components are fully interactive. Try dragging with your mouse or finger,
                                    scrolling with the mouse wheel, and using keyboard arrow keys for precise control.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Main Sections */}
            <section>
                <h2 className="text-2xl font-bold mb-6">Explore Components</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <Card key={section.name} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Icon className="h-5 w-5 text-primary" />
                                        {section.name}
                                    </CardTitle>
                                    <CardDescription>{section.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto">
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href={section.url}>
                                            View
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
