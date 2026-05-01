/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import React from "react";
import Button from "../../../src/components/defaults/controls/Button";
import { trackRenders, useRecordRootRenders, type RecordFn } from "../helpers/renderCounter";

export const STEP_COUNT = 8;

/**
 * Imperative handle exposed by {@link StepSequencerRowScene} for driving the
 * four render-count test triggers from tests without simulating DOM gestures.
 */
export interface StepSequencerRowSceneHandle {
    /** Toggles a single step; all other steps keep their current state. */
    setControlValue: (idx: number, value: boolean) => void;
    /** Sets the scene-root's `--audioui-primary-color` CSS variable. */
    setTheme: (color: string) => void;
    /** Bumps an otherwise-unread counter to force a parent re-render with no prop changes. */
    bumpParent: () => void;
    /** Replaces the scene-root's inline width/height. */
    setSize: (width: number, height: number) => void;
}

interface StepSequencerRowSceneProps {
    record: RecordFn;
}

const TrackedButton = trackRenders(Button);

/**
 * Test fixture: an 8-step latching button row (classic step-sequencer pattern)
 * used by `step-sequencer-row.test.tsx` to verify that toggling one step does
 * not re-render the other seven — the specific regression behind issue #35.
 */
const StepSequencerRowScene = React.forwardRef<StepSequencerRowSceneHandle, StepSequencerRowSceneProps>(
    function StepSequencerRowScene({ record }, ref) {
        useRecordRootRenders(record, "scene-root");

        const [steps, setSteps] = React.useState<boolean[]>(() => Array.from({ length: STEP_COUNT }, () => false));
        const [themeColor, setThemeColor] = React.useState<string>("#7ae24a");
        const [size, setSize] = React.useState<{ w: number; h: number }>({ w: 640, h: 80 });
        const [, setParentTick] = React.useState(0);

        React.useImperativeHandle(ref, () => ({
            setControlValue: (idx, value) => {
                setSteps((prev) => {
                    if (prev[idx] === value) return prev;
                    const next = prev.slice();
                    next[idx] = value;
                    return next;
                });
            },
            setTheme: (color) => setThemeColor(color),
            bumpParent: () => setParentTick((t) => t + 1),
            setSize: (w, h) => setSize({ w, h }),
        }));

        const setters = React.useMemo(
            () =>
                Array.from({ length: STEP_COUNT }, (_, i) => (v: boolean) => {
                    setSteps((prev) => {
                        if (prev[i] === v) return prev;
                        const next = prev.slice();
                        next[i] = v;
                        return next;
                    });
                }),
            []
        );

        const labels = React.useMemo(() => Array.from({ length: STEP_COUNT }, (_, i) => `S${i + 1}`), []);

        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${STEP_COUNT}, 1fr)`,
                    gap: 6,
                    width: size.w,
                    height: size.h,
                    ["--audioui-primary-color" as string]: themeColor,
                }}
            >
                {steps.map((v, i) => (
                    <TrackedButton
                        key={i}
                        trackId={`step-${i}`}
                        record={record}
                        value={v}
                        onValueChange={setters[i]}
                        label={labels[i]}
                        latch
                    />
                ))}
            </div>
        );
    }
);

export default StepSequencerRowScene;
