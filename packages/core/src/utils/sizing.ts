import { SizeType } from "../types";

/**
 * Maps size values to CSS class names for square components (Button, Knob, KnobSwitch)
 */
export const squareSizeClassMap: Record<SizeType, string> = {
    xsmall: "audioui-size-square-xsmall",
    small: "audioui-size-square-small",
    normal: "audioui-size-square-normal",
    large: "audioui-size-square-large",
    xlarge: "audioui-size-square-xlarge",
};

/**
 * Maps size values to CSS class names for horizontal slider
 */
export const horizontalSliderSizeClassMap: Record<SizeType, string> = {
    xsmall: "audioui-size-hslider-xsmall",
    small: "audioui-size-hslider-small",
    normal: "audioui-size-hslider-normal",
    large: "audioui-size-hslider-large",
    xlarge: "audioui-size-hslider-xlarge",
};

/**
 * Maps size values to CSS class names for vertical slider
 */
export const verticalSliderSizeClassMap: Record<SizeType, string> = {
    xsmall: "audioui-size-vslider-xsmall",
    small: "audioui-size-vslider-small",
    normal: "audioui-size-vslider-normal",
    large: "audioui-size-vslider-large",
    xlarge: "audioui-size-vslider-xlarge",
};

/**
 * Maps size values to CSS class names for keys
 */
export const keysSizeClassMap: Record<SizeType, string> = {
    xsmall: "audioui-size-keys-xsmall",
    small: "audioui-size-keys-small",
    normal: "audioui-size-keys-normal",
    large: "audioui-size-keys-large",
    xlarge: "audioui-size-keys-xlarge",
};

/**
 * Gets the appropriate size class name for a component
 * @param componentType The type of component ('knob', 'button', 'keys', or 'slider')
 * @param size The size value
 * @param orientation The orientation for slider components ('vertical' or 'horizontal')
 * @returns The CSS class name for the component size
 */
export function getSizeClassForComponent(
    componentType: "knob" | "button" | "keys" | "slider",
    size: SizeType = "normal",
    orientation: "vertical" | "horizontal" = "vertical"
): string {
    switch (componentType) {
        case "knob":
        case "button":
            return squareSizeClassMap[size];
        case "keys":
            return keysSizeClassMap[size];
        case "slider":
            return orientation === "horizontal" ? horizontalSliderSizeClassMap[size] : verticalSliderSizeClassMap[size];
        default:
            throw new Error(`Unknown component type: ${componentType}`);
    }
}

/**
 * Gets the CSS variable references for a component's size dimensions.
 * Used to apply size as inline styles (which override AdaptiveBox's default 100%).
 * @param componentType The type of component ('knob', 'button', 'keys', or 'slider')
 * @param size The size value
 * @param orientation The orientation for slider components ('vertical' or 'horizontal')
 * @returns An object with width and height CSS variable references
 */
export function getSizeStyleForComponent(
    componentType: "knob" | "button" | "keys" | "slider",
    size: SizeType = "normal",
    orientation: "vertical" | "horizontal" = "vertical"
): { width: string; height: string } {
    switch (componentType) {
        case "knob":
        case "button":
            return {
                width: `var(--audioui-size-square-${size})`,
                height: `var(--audioui-size-square-${size})`,
            };
        case "keys":
            return {
                width: `var(--audioui-size-keys-width-${size})`,
                height: `var(--audioui-size-keys-height-${size})`,
            };
        case "slider":
            if (orientation === "horizontal") {
                return {
                    width: `var(--audioui-size-hslider-width-${size})`,
                    height: `var(--audioui-size-hslider-height-${size})`,
                };
            } else {
                return {
                    width: `var(--audioui-size-vslider-width-${size})`,
                    height: `var(--audioui-size-vslider-height-${size})`,
                };
            }
        default:
            throw new Error(`Unknown component type: ${componentType}`);
    }
}
