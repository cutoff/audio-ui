"use client";

import React, { useCallback, useMemo, useRef } from "react";
import classNames from "classnames";
import AdaptiveBox from "../primitives/AdaptiveBox";
import SvgKnob from "../theme/SvgKnob";
import { AdaptativeSize, Base, InteractiveControl, Themable } from "../types";
import { knobSizeMap } from "../utils/sizeMappings";
import { useThemableProps } from "../theme/AudioUiProvider";
import { CLASSNAMES } from "../../styles/classNames";
import { EnumParameter } from "../../models/AudioParameter";
import { useAudioParameter } from "../../hooks/useAudioParameter";

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
export type KnobSwitchProps = AdaptativeSize &
    InteractiveControl &
    Base &
    Themable & {
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
        /** Thickness of the knob's stroke */
        thickness?: number;
    };

/**
 * A switch component that uses a knob interface to cycle through options.
 * ...
 */
const KnobSwitch: React.FC<KnobSwitchProps> & {
    Option: React.FC<KnobSwitchOptionProps>;
} = ({
    label,
    value,
    children,
    style,
    className,
    stretch = false,
    onChange,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    size = "normal",
    paramId,
    color,
    roundness,
    parameter,
    renderOption,
    thickness = 12,
}) => {
        // Use the themable props hook to resolve color and roundness with proper fallbacks
        const { resolvedColor, resolvedRoundness } = useThemableProps(
            { color, roundness },
            { color: undefined, roundness: 12 }
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
                        midiResolution: 7
                    } as EnumParameter,
                    visualMap: null,
                    defaultVal: undefined
                };
            }

            const options = optionEls.map((child, index) => {
                const val = child.props.value !== undefined ? child.props.value : index;
                // Try to extract text label from children if possible, else stringify value
                let txtLabel = String(val);
                if (typeof child.props.children === 'string') {
                    txtLabel = child.props.children;
                }
                return { value: val, label: txtLabel };
            });

            const map = new Map<any, React.ReactNode>();
            optionEls.forEach((child, index) => {
                const val = child.props.value !== undefined ? child.props.value : index;
                map.set(val, child.props.children);
            });

            const selectedChild = optionEls.find(c => c.props.selected);
            const defVal = selectedChild ? (selectedChild.props.value ?? optionEls.indexOf(selectedChild)) : options[0].value;

            return {
                derivedParameter: {
                    id: paramId ?? "adhoc-enum",
                    type: "enum",
                    name: label || "",
                    options,
                    defaultValue: defVal,
                    midiResolution: 7,
                    midiMapping: "spread"
                } as EnumParameter,
                visualMap: map,
                defaultVal: defVal
            };
        }, [parameter, children, label]);

        // Determine effective value (controlled or default)
        const effectiveValue = value !== undefined ? value : defaultVal;

        // Use Audio Param Hook
        const {
            normalizedValue,
            setNormalizedValue,
            displayValue,
            converter
        } = useAudioParameter(effectiveValue, onChange, derivedParameter);

        // Create value-to-index map for O(1) lookups (performance optimization)
        const valueToIndexMap = useMemo(() => {
            const map = new Map<any, number>();
            derivedParameter.options.forEach((opt, index) => {
                map.set(opt.value, index);
            });
            return map;
        }, [derivedParameter.options]);

        // Track current value in ref for wheel handler (avoids stale closures)
        const valueRef = useRef(effectiveValue);
        valueRef.current = effectiveValue;

        // Handle Wheel - discrete steps for enum parameters
        const handleWheel = useCallback(
            (e: WheelEvent) => {
                if (onChange && !e.defaultPrevented) {
                    e.preventDefault();
                    const count = derivedParameter.options.length;
                    if (count <= 1) return;

                    // Use O(1) lookup instead of O(n) findIndex
                    const currentIndex = valueToIndexMap.get(valueRef.current) ?? -1;
                    if (currentIndex === -1) return;
                    
                    // Determine direction: negative deltaY (scroll up) = decrease index, positive = increase
                    const direction = e.deltaY < 0 ? -1 : 1;
                    const newIndex = Math.max(0, Math.min(count - 1, currentIndex + direction));
                    
                    // Only update if index actually changed
                    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < count) {
                        const newValue = derivedParameter.options[newIndex].value;
                        // Convert the new value to normalized and set it
                        const newNormalized = converter.normalize(newValue);
                        setNormalizedValue(newNormalized);
                    }
                }
            },
            [onChange, derivedParameter.options, valueToIndexMap, converter, setNormalizedValue]
        );

        // Memoize the classNames calculation
        const componentClassNames = useMemo(() => {
            return classNames(className, CLASSNAMES.root, CLASSNAMES.container, onChange ? CLASSNAMES.highlight : "");
        }, [className, onChange]);

        // Get the preferred width based on the size prop
        const { width: preferredWidth, height: preferredHeight } = knobSizeMap[size];

        // Memoize content wrapper style to avoid object recreation on every render
        const contentWrapperStyle = useMemo(() => ({
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "22px",
            fontWeight: "500",
            color: "var(--audioui-text-color)",
            cursor: "inherit",
        }), []);

        // Create option lookup map for O(1) performance (avoids O(n) find on every render)
        const optionByValueMap = useMemo(() => {
            if (!renderOption) return null;
            const map = new Map<any, { value: any; label: string }>();
            derivedParameter.options.forEach(opt => {
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

        return (
            <AdaptiveBox
                displayMode="scaleToFit"
                className={componentClassNames}
                style={{
                    ...(style ?? {}),
                    ...(stretch ? {} : { width: `${preferredWidth}px`, height: `${preferredHeight}px` }),
                }}
                labelHeightUnits={20}
                minWidth={40}
                minHeight={40}
            >
                <>
                    <AdaptiveBox.Svg
                        viewBoxWidth={SvgKnob.viewBox.width}
                        viewBoxHeight={SvgKnob.viewBox.height}
                        onWheel={handleWheel}
                        onClick={onClick}
                        onMouseDown={onMouseDown}
                        onMouseUp={onMouseUp}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                    >
                        <SvgKnob
                            normalizedValue={normalizedValue}
                            bipolar={false} // Switches usually 0..1
                            thickness={thickness}
                            roundness={resolvedRoundness ?? 12}
                            color={resolvedColor}
                        >
                            <div style={contentWrapperStyle}>
                                {content}
                            </div>
                        </SvgKnob>
                    </AdaptiveBox.Svg>

                    {effectiveLabel && <AdaptiveBox.Label align="center">{effectiveLabel}</AdaptiveBox.Label>}
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
