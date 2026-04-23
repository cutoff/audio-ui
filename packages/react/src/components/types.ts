/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import React from "react";
import {
    ContinuousParameter,
    BooleanParameter,
    DiscreteParameter,
    DiscreteOption,
    ScaleType,
    AudioParameter,
    MidiResolution,
} from "@cutoff/audio-ui-core";

// Re-export types from core
export type { SizeType, InteractionMode, InteractionDirection } from "@cutoff/audio-ui-core";

// Import types for use in this file
import { SizeType, InteractionMode, InteractionDirection } from "@cutoff/audio-ui-core";

/**
 * Variant options for the Knob component
 */
export type KnobVariant = "abstract" | "simplest" | "plainCap" | "iconCap";

/**
 * Variant options for the Slider component
 */
export type SliderVariant = "abstract" | "trackless" | "trackfull" | "stripless";

/**
 * Cursor size options for the Slider component.
 * Determines which component's width is used for the cursor.
 * - "None": No cursor is rendered
 * - "Strip": Width of the ValueStrip (if variant supports it)
 * - "Track": Width of the LinearStrip (track)
 * - "Tick": Width of the TickStrip (future use)
 * - "Label": Entire width of the Slider, to the LabelStrip (future use)
 */
export type SliderCursorSize = "None" | "Strip" | "Track" | "Tick" | "Label";

/**
 * Mode for displaying value vs label.
 * - "labelOnly": Always shows the label (default)
 * - "valueOnly": Always shows the value
 * - "interactive": Shows label normally, but temporarily swaps to value during interaction
 */
export type ValueLabelMode = "labelOnly" | "valueOnly" | "interactive";

/**
 * Standard event object emitted by all AudioUI controls.
 * Provides the value in all three domain representations simultaneously.
 */
export type AudioControlEvent<T = number> = {
    /**
     * The real-world value in user-facing units — Hz, dB, semitones, seconds, etc.
     * For `Knob` and `Slider`, this is a `number` in the prop's `[min, max]` range.
     * For `CycleButton`, this is the option's `value`.
     * For `Button`, this is a `boolean`.
     */
    value: T;

    /**
     * Normalized 0.0-1.0 representation — useful for host automation,
     * cross-parameter mapping, and rendering scale-agnostic UIs.
     */
    normalizedValue: number;

    /**
     * MIDI integer representation — 0-127 for 7-bit, 0-16383 for 14-bit high-resolution.
     * Use for hardware/protocol integration.
     */
    midiValue: number;

    /**
     * The parameter definition driving this value, when bound via the `parameter` prop.
     * Undefined when the control is used in ad-hoc mode (min/max props only).
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameter?: any; // To avoid circular deps
};

/**
 * Value channel — one of three mutually-exclusive input/output pairs.
 *
 * Pick exactly one representation for a control:
 * - `value` / `onValueChange`: real-world value (Hz, dB, boolean, option value, ...).
 * - `normalizedValue` / `onNormalizedValueChange`: normalized 0..1 (JUCE-style hosts, automation).
 * - `midiValue` / `onMidiValueChange`: MIDI integer (hardware, MIDI-native apps).
 *
 * TypeScript enforces mutual exclusion via a discriminated union: providing props from more
 * than one channel is a compile error. Every paired callback receives `(value, event)` —
 * the first argument matches the chosen representation; the second is the full
 * {@link AudioControlEvent} with all three representations populated.
 *
 * @example
 * ```tsx
 * // Real-world binding (typical)
 * <Knob value={cutoffHz} onValueChange={setCutoffHz} parameter={cutoffParam} />
 *
 * // Normalized binding (e.g. JUCE WebUI)
 * <Knob normalizedValue={n} onNormalizedValueChange={setN} parameter={cutoffParam} />
 *
 * // MIDI binding (e.g. MIDI controller mapping)
 * <Knob midiValue={cc} onMidiValueChange={setCC} parameter={cutoffParam} />
 *
 * // Full event access via the second callback arg
 * <Knob value={hz} onValueChange={(v, e) => { setHz(v); logMidi(e.midiValue); }} parameter={cutoffParam} />
 * ```
 */
export type ValueChannel<T = number> =
    | {
          /** Current real-world value (Hz, dB, boolean state, option value, ...). */
          value?: T;
          normalizedValue?: never;
          midiValue?: never;
          /**
           * Handler for value changes when bound via `value`.
           * First argument: the new real-world value. Second argument: full event with all representations.
           */
          onValueChange?: (value: T, event: AudioControlEvent<T>) => void;
          onNormalizedValueChange?: never;
          onMidiValueChange?: never;
      }
    | {
          value?: never;
          /** Current normalized 0..1 value. */
          normalizedValue: number;
          midiValue?: never;
          onValueChange?: never;
          /**
           * Handler for value changes when bound via `normalizedValue`.
           * First argument: the new normalized value. Second argument: full event with all representations.
           */
          onNormalizedValueChange?: (value: number, event: AudioControlEvent<T>) => void;
          onMidiValueChange?: never;
      }
    | {
          value?: never;
          normalizedValue?: never;
          /** Current MIDI integer value (0-127 for 7-bit, 0-16383 for 14-bit, etc.). */
          midiValue: number;
          onValueChange?: never;
          onNormalizedValueChange?: never;
          /**
           * Handler for value changes when bound via `midiValue`.
           * First argument: the new MIDI integer. Second argument: full event with all representations.
           */
          onMidiValueChange?: (value: number, event: AudioControlEvent<T>) => void;
      };

/**
 * Permissive value channel — same three input/output pairs as {@link ValueChannel}, but without
 * mutual-exclusion enforcement. All six props are independently optional. Runtime precedence
 * picks the active channel (`value` > `normalizedValue` > `midiValue`).
 *
 * Use this on composable primitives and custom wrapper components where call-site strictness
 * is less valuable than forwarding ergonomics. End-user controls (`Knob`, `Slider`, `Button`,
 * `CycleButton`) use the strict {@link ValueChannel} form instead — a strict `ValueChannel<T>`
 * is a subset of `ValueChannelAny<T>`, so forwarding from a strict parent to a permissive
 * primitive type-checks directly.
 */
export type ValueChannelAny<T = number> = {
    /** Current real-world value (Hz, dB, boolean state, option value, ...). */
    value?: T;
    /** Current normalized 0..1 value. */
    normalizedValue?: number;
    /** Current MIDI integer value (0-127 for 7-bit, 0-16383 for 14-bit, etc.). */
    midiValue?: number;
    /** Paired callback for `value` input. First arg: new real-world value. Second arg: full event. */
    onValueChange?: (value: T, event: AudioControlEvent<T>) => void;
    /** Paired callback for `normalizedValue` input. First arg: new normalized value. Second arg: full event. */
    onNormalizedValueChange?: (value: number, event: AudioControlEvent<T>) => void;
    /** Paired callback for `midiValue` input. First arg: new MIDI integer. Second arg: full event. */
    onMidiValueChange?: (value: number, event: AudioControlEvent<T>) => void;
};

/**
 * Props for interactive controls (drag, wheel, keyboard).
 * Composes a {@link ValueChannel} (the three mutually-exclusive input/output pairs) with
 * interaction-tuning props. Used by continuous controls (Knob, Slider) and composable with
 * custom controls that follow the same interaction model.
 *
 * T is the real-value type emitted by the control:
 * - `number` for continuous controls (Knob, Slider)
 * - `boolean` for boolean controls (via BooleanControlProps)
 * - `string | number` for discrete/enum controls (via DiscreteControlProps)
 */
export type InteractiveControlProps<T = number> = ValueChannel<T> & InteractionTuningProps;

/**
 * Permissive sibling of {@link InteractiveControlProps}, using {@link ValueChannelAny} in place of
 * the strict {@link ValueChannel}. Intended for primitives and custom wrappers where forwarding
 * ergonomics matter more than call-site mutual-exclusion enforcement.
 */
export type InteractiveControlPrimitiveProps<T = number> = ValueChannelAny<T> & InteractionTuningProps;

/**
 * Interaction-tuning props shared by strict and permissive variants.
 */
export type InteractionTuningProps = {
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

    /**
     * How to handle label text overflow.
     * - "ellipsis": Truncate with ellipsis when text is too long
     * - "abbreviate": Abbreviate text to 3 characters max (e.g., "Volume" -> "Vol")
     * - "auto": Automatically abbreviate when viewBoxWidth < viewBoxHeight, otherwise ellipsis
     *
     * @default "auto"
     */
    labelOverflow?: "ellipsis" | "abbreviate" | "auto";

    /**
     * Label height in the same units as SVG viewBox height.
     * Overrides the default from the view component's static labelHeightUnits property.
     */
    labelHeightUnits?: number;
};

/**
 * Logical size props for AdaptiveBox layout calculations.
 * These correspond to the viewBox and labelHeightUnits properties
 * from the ControlComponentView interface, but allow per-instance override.
 */
export type AdaptiveBoxLogicalSizeProps = {
    /**
     * ViewBox width in the same coordinate system as the content.
     * Overrides the default from the view component's static viewBox.width property.
     */
    viewBoxWidthUnits?: number;

    /**
     * ViewBox height in the same coordinate system as the content.
     * Overrides the default from the view component's static viewBox.height property.
     */
    viewBoxHeightUnits?: number;

    /**
     * Label height in the same units as SVG viewBox height.
     * Overrides the default from the view component's static labelHeightUnits property.
     */
    labelHeightUnits?: number;
};

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
 * BaseProps for all components
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
/**
 * Continuous-specific props shared by strict and permissive variants.
 */
type ContinuousControlSharedProps = {
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
     * Controls how the label and value are displayed.
     * - "labelOnly": Always shows the label (default)
     * - "valueOnly": Always shows the value
     * - "interactive": Shows label normally, but temporarily swaps to value during interaction
     * @default "labelOnly"
     */
    valueAsLabel?: ValueLabelMode;

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

    /** MIDI resolution in bits (ad-hoc mode, ignored if parameter provided)
     * @default 32
     */
    midiResolution?: MidiResolution;

    /** Default value for the parameter (ad-hoc mode, ignored if parameter provided) */
    defaultValue?: number;

    /**
     * Orientation for slider role (accessibility).
     * Pass "horizontal" or "vertical" for linear sliders; omit for radial controls (e.g. Knob).
     */
    ariaOrientation?: "horizontal" | "vertical";
};

/**
 * Strict props for continuous controls — used by end-user controls (Knob, Slider) and by
 * any consumer that wants TypeScript to enforce the "pick exactly one value channel" contract.
 */
export type ContinuousControlProps = BaseProps & InteractiveControlProps<number> & ContinuousControlSharedProps;

/**
 * Permissive props for continuous controls — used by the {@link ContinuousControl} primitive
 * and by custom wrappers that compose it. Independent optionals on every channel prop make
 * forwarding trivial; runtime precedence (`value` > `normalizedValue` > `midiValue`) picks
 * the active channel. A strict {@link ContinuousControlProps} is structurally assignable to
 * this permissive form, so wrappers can forward strict parent props to a permissive child.
 */
export type ContinuousControlPrimitiveProps = BaseProps &
    InteractiveControlPrimitiveProps<number> &
    ContinuousControlSharedProps;

/**
 * Props for discrete value controls (primitives like DiscreteControl).
 *
 * This type is size-agnostic: it does not include AdaptiveSizeProps.
 * Built-in controls (CycleButton) combine this with AdaptiveSizeProps
 * so only high-level components handle size and stretch.
 *
 * **Important: Options vs Children**
 *
 * - **`options` prop**: Defines the parameter model (value, label, midiValue). Used for parameter structure.
 * - **`children` (Option components)**: Provides visual content (ReactNodes) for rendering. Used for display.
 *
 * These serve different purposes and can be used together:
 * - Use `options` when you have data-driven option definitions
 * - Use `children` when you want to provide custom visual content (icons, styled text, etc.)
 * - Use both: `options` for the model, `children` for visuals (matched by value)
 *
 * Supports four modes:
 * 1. **Ad-Hoc Mode (Options prop)**: Model from `options` prop, visual from `children` (if provided) or default rendering
 * 2. **Ad-Hoc Mode (Children only)**: Model inferred from OptionView children, visual from children
 * 3. **Strict Mode (Parameter only)**: Model from `parameter` prop, visual via `renderOption` callback
 * 4. **Hybrid Mode (Parameter + Children)**: Model from `parameter` prop, visual from children (matched by value)
 *
 * When `parameter` is provided, it takes precedence over ad-hoc props.
 */
/**
 * Discrete-specific props shared by strict and permissive variants.
 */
type DiscreteControlSharedProps = {
    /**
     * Default value for uncontrolled mode.
     * Used when no input channel (`value`, `normalizedValue`, `midiValue`) is provided.
     */
    defaultValue?: string | number;

    /** Label displayed below the component */
    label?: string;

    /** Identifier for the parameter this control represents
     * Used when creating ad-hoc parameters
     */
    paramId?: string;

    /**
     * Audio Parameter definition (Model)
     * If provided, overrides label/options from ad-hoc props
     */
    parameter?: DiscreteParameter;

    /** Option definitions for the parameter model (Ad-Hoc mode)
     *
     * **Parameter Model Only**: This prop defines the parameter structure (value, label, midiValue).
     * It does NOT provide visual content - use `children` (OptionView components) for that.
     *
     * When both `options` and `children` are provided:
     * - `options` defines the parameter model
     * - `children` provide visual content (matched by value)
     */
    options?: DiscreteOption[];

    /** Child elements (OptionView components) for visual content mapping (Hybrid/Ad-Hoc mode)
     *
     * **Visual Content Only**: Children provide ReactNodes for rendering (icons, text, custom components).
     * They do NOT define the parameter model - use `options` prop or `parameter` prop for that.
     *
     * When both `options` and `children` are provided, children are matched to options by value
     * to create the visual content map.
     */
    children?: React.ReactNode;

    /** MIDI resolution in bits (ad-hoc mode, ignored if parameter provided)
     * @default 7
     */
    midiResolution?: MidiResolution;

    /** MIDI mapping strategy (ad-hoc mode, ignored if parameter provided)
     * @default "spread"
     */
    midiMapping?: "spread" | "sequential" | "custom";
};

/**
 * Strict props for discrete controls — used by end-user controls (CycleButton).
 */
export type DiscreteControlProps = BaseProps & ValueChannel<string | number> & DiscreteControlSharedProps;

/**
 * Permissive props for discrete controls — used by the {@link DiscreteControl} primitive
 * and by custom wrappers that compose it.
 */
export type DiscreteControlPrimitiveProps = BaseProps & ValueChannelAny<string | number> & DiscreteControlSharedProps;

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
/**
 * Boolean-specific props shared by strict and permissive variants.
 */
type BooleanControlSharedProps = {
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

    /** MIDI resolution in bits (ad-hoc mode, ignored if parameter provided)
     * @default 7
     */
    midiResolution?: MidiResolution;
};

/**
 * Strict props for boolean controls — used by end-user controls (Button).
 */
export type BooleanControlProps = BaseProps & ValueChannel<boolean> & BooleanControlSharedProps;

/**
 * Permissive props for boolean controls — used by the {@link BooleanControl} primitive
 * and by custom wrappers that compose it.
 */
export type BooleanControlPrimitiveProps = BaseProps & ValueChannelAny<boolean> & BooleanControlSharedProps;

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
        mode?: InteractionMode;
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
export type ControlComponent<P = Record<string, unknown>> = React.ComponentType<ControlComponentViewProps & P> &
    ControlComponentView &
    Partial<ControlComponentMetadata>;
