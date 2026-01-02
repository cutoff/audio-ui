"use client";

import { TickRing } from "@cutoff/audio-ui-react";

export default function TickRingPage() {
    return (
        <div className="p-8 space-y-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-4">TickRing</h1>
                <p className="text-lg text-muted-foreground mb-8">
                    A decorative primitive for rendering tick marks around radial controls.
                </p>
            </div>

            <section className="space-y-6">
                <h2 className="text-2xl font-semibold">Basic Usage</h2>
                <div className="flex flex-wrap gap-12 items-center p-8 bg-card rounded-xl border">
                    {/* Basic count-based ring */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
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
                        <p className="text-sm text-muted-foreground">Count: 11 (0-10)</p>
                    </div>

                    {/* Step-based ring */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <TickRing
                                    cx={50}
                                    cy={50}
                                    radius={45}
                                    thickness={6}
                                    step={10} // 10 degrees per tick
                                    className="text-foreground"
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Step: 10 degrees</p>
                    </div>

                    {/* Full Circle */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <TickRing
                                    cx={50}
                                    cy={50}
                                    radius={45}
                                    thickness={6}
                                    openness={0}
                                    count={12}
                                    className="text-foreground"
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Full Circle (0° Openness)</p>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-semibold">Alignment</h2>
                <div className="flex flex-wrap gap-12 items-center p-8 bg-card rounded-xl border">
                    {/* Standard knob alignment */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                {/* Track for reference */}
                                <path
                                    d="M 21.7 78.3 A 40 40 0 1 1 78.3 78.3"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    className="text-muted-foreground/30"
                                />
                                <TickRing
                                    cx={50}
                                    cy={50}
                                    radius={45}
                                    thickness={8}
                                    count={11}
                                    openness={90}
                                    rotation={0}
                                    className="text-primary"
                                    style={{ strokeWidth: 1.5 }}
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Standard 90° Openness</p>
                    </div>

                    {/* Rotated */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <TickRing
                                    cx={50}
                                    cy={50}
                                    radius={40}
                                    thickness={10}
                                    count={8}
                                    openness={90}
                                    rotation={45}
                                    className="text-blue-500"
                                    style={{ strokeWidth: 2 }}
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Rotated 45°</p>
                    </div>

                    {/* Wide Openness */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <TickRing
                                    cx={50}
                                    cy={50}
                                    radius={45}
                                    thickness={5}
                                    count={21}
                                    openness={270}
                                    className="text-orange-500"
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">270° Openness</p>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-semibold">Variants & Custom Shapes</h2>
                <div className="flex flex-wrap gap-12 items-center p-8 bg-card rounded-xl border">
                    {/* Dots Variant */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <TickRing
                                    cx={50}
                                    cy={50}
                                    radius={45}
                                    thickness={4} // Diameter of dots
                                    count={11}
                                    variant="dot"
                                    className="text-primary"
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Dots (Single Path)</p>
                    </div>

                    {/* Pills Variant */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <TickRing
                                    cx={50}
                                    cy={50}
                                    radius={45}
                                    thickness={8}
                                    count={11}
                                    variant="pill"
                                    className="text-blue-500"
                                    style={{ strokeWidth: 4 }}
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Pills (Rounded Lines)</p>
                    </div>

                    {/* Custom Render (Text) */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <TickRing
                                    cx={50}
                                    cy={50}
                                    radius={35}
                                    count={11}
                                    className="text-foreground font-mono text-[8px] font-bold"
                                    renderTick={({ x, y, index }) => (
                                        <text
                                            x={x}
                                            y={y}
                                            dy="0.3em" // Vertical center correction
                                            textAnchor="middle"
                                            fill="currentColor"
                                        >
                                            {index}
                                        </text>
                                    )}
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Custom Render (Text)</p>
                    </div>

                    {/* Custom Render (Triangles) */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <TickRing
                                    cx={50}
                                    cy={50}
                                    radius={42}
                                    count={11}
                                    className="text-orange-500"
                                    renderTick={({ x, y, angle }) => (
                                        <path
                                            d="M 0 -3 L 3 3 L -3 3 Z"
                                            transform={`translate(${x}, ${y}) rotate(${angle + 90})`}
                                            fill="currentColor"
                                        />
                                    )}
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Custom Render (Shapes)</p>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-semibold">Styles & Thickness</h2>
                <div className="flex flex-wrap gap-12 items-center p-8 bg-card rounded-xl border">
                    {/* Thin & Long */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <TickRing
                                    cx={50}
                                    cy={50}
                                    radius={48}
                                    thickness={15}
                                    count={31}
                                    className="text-foreground"
                                    style={{ strokeWidth: 0.5 }}
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Long & Thin</p>
                    </div>

                    {/* Short & Thick */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <TickRing
                                    cx={50}
                                    cy={50}
                                    radius={45}
                                    thickness={3}
                                    count={6}
                                    className="text-foreground"
                                    style={{ strokeWidth: 4, strokeLinecap: "round" }}
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Short & Thick (Rounded)</p>
                    </div>

                    {/* Dashed Style */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <TickRing
                                    cx={50}
                                    cy={50}
                                    radius={40}
                                    thickness={10}
                                    count={12}
                                    className="text-pink-500"
                                    style={{ strokeWidth: 2, strokeDasharray: "2 2" }}
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Dashed Stroke</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
