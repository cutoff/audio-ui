"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import LabyrinthControl from "@/components/examples/LabyrinthControl";

export default function LabyrinthPage() {
    const [value, setValue] = useState([0]);
    const normalizedValue = value[0];

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-12 p-8">
            <div className="flex flex-col items-center gap-4 text-center">
                <h1 className="text-3xl font-bold tracking-tight">RevealingPath Labyrinth</h1>
                <p className="text-muted-foreground max-w-[600px]">
                    This example demonstrates the <code>RevealingPath</code> primitive. 
                    The maze is generated programmatically by defining a grid and removing segments.
                </p>
            </div>

            <div className="relative w-[400px] h-[400px] shadow-xl rounded-lg overflow-hidden bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                <LabyrinthControl
                    normalizedValue={normalizedValue}
                    className="w-full h-full"
                />
            </div>

            <div className="w-full max-w-sm space-y-4">
                <div className="flex justify-between text-sm font-medium">
                    <span>Start</span>
                    <span>Progress: {Math.round(normalizedValue * 100)}%</span>
                    <span>Finish</span>
                </div>
                <Slider
                    defaultValue={[0]}
                    max={1}
                    step={0.001}
                    value={value}
                    onValueChange={setValue}
                    className="w-full"
                />
            </div>
        </div>
    );
}
