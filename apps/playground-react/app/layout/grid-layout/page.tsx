"use client";

import { useMemo, useState } from "react";
import { Button, Keys, Knob, Slider } from "@cutoff/audio-ui-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function GridLayoutPage() {
    // State to track values for interactive controls
    const [knobValue, setKnobValue] = useState(42);
    const [hSliderValue, setHSliderValue] = useState(42);
    const [vSliderValue, setVSliderValue] = useState(42);
    const [buttonValue, setButtonValue] = useState(false);
    const [lockAspectRatio, setLockAspectRatio] = useState(false);

    // Grid fill items (for 9 rows x 9 columns = 81 items)
    const fillItems = useMemo(() => {
        const items: React.ReactNode[] = [];
        for (let i = 0; i < 81; i++) {
            items.push(
                <div
                    key={i}
                    className="w-full h-full border border-dashed dark:border-zinc-600 border-zinc-400"
                    style={{
                        gridArea: `${(i % 9) + 1} / ${Math.floor(i / 9) + 1} / span 1 / span 1`,
                    }}
                />
            );
        }
        return items;
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-foreground">
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                {/* Grid Layout */}
                <div className="w-full">
                    <div className="hidden md:block">
                        {/* Aspect Ratio Lock Switch */}
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Switch
                                id="lockAspectRatio"
                                checked={lockAspectRatio}
                                onCheckedChange={setLockAspectRatio}
                            />
                            <Label htmlFor="lockAspectRatio" className="cursor-pointer">
                                Lock Grid Aspect Ratio
                            </Label>
                        </div>
                        <div
                            className={`w-full grid grid-rows-9 grid-cols-9 gap-2 relative dark:bg-zinc-900/10 bg-zinc-100/50 p-2 rounded-md ${
                                lockAspectRatio ? "" : "h-[800px]"
                            }`}
                            style={lockAspectRatio ? { aspectRatio: "1/0.9" } : {}}
                        >
                            {fillItems}

                            {/* Grid title */}
                            <div className="row-start-2 col-start-1 col-span-3 absolute -top-14 left-2 text-base font-medium text-muted-foreground">
                                align-self
                            </div>

                            {/* Grid labels */}
                            <p className="row-start-2 col-start-1 absolute -top-8 left-2 text-sm text-muted-foreground">
                                start
                            </p>
                            <p className="row-start-2 col-start-2 absolute -top-8 left-2 text-sm text-muted-foreground">
                                end
                            </p>
                            <p className="row-start-2 col-start-3 absolute -top-8 left-2 text-sm text-muted-foreground">
                                center
                            </p>

                            <p className="row-start-3 col-start-5 absolute left-2 text-sm text-muted-foreground">2x2</p>
                            <p className="row-start-2 col-start-8 absolute -top-8 left-2 text-sm text-muted-foreground">
                                3x3
                            </p>
                            <p className="row-start-1 col-start-1 absolute left-2 text-sm text-muted-foreground whitespace-nowrap">
                                adaptiveSize=true && displayMode=scaleToFit
                            </p>
                            <p className="row-start-7 col-start-1 absolute bottom-3 left-2 text-sm text-muted-foreground">
                                displayMode=fill
                            </p>

                            {/* 5 Annotated Knobs (keeping existing layout) */}
                            <Knob
                                min={0}
                                max={100}
                                value={knobValue}
                                step={1}
                                label="Default"
                                thickness={0.35}
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "2 / 1 / span 2 / span 1",
                                    justifySelf: "center",
                                    alignSelf: "start",
                                }}
                                onChange={(e) => setKnobValue(e.value as number)}
                            />
                            <Knob
                                min={0}
                                max={100}
                                value={knobValue}
                                step={1}
                                label="Default"
                                thickness={0.35}
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "2 / 2 / span 2 / span 1",
                                    justifySelf: "center",
                                    alignSelf: "end",
                                }}
                                onChange={(e) => setKnobValue(e.value as number)}
                            />
                            <Knob
                                min={0}
                                max={100}
                                value={knobValue}
                                step={1}
                                label="Default"
                                thickness={0.35}
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "2 / 3 / span 2 / span 1",
                                    justifySelf: "center",
                                    alignSelf: "center",
                                }}
                                onChange={(e) => setKnobValue(e.value as number)}
                            />
                            <Knob
                                min={0}
                                max={100}
                                value={knobValue}
                                step={1}
                                label="Default"
                                thickness={0.35}
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "1 / 5 / span 2 / span 2",
                                    justifySelf: "center",
                                    alignSelf: "center",
                                }}
                                onChange={(e) => setKnobValue(e.value as number)}
                            />
                            <Knob
                                min={0}
                                max={100}
                                value={knobValue}
                                step={1}
                                label="Default"
                                thickness={0.35}
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "2 / 7 / span 3 / span 3",
                                    justifySelf: "center",
                                    alignSelf: "center",
                                }}
                                onChange={(e) => setKnobValue(e.value as number)}
                            />

                            {/* Horizontal Sliders */}
                            <Slider
                                min={0}
                                max={100}
                                value={hSliderValue}
                                step={1}
                                label="Slider"
                                thickness={0.25}
                                orientation="horizontal"
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "5 / 1 / span 1 / span 2",
                                    justifySelf: "center",
                                    alignSelf: "center",
                                }}
                                onChange={(e) => setHSliderValue(e.value as number)}
                            />
                            <Slider
                                min={0}
                                max={100}
                                value={hSliderValue}
                                step={1}
                                label="Slider"
                                thickness={0.25}
                                orientation="horizontal"
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "5 / 3 / span 1 / span 3",
                                    justifySelf: "center",
                                    alignSelf: "center",
                                }}
                                onChange={(e) => setHSliderValue(e.value as number)}
                            />

                            {/* Vertical Sliders */}
                            <Slider
                                min={0}
                                max={100}
                                value={vSliderValue}
                                step={1}
                                label="Slider"
                                thickness={0.25}
                                orientation="vertical"
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "5 / 6 / span 2 / span 1",
                                    justifySelf: "center",
                                    alignSelf: "center",
                                }}
                                onChange={(e) => setVSliderValue(e.value as number)}
                            />
                            <Slider
                                min={0}
                                max={100}
                                value={vSliderValue}
                                step={1}
                                label="Slider"
                                thickness={0.25}
                                orientation="vertical"
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "5 / 7 / span 2 / span 1",
                                    justifySelf: "center",
                                    alignSelf: "center",
                                }}
                                onChange={(e) => setVSliderValue(e.value as number)}
                            />
                            <Slider
                                min={0}
                                max={100}
                                value={vSliderValue}
                                step={1}
                                label="Slider"
                                thickness={0.25}
                                orientation="vertical"
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "5 / 8 / span 2 / span 1",
                                    justifySelf: "center",
                                    alignSelf: "center",
                                }}
                                onChange={(e) => setVSliderValue(e.value as number)}
                            />
                            <Slider
                                min={0}
                                max={100}
                                value={vSliderValue}
                                step={1}
                                label="Slider"
                                thickness={0.25}
                                orientation="vertical"
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "5 / 9 / span 2 / span 1",
                                    justifySelf: "center",
                                    alignSelf: "center",
                                }}
                                onChange={(e) => setVSliderValue(e.value as number)}
                            />

                            {/* Buttons */}
                            <Button
                                value={buttonValue}
                                label="Button"
                                latch={false}
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "6 / 1 / span 1 / span 1",
                                    justifySelf: "center",
                                    alignSelf: "center",
                                }}
                                onChange={(e) => setButtonValue(Boolean(e.value))}
                            />
                            <Button
                                value={buttonValue}
                                label="Button"
                                latch={true}
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "6 / 2 / span 1 / span 1",
                                    justifySelf: "center",
                                    alignSelf: "center",
                                }}
                                onChange={(e) => setButtonValue(Boolean(e.value))}
                            />
                            <Button
                                value={buttonValue}
                                label="Button"
                                latch={false}
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "6 / 3 / span 1 / span 1",
                                    justifySelf: "center",
                                    alignSelf: "center",
                                }}
                                onChange={(e) => setButtonValue(Boolean(e.value))}
                            />
                            <Button
                                value={buttonValue}
                                label="Button"
                                latch={false}
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "6 / 4 / span 1 / span 1",
                                    justifySelf: "center",
                                    alignSelf: "center",
                                }}
                                onChange={(e) => setButtonValue(Boolean(e.value))}
                            />
                            <Button
                                value={buttonValue}
                                label="Button"
                                latch={false}
                                adaptiveSize={true}
                                className="emphasized-bg"
                                style={{
                                    gridArea: "6 / 5 / span 1 / span 1",
                                    justifySelf: "center",
                                    alignSelf: "center",
                                }}
                                onChange={(e) => setButtonValue(Boolean(e.value))}
                            />

                            {/* 61-key Keys at the bottom spanning 7 columns x 2 rows, centered */}
                            <Keys
                                nbKeys={61}
                                startKey="C"
                                octaveShift={0}
                                notesOn={[]}
                                adaptiveSize={true}
                                displayMode="fill"
                                className="emphasized-bg"
                                style={{
                                    gridArea: "8 / 1 / span 1 / span 9",
                                    justifySelf: "center",
                                    alignSelf: "center",
                                }}
                            />
                        </div>
                    </div>

                    {/* Message for small screens */}
                    <div className="md:hidden">
                        <div className="dark:bg-zinc-800/50 bg-zinc-200/50 dark:border-zinc-700 border-zinc-300 rounded-lg p-6 text-center">
                            <h2 className="text-lg font-medium mb-3 text-primary-color">Screen Size Notice</h2>
                            <p className="dark:text-zinc-300 text-zinc-700">
                                Control surface examples are not suitable for small screens. Please use a wider screen
                                to view the grid layout examples.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
