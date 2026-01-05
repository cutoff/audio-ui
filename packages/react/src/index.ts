export { default as Option } from "./components/primitives/controls/Option";

export { default as Button } from "./components/defaults/controls/Button";
export { default as Knob } from "./components/defaults/controls/Knob";
export { default as KnobSwitch } from "./components/defaults/controls/KnobSwitch";
export { default as Slider } from "./components/defaults/controls/Slider";
export { default as ContinuousControl } from "./components/primitives/controls/ContinuousControl";

// Export primitives
export { default as ValueRing } from "./components/primitives/svg/ValueRing";
export type { ValueRingProps } from "./components/primitives/svg/ValueRing";
export { default as RotaryImage } from "./components/primitives/svg/RotaryImage";
export type { RotaryImageProps } from "./components/primitives/svg/RotaryImage";
export { default as RadialImage } from "./components/primitives/svg/RadialImage";
export type { RadialImageProps } from "./components/primitives/svg/RadialImage";
export { default as RadialHtmlOverlay } from "./components/primitives/svg/RadialHtmlOverlay";
export type { RadialHtmlOverlayProps } from "./components/primitives/svg/RadialHtmlOverlay";
export { default as FilmstripImage } from "./components/primitives/svg/FilmstripImage";
export type { FilmstripImageProps } from "./components/primitives/svg/FilmstripImage";
export { default as RevealingPath } from "./components/primitives/svg/RevealingPath";
export type { RevealingPathProps } from "./components/primitives/svg/RevealingPath";
export { default as TickRing } from "./components/primitives/svg/TickRing";
export type { TickRingProps } from "./components/primitives/svg/TickRing";
export { default as LabelRing } from "./components/primitives/svg/LabelRing";
export type { LabelRingProps } from "./components/primitives/svg/LabelRing";

// Export SVG presentation components
export { default as SvgButton } from "./components/defaults/controls/SvgButton";
export { default as SvgKnob } from "./components/defaults/controls/SvgKnob";
export { default as SvgSlider, SvgVerticalSlider, SvgHorizontalSlider } from "./components/defaults/controls/SvgSlider";

export { default as Keybed } from "./components/defaults/devices/Keybed";
export { default as AdaptiveBox } from "./components/primitives/AdaptiveBox";
export type {
    AdaptiveBoxSvgProps,
    AdaptiveBoxLabelProps,
    AdaptiveBoxHtmlOverlayProps,
} from "./components/primitives/AdaptiveBox";

// Export theme provider and hooks
export { default as AudioUiProvider, useAudioUiTheme, useThemableProps } from "./components/defaults/AudioUiProvider";
export type { AudioUiProviderProps } from "./components/defaults/AudioUiProvider";

// Also export types for consuming applications
export type { KnobSwitchProps, KnobSwitchOptionProps } from "./components/defaults/controls/KnobSwitch";
export type { KnobProps } from "./components/defaults/controls/Knob";
export type { SliderProps } from "./components/defaults/controls/Slider";
export type { ButtonProps } from "./components/defaults/controls/Button";
export type { ContinuousControlComponentProps } from "./components/primitives/controls/ContinuousControl";
export type { KeybedProps } from "./components/defaults/devices/Keybed";

// Export SVG component types
export type { SvgButtonProps } from "./components/defaults/controls/SvgButton";
export type { SvgKnobProps } from "./components/defaults/controls/SvgKnob";
export type { SvgSliderProps } from "./components/defaults/controls/SvgSlider";

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
    KnobVariant,
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
export * from "./hooks/useAdaptiveSize";
