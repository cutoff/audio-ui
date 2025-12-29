export { default as Option } from "./components/primitives/controls/Option";

export { default as Button } from "./components/controls/Button";
export { default as Knob } from "./components/controls/Knob";
export { default as KnobSwitch } from "./components/controls/KnobSwitch";
export { default as Slider } from "./components/controls/Slider";
export { default as ContinuousControl } from "./components/primitives/controls/ContinuousControl";

// Export primitives
export { default as ValueRing } from "./components/primitives/views/ValueRing";
export type { ValueRingProps } from "./components/primitives/views/ValueRing";
export { default as RotaryImage } from "./components/primitives/views/RotaryImage";
export type { RotaryImageProps } from "./components/primitives/views/RotaryImage";
export { default as RadialImage } from "./components/primitives/views/RadialImage";
export type { RadialImageProps } from "./components/primitives/views/RadialImage";
export { default as RadialText } from "./components/primitives/views/RadialText";
export type { RadialTextProps } from "./components/primitives/views/RadialText";
export { default as RevealingPath } from "./components/primitives/views/RevealingPath";
export type { RevealingPathProps } from "./components/primitives/views/RevealingPath";
export { default as TickRing } from "./components/primitives/views/TickRing";
export type { TickRingProps } from "./components/primitives/views/TickRing";

// Export SVG presentation components
export { default as SvgButton } from "./components/theme/SvgButton";
export { default as SvgKnob } from "./components/theme/SvgKnob";
export { default as SvgSlider, SvgVerticalSlider, SvgHorizontalSlider } from "./components/theme/SvgSlider";

export { default as Keybed } from "./components/devices/Keybed";
export { default as AdaptiveBox } from "./components/primitives/AdaptiveBox";

// Export theme provider and hooks
export { default as AudioUiProvider, useAudioUiTheme, useThemableProps } from "./components/theme/AudioUiProvider";
export type { AudioUiProviderProps } from "./components/theme/AudioUiProvider";

// Also export types for consuming applications
export type { KnobSwitchProps, KnobSwitchOptionProps } from "./components/controls/KnobSwitch";
export type { KnobProps } from "./components/controls/Knob";
export type { SliderProps } from "./components/controls/Slider";
export type { ButtonProps } from "./components/controls/Button";
export type { ContinuousControlComponentProps } from "./components/primitives/controls/ContinuousControl";
export type { KeybedProps } from "./components/devices/Keybed";

// Export SVG component types
export type { SvgButtonProps } from "./components/theme/SvgButton";
export type { SvgKnobProps } from "./components/theme/SvgKnob";
export type { SvgSliderProps } from "./components/theme/SvgSlider";

// Export common types
export type {
    AdaptiveSizeProps,
    AdaptiveBoxProps,
    BaseProps,
    ContinuousControlProps,
    BooleanControlProps,
    InteractiveControlProps,
    ThemableProps,
    ControlComponent,
    ControlComponentView,
    ControlComponentViewProps,
    AudioControlEvent,
    ControlComponentMetadata,
} from "./components/types";

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
} from "@cutoff/audio-ui-core";

// Export note utilities
export {
    // New function names
    noteNumToNote,
    noteToNoteNum,
    isNoteOn,
    createNoteNumSet,
} from "@cutoff/audio-ui-core";

// Export theme defaults
export { DEFAULT_ROUNDNESS, DEFAULT_THICKNESS } from "@cutoff/audio-ui-core";

// Export Audio Parameter Model and Hook
export * from "@cutoff/audio-ui-core";
export * from "./hooks/useAudioParameter";
