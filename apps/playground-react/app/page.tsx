/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
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
    ToggleLeft,
    RotateCw,
    Film,
    Grid3x3,
    Power,
    Settings,
    Ruler,
    Component,
} from "lucide-react";
import {
    Knob,
    Slider,
    CycleButton,
    Button as AudioButton,
    Keys,
    OptionView,
    AdaptiveBox,
    ValueRing,
    TickRing,
    LabelRing,
} from "@cutoff/audio-ui-react";
import { SineWaveIcon, TriangleWaveIcon, SquareWaveIcon, SawWaveIcon } from "@/components/wave-icons";

// No-op handler for read-only previews
const noOpHandler = () => {};

const defaultComponents = [
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

const genericComponents = [
    {
        name: "Image Knob",
        url: "/generic/image-knob",
        description:
            "A rotary knob control that rotates a bitmap image based on continuous parameter values. Supports configurable rotation range and openness, perfect for custom knob designs using bitmap graphics.",
        icon: RotateCw,
    },
    {
        name: "Image Rotary Switch",
        url: "/generic/image-rotary-switch",
        description:
            "A discrete rotary switch control that rotates a bitmap image to discrete positions. Maps discrete values to rotation angles, ideal for multi-position rotary selectors with custom bitmap graphics.",
        icon: Settings,
    },
    {
        name: "Image Switch",
        url: "/generic/image-switch",
        description:
            "A boolean switch control that displays one of two bitmap images based on state. Supports both momentary and latch (toggle) modes, perfect for on/off switches and buttons with custom bitmap graphics.",
        icon: ToggleLeft,
    },
    {
        name: "FilmStrip Continuous",
        url: "/generic/filmstrip-continuous",
        description:
            "A continuous control using bitmap sprite sheets (filmstrips) for visualization. Maps continuous values to frame indices, ideal for VU meters, rotary knobs, and other continuous parameter controls with custom bitmap graphics.",
        icon: Film,
    },
    {
        name: "FilmStrip Discrete",
        url: "/generic/filmstrip-discrete",
        description:
            "A discrete control using bitmap sprite sheets for visualization. Maps discrete values to frame indices based on option count, perfect for multi-position switches, selectors, and discrete parameter controls with custom bitmap graphics.",
        icon: Grid3x3,
    },
    {
        name: "FilmStrip Boolean",
        url: "/generic/filmstrip-boolean",
        description:
            "A boolean control using bitmap sprite sheets for visualization. Maps boolean values to frames (typically 2 frames: false/off, true/on), ideal for on/off switches, buttons, and toggle controls with custom bitmap graphics.",
        icon: Power,
    },
];

const layoutPages = [
    {
        name: "Size System",
        url: "/layout/sizing",
        description:
            "Comprehensive showcase of all components across all size variants (xsmall through xlarge). Demonstrates the consistent sizing system based on a base unit, ensuring components work harmoniously together in layouts.",
        icon: Ruler,
    },
    {
        name: "Grid Layout",
        url: "/layout/grid-layout",
        description:
            "Interactive demonstration of AdaptiveBox layout capabilities within CSS Grid. Shows how components adapt to grid cells with different aspect ratios, alignment options, and display modes.",
        icon: Grid3x3,
    },
];

const examples = [
    {
        name: "Customization",
        url: "/examples/customization",
        description:
            "Explore advanced customization techniques for building custom control components. Demonstrates how to use primitives and generic controls to create unique visual designs while maintaining full library functionality.",
        icon: Sparkles,
    },
    {
        name: "Control Surface",
        url: "/examples/control-surface",
        description:
            "A complete 4-channel mixer interface showcasing real-world component usage. Features faders, pan controls, gain knobs, mute buttons, and EQ controls in a professional audio interface layout.",
        icon: Sliders,
    },
    {
        name: "WebAudio",
        url: "/examples/webaudio",
        description:
            "Interactive synthesizer example demonstrating AudioUI components integrated with Web Audio API. Shows real-time audio parameter control with knobs, sliders, and buttons connected to audio nodes.",
        icon: Component,
    },
    {
        name: "Drag Interaction",
        url: "/examples/drag-interaction",
        description:
            "Detailed demonstration of drag interaction behaviors including drag-in/drag-out patterns, step sequencer interactions, and hardware-like button behaviors. Shows the flexibility of the interaction system.",
        icon: ToggleLeft,
    },
    {
        name: "Stress Test",
        url: "/examples/stress-test",
        description:
            "Performance demonstration with 100+ components rendered simultaneously. Validates the library's performance optimizations and ensures smooth interactions even with large numbers of controls.",
        icon: Grid3x3,
    },
];

/**
 * Home page providing an overview of all playground content.
 * Organizes content into sections: Default Components, Generic Components, Primitives, Layout, and Examples.
 *
 * @returns Home page component
 */
export default function Home() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Hero Section */}
            <div className="flex flex-col gap-4 mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">AudioUI by Cutoff</h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                    React components for audio and MIDI applications
                </p>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                    An interactive playground for exploring and testing components designed for professional audio
                    interfaces, plugins, and music software.
                </p>
            </div>

            {/* Default Components Section */}
            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Sliders className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold">Default Components</h2>
                    <Button asChild variant="ghost" size="sm" className="ml-auto">
                        <Link href="/defaults">
                            View All
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                <p className="text-muted-foreground mb-6 max-w-3xl">
                    Opinionated, production-ready components designed to cover 90% of use cases for audio applications
                    and plugins. Each component includes ad-hoc properties for common customization needs, uses adaptive
                    sizing to fit seamlessly into layouts, and responds to global theme settings.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {defaultComponents.map((component) => (
                        <Card key={component.name} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-xl">{component.name}</CardTitle>
                                <CardDescription className="text-sm leading-relaxed">
                                    {component.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
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
            </section>

            {/* Generic Components Section */}
            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Layers className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold">Generic Components</h2>
                    <Button asChild variant="ghost" size="sm" className="ml-auto">
                        <Link href="/generic">
                            View All
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                <p className="text-muted-foreground mb-6 max-w-3xl">
                    Components that support industry-standard control representations using bitmap sprite sheets
                    (filmstrips) and image-based visuals. While bitmap-based visualization is more constrained than
                    SVG, these components provide full access to all library features: complete layout system, full
                    parameter model, complete interaction system, and all accessibility features.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {genericComponents.map((component) => {
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
            </section>

            {/* Primitives Section */}
            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Box className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold">Primitive Components</h2>
                    <Button asChild variant="ghost" size="sm" className="ml-auto">
                        <Link href="/primitives">
                            View All
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
                <p className="text-muted-foreground mb-6 max-w-3xl">
                    Low-level building blocks for composing custom controls. These primitives provide the foundation for
                    building audio and MIDI interfaces. SVG primitives handle rendering, control primitives handle
                    interaction logic, and layout primitives manage responsive sizing and positioning.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Layout Primitives */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-xl">AdaptiveBox</CardTitle>
                            <CardDescription className="text-sm leading-relaxed">
                                A CSS/SVG-based layout system for SVG controls with labels. Supports multiple display
                                modes, container queries, two-row grid layout, label positioning, and HTML overlay
                                support.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex justify-center items-center h-32 bg-muted/30 rounded-lg border border-border/50 p-4">
                                <div className="w-full h-full flex items-center justify-center pointer-events-none">
                                    <AdaptiveBox
                                        displayMode="scaleToFit"
                                        labelMode="visible"
                                        labelHeightUnits={20}
                                        viewBoxWidth={100}
                                        viewBoxHeight={100}
                                        className="w-full h-full"
                                    >
                                        <AdaptiveBox.Svg>
                                            <circle cx={50} cy={50} r={40} className="fill-primary-50" />
                                            <text
                                                x={50}
                                                y={50}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                className="fill-primary"
                                                style={{ fontSize: "20px" }}
                                            >
                                                SVG
                                            </text>
                                        </AdaptiveBox.Svg>
                                        <AdaptiveBox.Label className="text-primary">Label</AdaptiveBox.Label>
                                    </AdaptiveBox>
                                </div>
                            </div>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/primitives/adaptive-box">
                                    View Component
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* SVG Primitives Preview */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-xl">ValueRing</CardTitle>
                            <CardDescription className="text-sm leading-relaxed">
                                An arc/ring indicator showing value progress. Supports bipolar mode, configurable
                                thickness, openness, and roundness.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex justify-center items-center h-32 bg-muted/30 rounded-lg border border-border/50 p-4">
                                <div className="w-full h-full flex items-center justify-center pointer-events-none">
                                    <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ display: "block" }}>
                                        <ValueRing
                                            cx={50}
                                            cy={50}
                                            radius={45}
                                            normalizedValue={0.65}
                                            thickness={6}
                                            roundness={true}
                                            openness={90}
                                            fgArcStyle={{ stroke: "var(--audioui-adaptive-default-color)" }}
                                            bgArcStyle={{
                                                stroke: "color-mix(in srgb, var(--audioui-adaptive-default-color) 50%, transparent)",
                                                opacity: 1,
                                            }}
                                        />
                                    </svg>
                                </div>
                            </div>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/primitives/ring">
                                    View Component
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-xl">TickRing</CardTitle>
                            <CardDescription className="text-sm leading-relaxed">
                                A decorative primitive for rendering tick marks around radial controls. Supports
                                count-based or step-based positioning, multiple variants, and custom render functions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex justify-center items-center h-32 bg-muted/30 rounded-lg border border-border/50 p-4">
                                <div className="w-full h-full flex items-center justify-center pointer-events-none">
                                    <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ display: "block" }}>
                                        <TickRing
                                            cx={50}
                                            cy={50}
                                            radius={45}
                                            thickness={6}
                                            count={11}
                                            className="text-foreground"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/primitives/tick-ring">
                                    View Component
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-xl">LabelRing</CardTitle>
                            <CardDescription className="text-sm leading-relaxed">
                                A wrapper primitive for rendering text or icon labels at radial positions. Supports
                                numeric scales, text labels, icons, and configurable orientation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex justify-center items-center h-32 bg-muted/30 rounded-lg border border-border/50 p-4">
                                <div className="w-full h-full flex items-center justify-center pointer-events-none">
                                    <svg
                                        width="100%"
                                        height="100%"
                                        viewBox="0 0 100 100"
                                        className="w-full h-full text-foreground"
                                        style={{ display: "block" }}
                                    >
                                        <LabelRing
                                            cx={50}
                                            cy={50}
                                            radius={40}
                                            openness={240}
                                            rotation={90}
                                            labels={[
                                                "Oth",
                                                <TriangleWaveIcon key="tri" width={10} height={10} />,
                                                <SineWaveIcon key="sine" width={10} height={10} />,
                                                <SquareWaveIcon key="sq" width={10} height={10} />,
                                                <SawWaveIcon key="saw" width={10} height={10} />,
                                            ]}
                                            orientation="upright"
                                            labelClassName="text-[8px] font-medium fill-foreground"
                                        />
                                        <circle cx={50} cy={50} r={2} className="fill-muted-foreground" />
                                    </svg>
                                </div>
                            </div>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/primitives/label-ring">
                                    View Component
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Layout Section */}
            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Layout className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold">Layout & Sizing</h2>
                </div>
                <p className="text-muted-foreground mb-6 max-w-3xl">
                    Explore the layout system and sizing capabilities of AudioUI components. Learn how components adapt
                    to different container sizes and how the consistent sizing system ensures harmonious layouts.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {layoutPages.map((page) => {
                        const Icon = page.icon;
                        return (
                            <Card key={page.name} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="text-xl">{page.name}</CardTitle>
                                    <CardDescription className="text-sm leading-relaxed">
                                        {page.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <div className="flex justify-center items-center h-32 bg-muted/30 rounded-lg border border-border/50 p-4">
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Icon className="h-16 w-16 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href={page.url}>
                                            View Page
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* Examples Section */}
            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold">Examples</h2>
                </div>
                <p className="text-muted-foreground mb-6 max-w-3xl">
                    Real-world examples demonstrating AudioUI components in action. From complete control surfaces to
                    Web Audio API integration, these examples show how to build professional audio interfaces.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {examples.map((example) => {
                        const Icon = example.icon;
                        return (
                            <Card key={example.name} className="flex flex-col h-full">
                                <CardHeader>
                                    <CardTitle className="text-xl">{example.name}</CardTitle>
                                    <CardDescription className="text-sm leading-relaxed">
                                        {example.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4 flex-1">
                                    <div className="flex justify-center items-center h-32 bg-muted/30 rounded-lg border border-border/50 p-4 mt-auto">
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Icon className="h-16 w-16 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href={example.url}>
                                            View Example
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
