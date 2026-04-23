/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo, useCallback } from "react";
import classNames from "classnames";
import { CLASSNAMES } from "@cutoff/audio-ui-core";
import { AdaptiveBoxProps, AdaptiveBoxLogicalSizeProps, BooleanControlPrimitiveProps, ControlComponent } from "@/types";
import AdaptiveBox from "../AdaptiveBox";
import { useAudioParameter } from "@/hooks/useAudioParameter";
import { useBooleanInteraction } from "@/hooks/useBooleanInteraction";
import { useBooleanParameterResolution } from "@/hooks/useBooleanParameterResolution";

export type BooleanControlComponentProps<P extends object = Record<string, unknown>> =
    // Base Control Props (permissive — accepts any combination of value-channel props,
    // with runtime precedence. A strict BooleanControlProps is assignable to this.)
    BooleanControlPrimitiveProps &
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
 * - **Editable Control**: When any paired value-change callback (`onValueChange`,
 *   `onNormalizedValueChange`, `onMidiValueChange`) is provided, the control is editable
 *   and responds to all interaction methods (mouse, touch, keyboard) to change the value.
 *   The full interaction system handles complex behaviors like drag-in/drag-out for momentary buttons.
 * - **Clickable View**: When only `onClick` is provided (no value-change callback), the
 *   control is a clickable view that triggers `onClick` but does not change its value.
 *   Touch events are handled to ensure `onClick` works on touch devices.
 * - **Both**: When both a value-change callback and `onClick` are provided, the control is
 *   editable and also triggers `onClick` for mouse clicks; touch events dispatch value changes.
 *
 * @param props - Component props including parameter configuration, view component, and layout options
 * @returns Rendered boolean control component
 *
 * @example
 * ```tsx
 * // Editable control
 * <BooleanControl
 *   value={isOn}
 *   onValueChange={setIsOn}
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
        normalizedValue: inputNormalizedValue,
        midiValue: inputMidiValue,
        onValueChange,
        onNormalizedValueChange,
        onMidiValueChange,
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

    const editable = !!(onValueChange || onNormalizedValueChange || onMidiValueChange);

    const { derivedParameter } = useBooleanParameterResolution({
        parameter,
        paramId,
        label,
        latch,
        midiResolution,
    });

    const { realValue, normalizedValue, commitValue } = useAudioParameter<boolean>({
        value,
        normalizedValue: inputNormalizedValue,
        midiValue: inputMidiValue,
        onValueChange,
        onNormalizedValueChange,
        onMidiValueChange,
        parameter: derivedParameter,
    });

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
        value: realValue,
        mode: derivedParameter.mode ?? (latch ? "toggle" : "momentary"),
        onValueChange: commitValue,
        disabled: !editable,
        onMouseDown,
        onMouseUp,
        onKeyDown: undefined, // BooleanControl doesn't have onKeyDown prop, only uses hook handler
        onKeyUp: undefined, // BooleanControl doesn't have onKeyUp prop, only uses hook handler
    });

    // Handle onClick for touch events when the control is non-editable.
    // When editable, the interaction system handles touch events for value changes.
    const handleTouchEndForClick = useCallback(
        (e: React.TouchEvent<SVGSVGElement>) => {
            if (!editable && onClick) {
                e.preventDefault();
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
        [editable, onClick]
    );

    const handleTouchStartForClick = useCallback(
        (e: React.TouchEvent<SVGSVGElement>) => {
            if (!editable && onClick) {
                e.preventDefault();
            }
        },
        [editable, onClick]
    );

    const effectiveLabel = label ?? derivedParameter.name;

    const componentClassNames = useMemo(() => {
        return classNames(className, CLASSNAMES.root, CLASSNAMES.container);
    }, [className]);

    const svgClassNames = useMemo(() => {
        return editable || onClick ? CLASSNAMES.highlight : "";
    }, [editable, onClick]);

    // Add clickable cursor when interactive; add touchAction: "none" to prevent default touch behaviors.
    const svgStyle = useMemo(
        () => ({
            ...(onClick || editable ? { cursor: "var(--audioui-cursor-clickable)" as const } : {}),
            touchAction: "none" as const,
        }),
        [onClick, editable]
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
                onMouseDown={editable ? handleMouseDownWithRef : undefined}
                onMouseUp={editable ? handleMouseUp : undefined}
                onMouseEnter={(e) => {
                    if (editable) {
                        handleMouseEnter(e);
                    }
                    onMouseEnter?.(e);
                }}
                onMouseLeave={(e) => {
                    if (editable) {
                        handleMouseLeave(e);
                    }
                    onMouseLeave?.(e);
                }}
                onTouchStart={editable ? handleTouchStartWithRef : onClick ? handleTouchStartForClick : undefined}
                onTouchEnd={editable ? handleTouchEnd : onClick ? handleTouchEndForClick : undefined}
                onTouchMove={editable ? handleTouchMove : undefined}
                onKeyDown={editable ? handleKeyDown : undefined}
                onKeyUp={editable ? handleKeyUp : undefined}
                tabIndex={editable || onClick ? 0 : undefined}
                role="button"
                aria-pressed={realValue}
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
