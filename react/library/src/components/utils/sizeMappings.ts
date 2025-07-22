import { SizeType } from '../types';

/**
 * Maps size values to dimensions for the Knob component
 */
export const knobSizeMap: Record<SizeType, { width: number, height: number }> = {
  'xsmall': { width: 50, height: 50 },
  'small': { width: 65, height: 65 },
  'normal': { width: 75, height: 75 },
  'large': { width: 90, height: 90 },
  'xlarge': { width: 110, height: 110 }
};

/**
 * Maps size values to dimensions for the Button component
 */
export const buttonSizeMap: Record<SizeType, { width: number, height: number }> = {
  'xsmall': { width: 30, height: 30 },
  'small': { width: 40, height: 40 },
  'normal': { width: 50, height: 50 },
  'large': { width: 60, height: 60 },
  'xlarge': { width: 75, height: 75 }
};

/**
 * Maps size values to dimensions for the Slider component
 */
export const sliderSizeMap: Record<SizeType, { width: number, height: number }> = {
  'xsmall': { width: 25, height: 100 },
  'small': { width: 30, height: 130 },
  'normal': { width: 40, height: 160 },
  'large': { width: 50, height: 200 },
  'xlarge': { width: 60, height: 240 }
};

/**
 * Gets the appropriate size dimensions for a component
 * @param componentType The type of component ('knob', 'button', or 'slider')
 * @param size The size value
 * @returns The dimensions for the component
 */
export function getSizeForComponent(
  componentType: 'knob' | 'button' | 'slider',
  size: SizeType = 'normal'
): number | { width: number, height: number } {
  switch (componentType) {
    case 'knob':
      return knobSizeMap[size];
    case 'button':
      return buttonSizeMap[size];
    case 'slider':
      return sliderSizeMap[size];
    default:
      throw new Error(`Unknown component type: ${componentType}`);
  }
}
