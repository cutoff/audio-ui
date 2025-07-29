import React from "react";

/**
 * Size options for control components
 */
export type SizeType = 'xsmall' | 'small' | 'normal' | 'large' | 'xlarge';

/**
 * Interface for themable components
 */
export type Themable = {
    /** Component primary color - any valid CSS color value
     * @default "blue"
     */
    color?: string;
    
    /** Roundness for component corners/caps
     * @default Component-specific: Knob uses 12, Slider uses half width, Button uses 10px
     * A value of 0 means square corners/caps, while values > 0 create rounded corners/caps
     */
    roundness?: number;
};

export type Base = Themable & {
    /** Additional CSS classes */
    className?: string;
    /** Additional inline styles */
    style?: React.CSSProperties;
    /** Click event handler */
    onClick?: React.MouseEventHandler;
    /** Mouse down event handler */
    onMouseDown?: React.MouseEventHandler;
    /** Mouse up event handler */
    onMouseUp?: React.MouseEventHandler;
    /** Mouse enter event handler */
    onMouseEnter?: React.MouseEventHandler;
    /** Mouse leave event handler */
    onMouseLeave?: React.MouseEventHandler;
}

export type AdaptativeSize = {
    /** Size of the component
     * @default 'normal'
     */
    size?: SizeType;

    /** Whether the component should stretch to fill its container
     *  @default false
     */
    stretch?: boolean;
};

export type InteractiveControl = {

    /** Handler for value changes
     * @param value The new value or a function to update the previous value
     */
    onChange?: (value: number | ((prev: number) => number)) => void;
}

export type ExplicitRange = {
    /** Minimum value of the component */
    min: number;
    /** Maximum value of the component */
    max: number;
}

/**
 * Base interface for control components with value ranges
 * Extends Stretchable to include responsive sizing capabilities
 */
export type Control = AdaptativeSize & InteractiveControl & Base & {
    /** Label displayed below the component */
    label?: string;

    /** Current value of the component */
    value: number;

    /** Identifier for the parameter this control represents
     * Used as the first argument in onChange callbacks
     */
    paramId?: string;

    /**
     * Custom renderer for the value display
     * If provided, this function will be used to render the value instead of the default formatter
     * @param value The current value
     * @param min The minimum value
     * @param max The maximum value
     * @returns A string representation of the value
     */
    renderValue?: (value: number, min: number, max: number) => string;
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
