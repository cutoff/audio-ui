"use client";

import { useState } from "react";
import { Button, Knob, Slider as AudioSlider } from "@cutoff/audio-ui-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export default function ControlSurfacePage() {
    // State for customization controls
    const [zoom, setZoom] = useState(1);
    const [perspectiveX, setPerspectiveX] = useState(0);
    const [perspectiveY, setPerspectiveY] = useState(0);

    // State for knob controls
    const [filterValue, setFilterValue] = useState(25);
    const [resonanceValue, setResonanceValue] = useState(50);
    const [attackValue, setAttackValue] = useState(75);
    const [releaseValue, setReleaseValue] = useState(35);
    const [reverbValue, setReverbValue] = useState(60);
    const [delayValue, setDelayValue] = useState(40);
    const [driveValue, setDriveValue] = useState(20);
    const [volumeValue, setVolumeValue] = useState(80);

    // State for slider controls
    const [slider1Value, setSlider1Value] = useState(30);
    const [slider2Value, setSlider2Value] = useState(60);
    const [slider3Value, setSlider3Value] = useState(45);
    const [slider4Value, setSlider4Value] = useState(75);

    // State for button controls
    const [buttonAValue, setButtonAValue] = useState(0);
    const [buttonBValue, setButtonBValue] = useState(0);
    const [buttonCValue, setButtonCValue] = useState(0);
    const [buttonDValue, setButtonDValue] = useState(0);

    // Calculate transformations based on state
    const controlSurfaceStyle = {
        transform: `scale(${zoom}) perspective(500px) rotateY(${perspectiveX}deg) rotateX(${perspectiveY}deg)`,
        transformOrigin: "center center",
        transition: "transform 0.2s ease-out",
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Control Surface Example</h1>

            <div className="mb-8">
                <h2 className="text-xl font-medium mb-4">Customization Controls</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Zoom control */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label htmlFor="zoom-slider">Zoom</Label>
                            <span className="text-sm text-muted-foreground">{zoom.toFixed(1)}x</span>
                        </div>
                        <Slider
                            id="zoom-slider"
                            min={0.5}
                            max={1.5}
                            step={0.1}
                            value={[zoom]}
                            onValueChange={(value) => setZoom(value[0])}
                        />
                    </div>

                    {/* Horizontal perspective control */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label htmlFor="perspective-x-slider">Horizontal Perspective</Label>
                            <span className="text-sm text-muted-foreground">{perspectiveX}°</span>
                        </div>
                        <Slider
                            id="perspective-x-slider"
                            min={-45}
                            max={45}
                            step={1}
                            value={[perspectiveX]}
                            onValueChange={(value) => setPerspectiveX(value[0])}
                        />
                    </div>

                    {/* Vertical perspective control */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label htmlFor="perspective-y-slider">Vertical Perspective</Label>
                            <span className="text-sm text-muted-foreground">{perspectiveY}°</span>
                        </div>
                        <Slider
                            id="perspective-y-slider"
                            min={-45}
                            max={45}
                            step={1}
                            value={[perspectiveY]}
                            onValueChange={(value) => setPerspectiveY(value[0])}
                        />
                    </div>
                </div>
            </div>

            {/* Control Surface */}
            <div className="mt-12 mb-8">
                <h2 className="text-xl font-medium mb-6">Control Surface</h2>
                <div className="border rounded-lg bg-zinc-100 dark:bg-zinc-900 p-4 md:p-8 flex justify-center items-center h-[600px]">
                    <div className="grid grid-cols-4 gap-4 w-full max-w-3xl" style={controlSurfaceStyle}>
                        {/* Row 1 - Knobs */}
                        <div className="col-span-1">
                            <Knob
                                value={filterValue}
                                onChange={(val) => setFilterValue(val)}
                                label="Filter"
                                min={0}
                                max={100}
                                stretch={true}
                            />
                        </div>
                        <div className="col-span-1">
                            <Knob
                                value={resonanceValue}
                                onChange={(val) => setResonanceValue(val)}
                                label="Resonance"
                                min={0}
                                max={100}
                                stretch={true}
                            />
                        </div>
                        <div className="col-span-1">
                            <Knob
                                value={attackValue}
                                onChange={(val) => setAttackValue(val)}
                                label="Attack"
                                min={0}
                                max={100}
                                stretch={true}
                            />
                        </div>
                        <div className="col-span-1">
                            <Knob
                                value={releaseValue}
                                onChange={(val) => setReleaseValue(val)}
                                label="Release"
                                min={0}
                                max={100}
                                stretch={true}
                            />
                        </div>

                        {/* Row 2 - More knobs */}
                        <div className="col-span-1">
                            <Knob
                                value={reverbValue}
                                onChange={(val) => setReverbValue(val)}
                                label="Reverb"
                                min={0}
                                max={100}
                                stretch={true}
                            />
                        </div>
                        <div className="col-span-1">
                            <Knob
                                value={delayValue}
                                onChange={(val) => setDelayValue(val)}
                                label="Delay"
                                min={0}
                                max={100}
                                stretch={true}
                            />
                        </div>
                        <div className="col-span-1">
                            <Knob
                                value={driveValue}
                                onChange={(val) => setDriveValue(val)}
                                label="Drive"
                                min={0}
                                max={100}
                                stretch={true}
                            />
                        </div>
                        <div className="col-span-1">
                            <Knob
                                value={volumeValue}
                                onChange={(val) => setVolumeValue(val)}
                                label="Volume"
                                min={0}
                                max={100}
                                stretch={true}
                            />
                        </div>

                        {/* Row 3 - Sliders */}
                        <div className="col-span-1">
                            <AudioSlider
                                value={slider1Value}
                                onChange={(val) => setSlider1Value(val)}
                                min={0}
                                max={100}
                                orientation="vertical"
                                stretch={true}
                            />
                        </div>
                        <div className="col-span-1">
                            <AudioSlider
                                value={slider2Value}
                                onChange={(val) => setSlider2Value(val)}
                                min={0}
                                max={100}
                                orientation="vertical"
                                stretch={true}
                            />
                        </div>
                        <div className="col-span-1">
                            <AudioSlider
                                value={slider3Value}
                                onChange={(val) => setSlider3Value(val)}
                                min={0}
                                max={100}
                                orientation="vertical"
                                stretch={true}
                            />
                        </div>
                        <div className="col-span-1">
                            <AudioSlider
                                value={slider4Value}
                                onChange={(val) => setSlider4Value(val)}
                                min={0}
                                max={100}
                                orientation="vertical"
                                stretch={true}
                            />
                        </div>

                        {/* Row 4 - Buttons */}
                        <div className="col-span-1">
                            <Button
                                value={buttonAValue}
                                onChange={setButtonAValue}
                                label="A"
                                stretch={true}
                                latch={true}
                            />
                        </div>
                        <div className="col-span-1">
                            <Button
                                value={buttonBValue}
                                onChange={setButtonBValue}
                                label="B"
                                stretch={true}
                                latch={true}
                            />
                        </div>
                        <div className="col-span-1">
                            <Button
                                value={buttonCValue}
                                onChange={setButtonCValue}
                                label="C"
                                stretch={true}
                                latch={true}
                            />
                        </div>
                        <div className="col-span-1">
                            <Button
                                value={buttonDValue}
                                onChange={setButtonDValue}
                                label="D"
                                stretch={true}
                                latch={true}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 border rounded-lg bg-zinc-100 dark:bg-zinc-900">
                <h2 className="text-xl font-medium mb-4">Control Values</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Knob Values */}
                    <div>
                        <h3 className="text-lg font-medium mb-2">Knobs</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="font-medium">Filter:</span> {filterValue}
                            </div>
                            <div>
                                <span className="font-medium">Resonance:</span> {resonanceValue}
                            </div>
                            <div>
                                <span className="font-medium">Attack:</span> {attackValue}
                            </div>
                            <div>
                                <span className="font-medium">Release:</span> {releaseValue}
                            </div>
                            <div>
                                <span className="font-medium">Reverb:</span> {reverbValue}
                            </div>
                            <div>
                                <span className="font-medium">Delay:</span> {delayValue}
                            </div>
                            <div>
                                <span className="font-medium">Drive:</span> {driveValue}
                            </div>
                            <div>
                                <span className="font-medium">Volume:</span> {volumeValue}
                            </div>
                        </div>
                    </div>

                    {/* Slider Values */}
                    <div>
                        <h3 className="text-lg font-medium mb-2">Sliders</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="font-medium">Slider 1:</span> {slider1Value}
                            </div>
                            <div>
                                <span className="font-medium">Slider 2:</span> {slider2Value}
                            </div>
                            <div>
                                <span className="font-medium">Slider 3:</span> {slider3Value}
                            </div>
                            <div>
                                <span className="font-medium">Slider 4:</span> {slider4Value}
                            </div>
                        </div>
                    </div>

                    {/* Button Values */}
                    <div>
                        <h3 className="text-lg font-medium mb-2">Buttons</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="font-medium">Button A:</span> {buttonAValue}
                            </div>
                            <div>
                                <span className="font-medium">Button B:</span> {buttonBValue}
                            </div>
                            <div>
                                <span className="font-medium">Button C:</span> {buttonCValue}
                            </div>
                            <div>
                                <span className="font-medium">Button D:</span> {buttonDValue}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-sm text-muted-foreground">
                <p>This demo showcases a control surface with various AudioUI components arranged in a grid layout.</p>
                <p>Use the controls above to adjust the zoom and perspective of the control surface.</p>
                <p>
                    All knobs, sliders, and buttons are editable. For knobs and sliders, use the mouse wheel to change
                    their values. For buttons, click to toggle their state.
                </p>
            </div>
        </div>
    );
}
