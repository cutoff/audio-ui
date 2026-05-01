/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import React from "react";
import Knob from "../../../src/components/defaults/controls/Knob";
import { trackRenders, useRecordRootRenders, type RecordFn } from "../helpers/renderCounter";

export const MIXER_GRID_KNOB_COUNT = 8;

/**
 * Imperative handle exposed by {@link MixerGridScene} for driving the four
 * render-count test triggers from tests without simulating DOM gestures.
 */
export interface MixerGridSceneHandle {
    /** Updates a single knob's value; all other knobs keep their current value. */
    setControlValue: (idx: number, value: number) => void;
    /** Sets the scene-root's `--audioui-primary-color` CSS variable. */
    setTheme: (color: string) => void;
    /** Bumps an otherwise-unread counter to force a parent re-render with no prop changes. */
    bumpParent: () => void;
    /** Replaces the scene-root's inline width/height. */
    setSize: (width: number, height: number) => void;
}

interface MixerGridSceneProps {
    record: RecordFn;
}

const TrackedKnob = trackRenders(Knob);

/**
 * Test fixture: an 8-knob mixer grid used by `mixer-grid.test.tsx` to verify
 * that parent re-renders, theme toggles, and container resizes do not cause
 * any Knob to re-render.
 */
const MixerGridScene = React.forwardRef<MixerGridSceneHandle, MixerGridSceneProps>(function MixerGridScene(
    { record },
    ref
) {
    useRecordRootRenders(record, "scene-root");

    const [values, setValues] = React.useState<number[]>(() =>
        Array.from({ length: MIXER_GRID_KNOB_COUNT }, () => 0.5)
    );
    const [themeColor, setThemeColor] = React.useState<string>("#4a90e2");
    const [size, setSize] = React.useState<{ w: number; h: number }>({ w: 600, h: 400 });
    const [, setParentTick] = React.useState(0);

    React.useImperativeHandle(ref, () => ({
        setControlValue: (idx, value) => {
            setValues((prev) => {
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
            Array.from({ length: MIXER_GRID_KNOB_COUNT }, (_, i) => (v: number) => {
                setValues((prev) => {
                    if (prev[i] === v) return prev;
                    const next = prev.slice();
                    next[i] = v;
                    return next;
                });
            }),
        []
    );

    const labels = React.useMemo(() => Array.from({ length: MIXER_GRID_KNOB_COUNT }, (_, i) => `K${i}`), []);

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
                width: size.w,
                height: size.h,
                ["--audioui-primary-color" as string]: themeColor,
            }}
        >
            {values.map((v, i) => (
                <TrackedKnob
                    key={i}
                    trackId={`knob-${i}`}
                    record={record}
                    value={v}
                    min={0}
                    max={1}
                    onValueChange={setters[i]}
                    label={labels[i]}
                />
            ))}
        </div>
    );
});

export default MixerGridScene;
