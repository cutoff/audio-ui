import { ControlComponent, SvgHorizontalSlider, SvgKnob, SvgVerticalSlider } from "@cutoff/audio-ui-react";
import LabyrinthControl from "../examples/LabyrinthControl";
import ClassicVectorKnob from "../examples/ClassicVectorKnob";
import GuitarKnob from "../examples/GuitarKnob";
import IconKnob from "../examples/IconKnob";
import HifiKnob from "../examples/HifiKnob";
import TextValueKnob from "../examples/TextValueKnob";
import SelectorKnob from "../examples/SelectorKnob";

/**
 * Registry of available custom control components for the customization laboratory.
 * Components should implement ControlComponentMetadata (title, description) for display.
 */
export const componentRegistry: ControlComponent[] = [
    IconKnob,
    HifiKnob,
    SelectorKnob,
    TextValueKnob,
    LabyrinthControl,
    ClassicVectorKnob,
    GuitarKnob,
    SvgKnob,
    SvgVerticalSlider,
    SvgHorizontalSlider,
    // Future components can be added here
];
