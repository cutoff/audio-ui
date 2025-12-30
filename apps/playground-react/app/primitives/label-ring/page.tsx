"use client";

import { LabelRing } from "@cutoff/audio-ui-react";
import { ArrowUp, Check, ChevronUp, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

const ICONS = [
    <Plus key="1" size={12} strokeWidth={2.5} />,
    <Minus key="2" size={12} strokeWidth={2.5} />,
    <ChevronUp key="3" size={12} strokeWidth={2.5} />,
    <ArrowUp key="4" size={12} strokeWidth={2.5} />,
    <Check key="5" size={12} strokeWidth={2.5} />,
];

export default function LabelRingPage() {
    // Force mount to handle theme
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <div className="p-8 space-y-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-4">LabelRing</h1>
                <p className="text-lg text-muted-foreground mb-8">
                    A wrapper primitive for rendering text or icon labels at radial positions.
                </p>
            </div>

            <section className="space-y-6">
                <h2 className="text-2xl font-semibold">Basic Usage</h2>
                <div className="flex flex-wrap gap-12 items-center p-8 bg-card rounded-xl border">
                    {/* Numeric scale */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <LabelRing
                                    cx={50}
                                    cy={50}
                                    radius={40}
                                    labels={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                                    labelClassName="text-[6px] font-medium fill-foreground"
                                />
                                <circle cx={50} cy={50} r={2} className="fill-muted-foreground" />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Numeric Scale (1-10)</p>
                    </div>

                    {/* Text labels */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <LabelRing
                                    cx={50}
                                    cy={50}
                                    radius={35}
                                    labels={["Min", "Low", "Mid", "High", "Max"]}
                                    orientation="radial"
                                    labelClassName="text-[5px] font-bold uppercase tracking-widest fill-primary"
                                />
                                <circle cx={50} cy={50} r={2} className="fill-muted-foreground" />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Radial Text Orientation</p>
                    </div>

                    {/* Icons */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg
                                width="100%"
                                height="100%"
                                viewBox="0 0 100 100"
                                className="w-full h-full text-foreground"
                            >
                                <LabelRing cx={50} cy={50} radius={40} labels={ICONS} orientation="upright" />
                                <circle cx={50} cy={50} r={2} className="fill-muted-foreground" />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Icon Labels</p>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-semibold">Configurations</h2>
                <div className="flex flex-wrap gap-12 items-center p-8 bg-card rounded-xl border">
                    {/* Different Openness */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <LabelRing
                                    cx={50}
                                    cy={50}
                                    radius={40}
                                    openness={180}
                                    labels={["L", "R"]}
                                    labelClassName="text-[8px] font-bold fill-foreground"
                                />
                                <LabelRing
                                    cx={50}
                                    cy={50}
                                    radius={30}
                                    openness={180}
                                    labels={[1, 2, 3, 4, 5]}
                                    labelClassName="text-[6px] font-medium fill-muted-foreground"
                                />
                                <circle cx={50} cy={50} r={2} className="fill-muted-foreground" />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">180° Openness (Pan)</p>
                    </div>

                    {/* Rotated */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <LabelRing
                                    cx={50}
                                    cy={50}
                                    radius={40}
                                    rotation={45}
                                    labels={[1, 2, 3, 4, 5, 6, 7, 8]}
                                    labelClassName="text-[6px] font-medium fill-foreground"
                                />
                                <path
                                    d="M50 50 L50 10"
                                    stroke="currentColor"
                                    strokeDasharray="2 2"
                                    className="text-muted-foreground opacity-50"
                                />
                                <circle cx={50} cy={50} r={2} className="fill-muted-foreground" />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Rotated 45°</p>
                    </div>

                    {/* Full Circle */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-48 h-48 border rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <LabelRing
                                    cx={50}
                                    cy={50}
                                    radius={40}
                                    openness={0}
                                    labels={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
                                    labelClassName="text-[5px] font-medium fill-foreground"
                                />
                                <circle cx={50} cy={50} r={2} className="fill-muted-foreground" />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Full Circle (0° Openness)</p>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-semibold">With Custom Styling</h2>
                <div className="flex flex-wrap gap-12 items-center p-8 bg-card rounded-xl border">
                    {/* Styled text */}
                    <div className="space-y-4 text-center">
                        <div className="relative w-64 h-64 border rounded-full bg-zinc-950 flex items-center justify-center">
                            <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                                <LabelRing
                                    cx={50}
                                    cy={50}
                                    radius={42}
                                    labels={["A", "B", "C", "D", "E", "F", "G", "H"]}
                                    labelClassName="text-[5px] font-mono font-bold fill-zinc-400"
                                />
                                <LabelRing
                                    cx={50}
                                    cy={50}
                                    radius={32}
                                    labels={["1", "2", "3", "4", "5", "6", "7", "8"]}
                                    labelClassName="text-[4px] font-mono fill-zinc-600"
                                    rotation={22.5}
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Concentric Rings</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
