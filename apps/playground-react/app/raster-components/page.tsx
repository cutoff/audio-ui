/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Film, Grid3x3, ToggleLeft, RotateCw, Settings, Power } from "lucide-react";

const components = [
    {
        name: "Image Knob",
        url: "/raster-components/image-knob",
        description:
            "A rotary knob control that rotates a bitmap image based on continuous parameter values. Supports configurable rotation range and openness, perfect for custom knob designs using bitmap graphics.",
        icon: RotateCw,
    },
    {
        name: "Image Rotary Switch",
        url: "/raster-components/image-rotary-switch",
        description:
            "A discrete rotary switch control that rotates a bitmap image to discrete positions. Maps discrete values to rotation angles, ideal for multi-position rotary selectors with custom bitmap graphics.",
        icon: Settings,
    },
    {
        name: "Image Switch",
        url: "/raster-components/image-switch",
        description:
            "A boolean switch control that displays one of two bitmap images based on state. Supports both momentary and latch (toggle) modes, perfect for on/off switches and buttons with custom bitmap graphics.",
        icon: ToggleLeft,
    },
    {
        name: "FilmStrip Continuous",
        url: "/raster-components/filmstrip-continuous",
        description:
            "A continuous control using bitmap sprite sheets (filmstrips) for visualization. Maps continuous values to frame indices, ideal for VU meters, rotary knobs, and other continuous parameter controls with custom bitmap graphics.",
        icon: Film,
    },
    {
        name: "FilmStrip Discrete",
        url: "/raster-components/filmstrip-discrete",
        description:
            "A discrete control using bitmap sprite sheets for visualization. Maps discrete values to frame indices based on option count, perfect for multi-position switches, selectors, and discrete parameter controls with custom bitmap graphics.",
        icon: Grid3x3,
    },
    {
        name: "FilmStrip Boolean",
        url: "/raster-components/filmstrip-boolean",
        description:
            "A boolean control using bitmap sprite sheets for visualization. Maps boolean values to frames (typically 2 frames: false/off, true/on), ideal for on/off switches, buttons, and toggle controls with custom bitmap graphics.",
        icon: Power,
    },
];

/**
 * Raster components overview page.
 * Provides an overview of all raster components and links to their individual demo pages.
 *
 * @returns {JSX.Element} Raster components overview page
 */
export default function RasterComponentsPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header Section */}
            <div className="flex flex-col gap-4 mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Raster Components</h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                    These components support industry-standard control representations using bitmap sprite sheets
                    (filmstrips) and image-based visuals. While bitmap-based visualization is more constrained than SVG,
                    these components provide full access to all library features: complete layout system, full parameter
                    model, complete interaction system, and all accessibility features. Visuals are determined by the
                    image content and do not respond to global theme settings.
                </p>
            </div>

            {/* Components Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {components.map((component) => {
                    const Icon = component.icon;
                    return (
                        <Card key={component.name} className="flex flex-col h-full">
                            <CardHeader>
                                <CardTitle className="text-xl">{component.name}</CardTitle>
                                <CardDescription className="text-sm leading-relaxed">
                                    {component.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 flex-1">
                                {/* Component Icon */}
                                <div className="flex justify-center items-center h-32 bg-muted/30 rounded-lg border border-border/50 p-4 mt-auto">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Icon className="h-16 w-16 text-muted-foreground" />
                                    </div>
                                </div>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={component.url}>
                                        View Component
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
