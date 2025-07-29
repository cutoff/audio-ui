/**
 * Utility functions for color manipulation
 * 
 * This module provides simplified color manipulation functions that leverage
 * modern CSS capabilities instead of reimplementing color parsing logic.
 */

/**
 * Named colors mapping to their HSL values
 * Used as fallbacks for luminosity variants of named colors
 */
const namedColors: Record<string, string> = {
    blue: 'hsl(204, 88%, 53%)',
    orange: 'hsl(29, 100%, 50%)',
    pink: 'hsl(332, 95%, 54%)',
    green: 'hsl(160, 98%, 37%)',
    purple: 'hsl(252, 100%, 67%)',
    yellow: 'hsl(50, 100%, 50%)',
    white: 'hsl(0, 0%, 100%)'
};

/**
 * Generates a luminosity-based variant of a color
 * @param baseColor The base color (any valid CSS color value)
 * @param luminosityPercentage The percentage of the original luminosity (0-100)
 * @returns A CSS color value with adjusted luminosity
 */
export function generateLuminosityVariant(baseColor: string, luminosityPercentage: number): string {
    // Handle named colors with known HSL values
    const lowerColor = baseColor.toLowerCase();
    if (lowerColor in namedColors) {
        // Extract the HSL values and adjust luminosity
        const hslMatch = namedColors[lowerColor].match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (hslMatch) {
            const h = hslMatch[1];
            const s = hslMatch[2];
            const l = parseInt(hslMatch[3], 10);
            const newL = Math.max(0, Math.min(100, l * (luminosityPercentage / 100)));
            return `hsl(${h}, ${s}%, ${newL}%)`;
        }
    }
    
    // For all other colors, use color-mix with black to darken
    // This is a simpler approach that works for any valid CSS color
    const darkening = 100 - luminosityPercentage;
    return `color-mix(in srgb, ${baseColor}, black ${darkening}%)`;
}

/**
 * Generates a transparency-based variant of a color
 * @param baseColor The base color (any valid CSS color value)
 * @param opacityPercentage The opacity percentage (0-100)
 * @returns A CSS color value with adjusted opacity
 */
export function generateTransparencyVariant(baseColor: string, opacityPercentage: number): string {
    // Use color-mix() to create a transparent variant
    // This is a modern CSS feature that works with any valid CSS color
    return `color-mix(in srgb, ${baseColor} ${opacityPercentage}%, transparent)`;
}

/**
 * Generates a highlight color variant suitable for drop-shadow effects
 * @param baseColor The base color (any valid CSS color value)
 * @returns A CSS color value optimized for highlight effects
 */
export function generateHighlightColor(baseColor: string): string {
    // Handle special case for named colors to ensure consistent results
    const lowerColor = baseColor.toLowerCase();
    if (lowerColor in namedColors) {
        baseColor = namedColors[lowerColor];
    }
    
    // For highlight effects, we want a slightly brighter and more saturated color
    // Extract the HSL values if possible
    const hslMatch = baseColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
        const h = parseInt(hslMatch[1], 10);
        const s = Math.min(100, parseInt(hslMatch[2], 10) + 10); // Increase saturation
        const l = Math.min(70, parseInt(hslMatch[3], 10) + 10);  // Increase lightness but cap at 70%
        return `hsl(${h}, ${s}%, ${l}%)`;
    }
    
    // For other color formats, use a simple approach that works for any color
    return `color-mix(in srgb, ${baseColor} 80%, white 20%)`;
}

/**
 * Generates color variants for a component
 * @param baseColor The base color (any valid CSS color value)
 * @param variant The variant type ('luminosity' or 'transparency')
 * @returns An object with primary, primary50, primary20, and highlight color values
 */
export function generateColorVariants(baseColor: string, variant: 'luminosity' | 'transparency' = 'luminosity'): {
    primary: string;
    primary50: string;
    primary20: string;
    highlight: string;
} {
    // Handle special case for named colors to ensure consistent results
    const lowerColor = baseColor.toLowerCase();
    if (lowerColor in namedColors) {
        baseColor = namedColors[lowerColor];
    }
    
    // Generate the highlight color
    const highlight = generateHighlightColor(baseColor);
    
    if (variant === 'luminosity') {
        return {
            primary: baseColor,
            primary50: generateLuminosityVariant(baseColor, 50),
            primary20: generateLuminosityVariant(baseColor, 20),
            highlight
        };
    } else {
        return {
            primary: baseColor,
            primary50: generateTransparencyVariant(baseColor, 50),
            primary20: generateTransparencyVariant(baseColor, 20),
            highlight
        };
    }
}
