/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import { describe, it } from "vitest";
import { render, act } from "@testing-library/react";
import MixerGridScene, { MIXER_GRID_KNOB_COUNT, type MixerGridSceneHandle } from "./scenes/MixerGridScene";
import { assertRenderCounts, createRenderCounter } from "./helpers/renderCounter";

// Baselines: inline expected update counts per profiled id after each trigger.
// Update intentionally when scene shape or component memoization changes.
// Run in strict mode via `RENDER_COUNT_STRICT=1 pnpm test` to convert divergence
// into hard failures.

function zeroKnobs(): Record<string, number> {
    return Object.fromEntries(Array.from({ length: MIXER_GRID_KNOB_COUNT }, (_, i) => [`knob-${i}`, 0]));
}

const BASELINE_VALUE_CHANGE: Record<string, number> = {
    ...zeroKnobs(),
    "knob-0": 1,
    "scene-root": 1,
};

const BASELINE_PARENT_RERENDER: Record<string, number> = {
    ...zeroKnobs(),
    "scene-root": 1,
};

const BASELINE_THEME_TOGGLE: Record<string, number> = {
    ...zeroKnobs(),
    "scene-root": 1,
};

const BASELINE_RESIZE: Record<string, number> = {
    ...zeroKnobs(),
    "scene-root": 1,
};

describe("MixerGridScene render counts", () => {
    it("value change on knob-0 updates only knob-0", () => {
        const { record, getCounts, reset } = createRenderCounter();
        const ref = React.createRef<MixerGridSceneHandle>();
        render(<MixerGridScene ref={ref} record={record} />);
        reset();

        act(() => ref.current!.setControlValue(0, 0.75));

        assertRenderCounts(getCounts(), BASELINE_VALUE_CHANGE, "value change knob-0");
    });

    it("parent re-render leaves all knobs at 0 updates", () => {
        const { record, getCounts, reset } = createRenderCounter();
        const ref = React.createRef<MixerGridSceneHandle>();
        render(<MixerGridScene ref={ref} record={record} />);
        reset();

        act(() => ref.current!.bumpParent());

        assertRenderCounts(getCounts(), BASELINE_PARENT_RERENDER, "parent re-render");
    });

    it("theme toggle leaves all knobs at 0 updates", () => {
        const { record, getCounts, reset } = createRenderCounter();
        const ref = React.createRef<MixerGridSceneHandle>();
        render(<MixerGridScene ref={ref} record={record} />);
        reset();

        act(() => ref.current!.setTheme("#d93333"));

        assertRenderCounts(getCounts(), BASELINE_THEME_TOGGLE, "theme toggle");
    });

    it("container resize leaves all knobs at 0 updates", () => {
        const { record, getCounts, reset } = createRenderCounter();
        const ref = React.createRef<MixerGridSceneHandle>();
        render(<MixerGridScene ref={ref} record={record} />);
        reset();

        act(() => ref.current!.setSize(800, 500));

        assertRenderCounts(getCounts(), BASELINE_RESIZE, "container resize");
    });
});
