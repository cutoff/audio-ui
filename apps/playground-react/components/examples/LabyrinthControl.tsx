/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import { useMemo } from "react";
import { RevealingPath, ControlComponentViewProps, ControlComponent } from "@cutoff/audio-ui-react";

export type LabyrinthControlViewProps = ControlComponentViewProps;

// ============================================================================
// Constants (moved outside component to prevent recreation on every render)
// ============================================================================
const GRID_SIZE = 10;
const CELL_SIZE = 40;
const STROKE_WIDTH = 8;
const PADDING = STROKE_WIDTH / 2; // Half stroke extends outside content area

// ============================================================================
// Solution Path Geometry (precomputed once)
// ============================================================================
// SVG path data for the solution route through the maze (from start to finish)
// Coordinates are offset by PADDING to account for viewBox expansion
const SOLUTION_PATH_DATA = [
    `M ${0 + PADDING} ${220 + PADDING}`,
    `L ${140 + PADDING} ${220 + PADDING}`,
    `L ${140 + PADDING} ${260 + PADDING}`,
    `L ${180 + PADDING} ${260 + PADDING}`,
    `L ${180 + PADDING} ${180 + PADDING}`,
    `L ${140 + PADDING} ${180 + PADDING}`,
    `L ${140 + PADDING} ${140 + PADDING}`,
    `L ${220 + PADDING} ${140 + PADDING}`,
    `L ${220 + PADDING} ${100 + PADDING}`,
    `L ${180 + PADDING} ${100 + PADDING}`,
    `L ${180 + PADDING} ${60 + PADDING}`,
    `L ${220 + PADDING} ${60 + PADDING}`,
    `L ${220 + PADDING} ${20 + PADDING}`,
    `L ${300 + PADDING} ${20 + PADDING}`,
    `L ${300 + PADDING} ${60 + PADDING}`,
    `L ${260 + PADDING} ${60 + PADDING}`,
    `L ${260 + PADDING} ${140 + PADDING}`,
    `L ${300 + PADDING} ${140 + PADDING}`,
    `L ${300 + PADDING} ${100 + PADDING}`,
    `L ${340 + PADDING} ${100 + PADDING}`,
    `L ${340 + PADDING} ${180 + PADDING}`,
    `L ${220 + PADDING} ${180 + PADDING}`,
    `L ${220 + PADDING} ${220 + PADDING}`,
    `L ${300 + PADDING} ${220 + PADDING}`,
    `L ${300 + PADDING} ${260 + PADDING}`,
    `L ${340 + PADDING} ${260 + PADDING}`,
    `L ${340 + PADDING} ${220 + PADDING}`,
    `L ${380 + PADDING} ${220 + PADDING}`,
    `L ${380 + PADDING} ${180 + PADDING}`,
    `L ${400 + PADDING} ${180 + PADDING}`,
].join(" ");

// ============================================================================
// Maze Passages (Walls to Remove) - precomputed once
// ============================================================================
// These define which walls are removed to create the maze passages.
// Format: "v-x-y" = Vertical wall at grid line x (0..10), row y (0..9)
//         "h-y-x" = Horizontal wall at grid line y (0..10), col x (0..9)
// Note: Grid lines are between cells. x=1 is between col 0 and 1.
//
// prettier-ignore
const PASSAGES = [
    // Vertical walls (grouped by grid line)
    "v-0-5",
    "v-1-0", "v-1-2", "v-1-3", "v-1-5", "v-1-7", "v-1-8",
    "v-2-0", "v-2-4", "v-2-5", "v-2-6", "v-2-9",
    "v-3-0", "v-3-2", "v-3-3", "v-3-5", "v-3-7",
    "v-4-0", "v-4-3", "v-4-4", "v-4-6", "v-4-7", "v-4-8", "v-4-9",
    "v-5-1", "v-5-2", "v-5-3", "v-5-8", "v-5-9",
    "v-6-0", "v-6-4", "v-6-5", "v-6-6", "v-6-7", "v-6-9",
    "v-7-0", "v-7-1", "v-7-3", "v-7-4", "v-7-5", "v-7-7",
    "v-8-0", "v-8-2", "v-8-4", "v-8-6", "v-8-8", "v-8-9",
    "v-9-1", "v-9-2", "v-9-5", "v-9-7", "v-9-8", "v-9-9",
    "v-10-4",

    // Horizontal walls (grouped by grid line)
    "h-1-0", "h-1-1", "h-1-2", "h-1-5", "h-1-7", "h-1-8", "h-1-9",
    "h-2-1", "h-2-2", "h-2-3", "h-2-4", "h-2-6",
    "h-3-0", "h-3-2", "h-3-5", "h-3-6", "h-3-7", "h-3-8", "h-3-9",
    "h-4-1", "h-4-3", "h-4-8",
    "h-5-0", "h-5-4", "h-5-5", "h-5-9",
    "h-6-2", "h-6-3", "h-6-4", "h-6-7", "h-6-8",
    "h-7-0", "h-7-1", "h-7-5", "h-7-9",
    "h-8-0", "h-8-2", "h-8-3", "h-8-6", "h-8-7", "h-8-9",
    "h-9-0", "h-9-1", "h-9-2", "h-9-5", "h-9-6", "h-9-7",
];

// Precompute passages Set once (O(1) lookups)
const PASSAGES_SET = new Set(PASSAGES);

// ============================================================================
// Wall Path Geometry (precomputed once at module load)
// ============================================================================
// Generate SVG path data for all walls (excluding passages)
// Calculated once at module load since all inputs are constants
const WALLS_PATH_DATA = (() => {
    const paths: string[] = [];

    // Generate vertical wall segments
    for (let col = 0; col < GRID_SIZE + 1; col++) {
        for (let row = 0; row < GRID_SIZE; row++) {
            const wallId = `v-${col}-${row}`;
            if (!PASSAGES_SET.has(wallId)) {
                const x = col * CELL_SIZE + PADDING;
                const yStart = row * CELL_SIZE + PADDING;
                const yEnd = (row + 1) * CELL_SIZE + PADDING;
                paths.push(`M ${x} ${yStart} V ${yEnd}`);
            }
        }
    }

    // Generate horizontal wall segments
    for (let row = 0; row < GRID_SIZE + 1; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const wallId = `h-${row}-${col}`;
            if (!PASSAGES_SET.has(wallId)) {
                const y = row * CELL_SIZE + PADDING;
                const xStart = col * CELL_SIZE + PADDING;
                const xEnd = (col + 1) * CELL_SIZE + PADDING;
                paths.push(`M ${xStart} ${y} H ${xEnd}`);
            }
        }
    }

    return paths.join(" ");
})();

/**
 * A control component that renders a labyrinth maze with a revealing solution path.
 * The solution path is revealed based on the normalizedValue prop (0..1).
 */
function LabyrinthControl({ normalizedValue, className, style }: LabyrinthControlViewProps) {
    // Memoize style object to prevent recreation on every render
    const groupStyle = useMemo(() => {
        return { strokeLinecap: "square" as const, strokeLinejoin: "miter" as const, ...style };
    }, [style]);

    return (
        <g className={className} style={groupStyle}>
            {/* Maze walls */}
            <path
                d={WALLS_PATH_DATA}
                fill="none"
                stroke="currentColor"
                strokeWidth={8}
                className="text-slate-900 dark:text-slate-100"
            />

            {/* Solution path (revealed progressively based on normalizedValue) */}
            <RevealingPath
                d={SOLUTION_PATH_DATA}
                normalizedValue={normalizedValue}
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] mix-blend-multiply dark:mix-blend-screen"
            />
        </g>
    );
}

/**
 * ViewBox dimensions for the LabyrinthControlView component.
 */
LabyrinthControl.viewBox = {
    width: 400 + 8, // 408 to include stroke overflow (8px stroke / 2 = 4px padding on each side)
    height: 400 + 8, // 408 to include stroke overflow
};

/**
 * Label height for the LabyrinthControlView component.
 */
LabyrinthControl.labelHeightUnits = 40;

/**
 * Interaction contract for the LabyrinthControlView component.
 */
LabyrinthControl.interaction = {
    mode: "both",
    direction: "both",
};

/**
 * Metadata for the LabyrinthControlView component.
 */
LabyrinthControl.title = "Maze Control";
LabyrinthControl.description =
    "A maze with a path revealing as the value increases (RevealingPath primitive), showcasing limitless creativity for component design.";

export default LabyrinthControl as ControlComponent;
