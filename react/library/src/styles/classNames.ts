/**
 * Centralized collection of CSS class names used across AudioUI components.
 * Keeping them in one place makes it easier to enforce prefixing conventions
 * and minimizes the risk of typos in string literals.
 */
export const AUDIOUI_CLASSNAMES = {
    /** Root class applied to all AudioUI components */
    root: "audioui",
    /** Container helper class for components that manage their own SVG sizing */
    container: "audioui-component-container",
    /** Highlight class used for interactive states */
    highlight: "audioui-highlight",
} as const;

export type AudioUiClassName = (typeof AUDIOUI_CLASSNAMES)[keyof typeof AUDIOUI_CLASSNAMES];
