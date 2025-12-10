"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button, Knob, Slider as AudioSlider, Keybed } from "@cutoff/audio-ui-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Modulation functions - these simulate different LFO waveforms
const modulators = {
    sine: (time: number, frequency: number, phase: number = 0) =>
        (Math.sin(time * frequency * Math.PI * 2 + phase) + 1) / 2,
    triangle: (time: number, frequency: number, phase: number = 0) => {
        const t = ((time * frequency + phase / (Math.PI * 2)) % 1 + 1) % 1;
        return t < 0.5 ? t * 2 : 2 - t * 2;
    },
    sawtooth: (time: number, frequency: number, phase: number = 0) =>
        ((time * frequency + phase / (Math.PI * 2)) % 1 + 1) % 1,
    square: (time: number, frequency: number, phase: number = 0) =>
        Math.sin(time * frequency * Math.PI * 2 + phase) >= 0 ? 1 : 0,
    random: () => Math.random(),
};

type ModulatorType = keyof typeof modulators;

// Generate a pseudo-random number based on a seed (for consistent random patterns per control)
function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Pre-define control configurations for better performance
type ControlConfig = {
    type: "knob" | "slider-v" | "slider-h" | "button" | "keybed";
    modulator: ModulatorType;
    frequency: number;
    phase: number;
    color: string;
    label: string;
    thickness: number;
};

// Color palette for vibrant visuals
const COLORS = [
    "#ff3366", // Pink
    "#ff6633", // Orange-red
    "#ff9933", // Orange
    "#ffcc33", // Yellow
    "#33cc66", // Green
    "#33cccc", // Cyan
    "#3399ff", // Blue
    "#6633ff", // Indigo
    "#9966ff", // Purple
    "#cc66ff", // Violet
];

// Thickness options for knobs and sliders
const KNOB_THICKNESSES = [6, 8, 10, 12, 14];
const SLIDER_THICKNESSES = [10, 14, 18, 22, 26];

function generateControlConfigs(count: number): ControlConfig[] {
    const configs: ControlConfig[] = [];
    const types: ControlConfig["type"][] = ["knob", "slider-v", "slider-h", "button"];
    const modulatorTypes: ModulatorType[] = ["sine", "triangle", "sawtooth", "square"];

    for (let i = 0; i < count; i++) {
        const seed = i + 1;
        const typeIndex = Math.floor(seededRandom(seed * 7) * types.length);
        const modIndex = Math.floor(seededRandom(seed * 13) * modulatorTypes.length);
        const colorIndex = Math.floor(seededRandom(seed * 19) * COLORS.length);
        const type = types[typeIndex];
        
        // Determine thickness based on control type
        let thickness: number;
        if (type === "knob") {
            const thicknessIndex = Math.floor(seededRandom(seed * 53) * KNOB_THICKNESSES.length);
            thickness = KNOB_THICKNESSES[thicknessIndex];
        } else if (type === "slider-v" || type === "slider-h") {
            const thicknessIndex = Math.floor(seededRandom(seed * 59) * SLIDER_THICKNESSES.length);
            thickness = SLIDER_THICKNESSES[thicknessIndex];
        } else {
            thickness = 0; // Not used for buttons
        }

        configs.push({
            type,
            modulator: modulatorTypes[modIndex],
            frequency: 0.1 + seededRandom(seed * 31) * 0.4, // 0.1 - 0.5 Hz
            phase: seededRandom(seed * 43) * Math.PI * 2,
            color: COLORS[colorIndex],
            label: `${type[0].toUpperCase()}${i + 1}`,
            thickness,
        });
    }

    return configs;
}

// Display-only control component (no interaction handlers)
const AnimatedControl = ({
    config,
    value,
    buttonValue,
}: {
    config: ControlConfig;
    value: number;
    buttonValue: boolean;
}) => {
    const commonProps = {
        stretch: true,
        color: config.color,
    };

    switch (config.type) {
        case "knob":
            return (
                <Knob
                    {...commonProps}
                    value={value}
                    min={0}
                    max={100}
                    step={1}
                    label={config.label}
                    thickness={config.thickness}
                    size="small"
                />
            );
        case "slider-v":
            return (
                <AudioSlider
                    {...commonProps}
                    value={value}
                    min={0}
                    max={100}
                    step={1}
                    orientation="vertical"
                    label={config.label}
                    thickness={config.thickness}
                    size="small"
                />
            );
        case "slider-h":
            return (
                <AudioSlider
                    {...commonProps}
                    value={value}
                    min={0}
                    max={100}
                    step={1}
                    orientation="horizontal"
                    label={config.label}
                    thickness={config.thickness}
                    size="small"
                />
            );
        case "button":
            return (
                <Button
                    {...commonProps}
                    value={buttonValue}
                    label={config.label}
                    latch={true}
                    size="small"
                />
            );
        default:
            return null;
    }
};

export default function StressTestPage() {
    // Configuration state
    const [controlCount, setControlCount] = useState(64);
    const [isAnimating, setIsAnimating] = useState(true);
    const [animationSpeed, setAnimationSpeed] = useState(1);
    const [showKeybeds, setShowKeybeds] = useState(true);
    const [keybedCount, setKeybedCount] = useState(4);
    const [showFps, setShowFps] = useState(true);
    const [fps, setFps] = useState(0);

    // Control values state - using refs for performance during animation
    const [values, setValues] = useState<number[]>(() => new Array(controlCount).fill(50));
    const [buttonValues, setButtonValues] = useState<boolean[]>(() => new Array(controlCount).fill(false));
    const [keybedNotes, setKeybedNotes] = useState<number[][]>(() =>
        new Array(keybedCount).fill(null).map(() => [])
    );

    // Pre-generated control configurations
    const controlConfigs = useMemo(() => generateControlConfigs(controlCount), [controlCount]);

    // Animation frame reference
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(performance.now());
    
    // FPS calculation refs
    const frameCountRef = useRef(0);
    const lastFpsUpdateRef = useRef(performance.now());

    // Memoized keybed configurations
    const keybedConfigs = useMemo(
        () =>
            Array.from({ length: keybedCount }, (_, i) => ({
                nbKeys: 25 + Math.floor(seededRandom((i + 1) * 97) * 37), // 25-61 keys
                startKey: (["C", "F", "A"] as const)[i % 3],
                color: COLORS[(i * 3) % COLORS.length],
                noteFrequency: 0.5 + seededRandom((i + 1) * 71) * 1.5, // How often notes change
                notePhase: seededRandom((i + 1) * 89) * Math.PI * 2,
            })),
        [keybedCount]
    );

    // Animation loop
    const animate = useCallback(() => {
        if (!isAnimating) return;

        const currentTime = (performance.now() - startTimeRef.current) / 1000;
        const scaledTime = currentTime * animationSpeed;

        // Update control values
        const newValues = controlConfigs.map((config) => {
            const modulatorFn = modulators[config.modulator];
            const normalizedValue = modulatorFn(scaledTime, config.frequency, config.phase);
            return Math.round(normalizedValue * 100);
        });

        // Update button values (toggle at different rates)
        const newButtonValues = controlConfigs.map((config) => {
            if (config.type !== "button") return false;
            const modulatorFn = modulators.square;
            return modulatorFn(scaledTime, config.frequency * 0.5, config.phase) > 0.5;
        });

        // Update keybed notes - generate notes within each keybed's actual range
        const newKeybedNotes = keybedConfigs.map((config, i) => {
            // Calculate the starting MIDI note based on startKey
            // C=0, D=2, E=4, F=5, G=7, A=9, B=11 (semitones from C)
            const noteOffsets: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
            const startKeyOffset = noteOffsets[config.startKey] || 0;
            // Use octave 3-4 range (MIDI 48-72) for all keybeds
            const baseNote = 48 + startKeyOffset;
            
            const notes: number[] = [];

            // Generate 2-4 notes based on time
            const noteCount = 2 + Math.floor(seededRandom(i * 101 + Math.floor(scaledTime * config.noteFrequency)) * 3);

            for (let n = 0; n < noteCount; n++) {
                // Generate notes within the keybed's range (0 to nbKeys-1)
                const offset = Math.floor(
                    seededRandom(i * 103 + n * 107 + Math.floor(scaledTime * config.noteFrequency * 2)) * config.nbKeys
                );
                notes.push(baseNote + offset);
            }

            return notes;
        });

        setValues(newValues);
        setButtonValues(newButtonValues);
        setKeybedNotes(newKeybedNotes);

        // Calculate FPS
        frameCountRef.current++;
        const now = performance.now();
        const elapsed = now - lastFpsUpdateRef.current;
        if (elapsed >= 1000) {
            setFps(Math.round((frameCountRef.current * 1000) / elapsed));
            frameCountRef.current = 0;
            lastFpsUpdateRef.current = now;
        }

        animationRef.current = requestAnimationFrame(animate);
    }, [isAnimating, animationSpeed, controlConfigs, keybedConfigs]);

    // Start/stop animation
    useEffect(() => {
        if (isAnimating) {
            startTimeRef.current = performance.now();
            animationRef.current = requestAnimationFrame(animate);
        } else if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isAnimating, animate]);

    // Reset values when control count changes
    useEffect(() => {
        setValues(new Array(controlCount).fill(50));
        setButtonValues(new Array(controlCount).fill(false));
    }, [controlCount]);

    // Reset keybeds when count changes
    useEffect(() => {
        setKeybedNotes(new Array(keybedCount).fill(null).map(() => []));
    }, [keybedCount]);

    // Calculate grid columns based on control count - use more columns for denser display
    const gridColCount = useMemo(() => {
        if (controlCount <= 32) return 8;
        if (controlCount <= 64) return 10;
        if (controlCount <= 128) return 12;
        return 14;
    }, [controlCount]);

    // Stats for display
    const stats = useMemo(() => {
        const types = controlConfigs.reduce(
            (acc, config) => {
                acc[config.type] = (acc[config.type] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        return {
            total: controlCount + (showKeybeds ? keybedCount : 0),
            knobs: types["knob"] || 0,
            vSliders: types["slider-v"] || 0,
            hSliders: types["slider-h"] || 0,
            buttons: types["button"] || 0,
            keybeds: showKeybeds ? keybedCount : 0,
        };
    }, [controlCount, keybedCount, showKeybeds, controlConfigs]);

    return (
        <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold mb-1">Performance Stress Test</h1>
            <p className="text-sm text-muted-foreground mb-4">
                {stats.total} animated components with automatic LFO modulation
            </p>

            {/* Control Panel */}
            <div className="mb-4 p-4 border rounded-lg bg-zinc-100 dark:bg-zinc-900">
                <h2 className="text-lg font-medium mb-3">Configuration</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Toggle Switches Row */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="animation-toggle">Animation</Label>
                            <Switch
                                id="animation-toggle"
                                checked={isAnimating}
                                onCheckedChange={setIsAnimating}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="fps-toggle">FPS</Label>
                            <Switch
                                id="fps-toggle"
                                checked={showFps}
                                onCheckedChange={setShowFps}
                            />
                        </div>
                    </div>

                    {/* Animation Speed */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>Speed</Label>
                            <span className="text-sm text-muted-foreground">{animationSpeed.toFixed(1)}x</span>
                        </div>
                        <Slider
                            min={0.1}
                            max={3}
                            step={0.1}
                            value={[animationSpeed]}
                            onValueChange={(v) => setAnimationSpeed(v[0])}
                        />
                    </div>

                    {/* Control Count */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label>Controls</Label>
                            <span className="text-sm text-muted-foreground">{controlCount}</span>
                        </div>
                        <Slider
                            min={16}
                            max={256}
                            step={16}
                            value={[controlCount]}
                            onValueChange={(v) => setControlCount(v[0])}
                        />
                    </div>

                    {/* Keybed Controls */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                            <Label htmlFor="keybed-toggle">Keybeds</Label>
                            <Switch
                                id="keybed-toggle"
                                checked={showKeybeds}
                                onCheckedChange={setShowKeybeds}
                            />
                        </div>
                        {showKeybeds && (
                            <Slider
                                min={1}
                                max={8}
                                step={1}
                                value={[keybedCount]}
                                onValueChange={(v) => setKeybedCount(v[0])}
                            />
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-3 pt-3 border-t border-zinc-300 dark:border-zinc-700">
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span><strong>{stats.knobs}</strong> Knobs</span>
                        <span>•</span>
                        <span><strong>{stats.vSliders}</strong> V-Sliders</span>
                        <span>•</span>
                        <span><strong>{stats.hSliders}</strong> H-Sliders</span>
                        <span>•</span>
                        <span><strong>{stats.buttons}</strong> Buttons</span>
                        {showKeybeds && (
                            <>
                                <span>•</span>
                                <span><strong>{stats.keybeds}</strong> Keybeds</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Keybeds Section */}
            {showKeybeds && (
                <div className="mb-4">
                    <h2 className="text-lg font-medium mb-2">Keybeds</h2>
                    <div className="flex flex-row flex-wrap gap-2">
                        {keybedConfigs.map((config, i) => (
                            <div key={`keybed-${i}`}>
                                <Keybed
                                    nbKeys={config.nbKeys}
                                    startKey={config.startKey}
                                    notesOn={keybedNotes[i] || []}
                                    color={config.color}
                                    size="xsmall"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Controls Grid */}
            <div className="mb-6">
                <h2 className="text-lg font-medium mb-2">Controls Grid</h2>
                <div
                    className="grid gap-2 p-3 border rounded-lg bg-zinc-100 dark:bg-zinc-900"
                    style={{ gridTemplateColumns: `repeat(${gridColCount}, minmax(0, 1fr))` }}
                >
                    {controlConfigs.map((config, i) => {
                        // Horizontal sliders span 2 columns, vertical sliders span 2 rows
                        const isHorizontal = config.type === "slider-h";
                        const isVertical = config.type === "slider-v";
                        
                        return (
                            <div
                                key={`control-${i}`}
                                className={`flex items-center justify-center ${
                                    isHorizontal ? "col-span-2" : ""
                                } ${isVertical ? "row-span-2" : ""}`}
                                style={{ 
                                    height: isHorizontal ? "45px" : isVertical ? "120px" : "60px",
                                    minWidth: isHorizontal ? "100px" : "50px"
                                }}
                            >
                                <AnimatedControl
                                    config={config}
                                    value={values[i] ?? 50}
                                    buttonValue={buttonValues[i] ?? false}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Description */}
            <div className="text-xs text-muted-foreground">
                <p>
                    Each control is modulated by a different LFO waveform (sine, triangle, sawtooth, square) to simulate real-time MIDI automation.
                    All components use CSS for layout and SVG for graphics.
                </p>
            </div>

            {/* FPS Display */}
            {showFps && (
                <div className="fixed bottom-4 right-4 bg-black/80 text-white px-4 py-3 rounded-lg font-mono text-base shadow-lg">
                    <span className={fps >= 50 ? "text-green-400" : fps >= 30 ? "text-yellow-400" : "text-red-400"}>
                        {fps}
                    </span>
                    <span className="text-zinc-400 ml-1">FPS</span>
                </div>
            )}
        </div>
    );
}

