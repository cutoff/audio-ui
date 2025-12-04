"use client";

import React, { useCallback, useMemo } from "react";
import classNames from "classnames";
import AdaptiveBox from "../AdaptiveBox";
import SvgKnob from "../svg/SvgKnob";
import { AdaptativeSize, Base, InteractiveControl, Themable } from "../types";
import { knobSizeMap } from "../utils/sizeMappings";
import { useThemableProps } from "../providers/AudioUiProvider";
import { CLASSNAMES } from "../../styles/classNames";
import { EnumParameter } from "../../models/AudioParameter";
import { useAudioParam } from "../../hooks/useAudioParam";

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
    paramId: _paramId,
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
                    id: "adhoc-enum",
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
            adjustValue,
            displayValue
        } = useAudioParam(effectiveValue, onChange, derivedParameter);

        // Handle Wheel
        const handleWheel = useCallback(
            (e: WheelEvent) => {
                if (onChange && !e.defaultPrevented) {
                    // For Enums, we need enough sensitivity to jump steps
                    // Step size in normalized space is 1 / (count - 1)
                    const count = derivedParameter.options.length;
                    if (count > 1) {
                        const stepSize = 1.01 / (count - 1); // Slightly larger to ensure jump
                        // Positive deltaY increases value (Down = Increase)
                        adjustValue(e.deltaY, stepSize * 0.01); // Scaling factor for wheel delta
                    }
                }
            },
            [onChange, adjustValue, derivedParameter.options.length]
        );

        // Memoize the classNames calculation
        const componentClassNames = useMemo(() => {
            return classNames(className, CLASSNAMES.root, CLASSNAMES.container, onChange ? CLASSNAMES.highlight : "");
        }, [className, onChange]);

        // Get the preferred width based on the size prop
        const { width: preferredWidth, height: preferredHeight } = knobSizeMap[size];

        // Render Content
        const content = useMemo(() => {
            // 1. Visual Map (Children Mode)
            if (visualMap && visualMap.has(effectiveValue)) {
                const node = visualMap.get(effectiveValue);
                // If node is an image, wrap it
                if (React.isValidElement(node) && node.type === "img") {
                    return (
                        <div style={{
                            width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px"
                        }}>
                            {React.cloneElement(node, { style: { maxWidth: "100%", maxHeight: "100%" } } as any)}
                        </div>
                    );
                }
                return node;
            }

            // 2. Render Prop (Mode A)
            if (renderOption) {
                const opt = derivedParameter.options.find(o => o.value === effectiveValue);
                if (opt) return renderOption(opt);
            }

            // 3. Default Text (from Hook)
            return displayValue;
        }, [visualMap, effectiveValue, renderOption, derivedParameter.options, displayValue]);

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
                            <div style={{
                                width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "22px", fontWeight: "500"
                            }}>
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
