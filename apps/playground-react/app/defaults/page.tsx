/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Knob, Slider, CycleButton, Button as AudioButton, Keys, OptionView } from "@cutoff/audio-ui-react";
import { SineWaveIcon, TriangleWaveIcon, SquareWaveIcon } from "@/components/wave-icons";

// No-op handler for read-only previews
const noOpHandler = () => {};

const components = [
    {
        name: "Knob",
        url: "/defaults/knob",
        description:
            "A rotary control for continuous parameter adjustment. Supports bipolar and unipolar modes, customizable value formatting, and multiple visual variants including icon caps.",
        preview: <Knob min={0} max={100} value={50} label="Volume" adaptiveSize={true} onChange={noOpHandler} />,
    },
    {
        name: "Slider (V)",
        url: "/defaults/vslider",
        description:
            "A vertical slider control for continuous parameter adjustment. Ideal for level controls, faders, and vertical parameter adjustment with customizable ranges and units.",
        preview: (
            <Slider
                min={0}
                max={100}
                value={60}
                label="Level"
                orientation="vertical"
                adaptiveSize={true}
                onChange={noOpHandler}
            />
        ),
    },
    {
        name: "Slider (H)",
        url: "/defaults/hslider",
        description:
            "A horizontal slider control for continuous parameter adjustment. Perfect for pan controls, horizontal parameter adjustment, and intuitive left-to-right value manipulation.",
        preview: (
            <Slider
                min={-1}
                max={1}
                value={0}
                label="Pan"
                orientation="horizontal"
                adaptiveSize={true}
                onChange={noOpHandler}
            />
        ),
    },
    {
        name: "CycleButton",
        url: "/defaults/cyclebutton",
        description:
            "A button that cycles through discrete options on each click. Supports keyboard navigation with arrow keys and space/enter for cycling through predefined values.",
        preview: (
            <CycleButton value={0} label="Waveform" adaptiveSize={true} onChange={noOpHandler}>
                <OptionView value={0} label="Sine">
                    <SineWaveIcon />
                </OptionView>
                <OptionView value={1} label="Triangle">
                    <TriangleWaveIcon />
                </OptionView>
                <OptionView value={2} label="Square">
                    <SquareWaveIcon />
                </OptionView>
            </CycleButton>
        ),
    },
    {
        name: "Button",
        url: "/defaults/button",
        description:
            "A versatile button control supporting both momentary and latch (toggle) modes. Features drag-in/drag-out behavior for step sequencer patterns and hardware-like interactions.",
        preview: <AudioButton value={false} label="Mute" adaptiveSize={true} onChange={noOpHandler} />,
    },
    {
        name: "Keys",
        url: "/defaults/keys",
        description:
            "A piano-style keyboard component for MIDI note input and visualization. Supports configurable key ranges, octave shifts, and multiple visual styles including classic and theme-based designs.",
        preview: <Keys nbKeys={13} startKey="C" octaveShift={0} notesOn={[60, 64, 67]} adaptiveSize={true} />,
    },
];

/**
 * Default components overview page.
 * Provides an overview of all default components and links to their individual demo pages.
 *
 * @returns Default components overview page
 */
export default function DefaultsPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header Section */}
            <div className="flex flex-col gap-4 mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Default Components</h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                    These are opinionated, production-ready components designed to cover 90% of use cases for audio
                    applications and plugins. Each component includes ad-hoc properties for common customization needs,
                    uses adaptive sizing to fit seamlessly into layouts, and responds to global theme settings. Generic
                    components, primitives, and other specialized components are not controlled by the theme settings.
                </p>
            </div>

            {/* Components Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {components.map((component) => (
                    <Card key={component.name} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-xl">{component.name}</CardTitle>
                            <CardDescription className="text-sm leading-relaxed">
                                {component.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            {/* Component Preview */}
                            <div className="flex justify-center items-center h-32 bg-muted/30 rounded-lg border border-border/50 p-4">
                                <div className="w-full h-full flex items-center justify-center pointer-events-none">
                                    {component.preview}
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
                ))}
            </div>
        </div>
    );
}
