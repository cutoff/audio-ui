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
    List,
    ToggleLeft,
    Box,
    Image as ImageIcon,
    Code,
    Square,
    Component,
    Film,
    RotateCw,
} from "lucide-react";
import { ValueRing, TickRing, LabelRing, AdaptiveBox, LinearStrip } from "@cutoff/audio-ui-react";
import { TriangleWaveIcon, SineWaveIcon, SquareWaveIcon, SawWaveIcon } from "@/components/wave-icons";

const layoutPrimitives = [
    {
        name: "AdaptiveBox",
        url: "/primitives/adaptive-box",
        description:
            "A CSS/SVG-based layout system for SVG controls with labels. Supports multiple display modes (scaleToFit, fill), container queries, two-row grid layout, label positioning, and HTML overlay support. The foundation for all control layouts.",
        preview: (
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
        ),
    },
];

const svgPrimitives = [
    {
        name: "ValueRing",
        url: "/primitives/ring",
        description:
            "An arc/ring indicator showing value progress. Supports bipolar mode, configurable thickness, openness, and roundness. The stroke expands inward from the radius, perfect for knob value indicators.",
        preview: (
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
        ),
    },
    {
        name: "RotaryImage",
        url: "/primitives/rotary",
        description:
            "Rotates children or an image based on normalized value. Shares angle logic with ValueRing via useArcAngle hook. Wraps RadialImage internally, ideal for rotating knob graphics and images.",
        icon: RotateCw,
    },
    {
        name: "FilmstripImage",
        url: "/primitives/filmstrip",
        description:
            "Displays a specific frame from a bitmap sprite sheet (filmstrip) based on normalized value. Supports frame rotation and configurable frame dimensions, perfect for bitmap-based control visualization.",
        icon: Film,
    },
    {
        name: "TickRing",
        url: "/primitives/tick-ring",
        description:
            "A decorative primitive for rendering tick marks around radial controls. Supports count-based or step-based positioning, multiple variants (line, dot, pill), and custom render functions for advanced styling.",
        preview: (
            <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ display: "block" }}>
                <TickRing cx={50} cy={50} radius={45} thickness={6} count={11} className="text-foreground" />
            </svg>
        ),
    },
    {
        name: "LabelRing",
        url: "/primitives/label-ring",
        description:
            "A wrapper primitive for rendering text or icon labels at radial positions. Supports numeric scales, text labels, icons, and configurable orientation (radial, upright). Perfect for knob scale labels.",
        preview: (
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
        ),
    },
    {
        name: "LinearStrip",
        description:
            "A linear rectangle strip for linear controls. Positioned at a center point (cx, cy) with configurable length, thickness, rotation, and rounded corners. Used for slider tracks, faders, and pitch/mod wheels.",
        preview: (
            <svg width="100%" height="100%" viewBox="0 0 100 300" style={{ display: "block" }}>
                <LinearStrip
                    cx={50}
                    cy={150}
                    length={260}
                    thickness={8}
                    rotation={0}
                    roundness={0.3}
                    style={{
                        fill: "var(--audioui-primary-50)",
                    }}
                />
            </svg>
        ),
    },
    {
        name: "RadialImage",
        description:
            "Displays static content at radial coordinates. The content is sized to fit within the specified radius and centered at (cx, cy). Can display an image or arbitrary SVG content, useful for icons or static images within knob compositions.",
        icon: ImageIcon,
    },
    {
        name: "RadialHtmlOverlay",
        description:
            "Renders HTML content inside an SVG at a radial position using foreignObject. Creates a square foreignObject centered at (cx, cy) with size based on radius. Preferred way to render text inside knobs, leveraging native HTML text rendering.",
        icon: Code,
    },
    {
        name: "Image",
        description:
            "Displays static content at rectangular coordinates. Positioned at (x, y) with specified width and height. Can display an image or arbitrary SVG content, designed for straightforward rectangular image placement without radial positioning.",
        icon: Square,
    },
    {
        name: "RevealingPath",
        description:
            "Reveals a path from start to end using CSS stroke-dashoffset. Uses SVG pathLength attribute to normalize path length calculation, enabling performant filling animations without JavaScript geometric calculations.",
        icon: Component,
    },
];

const controlPrimitives = [
    {
        name: "ContinuousControl",
        description:
            "A generic continuous control that connects a data model (AudioParameter) to a visualization view (ControlComponent). Handles parameter resolution, value management, interaction handling, and layout management for continuous controls like knobs and sliders.",
        icon: Sliders,
    },
    {
        name: "DiscreteControl",
        description:
            "A generic discrete control that connects a data model (DiscreteParameter) to a visualization view (ControlComponent). Handles parameter resolution, value management, interaction handling, and layout management for discrete controls like cycle buttons and selectors.",
        icon: List,
    },
    {
        name: "BooleanControl",
        description:
            "A generic boolean control that connects a data model (BooleanParameter) to a visualization view (ControlComponent). Handles parameter resolution, value management, interaction handling, and layout management for boolean controls like buttons and toggles.",
        icon: ToggleLeft,
    },
    {
        name: "OptionView",
        description:
            "A component for defining visual content for discrete control options. Used as children of DiscreteControl to provide ReactNodes (icons, styled text, custom components) for rendering. Matched to options by value in hybrid mode.",
        icon: Box,
    },
];

/**
 * Primitives components overview page.
 * Provides an overview of all primitive components and links to their individual demo pages where available.
 *
 * @returns Primitives components overview page
 */
export default function PrimitivesPage() {
    const renderComponentCard = (component: {
        name: string;
        url?: string;
        description: string;
        preview?: React.ReactNode;
        icon?: React.ComponentType<{ className?: string }>;
    }) => {
        const Icon = component.icon;
        return (
            <Card key={component.name} className="flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="text-xl">{component.name}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{component.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {/* Component Preview or Icon */}
                    <div className="flex justify-center items-center h-32 bg-muted/30 rounded-lg border border-border/50 p-4">
                        <div className="w-full h-full flex items-center justify-center pointer-events-none">
                            {component.preview || (Icon && <Icon className="h-16 w-16 text-muted-foreground" />)}
                        </div>
                    </div>
                    {/* Button only if URL exists */}
                    {component.url && (
                        <Button asChild variant="outline" className="w-full">
                            <Link href={component.url}>
                                View Component
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header Section */}
            <div className="flex flex-col gap-4 mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Primitive Components</h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                    Low-level building blocks for composing custom controls. These primitives provide the foundation for
                    building audio and MIDI interfaces. SVG primitives handle rendering, control primitives handle
                    interaction logic, and layout primitives manage responsive sizing and positioning. Use these to
                    create custom components tailored to your specific needs.
                </p>
            </div>

            {/* Layout Primitives Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Layout Primitives</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {layoutPrimitives.map(renderComponentCard)}
                </div>
            </div>

            {/* SVG Primitives Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">SVG Primitives</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {svgPrimitives.map(renderComponentCard)}
                </div>
            </div>

            {/* Control Primitives Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Control Primitives</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {controlPrimitives.map(renderComponentCard)}
                </div>
            </div>
        </div>
    );
}
