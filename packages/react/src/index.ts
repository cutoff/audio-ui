export { default as Option } from "./components/Option";

export { default as Button } from "./components/controls/Button";
export { default as Knob } from "./components/controls/Knob";
export { default as KnobSwitch } from "./components/controls/KnobSwitch";
export { default as Slider } from "./components/controls/Slider";

// Export SVG presentation components
export { default as SvgButton } from "./components/svg/SvgButton";
export { default as SvgKnob } from "./components/svg/SvgKnob";
export { default as SvgSlider } from "./components/svg/SvgSlider";

export { default as Keybed } from "./components/Keybed";
export { default as AdaptiveBox } from "./components/AdaptiveBox";

// Export theme provider and hooks
export { default as AudioUiProvider, useAudioUiTheme, useThemableProps } from "./components/providers/AudioUiProvider";
export type { AudioUiProviderProps } from "./components/providers/AudioUiProvider";

// Also export types for consuming applications
export type { KnobSwitchProps, KnobSwitchOptionProps } from "./components/controls/KnobSwitch";
export type { KnobProps } from "./components/controls/Knob";
export type { SliderProps } from "./components/controls/Slider";
export type { ButtonProps } from "./components/controls/Button";
export type { KeybedProps } from "./components/Keybed";

// Export SVG component types
export type { SvgButtonProps } from "./components/svg/SvgButton";
export type { SvgKnobProps } from "./components/svg/SvgKnob";
export type { SvgSliderProps } from "./components/svg/SvgSlider";

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

// Export theme colors
export { themeColors, themeColorsDirect } from "./themeColors";

// Export Audio Parameter Model and Hook
export * from "./models/AudioParameter";
export * from "./hooks/useAudioParam";
