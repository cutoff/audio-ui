/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import { useMemo, useState } from "react";
import { Button, Knob, Slider as AudioSlider } from "@cutoff/audio-ui-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

function ControlSurfacePage() {
    // State for global customization controls (camera / transform)
    const [zoom, setZoom] = useState(1);
    const [perspectiveX, setPerspectiveX] = useState(0);
    const [perspectiveY, setPerspectiveY] = useState(0);

    // Simple 4‑channel mixer state
    type ChannelId = 1 | 2 | 3 | 4;

    // Fader scale in dB for a more realistic audio feel
    const FADER_MIN_DB = -60;
    const FADER_MAX_DB = 0;

    const [channelFaderDb, setChannelFaderDb] = useState<Record<ChannelId, number>>({
        1: 0,
        2: -3,
        3: -6,
        4: -9,
    });

    const [channelPans, setChannelPans] = useState<Record<ChannelId, number>>({
        1: -0.4,
        2: -0.25,
        3: 0.25,
        4: 0.4,
    });

    const [channelGains, setChannelGains] = useState<Record<ChannelId, number>>({
        1: 0,
        2: -3,
        3: 3,
        4: 6,
    });

    const [channelMutes, setChannelMutes] = useState<Record<ChannelId, boolean>>({
        1: false,
        2: false,
        3: false,
        4: false,
    });

    const [channelSolos, setChannelSolos] = useState<Record<ChannelId, boolean>>({
        1: false,
        2: false,
        3: false,
        4: false,
    });

    const [masterFaderDb, setMasterFaderDb] = useState(-1.5);
    const [masterPan, setMasterPan] = useState(0);

    const channelIds: ChannelId[] = useMemo(() => [1, 2, 3, 4], []);

    // Helpers for realistic audio-style scales (used for meters and readouts)
    // dbToLinear is needed because visual meters represent Linear Amplitude (energy),
    // while the Fader control operates in the dB domain (logarithmic perception).
    const dbToLinear = (db: number) => {
        if (db <= FADER_MIN_DB) return 0;
        const clamped = Math.min(db, FADER_MAX_DB);
        return Math.pow(10, clamped / 20);
    };

    const formatDb = (db: number) => {
        if (db <= FADER_MIN_DB) return "-\u221e dB";
        if (db === 0) return "0 dB";
        return `${db > 0 ? "+" : ""}${db.toFixed(1)} dB`;
    };

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
                <h2 className="text-xl font-medium mb-2">Mixer-Style Control Surface</h2>
                <p className="mb-6 text-sm text-muted-foreground">
                    Each channel combines a bipolar pan knob, a gain/trim knob, a level fader and mute/solo buttons.
                    Knobs use meaningful scales and units instead of raw 0‑100 values.
                </p>
                <div className="border rounded-lg bg-zinc-100 dark:bg-zinc-900 p-4 md:p-8 flex justify-center items-center h-[560px]">
                    <div
                        className="grid grid-cols-[repeat(4,minmax(0,1fr))_0.08fr] grid-rows-[auto_1fr_auto] gap-4 w-full max-w-5xl h-full"
                        style={controlSurfaceStyle}
                    >
                        {/* Per‑channel strips */}
                        {channelIds.map((id) => (
                            <div
                                key={id}
                                className="flex flex-col items-stretch gap-3 border border-zinc-200/70 dark:border-zinc-800/70 rounded-md px-3 py-3"
                            >
                                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                    <span>CH {id}</span>
                                    <span className="tabular-nums">{formatDb(channelFaderDb[id])}</span>
                                </div>

                                {/* Top row: Pan + Trim / Gain */}
                                <div className="grid grid-cols-2 gap-2 h-[96px]">
                                    <Knob
                                        adaptiveSize={true}
                                        label="Pan"
                                        bipolar={true}
                                        min={-1}
                                        max={1}
                                        step={0.02}
                                        value={channelPans[id]}
                                        onChange={(e) =>
                                            setChannelPans((prev) => ({ ...prev, [id]: e.value as number }))
                                        }
                                        // Display as L / C / R with percentage
                                        valueFormatter={(val) => {
                                            if (val === 0) return "C";
                                            const side = (val as number) < 0 ? "L" : "R";
                                            const pct = Math.round(Math.abs(val as number) * 100);
                                            return `${side}${pct}`;
                                        }}
                                    />
                                    <Knob
                                        adaptiveSize={true}
                                        label="Gain"
                                        min={-12}
                                        max={12}
                                        step={0.5}
                                        value={channelGains[id]}
                                        unit="dB"
                                        onChange={(e) =>
                                            setChannelGains((prev) => ({ ...prev, [id]: e.value as number }))
                                        }
                                        valueFormatter={(val, parameterDef) => {
                                            const v = val as number;
                                            if (parameterDef.type !== "continuous") return undefined;
                                            const { min, max } = parameterDef;
                                            if (v === 0) return "0 dB";
                                            if (v === min) return `${v.toFixed(0)} dB`;
                                            if (v === max) return `${v.toFixed(0)} dB`;
                                            return `${v > 0 ? "+" : ""}${v.toFixed(1)} dB`;
                                        }}
                                    />
                                </div>

                                {/* Fader */}
                                <div className="flex flex-1 items-stretch">
                                    <div className="flex-1 flex items-center justify-center">
                                        <AudioSlider
                                            adaptiveSize={false}
                                            size="large"
                                            orientation="vertical"
                                            label="Level"
                                            min={FADER_MIN_DB}
                                            max={FADER_MAX_DB}
                                            step={0.5}
                                            value={channelFaderDb[id]}
                                            unit="dB"
                                            onChange={(e) =>
                                                setChannelFaderDb((prev) => ({ ...prev, [id]: e.value as number }))
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Transport buttons for the channel */}
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        adaptiveSize={true}
                                        latch={true}
                                        value={channelMutes[id]}
                                        onChange={(e) =>
                                            setChannelMutes((prev) => ({ ...prev, [id]: e.value as boolean }))
                                        }
                                        label="Mute"
                                    />
                                    <Button
                                        adaptiveSize={true}
                                        latch={true}
                                        value={channelSolos[id]}
                                        onChange={(e) =>
                                            setChannelSolos((prev) => ({ ...prev, [id]: e.value as boolean }))
                                        }
                                        label="Solo"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Master section */}
                        <div className="flex flex-col items-stretch gap-3 border border-zinc-200/70 dark:border-zinc-800/70 rounded-md px-3 py-3">
                            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                                <span>MASTER</span>
                                <span className="tabular-nums">{formatDb(masterFaderDb)}</span>
                            </div>

                            <div className="grid grid-cols-1 gap-2 h-[96px]">
                                <Knob
                                    adaptiveSize={true}
                                    label="Pan"
                                    bipolar={true}
                                    min={-1}
                                    max={1}
                                    step={0.02}
                                    value={masterPan}
                                    onChange={(e) => setMasterPan(e.value as number)}
                                    valueFormatter={(val) => {
                                        if (val === 0) return "C";
                                        const side = (val as number) < 0 ? "L" : "R";
                                        const pct = Math.round(Math.abs(val as number) * 100);
                                        return `${side}${pct}`;
                                    }}
                                />
                            </div>

                            <div className="flex flex-1 items-stretch">
                                <div className="flex-1 flex items-center justify-center">
                                    <AudioSlider
                                        adaptiveSize={false}
                                        size="large"
                                        orientation="vertical"
                                        label="Level"
                                        min={FADER_MIN_DB}
                                        max={FADER_MAX_DB}
                                        step={0.5}
                                        value={masterFaderDb}
                                        unit="dB"
                                        onChange={(e) => setMasterFaderDb(e.value as number)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                <Button
                                    adaptiveSize={true}
                                    latch={true}
                                    value={false}
                                    onChange={() => {
                                        // no-op, just shows the visual style
                                    }}
                                    label="Rec"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 border rounded-lg bg-zinc-100 dark:bg-zinc-900">
                <h2 className="text-xl font-medium mb-4">Mixer State</h2>
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                    {/* Channel overview */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium mb-2">Channels</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs md:text-sm">
                            {channelIds.map((id) => (
                                <div
                                    key={`state-${id}`}
                                    className="rounded-md border border-zinc-200/60 dark:border-zinc-800/70 px-2 py-1.5 space-y-1"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-xs">CH {id}</span>
                                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                            {channelMutes[id] ? "M" : channelSolos[id] ? "S" : "\u00A0"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 tabular-nums">
                                        <span className="text-muted-foreground">Pan</span>
                                        <span className="text-right">
                                            {channelPans[id] === 0
                                                ? "C"
                                                : channelPans[id] < 0
                                                  ? `L${Math.abs(channelPans[id])}`
                                                  : `R${channelPans[id]}`}
                                        </span>
                                        <span className="text-muted-foreground">Gain</span>
                                        <span className="text-right">
                                            {channelGains[id] > 0
                                                ? `+${channelGains[id].toFixed(1)} dB`
                                                : `${channelGains[id].toFixed(1)} dB`}
                                        </span>
                                        <span className="text-muted-foreground">Level</span>
                                        <span className="text-right">{formatDb(channelFaderDb[id])}</span>
                                    </div>
                                    <div className="mt-1 h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-emerald-500"
                                            style={{ width: `${Math.round(dbToLinear(channelFaderDb[id]) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Master overview */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium mb-2">Master</h3>
                        <div className="rounded-md border border-zinc-200/60 dark:border-zinc-800/70 px-3 py-2 text-sm tabular-nums space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Output</span>
                                <span className="text-xs text-muted-foreground">Mixer Sum</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Pan</span>
                                <span>
                                    {masterPan === 0
                                        ? "C"
                                        : masterPan < 0
                                          ? `L${Math.abs(masterPan)}`
                                          : `R${masterPan}`}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Level</span>
                                <span>{formatDb(masterFaderDb)}</span>
                            </div>
                            <div className="mt-1.5 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-emerald-500"
                                    style={{ width: `${Math.round(dbToLinear(masterFaderDb) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-sm text-muted-foreground">
                <p>
                    This demo showcases a mixer-style control surface built from AudioUI components: bipolar knobs
                    (pan), gain knobs with dB units, vertical sliders for channel and master levels, simple level meters
                    and latch buttons for mute/solo.
                </p>
                <p>Use the controls at the top of the page to adjust the zoom and perspective of the surface.</p>
                <p>
                    All knobs, sliders, and buttons are editable. For knobs and sliders, use the mouse wheel to change
                    their values. For buttons, click to toggle their state.
                </p>
            </div>
        </div>
    );
}

export default ControlSurfacePage;
