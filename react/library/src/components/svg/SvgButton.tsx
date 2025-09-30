import { useMemo } from "react";
import { generateColorVariants } from "../utils/colorUtils";

/**
 * Props for the SvgButton component
 */
export type SvgButtonProps = {
    /** Normalized value between 0 and 1 */
    normalizedValue: number;
    /** Threshold for determining "on" state (default 0.5) */
    threshold?: number;
    /** Corner roundness (0 = square, > 0 = rounded) */
    roundness?: number;
    /** Resolved color string */
    color: string;
    /** Additional CSS class name */
    className?: string;
};

/**
 * Pure SVG presentation component for a button.
 * Renders a rectangle with conditional styling based on normalized value vs threshold.
 *
 * @param normalizedValue - Value between 0 and 1
 * @param threshold - Threshold value (default 0.5), determines "on" state
 * @param roundness - Corner radius (default 10)
 * @param color - Resolved color string
 * @param className - Optional CSS class
 */
function SvgButton({
    normalizedValue,
    threshold = 0.5,
    roundness = 10,
    color,
    className,
}: SvgButtonProps): JSX.Element {
    // Determine if button is "on" based on threshold
    const isOn = useMemo(() => normalizedValue > threshold, [normalizedValue, threshold]);

    // Generate color variants
    const colorVariants = useMemo(() => generateColorVariants(color, "transparency"), [color]);

    // Calculate corner radius (ensure non-negative)
    const cornerRadius = useMemo(() => Math.max(0, roundness), [roundness]);

    // Determine button styles based on state
    const buttonStyles = useMemo(
        () => ({
            stroke: isOn ? colorVariants.primary50 : colorVariants.primary20,
            fill: isOn ? colorVariants.primary : colorVariants.primary50,
        }),
        [isOn, colorVariants]
    );

    return (
        <rect
            className={className}
            style={{
                stroke: buttonStyles.stroke,
                fill: buttonStyles.fill,
            }}
            strokeWidth="5"
            x={10}
            y={10}
            width={80}
            height={40}
            rx={cornerRadius}
            ry={cornerRadius}
        />
    );
}

/**
 * ViewBox dimensions for the SvgButton component.
 * The parent component should use these values when setting up the SVG container.
 */
SvgButton.viewBox = {
    width: 100,
    height: 60,
} as const;

export default SvgButton;
