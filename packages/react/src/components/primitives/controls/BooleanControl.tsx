/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo, useCallback } from "react";
import classNames from "classnames";
import { CLASSNAMES } from "@cutoff/audio-ui-core";
import { AdaptiveBoxProps, AdaptiveBoxLogicalSizeProps, BooleanControlProps, ControlComponent } from "@/types";
import AdaptiveBox from "../AdaptiveBox";
import { useAudioParameter } from "@/hooks/useAudioParameter";
import { useBooleanInteraction } from "@/hooks/useBooleanInteraction";
import { useBooleanParameterResolution } from "@/hooks/useBooleanParameterResolution";

export type BooleanControlComponentProps<P extends object = Record<string, unknown>> =
    // Base Control Props (includes all BooleanControlProps)
    BooleanControlProps &
        // Layout props that configure AdaptiveBox behavior
        AdaptiveBoxProps &
        // Logical size props that override view component defaults
        AdaptiveBoxLogicalSizeProps & {
            /**
             * The Visualization Component.
             * Must adhere to ControlComponent contract.
             */
            view: ControlComponent<P>;

            /**
             * Props specific to the Visualization Component.
             */
            viewProps: P;

            /**
             * Content overlay (HTML) rendered over the SVG (e.g. text value, icons).
             * Rendered via AdaptiveBox.HtmlOverlay to avoid foreignObject issues.
             */
            htmlOverlay?: React.ReactNode;
        };

/**
 * A Generic Boolean Control that connects a Data Model (BooleanParameter)
 * to a Visualization View (ControlComponent).
 *
 * This component handles parameter resolution, value management, interaction handling,
 * and layout management for boolean controls (Button, Toggle, etc.).
 *
 * Supports two modes of operation:
 * 1. Strict Mode (Parameter only): Model provided via parameter prop.
 * 2. Ad-Hoc Mode (Props only): Model created from individual props (label, latch, etc.).
 *
 * **Interaction Modes:**
 * - **Editable Control**: When `onChange` is provided, the control is editable and responds to
 *   all interaction methods (mouse, touch, keyboard) to change the value. The full interaction
 *   system handles complex behaviors like drag-in/drag-out for momentary buttons.
 * - **Clickable View**: When only `onClick` is provided (no `onChange`), the control is a
 *   clickable view that triggers the onClick handler but does not change its value. Touch events
 *   are handled to ensure onClick works on touch devices.
 * - **Both**: When both `onChange` and `onClick` are provided, the control is editable and
 *   also triggers onClick for mouse clicks (onChange handles touch events for value changes).
 *
 * @param props - Component props including parameter configuration, view component, and layout options
 * @returns Rendered boolean control component
 *
 * @example
 * ```tsx
 * // Editable control
 * <BooleanControl
 *   value={isOn}
 *   onChange={(e) => setIsOn(e.value)}
 *   view={ButtonView}
 *   viewProps={{ color: "blue", roundness: 0.3 }}
 * />
 *
 * // Clickable view (non-editable)
 * <BooleanControl
 *   value={false}
 *   onClick={() => handleClick()}
 *   view={ButtonView}
 *   viewProps={{ color: "gray" }}
 * />
 * ```
 */
export function BooleanControl<P extends object = Record<string, unknown>>(props: BooleanControlComponentProps<P>) {
    const {
        view: View,
        viewProps,
        htmlOverlay,
        value,
        onChange,
        label,
        paramId,
        parameter,
        latch,
        displayMode,
        labelMode,
        labelPosition,
        labelAlign,
        labelOverflow,
        viewBoxWidthUnits,
        viewBoxHeightUnits,
        labelHeightUnits,
        className,
        style,
        onClick,
        onMouseDown,
        onMouseUp,
        onMouseEnter,
        onMouseLeave,
        midiResolution,
    } = props;

    const { derivedParameter } = useBooleanParameterResolution({
        parameter,
        paramId,
        label,
        latch,
        midiResolution,
    });

    const { normalizedValue, converter } = useAudioParameter(value, onChange, derivedParameter);

    const fireChange = useCallback(
        (newValue: boolean) => {
            if (!onChange) return;
            const normalized = converter.normalize(newValue);
            const midi = converter.toMidi(newValue);
            onChange({
                value: newValue,
                normalizedValue: normalized,
                midiValue: midi,
                parameter: derivedParameter,
            });
        },
        [onChange, converter, derivedParameter]
    );

    const {
        handleMouseDown,
        handleMouseUp,
        handleMouseEnter,
        handleMouseLeave,
        handleTouchStart,
        handleTouchEnd,
        handleTouchMove,
        setButtonElement,
        handleKeyDown,
        handleKeyUp,
    } = useBooleanInteraction({
        value,
        mode: derivedParameter.mode ?? (latch ? "toggle" : "momentary"),
        onValueChange: fireChange,
        disabled: !onChange,
        onMouseDown,
        onMouseUp,
        onKeyDown: undefined, // BooleanControl doesn't have onKeyDown prop, only uses hook handler
        onKeyUp: undefined, // BooleanControl doesn't have onKeyUp prop, only uses hook handler
    });

    // Handle onClick for touch events when onChange is not provided
    // This ensures onClick works on touch devices even when the control is not editable
    // When onChange is provided, the interaction system handles touch events and we don't need this
    const handleTouchEndForClick = useCallback(
        (e: React.TouchEvent<SVGSVGElement>) => {
            if (!onChange && onClick) {
                // Prevent default to avoid mouse event emulation
                e.preventDefault();
                // Create a synthetic mouse event for onClick
                const touch = e.changedTouches[0];
                if (touch) {
                    const syntheticEvent = {
                        ...e,
                        clientX: touch.clientX,
                        clientY: touch.clientY,
                        currentTarget: e.currentTarget,
                        type: "click",
                    } as unknown as React.MouseEvent<SVGSVGElement>;
                    onClick(syntheticEvent);
                }
            }
        },
        [onChange, onClick]
    );

    const handleTouchStartForClick = useCallback(
        (e: React.TouchEvent<SVGSVGElement>) => {
            if (!onChange && onClick) {
                // Prevent default to avoid mouse event emulation
                e.preventDefault();
            }
        },
        [onChange, onClick]
    );

    const effectiveLabel = label ?? derivedParameter.name;

    const componentClassNames = useMemo(() => {
        return classNames(className, CLASSNAMES.root, CLASSNAMES.container);
    }, [className]);

    const svgClassNames = useMemo(() => {
        return onChange || onClick ? CLASSNAMES.highlight : "";
    }, [onChange, onClick]);

    // Add clickable cursor when interactive (onChange or onClick)
    // Uses CSS variable for customizable cursor type
    // Add touchAction: "none" to prevent default touch behaviors (scrolling/zooming)
    const svgStyle = useMemo(
        () => ({
            ...(onClick || onChange ? { cursor: "var(--audioui-cursor-clickable)" as const } : {}),
            touchAction: "none" as const,
        }),
        [onClick, onChange]
    );

    // Wrap handlers to set element reference
    const handleMouseDownWithRef = useCallback(
        (e: React.MouseEvent<SVGSVGElement>) => {
            setButtonElement(e.currentTarget);
            handleMouseDown(e);
        },
        [setButtonElement, handleMouseDown]
    );

    const handleTouchStartWithRef = useCallback(
        (e: React.TouchEvent<SVGSVGElement>) => {
            setButtonElement(e.currentTarget);
            handleTouchStart(e);
        },
        [setButtonElement, handleTouchStart]
    );

    return (
        <AdaptiveBox
            displayMode={displayMode ?? "scaleToFit"}
            labelMode={labelMode}
            labelOverflow={labelOverflow}
            className={componentClassNames}
            style={style}
            labelHeightUnits={labelHeightUnits ?? View.labelHeightUnits ?? 20}
            viewBoxWidth={viewBoxWidthUnits ?? View.viewBox.width}
            viewBoxHeight={viewBoxHeightUnits ?? View.viewBox.height}
        >
            <AdaptiveBox.Svg
                className={svgClassNames}
                style={svgStyle}
                onClick={onClick}
                onMouseDown={onChange ? handleMouseDownWithRef : undefined}
                onMouseUp={onChange ? handleMouseUp : undefined}
                onMouseEnter={(e) => {
                    if (onChange) {
                        handleMouseEnter(e);
                    }
                    onMouseEnter?.(e);
                }}
                onMouseLeave={(e) => {
                    if (onChange) {
                        handleMouseLeave(e);
                    }
                    onMouseLeave?.(e);
                }}
                onTouchStart={onChange ? handleTouchStartWithRef : onClick ? handleTouchStartForClick : undefined}
                onTouchEnd={onChange ? handleTouchEnd : onClick ? handleTouchEndForClick : undefined}
                onTouchMove={onChange ? handleTouchMove : undefined}
                onKeyDown={onChange ? handleKeyDown : undefined}
                onKeyUp={onChange ? handleKeyUp : undefined}
                tabIndex={onChange || onClick ? 0 : undefined}
                role="button"
                aria-pressed={value}
                aria-label={effectiveLabel}
            >
                <View normalizedValue={normalizedValue} {...viewProps} />
            </AdaptiveBox.Svg>
            {htmlOverlay && <AdaptiveBox.HtmlOverlay>{htmlOverlay}</AdaptiveBox.HtmlOverlay>}
            {effectiveLabel && (
                <AdaptiveBox.Label position={labelPosition} align={labelAlign ?? "center"}>
                    {effectiveLabel}
                </AdaptiveBox.Label>
            )}
        </AdaptiveBox>
    );
}

export default React.memo(BooleanControl) as typeof BooleanControl;
