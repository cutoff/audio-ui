/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import { useState } from "react";
import { Button } from "@cutoff/audio-ui-react";

export default function DragInteractionPage() {
    // Momentary button states
    const [momentary1, setMomentary1] = useState(false);
    const [momentary2, setMomentary2] = useState(false);
    const [momentary3, setMomentary3] = useState(false);

    // Toggle/Latch button states
    const [latch1, setLatch1] = useState(false);
    const [latch2, setLatch2] = useState(false);
    const [latch3, setLatch3] = useState(false);

    // Step sequencer grid (8x4 grid)
    const [sequencerSteps, setSequencerSteps] = useState<boolean[][]>(
        Array(4)
            .fill(null)
            .map(() => Array(8).fill(false))
    );

    const handleSequencerStep = (row: number, col: number, value: boolean) => {
        setSequencerSteps((prev) => {
            const newSteps = prev.map((r) => [...r]);
            newSteps[row][col] = value;
            return newSteps;
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 select-none">
            <h1 className="text-3xl font-bold mb-2">Drag Interaction Demo</h1>
            <p className="text-muted-foreground mb-8">
                This page demonstrates the new drag-in/drag-out behavior for boolean buttons. Press and drag across
                buttons to see how they respond!
            </p>

            {/* Momentary Buttons Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Momentary Buttons</h2>
                <div className="mb-4 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                    <p className="text-sm text-muted-foreground mb-2">
                        <strong>How it works:</strong>
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-4">
                        <li>Press inside a button → it turns on</li>
                        <li>Drag out while still pressed → it turns off</li>
                        <li>Drag back in while still pressed → it turns on again</li>
                        <li>Works even if you start pressing outside the button!</li>
                    </ul>
                    <p className="text-sm text-muted-foreground">
                        <strong>Try it:</strong> Press and hold outside the buttons, then drag across them. Each button
                        will turn on as you enter it and turn off as you leave it.
                    </p>
                </div>

                <div className="flex gap-4 items-center justify-center flex-wrap">
                    <div className="flex flex-col items-center gap-2">
                        <Button
                            adaptiveSize={false}
                            size="small"
                            latch={false}
                            value={momentary1}
                            onChange={(e) => setMomentary1(e.value as boolean)}
                            label="Momentary 1"
                        />
                        <span className="text-xs text-muted-foreground">{momentary1 ? "ON" : "OFF"}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Button
                            adaptiveSize={false}
                            size="small"
                            latch={false}
                            value={momentary2}
                            onChange={(e) => setMomentary2(e.value as boolean)}
                            label="Momentary 2"
                        />
                        <span className="text-xs text-muted-foreground">{momentary2 ? "ON" : "OFF"}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Button
                            adaptiveSize={false}
                            size="small"
                            latch={false}
                            value={momentary3}
                            onChange={(e) => setMomentary3(e.value as boolean)}
                            label="Momentary 3"
                        />
                        <span className="text-xs text-muted-foreground">{momentary3 ? "ON" : "OFF"}</span>
                    </div>
                </div>
            </div>

            {/* Toggle/Latch Buttons Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Toggle/Latch Buttons</h2>
                <div className="mb-4 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                    <p className="text-sm text-muted-foreground mb-2">
                        <strong>How it works:</strong>
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-4">
                        <li>Press inside a button → it toggles state</li>
                        <li>Drag out while still pressed → no change</li>
                        <li>Drag back in while still pressed → it toggles again</li>
                        <li>Works even if you start pressing outside the button!</li>
                    </ul>
                    <p className="text-sm text-muted-foreground">
                        <strong>Try it:</strong> Press and hold outside the buttons, then drag across them. Each button
                        will toggle its state each time you enter it while pressed.
                    </p>
                </div>

                <div className="flex gap-4 items-center justify-center flex-wrap">
                    <div className="flex flex-col items-center gap-2">
                        <Button
                            adaptiveSize={false}
                            size="small"
                            latch={true}
                            value={latch1}
                            onChange={(e) => setLatch1(e.value as boolean)}
                            label="Latch 1"
                        />
                        <span className="text-xs text-muted-foreground">{latch1 ? "ON" : "OFF"}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Button
                            adaptiveSize={false}
                            size="small"
                            latch={true}
                            value={latch2}
                            onChange={(e) => setLatch2(e.value as boolean)}
                            label="Latch 2"
                        />
                        <span className="text-xs text-muted-foreground">{latch2 ? "ON" : "OFF"}</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Button
                            adaptiveSize={false}
                            size="small"
                            latch={true}
                            value={latch3}
                            onChange={(e) => setLatch3(e.value as boolean)}
                            label="Latch 3"
                        />
                        <span className="text-xs text-muted-foreground">{latch3 ? "ON" : "OFF"}</span>
                    </div>
                </div>
            </div>

            {/* Step Sequencer Grid */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Step Sequencer Pattern</h2>
                <div className="mb-4 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                    <p className="text-sm text-muted-foreground mb-2">
                        <strong>Step Sequencer Behavior:</strong>
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                        This demonstrates the classic step sequencer interaction pattern. With a single press and drag,
                        you can activate multiple steps in a pattern. Perfect for programming drum patterns or melodic
                        sequences!
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>Press and drag across the grid to toggle steps on/off</li>
                        <li>Each step toggles when you enter it while pressed</li>
                        <li>You can start pressing outside the grid and drag in</li>
                        <li>Works horizontally, vertically, or diagonally!</li>
                    </ul>
                </div>

                <div className="flex flex-col items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 w-full">
                    {/* Row labels */}
                    <div className="grid grid-cols-[35px_repeat(8,minmax(0,1fr))] sm:grid-cols-[45px_repeat(8,minmax(0,1fr))] md:grid-cols-[60px_repeat(8,minmax(0,1fr))] lg:grid-cols-[80px_repeat(8,minmax(0,1fr))] gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-1 sm:px-2 md:px-4">
                        <div></div>
                        {Array.from({ length: 8 }, (_, i) => (
                            <div key={i} className="text-center text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">
                                {i + 1}
                            </div>
                        ))}
                    </div>

                    {/* Sequencer grid */}
                    {sequencerSteps.map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className="grid grid-cols-[35px_repeat(8,minmax(0,1fr))] sm:grid-cols-[45px_repeat(8,minmax(0,1fr))] md:grid-cols-[60px_repeat(8,minmax(0,1fr))] lg:grid-cols-[80px_repeat(8,minmax(0,1fr))] gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-1 sm:px-2 md:px-4"
                        >
                            <div className="flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">
                                {rowIndex + 1}
                            </div>
                            {row.map((step, colIndex) => (
                                <div key={colIndex} className="flex items-center justify-center aspect-square min-w-0">
                                    <Button
                                        adaptiveSize={true}
                                        latch={true}
                                        value={step}
                                        onChange={(e) => handleSequencerStep(rowIndex, colIndex, e.value as boolean)}
                                        label=""
                                    />
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Reset button */}
                    <button
                        onClick={() => {
                            setSequencerSteps(
                                Array(4)
                                    .fill(null)
                                    .map(() => Array(8).fill(false))
                            );
                        }}
                        className="px-4 py-2 text-sm border rounded-md hover:bg-accent transition-colors"
                    >
                        Clear Pattern
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="mt-12 p-6 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>
                            <strong>Drag-in behavior:</strong> Buttons respond even when you start pressing outside them
                        </span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>
                            <strong>Momentary buttons:</strong> Turn on when entered, turn off when left (while pressed)
                        </span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>
                            <strong>Toggle/Latch buttons:</strong> Toggle state each time you enter them (while pressed)
                        </span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>
                            <strong>Step sequencer pattern:</strong> Program entire patterns with a single drag gesture
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
