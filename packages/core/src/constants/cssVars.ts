/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

/**
 * Shared constants for CSS custom property names used throughout the library.
 * Using string constants makes it easier to update prefixes in the future and
 * keeps TypeScript aware of the possible values.
 */
export const CSS_VARS = {
    adaptiveDefaultColor: "--audioui-adaptive-default-color",
    keysIvory: "--audioui-keys-ivory",
    keysIvoryStroke: "--audioui-keys-ivory-stroke",
    keysEbony: "--audioui-keys-ebony",
    keysEbonyStroke: "--audioui-keys-ebony-stroke",
} as const;

export type AudioUiCssVar = (typeof CSS_VARS)[keyof typeof CSS_VARS];
