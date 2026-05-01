/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import React from "react";
import Knob from "../../../src/components/defaults/controls/Knob";
import Slider from "../../../src/components/defaults/controls/Slider";
import Button from "../../../src/components/defaults/controls/Button";
import { trackRenders, useRecordRootRenders, type RecordFn } from "../helpers/renderCounter";

export const CHANNEL_STRIP_CONTROL_IDS = [
    "strip-fader",
    "strip-gain",
    "strip-pan",
    "strip-send",
    "strip-mute",
] as const;

export type ChannelStripControlId = (typeof CHANNEL_STRIP_CONTROL_IDS)[number];

/**
 * Imperative handle exposed by {@link ChannelStripScene} for driving the four
 * render-count test triggers from tests without simulating DOM gestures.
 */
export interface ChannelStripSceneHandle {
    /** Updates a single control's value; all other controls keep their current value. */
    setControlValue: (id: ChannelStripControlId, value: number | boolean) => void;
    /** Sets the scene-root's `--audioui-primary-color` CSS variable. */
    setTheme: (color: string) => void;
    /** Bumps an otherwise-unread counter to force a parent re-render with no prop changes. */
    bumpParent: () => void;
    /** Replaces the scene-root's inline width/height. */
    setSize: (width: number, height: number) => void;
}

interface ChannelStripSceneProps {
    record: RecordFn;
}

const TrackedKnob = trackRenders(Knob);
const TrackedSlider = trackRenders(Slider);
const TrackedButton = trackRenders(Button);

/**
 * Test fixture: a single audio channel strip (vertical fader, three knobs, a
 * mute button) used by `channel-strip.test.tsx` to verify that one control's
 * value change does not propagate re-renders to its siblings, and that
 * parent re-renders, theme toggles, and container resizes leave every control
 * at zero updates.
 */
const ChannelStripScene = React.forwardRef<ChannelStripSceneHandle, ChannelStripSceneProps>(function ChannelStripScene(
    { record },
    ref
) {
    useRecordRootRenders(record, "scene-root");

    const [fader, setFader] = React.useState(0.75);
    const [gain, setGain] = React.useState(0.5);
    const [pan, setPan] = React.useState(0.5);
    const [send, setSend] = React.useState(0.25);
    const [mute, setMute] = React.useState(false);
    const [themeColor, setThemeColor] = React.useState<string>("#e29a4a");
    const [size, setSize] = React.useState<{ w: number; h: number }>({ w: 200, h: 500 });
    const [, setParentTick] = React.useState(0);

    React.useImperativeHandle(ref, () => ({
        setControlValue: (id, value) => {
            switch (id) {
                case "strip-fader":
                    setFader(value as number);
                    break;
                case "strip-gain":
                    setGain(value as number);
                    break;
                case "strip-pan":
                    setPan(value as number);
                    break;
                case "strip-send":
                    setSend(value as number);
                    break;
                case "strip-mute":
                    setMute(value as boolean);
                    break;
            }
        },
        setTheme: (color) => setThemeColor(color),
        bumpParent: () => setParentTick((t) => t + 1),
        setSize: (w, h) => setSize({ w, h }),
    }));

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                width: size.w,
                height: size.h,
                ["--audioui-primary-color" as string]: themeColor,
            }}
        >
            <TrackedSlider
                trackId="strip-fader"
                record={record}
                value={fader}
                min={0}
                max={1}
                orientation="vertical"
                onValueChange={setFader}
                label="Fader"
            />
            <TrackedKnob
                trackId="strip-gain"
                record={record}
                value={gain}
                min={0}
                max={1}
                onValueChange={setGain}
                label="Gain"
            />
            <TrackedKnob
                trackId="strip-pan"
                record={record}
                value={pan}
                min={-1}
                max={1}
                bipolar
                onValueChange={setPan}
                label="Pan"
            />
            <TrackedKnob
                trackId="strip-send"
                record={record}
                value={send}
                min={0}
                max={1}
                onValueChange={setSend}
                label="Send"
            />
            <TrackedButton
                trackId="strip-mute"
                record={record}
                value={mute}
                onValueChange={setMute}
                label="Mute"
                latch
            />
        </div>
    );
});

export default ChannelStripScene;
