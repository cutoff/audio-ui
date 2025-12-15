"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import AdaptiveBox from "../primitives/AdaptiveBox";
import SvgKnob from "../theme/SvgKnob";
import { AdaptiveBoxProps, AdaptiveSizeProps, BaseProps, InteractiveControlProps, ThemableProps } from "../types";
import { getSizeClassForComponent, getSizeStyleForComponent } from "@cutoff/audio-ui-core";
import { useThemableProps } from "../theme/AudioUiProvider";
import { CLASSNAMES } from "@cutoff/audio-ui-core";
import { EnumParameter } from "@cutoff/audio-ui-core";
import { useAudioParameter } from "../../hooks/useAudioParameter";
import { useInteractiveControl } from "../../hooks/useInteractiveControl";
import { clampNormalized } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";

/**
 * Props for the option elements within KnobSwitch
 */
export type KnobSwitchOptionProps = {
    /** Value associated with this option */
    value?: any;
    /** Whether this option is selected by default when no value prop is provided */
    selected?: boolean;
    /** Content to display when this option is selected */
    children?: React.ReactNode;
};

/**
 * Props for the KnobSwitch component
 */
export type KnobSwitchProps = AdaptiveSizeProps &
    AdaptiveBoxProps &
    InteractiveControlProps<any> &
    BaseProps &
    ThemableProps & {
        /** Label displayed below the component */
        label?: string;
        /** Current value of the component */
        value?: any;
        /** Child elements (KnobSwitch.Option components) - Optional if parameter provided */
        children?: React.ReactNode;
        /** Identifier for the parameter this control represents */
        paramId?: string;
        /** Audio Parameter definition (Model) */
        parameter?: EnumParameter;
        /** Custom renderer for options (Mode A) */
        renderOption?: (option: { value: any; label: string }) => React.ReactNode;
        /** Thickness of the knob's stroke (normalized 0.0-1.0, maps to 1-20) */
        thickness?: number;
    };

/**
 * A switch component that uses a knob interface to cycle through options.
 * ...
 */
const KnobSwitch: React.FC<KnobSwitchProps> & {
    Option: React.FC<KnobSwitchOptionProps>;
} = ({
    value,
    onChange,
    renderOption,
    label,
    adaptiveSize = false,
    size = "normal",
    displayMode,
    labelMode,
    labelPosition,
    labelAlign,
    color,
    roundness,
    thickness = 0.4,
    parameter,
    paramId,
    interactionMode,
    sensitivity,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    className,
    style,
    children,
}) => {
    // Use the themable props hook to resolve color and roundness with proper fallbacks
    // Clamp values to 0.0-1.0 range
    const clampedRoundness = roundness !== undefined ? clampNormalized(roundness) : undefined;
    const clampedThickness = clampNormalized(thickness);
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness: clampedRoundness },
        { color: undefined, roundness: DEFAULT_ROUNDNESS }
    );

    // Mode B: Parse children to build parameter and visual map
    const { derivedParameter, visualMap, defaultVal } = useMemo(() => {
        if (parameter) return { derivedParameter: parameter, visualMap: null, defaultVal: parameter.defaultValue };

        const optionEls = React.Children.toArray(children).filter(
            React.isValidElement
        ) as React.ReactElement<KnobSwitchOptionProps>[];

        if (optionEls.length === 0) {
            // Fallback empty parameter
            return {
                derivedParameter: {
                    id: "empty-enum",
                    type: "enum",
                    name: label || "",
                    options: [],
                    midiResolution: 7,
                } as EnumParameter,
                visualMap: null,
                defaultVal: undefined,
            };
        }

        const options = optionEls.map((child, index) => {
            const val = child.props.value !== undefined ? child.props.value : index;
            // Try to extract text label from children if possible, else stringify value
            let txtLabel = String(val);
            if (typeof child.props.children === "string") {
                txtLabel = child.props.children;
            }
            return { value: val, label: txtLabel };
        });

        const map = new Map<any, React.ReactNode>();
        optionEls.forEach((child, index) => {
            const val = child.props.value !== undefined ? child.props.value : index;
            map.set(val, child.props.children);
        });

        const selectedChild = optionEls.find((c) => c.props.selected);
        const defVal = selectedChild
            ? (selectedChild.props.value ?? optionEls.indexOf(selectedChild))
            : options[0].value;

        return {
            derivedParameter: {
                id: paramId ?? "adhoc-enum",
                type: "enum",
                name: label || "",
                options,
                defaultValue: defVal,
                midiResolution: 7,
                midiMapping: "spread",
            } as EnumParameter,
            visualMap: map,
            defaultVal: defVal,
        };
    }, [parameter, children, label]);

    // Determine effective value (controlled or default)
    const effectiveValue = value !== undefined ? value : defaultVal;

    // Use Audio Param Hook
    const { normalizedValue, setNormalizedValue, displayValue, adjustValue, converter } = useAudioParameter(
        effectiveValue,
        onChange,
        derivedParameter
    );

    // Calculate step size for normalized range (0..1)
    const stepSize = useMemo(() => {
        const count = derivedParameter.options.length;
        return count > 1 ? 1 / (count - 1) : 0;
    }, [derivedParameter.options.length]);

    // Use interactive control hook
    const interactiveProps = useInteractiveControl({
        adjustValue,
        interactionMode: interactionMode ?? "both",
        direction: "vertical",
        // For enumerations, drag sensitivity needs to be higher to feel responsive,
        // otherwise you have to drag extremely far to change one step.
        // 0.05 was still too low. Increasing to 0.1 (approx 10px per step if step is 1/N).
        sensitivity: sensitivity ?? 0.1,
        // Wheel sensitivity: 1 notch (100 delta) = 1 step
        // We want 1 notch (delta ~100) to equal exactly one step (stepSize).
        // adjustValue does: delta * sensitivity.
        // We want 100 * sensitivity = stepSize.
        // So sensitivity = stepSize / 100.
        // If it's "too hard", it means we need MORE change per delta.
        // So we need HIGHER sensitivity.
        // Previous was stepSize / 20. Increasing to stepSize / 5.
        // This means 5 delta (very tiny scroll) triggers step.
        wheelSensitivity: stepSize > 0 ? stepSize / 4 : 0,
        editable: !!onChange || !!onClick,
    });

    // Determine sizing behavior: adaptiveSize controls stretch behavior and
    // takes precedence over size when both are provided.
    const isStretch = adaptiveSize === true;

    // Get the size class name based on the size prop
    const sizeClassName = isStretch ? undefined : getSizeClassForComponent("knob", size);

    // Memoize the classNames calculation: size class first, then base classes, then user className (user takes precedence)
    const componentClassNames = useMemo(() => {
        return classNames(
            sizeClassName,
            CLASSNAMES.root,
            CLASSNAMES.container,
            onChange || onClick ? CLASSNAMES.highlight : "",
            className
        );
    }, [sizeClassName, className, onChange, onClick]);

    // Build merged style: size style (when not stretching), then interactive props style, then user style (user takes precedence)
    const sizeStyle = isStretch ? undefined : getSizeStyleForComponent("knob", size);

    // Memoize content wrapper style to avoid object recreation on every render
    const contentWrapperStyle = useMemo(
        () => ({
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: "500",
            color: "var(--audioui-text-color)",
            cursor: "inherit",
        }),
        []
    );

    // Create option lookup map for O(1) performance (avoids O(n) find on every render)
    const optionByValueMap = useMemo(() => {
        if (!renderOption) return null;
        const map = new Map<any, { value: any; label: string }>();
        derivedParameter.options.forEach((opt) => {
            map.set(opt.value, opt);
        });
        return map;
    }, [renderOption, derivedParameter.options]);

    // Render Content
    const content = useMemo(() => {
        // 1. Visual Map (Children Mode)
        if (visualMap && visualMap.has(effectiveValue)) {
            return visualMap.get(effectiveValue);
        }

        // 2. Render Prop (Mode A) - use O(1) lookup
        if (renderOption && optionByValueMap) {
            const opt = optionByValueMap.get(effectiveValue);
            if (opt) return renderOption(opt);
        }

        // 3. Default Text (from Hook)
        return displayValue;
    }, [visualMap, effectiveValue, renderOption, optionByValueMap, displayValue]);

    const effectiveLabel = label ?? derivedParameter.name;

    // Common cycle logic for Space key and Click
    const cycleNext = () => {
        const count = derivedParameter.options.length;
        if (count <= 1) return;

        // Find current index
        const currentIdx = derivedParameter.options.findIndex((opt) => opt.value === effectiveValue);
        if (currentIdx === -1) return;

        const nextIdx = (currentIdx + 1) % count;
        const nextVal = derivedParameter.options[nextIdx].value;
        const nextNorm = converter.normalize(nextVal);
        setNormalizedValue(nextNorm);
    };

    // Merge event handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        interactiveProps.onMouseDown(e);
        onMouseDown?.(e);
    };

    // Handle Click for rotation
    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (interactionMode === "wheel") return; // Drag disabled usually means no mouse interaction?
        // Actually, if we allow click to rotate, it should probably work regardless of drag/wheel mode,
        // or perhaps only if not dragging?
        // The issue is distinguishing a click from a drag.
        // If the user drags, we don't want to trigger a cycle on mouse up (click).
        // Usually 'click' fires after mouseup if no move happened.
        // Let's assume standard click behavior.

        // Note: If onClick prop is provided, we should probably call it too?
        // The props say `onClick?: React.MouseEventHandler;`
        onClick?.(e as unknown as React.MouseEvent);
        if (!e.defaultPrevented) {
            cycleNext();
        }
    };

    // Custom keyboard handler for Space cycling and Arrow keys stepping
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === " ") {
            e.preventDefault();
            cycleNext();
        } else if (e.key === "ArrowUp" || e.key === "ArrowRight") {
            e.preventDefault();
            // Explicitly handle increment to ensure step change
            const count = derivedParameter.options.length;
            if (count <= 1) return;

            const currentIdx = derivedParameter.options.findIndex((opt) => opt.value === effectiveValue);
            if (currentIdx === -1) return;

            if (currentIdx < count - 1) {
                const nextVal = derivedParameter.options[currentIdx + 1].value;
                setNormalizedValue(converter.normalize(nextVal));
            }
        } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
            e.preventDefault();
            // Explicitly handle decrement
            const count = derivedParameter.options.length;
            if (count <= 1) return;

            const currentIdx = derivedParameter.options.findIndex((opt) => opt.value === effectiveValue);
            if (currentIdx === -1) return;

            if (currentIdx > 0) {
                const nextVal = derivedParameter.options[currentIdx - 1].value;
                setNormalizedValue(converter.normalize(nextVal));
            }
        } else {
            // Delegate other keys (Home/End) to the standard handler
            interactiveProps.onKeyDown(e);
        }
    };

    return (
        <AdaptiveBox
            displayMode={displayMode ?? "scaleToFit"}
            labelMode={labelMode}
            className={componentClassNames}
            style={{
                // Size style first
                ...sizeStyle,
                // Interactive style second (provides default cursor)
                ...interactiveProps.style,
                // User style last (can override cursor and other styles)
                ...style,
            }}
            labelHeightUnits={20}
            minWidth={40}
            minHeight={40}
        >
            <>
                <AdaptiveBox.Svg
                    viewBoxWidth={SvgKnob.viewBox.width}
                    viewBoxHeight={SvgKnob.viewBox.height}
                    onWheel={interactiveProps.onWheel}
                    onClick={handleClick}
                    onMouseDown={handleMouseDown}
                    onTouchStart={interactiveProps.onTouchStart}
                    onKeyDown={handleKeyDown}
                    onMouseUp={onMouseUp}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    tabIndex={interactiveProps.tabIndex}
                    role={interactiveProps.role}
                    aria-valuenow={typeof effectiveValue === "number" ? effectiveValue : undefined}
                    aria-valuetext={displayValue}
                    aria-label={effectiveLabel}
                >
                    <SvgKnob
                        normalizedValue={normalizedValue}
                        bipolar={false} // Switches usually 0..1
                        thickness={clampedThickness}
                        roundness={resolvedRoundness ?? DEFAULT_ROUNDNESS}
                        color={resolvedColor}
                    >
                        <div style={contentWrapperStyle}>{content}</div>
                    </SvgKnob>
                </AdaptiveBox.Svg>

                {effectiveLabel && (
                    <AdaptiveBox.Label position={labelPosition} align={labelAlign ?? "center"}>
                        {effectiveLabel}
                    </AdaptiveBox.Label>
                )}
            </>
        </AdaptiveBox>
    );
};

/**
 * Option component for KnobSwitch
 * @private
 */
const Option: React.FC<KnobSwitchOptionProps> = () => {
    return null; // This component is never rendered directly
};

KnobSwitch.Option = Option;

// Wrap the component in React.memo to prevent unnecessary re-renders
export default React.memo(KnobSwitch);
