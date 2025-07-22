/**
 * Interface for components that can stretch to fill their container
 */
export type Stretchable = {
    /** Whether the component should stretch to fill its container
     *  @default false
     */
    stretch?: boolean;
};

/**
 * Base interface for control components with value ranges
 * Extends Stretchable to include responsive sizing capabilities
 */
export type Control = Stretchable & {
    /** Label displayed below the component */
    label?: string;
    /** Minimum value of the component */
    min: number;
    /** Maximum value of the component */
    max: number;
    /** Current value of the component */
    value: number;
};

/**
 * Interface for control components that support bipolar (centered) mode
 * Extends Control to include all basic control properties
 */
export type BipolarControl = Control & {
    /** 
     * Whether the component should operate in bipolar mode
     * In bipolar mode, the component visualizes values relative to a center point
     * rather than from minimum to maximum
     * @default false
     */
    bipolar?: boolean;
};
