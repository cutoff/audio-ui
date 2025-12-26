"use client";

import { useState } from "react";
import { AudioControlEvent } from "@cutoff/audio-ui-react";
import CustomContinuousControl from "@/components/CustomContinuousControl";
import LabyrinthControlView from "@/components/examples/LabyrinthControlView";

export default function LabyrinthPage() {
    const [value, setValue] = useState(0);

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-12 p-8">
            <div className="flex flex-col items-center gap-4 text-center">
                <h1 className="text-3xl font-bold tracking-tight">RevealingPath Labyrinth</h1>
                <p className="text-muted-foreground max-w-[600px]">
                    This example demonstrates the <code>RevealingPath</code> primitive. 
                    The maze is generated programmatically by defining a grid and removing segments.
                </p>
            </div>

            <div className="relative w-[200px] h-[200px]">
                <CustomContinuousControl
                    view={LabyrinthControlView}
                    min={0}
                    max={16383}
                    step={1}
                    value={value}
                    onChange={(event: AudioControlEvent<number>) => setValue(event.value)}
                    label="FunMaze Control"
                    className="w-full h-full"
                />
            </div>
        </div>
    );
}
