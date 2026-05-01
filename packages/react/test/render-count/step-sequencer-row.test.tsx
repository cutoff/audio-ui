/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import { describe, it } from "vitest";
import { render, act } from "@testing-library/react";
import StepSequencerRowScene, { STEP_COUNT, type StepSequencerRowSceneHandle } from "./scenes/StepSequencerRowScene";
import { assertRenderCounts, createRenderCounter } from "./helpers/renderCounter";

function zeroSteps(): Record<string, number> {
    return Object.fromEntries(Array.from({ length: STEP_COUNT }, (_, i) => [`step-${i}`, 0]));
}

const BASELINE_VALUE_CHANGE: Record<string, number> = {
    ...zeroSteps(),
    "step-3": 1,
    "scene-root": 1,
};

const BASELINE_PARENT_RERENDER: Record<string, number> = {
    ...zeroSteps(),
    "scene-root": 1,
};

const BASELINE_THEME_TOGGLE: Record<string, number> = {
    ...zeroSteps(),
    "scene-root": 1,
};

const BASELINE_RESIZE: Record<string, number> = {
    ...zeroSteps(),
    "scene-root": 1,
};

describe("StepSequencerRowScene render counts", () => {
    it("toggling step-3 updates only step-3", () => {
        const { record, getCounts, reset } = createRenderCounter();
        const ref = React.createRef<StepSequencerRowSceneHandle>();
        render(<StepSequencerRowScene ref={ref} record={record} />);
        reset();

        act(() => ref.current!.setControlValue(3, true));

        assertRenderCounts(getCounts(), BASELINE_VALUE_CHANGE, "value change step-3");
    });

    it("parent re-render leaves all steps at 0 updates", () => {
        const { record, getCounts, reset } = createRenderCounter();
        const ref = React.createRef<StepSequencerRowSceneHandle>();
        render(<StepSequencerRowScene ref={ref} record={record} />);
        reset();

        act(() => ref.current!.bumpParent());

        assertRenderCounts(getCounts(), BASELINE_PARENT_RERENDER, "parent re-render");
    });

    it("theme toggle leaves all steps at 0 updates", () => {
        const { record, getCounts, reset } = createRenderCounter();
        const ref = React.createRef<StepSequencerRowSceneHandle>();
        render(<StepSequencerRowScene ref={ref} record={record} />);
        reset();

        act(() => ref.current!.setTheme("#4ae2a0"));

        assertRenderCounts(getCounts(), BASELINE_THEME_TOGGLE, "theme toggle");
    });

    it("container resize leaves all steps at 0 updates", () => {
        const { record, getCounts, reset } = createRenderCounter();
        const ref = React.createRef<StepSequencerRowSceneHandle>();
        render(<StepSequencerRowScene ref={ref} record={record} />);
        reset();

        act(() => ref.current!.setSize(720, 100));

        assertRenderCounts(getCounts(), BASELINE_RESIZE, "container resize");
    });
});
