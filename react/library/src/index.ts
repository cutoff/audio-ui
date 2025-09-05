export { default as Option } from "./components/support/Option";

export { default as Button } from "./components/controls/Button";
export { default as Knob } from "./components/controls/Knob";
export { default as KnobSwitch } from "./components/controls/KnobSwitch";
export { default as Slider } from "./components/controls/Slider";

export { default as Keybed } from "./components/Keybed";

// Export theme provider and hooks
export { default as AudioUiProvider, useAudioUiTheme, useThemableProps } from "./components/providers/AudioUiProvider";
export type { AudioUiProviderProps } from "./components/providers/AudioUiProvider";

// Also export types for consuming applications
export type { KnobSwitchProps, KnobSwitchOptionProps } from "./components/controls/KnobSwitch";
export type { KnobProps } from "./components/controls/Knob";
export type { SliderProps } from "./components/controls/Slider";
export type { ButtonProps } from "./components/controls/Button";
export type { KeybedProps } from "./components/Keybed";

// Export common types
export type { SizeType, AdaptativeSize, Control, BipolarControl, Themable } from "./components/types";

// Export value formatters
export {
    bipolarFormatter,
    midiBipolarFormatter,
    withUnit,
    withPrecision,
    combineFormatters,
    percentageFormatter,
    frequencyFormatter,
    calculateCenterValue,
} from "./components/utils/valueFormatters";

// Export note utilities
export {
    // New function names
    noteNumToNote,
    noteToNoteNum,
    isNoteOn,
    createNoteNumSet,
} from "./components/utils/noteUtils";
