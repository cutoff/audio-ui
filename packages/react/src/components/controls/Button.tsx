"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import classNames from "classnames";
import AdaptiveBox from "../primitives/AdaptiveBox";
import "@cutoff/audio-ui-core/styles.css";
import { CLASSNAMES } from "@cutoff/audio-ui-core";
import { AdaptiveBoxProps, AdaptiveSizeProps, BooleanControlProps, ThemableProps } from "../types";
import { getSizeClassForComponent, getSizeStyleForComponent } from "@cutoff/audio-ui-core";
import { useThemableProps } from "../theme/AudioUiProvider";
import SvgButton from "../theme/SvgButton";
import { useAudioParameter } from "../../hooks/useAudioParameter";
import { clampNormalized } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";

/**
 * Props for the Button component (built-in control with theming support)
 */
export type ButtonProps = BooleanControlProps &
    AdaptiveSizeProps &
    AdaptiveBoxProps &
    ThemableProps;

/**
 * A button component for audio applications.
 * ...
 */
function Button({
    latch = false,
    value = false,
    onChange,
    label,
    adaptiveSize = false,
    size = "normal",
    displayMode,
    labelMode,
    labelPosition,
    labelAlign,
    parameter,
    paramId,
    color,
    roundness,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseEnter,
    onMouseLeave,
    className,
    style,
}: ButtonProps) {
    // Use the themable props hook to resolve color and roundness with proper fallbacks
    // Clamp roundness to 0.0-1.0 range
    const clampedRoundness = roundness !== undefined ? clampNormalized(roundness) : undefined;
    const { resolvedColor, resolvedRoundness } = useThemableProps(
        { color, roundness: clampedRoundness },
        { color: undefined, roundness: DEFAULT_ROUNDNESS }
    );

    // Construct the configuration object
    const paramConfig = useMemo(() => {
        if (parameter) {
            if (parameter.type !== "boolean") {
                console.error("Button component only supports boolean parameters.");
            }
            return parameter;
        }

        // Ad-hoc Boolean Parameter
        return {
            id: paramId ?? "adhoc-button",
            type: "boolean" as const,
            name: label || "",
            mode: (latch ? "toggle" : "momentary") as "toggle" | "momentary",
            defaultValue: false,
            midiResolution: 7 as const,
        };
    }, [parameter, label, latch, paramId]);

    // Use the hook to handle normalization
    const { normalizedValue, converter } = useAudioParameter(value, onChange, paramConfig);

    // Helper to fire change events
    const fireChange = useCallback(
        (newValue: boolean) => {
            if (!onChange) return;
            const normalized = converter.normalize(newValue);
            const midi = converter.toMidi(newValue);
            onChange({
                value: newValue,
                normalizedValue: normalized,
                midiValue: midi,
                parameter: paramConfig,
            });
        },
        [onChange, converter, paramConfig]
    );

    // Ref to track if the button is currently pressed (for momentary mode)
    const isPressedRef = useRef(false);

    // Internal handler for mouse down
    const handleInternalMouseDown = useCallback(
        (_e: React.MouseEvent) => {
            if (onChange) {
                if (paramConfig.mode === "toggle") {
                    // Toggle
                    fireChange(!value);
                } else {
                    // Momentary Press -> True
                    isPressedRef.current = true;
                    fireChange(true);
                }
            }
        },
        [onChange, paramConfig.mode, value, fireChange]
    );

    // Internal handler for mouse up
    const handleInternalMouseUp = useCallback(
        (_e: React.MouseEvent) => {
            // Momentary Release -> False
            if (onChange && paramConfig.mode === "momentary" && isPressedRef.current) {
                isPressedRef.current = false;
                fireChange(false);
            }
        },
        [onChange, paramConfig.mode, fireChange]
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
            fireChange(false);
        }
    }, [fireChange]);

    useEffect(() => {
        if (paramConfig.mode === "momentary" && onChange) {
            window.addEventListener("mouseup", handleGlobalMouseUp);
            return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
        }
        return undefined;
    }, [paramConfig.mode, onChange, handleGlobalMouseUp]);

    // Determine sizing behavior: adaptiveSize controls stretch behavior and
    // takes precedence over size when both are provided.
    const isStretch = adaptiveSize === true;

    // Get the size class name based on the size prop
    const sizeClassName = isStretch ? undefined : getSizeClassForComponent("button", size);

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

    // Use display value or label
    const effectiveLabel = label ?? (parameter ? paramConfig.name : undefined);

    // Build merged style: size style (when not stretching), then user style (user takes precedence)
    const sizeStyle = isStretch ? undefined : getSizeStyleForComponent("button", size);

    // Determine if button is editable/clickable
    const isInteractive = !!(onChange || onClick);

    return (
        <AdaptiveBox
            displayMode={displayMode ?? "scaleToFit"}
            labelMode={labelMode}
            className={componentClassNames}
            style={{ ...sizeStyle, ...style }}
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
                // Add keyboard accessibility
                tabIndex={0}
                role="button"
                aria-pressed={value}
                aria-label={effectiveLabel}
                style={{
                    // Explicitly set cursor based on interactivity
                    // User can override via className or parent style
                    cursor: isInteractive ? "pointer" : "default",
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (onChange) {
                            fireChange(latch ? !value : true);
                            if (!latch) {
                                // Simulate release after delay or keyup?
                                // Standard button triggers on click (down+up).
                                // For momentary, usually keydown=active, keyup=inactive
                            }
                        }
                    }
                }}
                onKeyUp={(e) => {
                    if (!latch && onChange && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        fireChange(false);
                    }
                }}
            >
                <SvgButton
                    normalizedValue={normalizedValue}
                    // Threshold is 0.5 for boolean
                    threshold={0.5}
                    roundness={resolvedRoundness ?? DEFAULT_ROUNDNESS}
                    color={resolvedColor}
                />
            </AdaptiveBox.Svg>
            {effectiveLabel && (
                <AdaptiveBox.Label position={labelPosition} align={labelAlign ?? "center"}>
                    {effectiveLabel}
                </AdaptiveBox.Label>
            )}
        </AdaptiveBox>
    );
}

export default React.memo(Button);
