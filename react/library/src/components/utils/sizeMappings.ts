import { SizeType } from "../types";

/**
 * Maps size values to dimensions for the Knob component
 */
export const knobSizeMap: Record<SizeType, { width: number; height: number }> = {
    xsmall: { width: 50, height: 50 },
    small: { width: 65, height: 65 },
    normal: { width: 75, height: 75 },
    large: { width: 90, height: 90 },
    xlarge: { width: 110, height: 110 },
};

/**
 * Maps size values to dimensions for the Button component
 */
export const buttonSizeMap: Record<SizeType, { width: number; height: number }> = {
    xsmall: { width: 30, height: 30 },
    small: { width: 40, height: 40 },
    normal: { width: 50, height: 50 },
    large: { width: 60, height: 60 },
    xlarge: { width: 75, height: 75 },
};

/**
 * Maps size values to dimensions for the Keybed component
 */
export const keybedSizeMap: Record<SizeType, { width: number; height: number }> = {
    xsmall: { width: 320, height: 80 },
    small: { width: 460, height: 115 },
    normal: { width: 640, height: 160 },
    large: { width: 800, height: 200 },
    xlarge: { width: 900, height: 225 },
};

/**
 * Maps size values to dimensions for the Slider component
 */
export const sliderSizeMap: Record<
    SizeType,
    {
        vertical: { width: number; height: number };
        horizontal: { width: number; height: number };
    }
> = {
    xsmall: {
        vertical: { width: 25, height: 100 },
        horizontal: { width: 100, height: 25 },
    },
    small: {
        vertical: { width: 30, height: 130 },
        horizontal: { width: 130, height: 30 },
    },
    normal: {
        vertical: { width: 40, height: 160 },
        horizontal: { width: 160, height: 40 },
    },
    large: {
        vertical: { width: 50, height: 200 },
        horizontal: { width: 200, height: 50 },
    },
    xlarge: {
        vertical: { width: 60, height: 240 },
        horizontal: { width: 240, height: 60 },
    },
};

/**
 * Gets the appropriate size dimensions for a component
 * @param componentType The type of component ('knob', 'button', 'keybed', or 'slider')
 * @param size The size value
 * @param orientation The orientation for slider components ('vertical' or 'horizontal')
 * @returns The dimensions for the component
 */
export function getSizeForComponent(
    componentType: "knob" | "button" | "keybed" | "slider",
    size: SizeType = "normal",
    orientation: "vertical" | "horizontal" = "vertical"
): number | { width: number; height: number } {
    switch (componentType) {
        case "knob":
            return knobSizeMap[size];
        case "button":
            return buttonSizeMap[size];
        case "keybed":
            return keybedSizeMap[size];
        case "slider":
            return sliderSizeMap[size][orientation];
        default:
            throw new Error(`Unknown component type: ${componentType}`);
    }
}
