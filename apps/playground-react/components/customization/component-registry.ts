/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { ControlComponent, SvgHorizontalSlider, SvgKnob, SvgVerticalSlider } from "@cutoff/audio-ui-react";
import LabyrinthControl from "../examples/LabyrinthControl";
import ClassicVectorKnob from "../examples/ClassicVectorKnob";
import GuitarKnob from "../examples/GuitarKnob";
import IconKnob from "../examples/IconKnob";
import HifiKnob from "../examples/HifiKnob";
import SelectorKnob from "../examples/SelectorKnob";
import PanKnob from "../examples/PanKnob";
import HtmlContentKnob from "../examples/HtmlContentKnob";

/**
 * Registry of available custom control components for the customization laboratory.
 * Components should implement ControlComponentMetadata (title, description) for display.
 */
export const componentRegistry: ControlComponent<Record<string, unknown>>[] = [
    IconKnob,
    HifiKnob,
    SelectorKnob,
    PanKnob,
    HtmlContentKnob,
    LabyrinthControl,
    ClassicVectorKnob,
    GuitarKnob,
    SvgKnob,
    SvgVerticalSlider,
    SvgHorizontalSlider,
    // Future components can be added here
];
