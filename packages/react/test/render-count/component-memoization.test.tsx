/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

// Per-component memoization regression tests.
//
// Scope: every interactive control exported from the public API plus the
// three control primitives. Each case asserts two properties of the
// component's `React.memo` boundary in isolation (no scene composition):
//   1. Parent re-render with shallow-equal props → 0 updates (memo bails out).
//   2. Value prop change                          → 1 update  (memo invalidates).
//
// Adding a new interactive component to the library requires one row in
// `cases` below. A failure here points directly at the component whose memo
// boundary regressed, complementing the scene tests that catch composition
// regressions one layer up.

import React from "react";
import { describe, it } from "vitest";
import { render } from "@testing-library/react";

import Knob from "../../src/components/defaults/controls/Knob";
import Slider from "../../src/components/defaults/controls/Slider";
import Button from "../../src/components/defaults/controls/Button";
import CycleButton from "../../src/components/defaults/controls/CycleButton";
import Keys from "../../src/components/defaults/devices/Keys";
import FilmStripContinuousControl from "../../src/components/generic/controls/FilmStripContinuousControl";
import FilmStripDiscreteControl from "../../src/components/generic/controls/FilmStripDiscreteControl";
import FilmStripBooleanControl from "../../src/components/generic/controls/FilmStripBooleanControl";
import ImageKnob from "../../src/components/generic/controls/ImageKnob";
import ImageRotarySwitch from "../../src/components/generic/controls/ImageRotarySwitch";
import ImageSwitch from "../../src/components/generic/controls/ImageSwitch";
import ContinuousControl from "../../src/components/primitives/controls/ContinuousControl";
import DiscreteControl from "../../src/components/primitives/controls/DiscreteControl";
import BooleanControl from "../../src/components/primitives/controls/BooleanControl";
import KnobView from "../../src/components/defaults/controls/KnobView";
import ButtonView from "../../src/components/defaults/controls/ButtonView";

import { createRenderCounter, expectRenderCount, trackRenders } from "./helpers/renderCounter";

// Stable shared props. Memo's shallow compare requires reference equality on
// any object/array/function prop, so these must be defined once at module
// scope and reused across renders.

const STABLE_OPTIONS = [
    { value: 0, label: "A" },
    { value: 1, label: "B" },
    { value: 2, label: "C" },
];
const STABLE_NOTES_A: number[] = [];
const STABLE_NOTES_B: number[] = [60];
const STABLE_FILMSTRIP_PROPS = {
    imageHref: "data:image/png;base64,iVBORw0KGgo=",
    frameWidth: 64,
    frameHeight: 64,
    frameCount: 31,
} as const;
const STABLE_IMAGE_HREF = "data:image/png;base64,iVBORw0KGgo=";
const STABLE_VIEW_PROPS = {} as const;

interface Case {
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Component: React.ComponentType<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    baseProps: Record<string, any>;
    valueProp: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    to: any;
}

const cases: Case[] = [
    // Default controls
    {
        name: "Knob",
        Component: Knob,
        baseProps: { min: 0, max: 1, label: "K" },
        valueProp: "value",
        from: 0.5,
        to: 0.7,
    },
    {
        name: "Slider",
        Component: Slider,
        baseProps: { min: 0, max: 1, label: "S" },
        valueProp: "value",
        from: 0.5,
        to: 0.7,
    },
    {
        name: "Button",
        Component: Button,
        baseProps: { label: "B", latch: true },
        valueProp: "value",
        from: false,
        to: true,
    },
    {
        name: "CycleButton",
        Component: CycleButton,
        baseProps: { options: STABLE_OPTIONS, label: "C" },
        valueProp: "value",
        from: 0,
        to: 1,
    },
    // Devices
    {
        name: "Keys",
        Component: Keys,
        baseProps: { nbKeys: 12 },
        valueProp: "notesOn",
        from: STABLE_NOTES_A,
        to: STABLE_NOTES_B,
    },
    // Generic / raster controls
    {
        name: "FilmStripContinuousControl",
        Component: FilmStripContinuousControl,
        baseProps: { ...STABLE_FILMSTRIP_PROPS, min: 0, max: 1, label: "FC" },
        valueProp: "value",
        from: 0.5,
        to: 0.7,
    },
    {
        name: "FilmStripDiscreteControl",
        Component: FilmStripDiscreteControl,
        baseProps: { ...STABLE_FILMSTRIP_PROPS, options: STABLE_OPTIONS, label: "FD" },
        valueProp: "value",
        from: 0,
        to: 1,
    },
    {
        name: "FilmStripBooleanControl",
        Component: FilmStripBooleanControl,
        baseProps: { ...STABLE_FILMSTRIP_PROPS, label: "FB", latch: true },
        valueProp: "value",
        from: false,
        to: true,
    },
    {
        name: "ImageKnob",
        Component: ImageKnob,
        baseProps: { imageHref: STABLE_IMAGE_HREF, min: 0, max: 1, label: "IK" },
        valueProp: "value",
        from: 0.5,
        to: 0.7,
    },
    {
        name: "ImageRotarySwitch",
        Component: ImageRotarySwitch,
        baseProps: { imageHref: STABLE_IMAGE_HREF, options: STABLE_OPTIONS, label: "IRS" },
        valueProp: "value",
        from: 0,
        to: 1,
    },
    {
        name: "ImageSwitch",
        Component: ImageSwitch,
        baseProps: {
            imageHrefFalse: STABLE_IMAGE_HREF,
            imageHrefTrue: STABLE_IMAGE_HREF,
            frameWidth: 64,
            frameHeight: 64,
            label: "IS",
            latch: true,
        },
        valueProp: "value",
        from: false,
        to: true,
    },
    // Primitives — paired with their canonical default views (stable references).
    {
        name: "ContinuousControl",
        Component: ContinuousControl,
        baseProps: { min: 0, max: 1, view: KnobView, viewProps: STABLE_VIEW_PROPS, label: "CC" },
        valueProp: "value",
        from: 0.5,
        to: 0.7,
    },
    {
        name: "DiscreteControl",
        Component: DiscreteControl,
        baseProps: {
            options: STABLE_OPTIONS,
            view: KnobView,
            viewProps: STABLE_VIEW_PROPS,
            label: "DC",
        },
        valueProp: "value",
        from: 0,
        to: 1,
    },
    {
        name: "BooleanControl",
        Component: BooleanControl,
        baseProps: {
            view: ButtonView,
            viewProps: STABLE_VIEW_PROPS,
            label: "BC",
            latch: true,
        },
        valueProp: "value",
        from: false,
        to: true,
    },
];

describe.each(cases)("$name memoization", ({ Component, baseProps, valueProp, from, to }) => {
    const Tracked = trackRenders(Component);

    it("bails out on parent re-render with stable props", () => {
        const { record, getCounts, reset } = createRenderCounter();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const props: any = { trackId: "leaf", record, ...baseProps, [valueProp]: from };
        const { rerender } = render(<Tracked {...props} />);
        reset();

        rerender(<Tracked {...props} />);

        expectRenderCount("leaf", getCounts()["leaf"]?.update ?? 0, 0, "parent re-render");
    });

    it("re-renders when the value prop changes", () => {
        const { record, getCounts, reset } = createRenderCounter();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const propsA: any = { trackId: "leaf", record, ...baseProps, [valueProp]: from };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const propsB: any = { trackId: "leaf", record, ...baseProps, [valueProp]: to };
        const { rerender } = render(<Tracked {...propsA} />);
        reset();

        rerender(<Tracked {...propsB} />);

        expectRenderCount("leaf", getCounts()["leaf"]?.update ?? 0, 1, "value prop change");
    });
});
