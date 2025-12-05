"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import classNames from "classnames";
import AdaptiveBox from "../AdaptiveBox";
import "../../styles.css";
import { CLASSNAMES } from "../../styles/classNames";
import { Control } from "../types";
import { buttonSizeMap } from "../utils/sizeMappings";
import { useThemableProps } from "../providers/AudioUiProvider";
import SvgButton from "../svg/SvgButton";
import { BooleanParameter } from "../../models/AudioParameter";
import { useAudioParameter } from "../../hooks/useAudioParameter";

/**
 * Props for the Button component
 */
export type ButtonProps = Omit<Partial<Control>, "value" | "onChange"> & {
    /** Whether the button should latch (toggle between states) or momentary (only active while pressed) */
    latch?: boolean;
    /**
     * Audio Parameter definition (Model)
     */
    parameter?: BooleanParameter;
    /**
     * Current value (must be boolean)
     */
    value: boolean;
    /**
     * Handler for value changes
     */
    onChange?: (value: boolean) => void;
};

/**
 * A button component for audio applications.
 * ...
 */
function Button({
    value = false,
    label,
    stretch = false,
    className,
    style,
    paramId,
    onChange,
    latch = false,
    roundness,
    size = "normal",
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    color,
    parameter,
}: ButtonProps) {
    // Use the themable props hook to resolve color and roundness with proper fallbacks
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness },
        { color: undefined, roundness: 10 }
    );

    // Construct the configuration object
    const paramConfig = useMemo<BooleanParameter>(() => {
        if (parameter) {
            if (parameter.type !== "boolean") {
                console.error("Button component only supports boolean parameters.");
            }
            return parameter;
        }

        // Ad-hoc Boolean Parameter
        return {
            id: paramId ?? "adhoc-button",
            type: "boolean",
            name: label || "",
            mode: latch ? "toggle" : "momentary",
            defaultValue: false,
            midiResolution: 7
        };
    }, [parameter, label, latch]);

    // Use the hook to handle normalization
    const {
        normalizedValue
    } = useAudioParameter(value, onChange, paramConfig);

    // Ref to track if the button is currently pressed (for momentary mode)
    const isPressedRef = useRef(false);

    // Internal handler for mouse down
    const handleInternalMouseDown = useCallback(
        (_e: React.MouseEvent) => {
            if (onChange) {
                if (paramConfig.mode === "toggle") {
                    // Toggle
                    onChange(!value);
                } else {
                    // Momentary Press -> True
                    isPressedRef.current = true;
                    onChange(true);
                }
            }
        },
        [onChange, paramConfig.mode, value]
    );

    // Internal handler for mouse up
    const handleInternalMouseUp = useCallback(
        (_e: React.MouseEvent) => {
            // Momentary Release -> False
            if (onChange && paramConfig.mode === "momentary" && isPressedRef.current) {
                isPressedRef.current = false;
                onChange(false);
            }
        },
        [onChange, paramConfig.mode]
    );

    // Combined handlers
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            onMouseDown?.(e);
            if (!e.defaultPrevented) {
                handleInternalMouseDown(e);
            }
        },
        [onMouseDown, handleInternalMouseDown]
    );

    const handleMouseUp = useCallback(
        (e: React.MouseEvent) => {
            onMouseUp?.(e);
            if (!e.defaultPrevented) {
                handleInternalMouseUp(e);
            }
        },
        [onMouseUp, handleInternalMouseUp]
    );

    // Global mouseup for momentary buttons
    const handleGlobalMouseUp = useCallback(() => {
        if (isPressedRef.current) {
            isPressedRef.current = false;
            onChange?.(false);
        }
    }, [onChange]);

    useEffect(() => {
        if (paramConfig.mode === "momentary" && onChange) {
            window.addEventListener("mouseup", handleGlobalMouseUp);
            return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
        }
        return undefined;
    }, [paramConfig.mode, onChange, handleGlobalMouseUp]);

    // Memoize the classNames calculation
    const componentClassNames = useMemo(() => {
        return classNames(className, CLASSNAMES.root, onChange ? CLASSNAMES.highlight : "");
    }, [className, onChange]);

    // Get the preferred width based on the size prop
    const { width: preferredWidth, height: preferredHeight } = buttonSizeMap[size];

    // Use display value or label
    const effectiveLabel = label ?? (parameter ? paramConfig.name : undefined);

    return (
        <AdaptiveBox
            displayMode="scaleToFit"
            className={componentClassNames}
            style={{
                ...(style ?? {}),
                ...(stretch ? {} : { width: `${preferredWidth}px`, height: `${preferredHeight}px` }),
            }}
            labelHeightUnits={30}
            minWidth={20}
            minHeight={40}
        >
            <AdaptiveBox.Svg
                viewBoxWidth={SvgButton.viewBox.width}
                viewBoxHeight={SvgButton.viewBox.height}
                onClick={onClick}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <SvgButton
                    normalizedValue={normalizedValue}
                    // Threshold is 0.5 for boolean
                    threshold={0.5}
                    roundness={resolvedRoundness ?? 10}
                    color={resolvedColor}
                />
            </AdaptiveBox.Svg>
            {effectiveLabel && <AdaptiveBox.Label align="center">{effectiveLabel}</AdaptiveBox.Label>}
        </AdaptiveBox>
    );
}

export default React.memo(Button);
