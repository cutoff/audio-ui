/**
 * Shared constants for CSS custom property names used throughout the library.
 * Using string constants makes it easier to update prefixes in the future and
 * keeps TypeScript aware of the possible values.
 */
export const AUDIOUI_CSS_VARS = {
    adaptiveDefaultColor: "--audioui-adaptive-default-color",
} as const;

export type AudioUiCssVar = (typeof AUDIOUI_CSS_VARS)[keyof typeof AUDIOUI_CSS_VARS];
