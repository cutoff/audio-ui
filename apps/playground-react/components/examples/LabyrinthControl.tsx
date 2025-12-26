"use client";

import { useMemo } from "react";
import { RevealingPath, ControlComponentViewProps, ControlComponent } from "@cutoff/audio-ui-react";

export type LabyrinthControlProps = ControlComponentViewProps;

/**
 * A control component that renders a labyrinth maze with a revealing solution path.
 * The solution path is revealed based on the normalizedValue prop (0..1).
 */
function LabyrinthControl(props: LabyrinthControlProps) {
    const { normalizedValue, className, style } = props;

    // ============================================================================
    // Grid Configuration
    // ============================================================================
    const GRID_SIZE = 10;
    const CELL_SIZE = 40;

    // ============================================================================
    // Solution Path Geometry
    // ============================================================================
    // SVG path data for the solution route through the maze (from start to finish)
    const solutionPathData = [
        "M 0 220",
        "L 140 220", "L 140 260", "L 180 260", "L 180 180", "L 140 180", "L 140 140", "L 220 140", "L 220 100",
        "L 180 100", "L 180 60", "L 220 60", "L 220 20", "L 300 20", "L 300 60", "L 260 60", "L 260 140", "L 300 140",
        "L 300 100", "L 340 100", "L 340 180", "L 220 180", "L 220 220", "L 300 220", "L 300 260", "L 340 260",
        "L 340 220", "L 380 220", "L 380 180", "L 400 180"
    ].join(" ");

    // ============================================================================
    // Maze Passages (Walls to Remove)
    // ============================================================================
    // These define which walls are removed to create the maze passages.
    // Format: "v-x-y" = Vertical wall at grid line x (0..10), row y (0..9)
    //         "h-y-x" = Horizontal wall at grid line y (0..10), col x (0..9)
    // Note: Grid lines are between cells. x=1 is between col 0 and 1.
    const passages = [
        // Vertical walls (grouped by grid line)
        ...["v-0-5"],
        ...["v-1-0", "v-1-2", "v-1-3", "v-1-5", "v-1-7", "v-1-8"],
        ...["v-2-0", "v-2-4", "v-2-5", "v-2-6", "v-2-9"],
        ...["v-3-0", "v-3-2", "v-3-3", "v-3-5", "v-3-7"],
        ...["v-4-0", "v-4-3", "v-4-4", "v-4-6", "v-4-7", "v-4-8", "v-4-9"],
        ...["v-5-1", "v-5-2", "v-5-3", "v-5-8", "v-5-9"],
        ...["v-6-0", "v-6-4", "v-6-5", "v-6-6", "v-6-7", "v-6-9"],
        ...["v-7-0", "v-7-1", "v-7-3", "v-7-4", "v-7-5", "v-7-7"],
        ...["v-8-0", "v-8-2", "v-8-4", "v-8-6", "v-8-8", "v-8-9"],
        ...["v-9-1", "v-9-2", "v-9-5", "v-9-7", "v-9-8", "v-9-9"],
        ...["v-10-4"],

        // Horizontal walls (grouped by grid line)
        ...["h-1-0", "h-1-1", "h-1-2", "h-1-5", "h-1-7", "h-1-8", "h-1-9"],
        ...["h-2-1", "h-2-2", "h-2-3", "h-2-4", "h-2-6"],
        ...["h-3-0", "h-3-2", "h-3-5", "h-3-6", "h-3-7", "h-3-8", "h-3-9"],
        ...["h-4-1", "h-4-3", "h-4-8"],
        ...["h-5-0", "h-5-4", "h-5-5", "h-5-9"],
        ...["h-6-2", "h-6-3", "h-6-4", "h-6-7", "h-6-8"],
        ...["h-7-0", "h-7-1", "h-7-5", "h-7-9"],
        ...["h-8-0", "h-8-2", "h-8-3", "h-8-6", "h-8-7", "h-8-9"],
        ...["h-9-0", "h-9-1", "h-9-2", "h-9-5", "h-9-6", "h-9-7"],
    ];

    // ============================================================================
    // Wall Path Generation
    // ============================================================================
    // Generate SVG path data for all walls (excluding passages)
    const wallsPath = useMemo(() => {
        const paths: string[] = [];
        const passagesSet = new Set(passages);

        // Generate vertical wall segments
        // Grid lines run vertically at x = column * CELL_SIZE
        for (let col = 0; col < GRID_SIZE + 1; col++) {
            for (let row = 0; row < GRID_SIZE; row++) {
                const wallId = `v-${col}-${row}`;
                if (!passagesSet.has(wallId)) {
                    const x = col * CELL_SIZE;
                    const yStart = row * CELL_SIZE;
                    const yEnd = (row + 1) * CELL_SIZE;
                    paths.push(`M ${x} ${yStart} V ${yEnd}`);
                }
            }
        }

        // Generate horizontal wall segments
        // Grid lines run horizontally at y = row * CELL_SIZE
        for (let row = 0; row < GRID_SIZE + 1; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                const wallId = `h-${row}-${col}`;
                if (!passagesSet.has(wallId)) {
                    const y = row * CELL_SIZE;
                    const xStart = col * CELL_SIZE;
                    const xEnd = (col + 1) * CELL_SIZE;
                    paths.push(`M ${xStart} ${y} H ${xEnd}`);
                }
            }
        }

        return paths.join(" ");
    }, []);

    // ============================================================================
    // SVG ViewBox Configuration
    // ============================================================================
    const STROKE_WIDTH = 8;
    const PADDING = STROKE_WIDTH / 2; // Half stroke extends outside content area
    const VIEWBOX_SIZE = 400 + STROKE_WIDTH; // Expand to show full stroke at edges
    const VIEWBOX_OFFSET = -PADDING; // Shift origin to include stroke overflow

    // ============================================================================
    // Render
    // ============================================================================
    return (
        <svg 
            viewBox={`${VIEWBOX_OFFSET} ${VIEWBOX_OFFSET} ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} 
            className={className}
            style={{ strokeLinecap: "square", strokeLinejoin: "miter", ...style }}
        >
            {/* Maze walls */}
            <path 
                d={wallsPath} 
                fill="none" 
                stroke="currentColor" 
                strokeWidth={STROKE_WIDTH} 
                className="text-slate-900 dark:text-slate-100"
            />

            {/* Solution path (revealed progressively based on normalizedValue) */}
            <RevealingPath
                d={solutionPathData}
                normalizedValue={normalizedValue}
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] mix-blend-multiply dark:mix-blend-screen"
            />
        </svg>
    );
}

/**
 * ViewBox dimensions for the LabyrinthControl component.
 * The parent component should use these values when setting up the SVG container.
 */
LabyrinthControl.viewBox = {
    width: 400,
    height: 400,
};

/**
 * Label height for the LabyrinthControl component.
 */
LabyrinthControl.labelHeightUnits = 20;

/**
 * Interaction contract for the LabyrinthControl component.
 */
LabyrinthControl.interaction = {
    mode: "both",
    direction: "vertical",
};

export default LabyrinthControl as ControlComponent;

