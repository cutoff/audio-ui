import React from "react";
import { ContinuousParameter, BooleanParameter, ScaleType, AudioParameter } from "@cutoff/audio-ui-core";
import { SizeType, InteractionMode, InteractionDirection } from "@cutoff/audio-ui-core";

/**
 * Size options for control components
 */
// SizeType is imported from core now

/**
 * Props for themable components
 */
export type ThemableProps = {
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
export type AdaptiveSizeProps = {
    /**
     * Adaptive sizing mode for the component.
     * When true, the component stretches to fill its container and
     * ignores the `size` prop for sizing constraints.
     *
     * When both `adaptiveSize` and `size` are provided, `adaptiveSize`
     * takes precedence for sizing behavior.
     *
     * @default false
     */
    adaptiveSize?: boolean;

    /** Size of the component
     * @default 'normal'
     */
    size?: SizeType;
};

/**
 * Layout props that control how AdaptiveBox behaves for a control.
 */
export type AdaptiveBoxProps = {
    /**
     * Layout mode for the control.
     * - "scaleToFit": Preserve aspect ratio, letterbox within container.
     * - "fill": Fill container, allowing horizontal stretching of the SVG.
     *
     * @default "scaleToFit"
     */
    displayMode?: "scaleToFit" | "fill";

    /**
     * Visibility of the label row.
     * - "visible": Render the label and reserve space.
     * - "hidden": Reserve space but visually hide the label.
     * - "none": Do not reserve label space.
     *
     * @default "visible"
     */
    labelMode?: "none" | "hidden" | "visible";

    /**
     * Vertical position of the label relative to the control.
     *
     * @default "below"
     */
    labelPosition?: "above" | "below";

    /**
     * Horizontal alignment of the label text within its row.
     *
     * @default "center"
     */
    labelAlign?: "start" | "center" | "end";
};

/**
 * Variant options for the Knob component
 */
export type KnobVariant = "abstract" | "simplest" | "plainCap" | "iconCap";

/**
 * Standard event object emitted by all AudioUI controls.
 * Provides the value in all three domain representations simultaneously.
 */
export type AudioControlEvent<T = number> = {
    /** The real-world value (e.g. -6.0 dB, 440 Hz, true/false) */
    value: T;
    /** The normalized value (0.0 to 1.0) used for UI rendering and host automation */
    normalizedValue: number;
    /** The MIDI value (integer, e.g. 0-127 or 0-16383) used for hardware/protocol communication */
    midiValue: number;
    /** The parameter definition driving this value */
    parameter?: any; // To avoid circular deps
};

/**
 * Props for interactive controls (drag, wheel, keyboard)
 * Used by both continuous and enum controls.
 *
 * T is the real value type emitted by the control:
 * - number for continuous controls (Knob, Slider)
 * - boolean for boolean controls (not commonly using this type)
 * - custom types for enum-like controls (e.g. KnobSwitch)
 */
export type InteractiveControlProps<T = number> = {
    /**
     * Handler for value changes.
     * Receives a rich event object with real, normalized, and MIDI representations.
     */
    onChange?: (event: AudioControlEvent<T>) => void;

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
    interactionSensitivity?: number;

    /**
     * Direction of the interaction.
     * Overrides the default direction defined by the component's view.
     */
    interactionDirection?: InteractionDirection;
};

/**
 * Props for continuous value controls (primitives like ContinuousControl).
 *
 * This type is size-agnostic: it does not include AdaptiveSizeProps.
 * Built-in controls (Knob, Slider) combine this with AdaptiveSizeProps
 * so only high-level components handle size and stretch.
 *
 * Supports two modes:
 * 1. Parameter model mode: Provide `parameter` (ContinuousParameter) - all range/label info comes from the model
 * 2. Ad-hoc mode: Provide `min`, `max`, `step`, `label` directly as props
 *
 * When `parameter` is provided, it takes precedence over ad-hoc props.
 */
export type ContinuousControlProps = BaseProps &
    InteractiveControlProps<number> & {
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
         * If provided and returns a value, this function will be used to render the value instead of the default formatter
         * @param value The current value
         * @param parameterDef The full parameter definition (includes min, max, unit, scale, etc.)
         * @returns A string representation of the value, or undefined to fall back to default formatter
         */
        valueFormatter?: (value: number, parameterDef: AudioParameter) => string | undefined;

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

        /**
         * Unit suffix for the value in ad-hoc mode (e.g. "dB", "Hz").
         * Used only when the internal parameter model is created from the props.
         * Ignored when a full `parameter` object is provided.
         */
        unit?: string;

        /**
         * Scale function or shortcut for the parameter in ad-hoc mode.
         * Controls how the normalized 0..1 range maps to the real value domain.
         * Common shortcuts are "linear", "log", and "exp".
         * Ignored when a full `parameter` object is provided.
         */
        scale?: ScaleType;

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
 * This type is size-agnostic: it does not include AdaptiveSizeProps.
 * Built-in controls (Button) combine this with AdaptiveSizeProps
 * so only high-level components handle size and stretch.
 *
 * Supports two modes:
 * 1. Parameter model mode: Provide `parameter` (BooleanParameter) - all config comes from the model
 * 2. Ad-hoc mode: Provide `label`, `latch` directly as props
 *
 * When `parameter` is provided, it takes precedence over ad-hoc props.
 */
export type BooleanControlProps = BaseProps & {
    /** Current value (must be boolean) */
    value: boolean;

    /** Handler for value changes */
    onChange?: (event: AudioControlEvent<boolean>) => void;

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
         * - circular: Drag in a circle around the center changes value (Rotary Knobs)
         */
        direction?: InteractionDirection;
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
export type ControlComponent<P = {}> = React.ComponentType<ControlComponentViewProps & P> &
    ControlComponentView &
    Partial<ControlComponentMetadata>;

/**
 * Metadata for a control component.
 * Used for display in customization interfaces and documentation.
 */
export interface ControlComponentMetadata {
    /** Display name/title for the component */
    title: string;
    /** Optional description of what the component does */
    description?: string;
}
