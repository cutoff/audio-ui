/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sliders, Layers, Box, Layout, Sparkles, Palette, Sun, Moon } from "lucide-react";

const defaultComponents = [
    {
        name: "Knob",
        url: "/defaults/knob",
        description:
            "Rotary control for continuous parameter adjustment with bipolar/unipolar modes and customizable formatting.",
    },
    {
        name: "Slider (V)",
        url: "/defaults/vslider",
        description: "Vertical slider for level controls, faders, and vertical parameter adjustment.",
    },
    {
        name: "Slider (H)",
        url: "/defaults/hslider",
        description: "Horizontal slider for pan controls and horizontal parameter adjustment.",
    },
    {
        name: "CycleButton",
        url: "/defaults/cyclebutton",
        description: "Button that cycles through discrete options with keyboard navigation support.",
    },
    {
        name: "Button",
        url: "/defaults/button",
        description: "Versatile button supporting momentary and latch modes with drag-in/drag-out behavior.",
    },
    {
        name: "Keys",
        url: "/defaults/keys",
        description: "Piano-style keyboard for MIDI note input and visualization with configurable ranges.",
    },
];

const genericComponents = [
    {
        name: "Image Knob",
        url: "/generic/image-knob",
        description: "Rotary knob that rotates a bitmap image based on continuous parameter values.",
    },
    {
        name: "Image Rotary Switch",
        url: "/generic/image-rotary-switch",
        description: "Discrete rotary switch that rotates a bitmap image to discrete positions.",
    },
    {
        name: "Image Switch",
        url: "/generic/image-switch",
        description: "Boolean switch that displays one of two bitmap images based on state.",
    },
    {
        name: "FilmStrip Continuous",
        url: "/generic/filmstrip-continuous",
        description: "Continuous control using bitmap sprite sheets for visualization.",
    },
    {
        name: "FilmStrip Discrete",
        url: "/generic/filmstrip-discrete",
        description: "Discrete control using bitmap sprite sheets for visualization.",
    },
    {
        name: "FilmStrip Boolean",
        url: "/generic/filmstrip-boolean",
        description: "Boolean control using bitmap sprite sheets for visualization.",
    },
];

const layoutPages = [
    {
        name: "Size System",
        url: "/layout/sizing",
        description: "Showcase of all components across all size variants demonstrating the consistent sizing system.",
    },
    {
        name: "Grid Layout",
        url: "/layout/grid-layout",
        description: "Interactive demonstration of AdaptiveBox layout capabilities within CSS Grid.",
    },
];

const examples = [
    {
        name: "Customization",
        url: "/examples/customization",
        description:
            "Advanced customization techniques for building custom control components using primitives and generic controls.",
    },
    {
        name: "Control Surface",
        url: "/examples/control-surface",
        description:
            "Complete 4-channel mixer interface with faders, pan controls, gain knobs, mute buttons, and EQ controls.",
    },
    {
        name: "WebAudio",
        url: "/examples/webaudio",
        description: "Interactive synthesizer demonstrating AudioUI components integrated with Web Audio API.",
    },
    {
        name: "Drag Interaction",
        url: "/examples/drag-interaction",
        description:
            "Demonstration of drag interaction behaviors including drag-in/drag-out patterns and step sequencer interactions.",
    },
    {
        name: "Stress Test",
        url: "/examples/stress-test",
        description: "Performance demonstration with 100+ components rendered simultaneously.",
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
                    sizing to fit seamlessly into layouts, and responds to global theme settings (
                    <Palette className="inline h-4 w-4 mx-0.5 align-middle" aria-label="Theme Settings" />{" "}
                    <Sun className="inline h-4 w-4 mx-0.5 align-middle" aria-label="Light Mode" />{" "}
                    <Moon className="inline h-4 w-4 mx-0.5 align-middle" aria-label="Dark Mode" /> in the header).
                </p>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 font-semibold">Component</th>
                                <th className="text-left p-4 font-semibold">Description</th>
                                <th className="text-right p-4 font-semibold">Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {defaultComponents.map((component, index) => (
                                <tr key={component.name} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                    <td className="p-4 font-medium">{component.name}</td>
                                    <td className="p-4 text-muted-foreground">{component.description}</td>
                                    <td className="p-4 text-right">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={component.url}>
                                                View
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                    (filmstrips) and image-based visuals. While bitmap-based visualization is more constrained than SVG,
                    these components provide full access to all library features: complete layout system, full parameter
                    model, complete interaction system, and all accessibility features.
                </p>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 font-semibold">Component</th>
                                <th className="text-left p-4 font-semibold">Description</th>
                                <th className="text-right p-4 font-semibold">Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {genericComponents.map((component, index) => (
                                <tr key={component.name} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                    <td className="p-4 font-medium">{component.name}</td>
                                    <td className="p-4 text-muted-foreground">{component.description}</td>
                                    <td className="p-4 text-right">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={component.url}>
                                                View
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 font-semibold">Primitive</th>
                                <th className="text-left p-4 font-semibold">Description</th>
                                <th className="text-right p-4 font-semibold">Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Layout Primitives */}
                            <tr className="bg-primary/5 border-t border-b border-primary/10">
                                <td
                                    colSpan={3}
                                    className="p-3 font-semibold text-sm uppercase tracking-wide text-primary/90"
                                >
                                    Layout Primitives
                                </td>
                            </tr>
                            <tr className="bg-background">
                                <td className="p-4 font-medium">AdaptiveBox</td>
                                <td className="p-4 text-muted-foreground">
                                    CSS/SVG-based layout system for SVG controls with labels. Supports multiple display
                                    modes, container queries, and HTML overlay support.
                                </td>
                                <td className="p-4 text-right">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href="/primitives/adaptive-box">
                                            View
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </td>
                            </tr>
                            {/* SVG Primitives */}
                            <tr className="bg-primary/5 border-t border-b border-primary/10">
                                <td
                                    colSpan={3}
                                    className="p-3 font-semibold text-sm uppercase tracking-wide text-primary/90"
                                >
                                    SVG Primitives
                                </td>
                            </tr>
                            <tr className="bg-muted/20">
                                <td className="p-4 font-medium">ValueRing</td>
                                <td className="p-4 text-muted-foreground">
                                    Arc/ring indicator showing value progress. Supports bipolar mode, configurable
                                    thickness, openness, and roundness.
                                </td>
                                <td className="p-4 text-right">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href="/primitives/ring">
                                            View
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </td>
                            </tr>
                            <tr className="bg-background">
                                <td className="p-4 font-medium">RotaryImage</td>
                                <td className="p-4 text-muted-foreground">
                                    Rotates children or an image based on normalized value. Shares angle logic with
                                    ValueRing, ideal for rotating knob graphics and images.
                                </td>
                                <td className="p-4 text-right">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href="/primitives/rotary">
                                            View
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </td>
                            </tr>
                            <tr className="bg-muted/20">
                                <td className="p-4 font-medium">FilmstripImage</td>
                                <td className="p-4 text-muted-foreground">
                                    Displays a specific frame from a bitmap sprite sheet based on normalized value.
                                    Supports frame rotation and configurable frame dimensions.
                                </td>
                                <td className="p-4 text-right">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href="/primitives/filmstrip">
                                            View
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </td>
                            </tr>
                            <tr className="bg-background">
                                <td className="p-4 font-medium">TickRing</td>
                                <td className="p-4 text-muted-foreground">
                                    Decorative primitive for rendering tick marks around radial controls. Supports
                                    count-based or step-based positioning and custom render functions.
                                </td>
                                <td className="p-4 text-right">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href="/primitives/tick-ring">
                                            View
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </td>
                            </tr>
                            <tr className="bg-muted/20">
                                <td className="p-4 font-medium">LabelRing</td>
                                <td className="p-4 text-muted-foreground">
                                    Wrapper primitive for rendering text or icon labels at radial positions. Supports
                                    numeric scales, text labels, icons, and configurable orientation.
                                </td>
                                <td className="p-4 text-right">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href="/primitives/label-ring">
                                            View
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </td>
                            </tr>
                            <tr className="bg-background">
                                <td className="p-4 font-medium">LinearStrip</td>
                                <td className="p-4 text-muted-foreground">
                                    A linear rectangle strip for linear controls. Positioned at a center point (cx, cy)
                                    with configurable length, thickness, rotation, and rounded corners. Used for slider
                                    tracks, faders, and pitch/mod wheels.
                                </td>
                                <td className="p-4 text-right">—</td>
                            </tr>
                            <tr className="bg-muted/20">
                                <td className="p-4 font-medium">RadialImage</td>
                                <td className="p-4 text-muted-foreground">
                                    Displays static content at radial coordinates. Content is sized to fit within the
                                    specified radius and centered at (cx, cy). Useful for icons or static images within
                                    knob compositions.
                                </td>
                                <td className="p-4 text-right">—</td>
                            </tr>
                            <tr className="bg-muted/20">
                                <td className="p-4 font-medium">RadialHtmlOverlay</td>
                                <td className="p-4 text-muted-foreground">
                                    Renders HTML content inside an SVG at a radial position using foreignObject.
                                    Preferred way to render text inside knobs, leveraging native HTML text rendering.
                                </td>
                                <td className="p-4 text-right">—</td>
                            </tr>
                            <tr className="bg-background">
                                <td className="p-4 font-medium">Image</td>
                                <td className="p-4 text-muted-foreground">
                                    Displays static content at rectangular coordinates. Positioned at (x, y) with
                                    specified width and height. Designed for straightforward rectangular image placement
                                    without radial positioning.
                                </td>
                                <td className="p-4 text-right">—</td>
                            </tr>
                            <tr className="bg-muted/20">
                                <td className="p-4 font-medium">RevealingPath</td>
                                <td className="p-4 text-muted-foreground">
                                    Reveals a path from start to end using CSS stroke-dashoffset. Uses SVG pathLength
                                    attribute to normalize path length calculation, enabling performant filling
                                    animations.
                                </td>
                                <td className="p-4 text-right">—</td>
                            </tr>
                            {/* Control Primitives */}
                            <tr className="bg-primary/5 border-t border-b border-primary/10">
                                <td
                                    colSpan={3}
                                    className="p-3 font-semibold text-sm uppercase tracking-wide text-primary/90"
                                >
                                    Control Primitives
                                </td>
                            </tr>
                            <tr className="bg-background">
                                <td className="p-4 font-medium">ContinuousControl</td>
                                <td className="p-4 text-muted-foreground">
                                    Generic continuous control that connects a data model (AudioParameter) to a
                                    visualization view. Handles parameter resolution, value management, and interaction
                                    handling for continuous controls like knobs and sliders.
                                </td>
                                <td className="p-4 text-right">—</td>
                            </tr>
                            <tr className="bg-muted/20">
                                <td className="p-4 font-medium">DiscreteControl</td>
                                <td className="p-4 text-muted-foreground">
                                    Generic discrete control that connects a data model (DiscreteParameter) to a
                                    visualization view. Handles parameter resolution, value management, and interaction
                                    handling for discrete controls like cycle buttons and selectors.
                                </td>
                                <td className="p-4 text-right">—</td>
                            </tr>
                            <tr className="bg-background">
                                <td className="p-4 font-medium">BooleanControl</td>
                                <td className="p-4 text-muted-foreground">
                                    Generic boolean control that connects a data model (BooleanParameter) to a
                                    visualization view. Handles parameter resolution, value management, and interaction
                                    handling for boolean controls like buttons and toggles.
                                </td>
                                <td className="p-4 text-right">—</td>
                            </tr>
                            <tr className="bg-muted/20">
                                <td className="p-4 font-medium">OptionView</td>
                                <td className="p-4 text-muted-foreground">
                                    Component for defining visual content for discrete control options. Used as children
                                    of DiscreteControl to provide ReactNodes (icons, styled text, custom components) for
                                    rendering.
                                </td>
                                <td className="p-4 text-right">—</td>
                            </tr>
                        </tbody>
                    </table>
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
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 font-semibold">Page</th>
                                <th className="text-left p-4 font-semibold">Description</th>
                                <th className="text-right p-4 font-semibold">Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {layoutPages.map((page, index) => (
                                <tr key={page.name} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                    <td className="p-4 font-medium">{page.name}</td>
                                    <td className="p-4 text-muted-foreground">{page.description}</td>
                                    <td className="p-4 text-right">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={page.url}>
                                                View
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 font-semibold">Example</th>
                                <th className="text-left p-4 font-semibold">Description</th>
                                <th className="text-right p-4 font-semibold">Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {examples.map((example, index) => (
                                <tr key={example.name} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                                    <td className="p-4 font-medium">{example.name}</td>
                                    <td className="p-4 text-muted-foreground">{example.description}</td>
                                    <td className="p-4 text-right">
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={example.url}>
                                                View
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
