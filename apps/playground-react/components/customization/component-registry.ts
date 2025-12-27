import { ControlComponent, SvgHorizontalSlider, SvgKnob, SvgSlider, SvgVerticalSlider } from "@cutoff/audio-ui-react";
import LabyrinthControlView from "../examples/LabyrinthControlView";

/**
 * Registry of available custom control components for the customization laboratory.
 * Components should implement ControlComponentMetadata (title, description) for display.
 */
export const componentRegistry: ControlComponent[] = [
    LabyrinthControlView,
    SvgKnob,
    SvgVerticalSlider,
    SvgHorizontalSlider,
    // Future components can be added here
];
