import { ControlComponent, SvgHorizontalSlider, SvgKnob, SvgVerticalSlider } from "@cutoff/audio-ui-react";
import LabyrinthControlView from "../examples/LabyrinthControlView";
import ClassicVectorKnob from "../examples/ClassicVectorKnob";
import GuitarPixelKnob from "../examples/GuitarPixelKnob";

/**
 * Registry of available custom control components for the customization laboratory.
 * Components should implement ControlComponentMetadata (title, description) for display.
 */
export const componentRegistry: ControlComponent[] = [
    LabyrinthControlView,
    ClassicVectorKnob,
    GuitarPixelKnob,
    SvgKnob,
    SvgVerticalSlider,
    SvgHorizontalSlider,
    // Future components can be added here
];
