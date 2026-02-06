/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

/**
 * Shared constants for CSS custom property names used throughout the library.
 * Using string constants makes it easier to update prefixes in the future and
 * keeps TypeScript aware of the possible values.
 */
export const CSS_VARS = {
    // Theming parameters
    roundnessBase: "--audioui-roundness-base",
    primaryColor: "--audioui-primary-color",
    adaptiveDefaultColor: "--audioui-adaptive-default-color",
    adaptive50: "--audioui-adaptive-50",
    adaptive20: "--audioui-adaptive-20",
    adaptiveLight: "--audioui-adaptive-light",
    adaptiveDark: "--audioui-adaptive-dark",
    primary50: "--audioui-primary-50",
    primary20: "--audioui-primary-20",
    primaryLighter: "--audioui-primary-lighter",
    primaryDarker: "--audioui-primary-darker",

    // Text and typography
    textColor: "--audioui-text-color",
    defaultFontSize: "--audioui-default-font-size",

    // Interactive highlight
    highlightEffect: "--audioui-highlight-effect",
    highlightTransitionDuration: "--audioui-highlight-transition-duration",

    // Cursor styles
    cursorClickable: "--audioui-cursor-clickable",
    cursorBidirectional: "--audioui-cursor-bidirectional",
    cursorHorizontal: "--audioui-cursor-horizontal",
    cursorVertical: "--audioui-cursor-vertical",
    cursorCircular: "--audioui-cursor-circular",
    cursorNoneditable: "--audioui-cursor-noneditable",
    cursorDisabled: "--audioui-cursor-disabled",

    // Keys colors
    keysIvory: "--audioui-keys-ivory",
    keysIvoryStroke: "--audioui-keys-ivory-stroke",
    keysEbony: "--audioui-keys-ebony",
    keysEbonyStroke: "--audioui-keys-ebony-stroke",

    // Component style customization
    knobCapFill: "--audioui-knob-cap-fill",
    buttonStrokeWidth: "--audioui-button-stroke-width",

    // Slider component colors
    sliderTrackColor: "--audioui-slider-track-color",
    sliderStripColor: "--audioui-slider-strip-color",
    sliderCursorColor: "--audioui-slider-cursor-color",
    sliderCursorBorderColor: "--audioui-slider-cursor-border-color",
    sliderCursorBorderWidth: "--audioui-slider-cursor-border-width",
} as const;

export type AudioUiCssVar = (typeof CSS_VARS)[keyof typeof CSS_VARS];
