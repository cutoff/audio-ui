/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

export { default as OptionView } from "./components/primitives/controls/OptionView";

export { default as Button } from "./components/defaults/controls/Button";
export { default as Knob } from "./components/defaults/controls/Knob";
export { default as CycleButton } from "./components/defaults/controls/CycleButton";
export { default as Slider } from "./components/defaults/controls/Slider";
export { default as ContinuousControl } from "./components/primitives/controls/ContinuousControl";
export { default as DiscreteControl } from "./components/primitives/controls/DiscreteControl";
export { default as BooleanControl } from "./components/primitives/controls/BooleanControl";
export { default as FilmStripContinuousControl } from "./components/generic/controls/FilmStripContinuousControl";
export { default as FilmStripDiscreteControl } from "./components/generic/controls/FilmStripDiscreteControl";
export { default as FilmStripBooleanControl } from "./components/generic/controls/FilmStripBooleanControl";

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
export { default as ButtonView } from "./components/defaults/controls/ButtonView";
export { default as KnobView } from "./components/defaults/controls/KnobView";
export {
    default as SliderView,
    VerticalSliderView,
    HorizontalSliderView,
} from "./components/defaults/controls/SliderView";

export { default as Keys } from "./components/defaults/devices/Keys";
export { default as AdaptiveBox } from "./components/primitives/AdaptiveBox";
export type {
    AdaptiveBoxSvgProps,
    AdaptiveBoxLabelProps,
    AdaptiveBoxHtmlOverlayProps,
} from "./components/primitives/AdaptiveBox";

// Export theme utility functions
export {
    setThemeColor,
    setThemeRoundness,
    setThemeThickness,
    setTheme,
    getThemeColor,
    getThemeRoundness,
    getThemeThickness,
} from "./utils/theme";
export type { ThemeConfig } from "./utils/theme";

// Also export types for consuming applications
export type { CycleButtonProps } from "./components/defaults/controls/CycleButton";
export type { OptionViewProps } from "./components/primitives/controls/OptionView";
export type { KnobProps } from "./components/defaults/controls/Knob";
export type { SliderProps } from "./components/defaults/controls/Slider";
export type { ButtonProps } from "./components/defaults/controls/Button";
export type { ContinuousControlComponentProps } from "./components/primitives/controls/ContinuousControl";
export type { DiscreteControlComponentProps } from "./components/primitives/controls/DiscreteControl";
export type { BooleanControlComponentProps } from "./components/primitives/controls/BooleanControl";
export type {
    FilmStripContinuousControlProps,
    FilmstripProps,
} from "./components/generic/controls/FilmStripContinuousControl";
export type { FilmStripDiscreteControlProps } from "./components/generic/controls/FilmStripDiscreteControl";
export type { FilmStripBooleanControlProps } from "./components/generic/controls/FilmStripBooleanControl";
export type { KeysProps } from "./components/defaults/devices/Keys";

// Export SVG component types
export type { ButtonViewProps } from "./components/defaults/controls/ButtonView";
export type { KnobViewProps } from "./components/defaults/controls/KnobView";
export type { SliderViewProps } from "./components/defaults/controls/SliderView";

// Export common types
export type {
    AdaptiveSizeProps,
    AdaptiveBoxProps,
    BaseProps,
    ContinuousControlProps,
    DiscreteControlProps,
    BooleanControlProps,
    InteractiveControlProps,
    ThemableProps,
    ControlComponent,
    ControlComponentView,
    ControlComponentViewProps,
    AudioControlEvent,
    ControlComponentMetadata,
    KnobVariant,
    ValueLabelMode,
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
export * from "./hooks/useThemableProps";
export * from "./hooks/useDiscreteParameterResolution";
export * from "./hooks/useContinuousParameterResolution";
export * from "./hooks/useBooleanParameterResolution";
