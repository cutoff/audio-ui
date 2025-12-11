import React from "react";
import { ContinuousParameter, BooleanParameter } from "../models/AudioParameter";

/**
 * Size options for control components
 */
export type SizeType = "xsmall" | "small" | "normal" | "large" | "xlarge";

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

/**
 * Base props for all components
 */
export type BaseProps = {
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
};

/**
 * Adaptive sizing props for responsive components
 */
export type AdaptiveSize = {
    /** Size of the component
     * @default 'normal'
     */
    size?: SizeType;

    /** Whether the component should stretch to fill its container
     *  @default false
     */
    stretch?: boolean;
};

/**
 * Interaction modes for controls
 */
export type InteractionMode = "drag" | "wheel" | "both";

/**
 * Props for interactive controls (drag, wheel, keyboard)
 * Used by both continuous and enum controls
 */
export type InteractiveControl = {
    /** Handler for value changes
     * @param value The new value or a function to update the previous value
     */
    onChange?: (value: number | ((prev: number) => number)) => void;

    /**
     * Interaction mode: drag, wheel, or both.
     * @default "both"
     */
    interactionMode?: InteractionMode;

    /**
     * Sensitivity of the control.
     * Represents the amount of normalized value change per pixel (drag) or unit (wheel).
     * @default Component-specific
     */
    sensitivity?: number;
};

/**
 * Props for continuous value controls (primitives like SvgContinuousControl).
 *
 * Note: This is a primitive type for building customizable controls. Built-in controls
 * (Knob, Slider) extend this with Themable props. If you're building a custom control
 * using SvgContinuousControl, you can add your own theming props as needed.
 *
 * Supports two modes:
 * 1. Parameter model mode: Provide `parameter` (ContinuousParameter) - all range/label info comes from the model
 * 2. Ad-hoc mode: Provide `min`, `max`, `step`, `label` directly as props
 *
 * When `parameter` is provided, it takes precedence over ad-hoc props.
 */
export type ContinuousControlProps = BaseProps &
    AdaptiveSize &
    InteractiveControl & {
        /** Current value of the control */
        value: number;

        /** Label displayed below the component */
        label?: string;

        /** Identifier for the parameter this control represents
         * Used when creating ad-hoc parameters
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

        /**
         * Whether the component should operate in bipolar mode
         * In bipolar mode, the component visualizes values relative to a center point
         * rather than from minimum to maximum
         * @default false
         */
        bipolar?: boolean;

        /**
         * Audio Parameter definition (Model)
         * If provided, overrides min/max/step/label/bipolar from ad-hoc props
         */
        parameter?: ContinuousParameter;

        /** Minimum value (ad-hoc mode, ignored if parameter provided) */
        min?: number;

        /** Maximum value (ad-hoc mode, ignored if parameter provided) */
        max?: number;

        /** Step size for value adjustments (ad-hoc mode, ignored if parameter provided)
         * @default 1 (or calculated based on range)
         */
        step?: number;
    };

/**
 * Props for boolean value controls (primitives).
 *
 * Note: This is a primitive type for building customizable controls. Built-in controls
 * (Button) extend this with Themable props. If you're building a custom control,
 * you can add your own theming props as needed.
 *
 * Supports two modes:
 * 1. Parameter model mode: Provide `parameter` (BooleanParameter) - all config comes from the model
 * 2. Ad-hoc mode: Provide `label`, `latch` directly as props
 *
 * When `parameter` is provided, it takes precedence over ad-hoc props.
 */
export type BooleanControlProps = BaseProps &
    AdaptiveSize & {
        /** Current value (must be boolean) */
        value: boolean;

        /** Handler for value changes */
        onChange?: (value: boolean) => void;

        /** Label displayed below the component */
        label?: string;

        /** Identifier for the parameter this control represents
         * Used when creating ad-hoc parameters
         */
        paramId?: string;

        /**
         * Audio Parameter definition (Model)
         * If provided, overrides label/latch from ad-hoc props
         */
        parameter?: BooleanParameter;

        /** Whether the button should latch (toggle between states) or momentary (only active while pressed)
         * Ad-hoc mode only, ignored if parameter provided
         * @default false
         */
        latch?: boolean;
    };

// --- GENERIC CONTRACTS ---

/**
 * Contract for a component acting as a visualization for a generic control.
 * It defines the geometric requirements and interaction behavior.
 */
export interface ControlComponentView {
    /** The viewBox dimensions required by this visualization */
    viewBox: { width: number; height: number };

    /**
     * Label height in the same units as SVG viewBox height.
     * Used by AdaptiveBox to calculate layout proportions.
     */
    labelHeightUnits?: number;

    /**
     * The preferred interaction configuration for this visualization.
     * This tells the generic control how to interpret user input.
     */
    interaction: {
        /** Supported interaction modes */
        mode?: "drag" | "wheel" | "both";
        /**
         * Direction of the interaction gesture.
         * - vertical: Drag up/down changes value (Standard Faders/Knobs)
         * - horizontal: Drag left/right changes value
         */
        direction?: "vertical" | "horizontal";
    };
}

/**
 * The minimum props that ANY control view must accept.
 */
export interface ControlComponentViewProps {
    /** The normalized value (0..1) to display */
    normalizedValue: number;

    /** Content to be rendered inside the control (e.g. label, icon) */
    children?: React.ReactNode;

    /** Optional class name passed from the parent */
    className?: string;

    /** Optional style passed from the parent */
    style?: React.CSSProperties;
}

/**
 * A Generic Component Type that enforces the contract + props.
 * P = Additional custom props specific to the visualization (e.g. color, thickness).
 */
export type ControlComponent<P = {}> = React.ComponentType<ControlComponentViewProps & P> & ControlComponentView;
