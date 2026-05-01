/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React from "react";
import { describe, it } from "vitest";
import { render, act } from "@testing-library/react";
import ChannelStripScene, { CHANNEL_STRIP_CONTROL_IDS, type ChannelStripSceneHandle } from "./scenes/ChannelStripScene";
import { assertRenderCounts, createRenderCounter } from "./helpers/renderCounter";

function zeroControls(): Record<string, number> {
    return Object.fromEntries(CHANNEL_STRIP_CONTROL_IDS.map((id) => [id, 0]));
}

const BASELINE_VALUE_CHANGE_FADER: Record<string, number> = {
    ...zeroControls(),
    "strip-fader": 1,
    "scene-root": 1,
};

const BASELINE_VALUE_CHANGE_MUTE: Record<string, number> = {
    ...zeroControls(),
    "strip-mute": 1,
    "scene-root": 1,
};

const BASELINE_PARENT_RERENDER: Record<string, number> = {
    ...zeroControls(),
    "scene-root": 1,
};

const BASELINE_THEME_TOGGLE: Record<string, number> = {
    ...zeroControls(),
    "scene-root": 1,
};

const BASELINE_RESIZE: Record<string, number> = {
    ...zeroControls(),
    "scene-root": 1,
};

describe("ChannelStripScene render counts", () => {
    it("fader value change updates only the fader", () => {
        const { record, getCounts, reset } = createRenderCounter();
        const ref = React.createRef<ChannelStripSceneHandle>();
        render(<ChannelStripScene ref={ref} record={record} />);
        reset();

        act(() => ref.current!.setControlValue("strip-fader", 0.4));

        assertRenderCounts(getCounts(), BASELINE_VALUE_CHANGE_FADER, "value change fader");
    });

    it("mute toggle updates only the mute button", () => {
        const { record, getCounts, reset } = createRenderCounter();
        const ref = React.createRef<ChannelStripSceneHandle>();
        render(<ChannelStripScene ref={ref} record={record} />);
        reset();

        act(() => ref.current!.setControlValue("strip-mute", true));

        assertRenderCounts(getCounts(), BASELINE_VALUE_CHANGE_MUTE, "value change mute");
    });

    it("parent re-render leaves all controls at 0 updates", () => {
        const { record, getCounts, reset } = createRenderCounter();
        const ref = React.createRef<ChannelStripSceneHandle>();
        render(<ChannelStripScene ref={ref} record={record} />);
        reset();

        act(() => ref.current!.bumpParent());

        assertRenderCounts(getCounts(), BASELINE_PARENT_RERENDER, "parent re-render");
    });

    it("theme toggle leaves all controls at 0 updates", () => {
        const { record, getCounts, reset } = createRenderCounter();
        const ref = React.createRef<ChannelStripSceneHandle>();
        render(<ChannelStripScene ref={ref} record={record} />);
        reset();

        act(() => ref.current!.setTheme("#8844cc"));

        assertRenderCounts(getCounts(), BASELINE_THEME_TOGGLE, "theme toggle");
    });

    it("container resize leaves all controls at 0 updates", () => {
        const { record, getCounts, reset } = createRenderCounter();
        const ref = React.createRef<ChannelStripSceneHandle>();
        render(<ChannelStripScene ref={ref} record={record} />);
        reset();

        act(() => ref.current!.setSize(240, 600));

        assertRenderCounts(getCounts(), BASELINE_RESIZE, "container resize");
    });
});
