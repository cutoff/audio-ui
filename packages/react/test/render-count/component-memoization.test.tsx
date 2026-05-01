/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

// Static memoization-coverage regression tests.
//
// Every interactive component, every control primitive, and every exported
// view is required to be `React.memo`-wrapped. This file enforces that
// requirement directly: it inspects each component's `$$typeof` tag and
// verifies it equals `Symbol.for("react.memo")` — the runtime marker that
// `React.memo(...)` stamps onto its wrapper.
//
// Why static rather than behavioral: a behavioral test that wraps a leaf
// component in another `React.memo` (the way `trackRenders` does for scene
// tests) cannot observe the leaf's own memoization, because the outer
// wrapper bails out first. The leaf's memo could be removed entirely and
// the behavioral test would still pass. The `$$typeof` check inspects the
// wrapping directly and catches "someone deleted React.memo from Knob"
// without depending on rendering or reconciliation behavior.
//
// What this complements: scene-level tests in this directory verify the
// orthogonal "scene-level prop bindings stay referentially stable" property.
// Together, the two layers cover both leaf-level memo wrapping and
// composition-level prop stability.

import { describe, it, expect } from "vitest";
import type React from "react";

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
import SliderView, {
    VerticalSliderView,
    HorizontalSliderView,
} from "../../src/components/defaults/controls/SliderView";
import FilmstripView from "../../src/components/generic/controls/FilmstripView";
import ImageKnobView from "../../src/components/generic/controls/ImageKnobView";
import ImageSwitchView from "../../src/components/generic/controls/ImageSwitchView";

const REACT_MEMO_TYPE = Symbol.for("react.memo");

function isMemoWrapped(component: unknown): boolean {
    return (component as { $$typeof?: symbol })?.$$typeof === REACT_MEMO_TYPE;
}

// OptionView is intentionally excluded: it is a marker component (returns
// `null`, never rendered directly) used by `DiscreteControl` to extract
// option metadata from JSX. Memo wrapping does not apply.

const cases: Array<[string, React.ComponentType<unknown>]> = [
    // Default controls
    ["Knob", Knob as unknown as React.ComponentType<unknown>],
    ["Slider", Slider as unknown as React.ComponentType<unknown>],
    ["Button", Button as unknown as React.ComponentType<unknown>],
    ["CycleButton", CycleButton as unknown as React.ComponentType<unknown>],
    // Devices
    ["Keys", Keys as unknown as React.ComponentType<unknown>],
    // Generic / raster controls
    ["FilmStripContinuousControl", FilmStripContinuousControl as unknown as React.ComponentType<unknown>],
    ["FilmStripDiscreteControl", FilmStripDiscreteControl as unknown as React.ComponentType<unknown>],
    ["FilmStripBooleanControl", FilmStripBooleanControl as unknown as React.ComponentType<unknown>],
    ["ImageKnob", ImageKnob as unknown as React.ComponentType<unknown>],
    ["ImageRotarySwitch", ImageRotarySwitch as unknown as React.ComponentType<unknown>],
    ["ImageSwitch", ImageSwitch as unknown as React.ComponentType<unknown>],
    // Control primitives
    ["ContinuousControl", ContinuousControl as unknown as React.ComponentType<unknown>],
    ["DiscreteControl", DiscreteControl as unknown as React.ComponentType<unknown>],
    ["BooleanControl", BooleanControl as unknown as React.ComponentType<unknown>],
    // Default views (exported)
    ["KnobView", KnobView as unknown as React.ComponentType<unknown>],
    ["ButtonView", ButtonView as unknown as React.ComponentType<unknown>],
    ["SliderView", SliderView as unknown as React.ComponentType<unknown>],
    ["VerticalSliderView", VerticalSliderView as unknown as React.ComponentType<unknown>],
    ["HorizontalSliderView", HorizontalSliderView as unknown as React.ComponentType<unknown>],
    // Generic / raster views (internal but on the render-time path)
    ["FilmstripView", FilmstripView as unknown as React.ComponentType<unknown>],
    ["ImageKnobView", ImageKnobView as unknown as React.ComponentType<unknown>],
    ["ImageSwitchView", ImageSwitchView as unknown as React.ComponentType<unknown>],
];

describe("React.memo coverage", () => {
    it.each(cases)("%s is wrapped in React.memo", (_name, Component) => {
        expect(isMemoWrapped(Component)).toBe(true);
    });
});
