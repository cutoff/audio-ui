/**
 * Size options for control components
 */
export type SizeType = "xsmall" | "small" | "normal" | "large" | "xlarge";

/**
 * Interaction modes for controls
 */
export type InteractionMode = "drag" | "wheel" | "both";

/**
 * Interface for themable components
 */
export type Themable = {
    /** Component primary color - any valid CSS color value
     * @default "blue"
     */
    color?: string;

    /** Roundness for component corners/caps
     * Normalized value between 0.0 (square) and 1.0 (fully rounded)
     * @default 0.3
     */
    roundness?: number;

    /** Thickness for component strokes/widths
     * Normalized value between 0.0 (smallest) and 1.0 (largest)
     * @default 0.4
     */
    thickness?: number;
};
