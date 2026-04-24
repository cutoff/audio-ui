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
 * Interactivity is governed by the explicit `editable` (default `true`) and `disabled`
 * (default `false`) props. `editable=false` blocks pointer/keyboard gestures but keeps the
 * control "alive" — external `value` updates still animate the visuals. `disabled=true`
 * implies non-editable, suppresses all callback firing (including `onClick`), and removes
 * the control from the tab order.
 *
 * When `onClick` is provided, the control remains focusable even when `editable=false` so
 * Space/Enter can still activate the click handler.
 *
 * @param props - Component props including parameter configuration, view component, and layout options
 * @returns Rendered boolean control component
 *
 * @example
 * ```tsx
 * // Editable control (default)
 * <BooleanControl
 *   value={isOn}
 *   onValueChange={setIsOn}
 *   view={ButtonView}
 *   viewProps={{ color: "blue", roundness: 0.3 }}
 * />
 *
 * // Display-only view (value driven externally)
 * <BooleanControl
 *   value={isOn}
 *   editable={false}
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
        editable = true,
        disabled = false,
    } = props;

    const effectiveEditable = editable && !disabled;
    const gatedOnValueChange = disabled ? undefined : onValueChange;
    const gatedOnNormalizedValueChange = disabled ? undefined : onNormalizedValueChange;
    const gatedOnMidiValueChange = disabled ? undefined : onMidiValueChange;
    const gatedOnClick = disabled ? undefined : onClick;
    // Gestures only have a visible effect when a value-change callback is wired. This drives
    // cursor/highlight/hook-wiring, so a button with `editable=true` but no callback does not
    // advertise interactivity through the cursor.
    const hasAnyChangeCallback = !!(onValueChange || onNormalizedValueChange || onMidiValueChange);
    const trulyEditable = effectiveEditable && hasAnyChangeCallback;

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
        onValueChange: gatedOnValueChange,
        onNormalizedValueChange: gatedOnNormalizedValueChange,
        onMidiValueChange: gatedOnMidiValueChange,
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
        disabled,
        editable: trulyEditable,
        onMouseDown,
        onMouseUp,
        onKeyDown: undefined, // BooleanControl doesn't have onKeyDown prop, only uses hook handler
        onKeyUp: undefined, // BooleanControl doesn't have onKeyUp prop, only uses hook handler
    });

    // Handle onClick for touch events when the control is not truly editable.
    // When truly editable, the interaction system handles touch events for value changes.
    const handleTouchEndForClick = useCallback(
        (e: React.TouchEvent<SVGSVGElement>) => {
            if (!trulyEditable && gatedOnClick) {
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
                    gatedOnClick(syntheticEvent);
                }
            }
        },
        [trulyEditable, gatedOnClick]
    );

    const handleTouchStartForClick = useCallback(
        (e: React.TouchEvent<SVGSVGElement>) => {
            if (!trulyEditable && gatedOnClick) {
                e.preventDefault();
            }
        },
        [trulyEditable, gatedOnClick]
    );

    const effectiveLabel = label ?? derivedParameter.name;

    const componentClassNames = useMemo(() => {
        return classNames(className, CLASSNAMES.root, CLASSNAMES.container);
    }, [className]);

    const svgClassNames = useMemo(() => {
        return trulyEditable || gatedOnClick ? CLASSNAMES.highlight : "";
    }, [trulyEditable, gatedOnClick]);

    // Always set an explicit cursor to match ContinuousControl's behavior and avoid surprise
    // inheritance from user-agent SVG defaults. Order: disabled wins; otherwise clickable when
    // interactive; otherwise non-editable.
    const cursor = disabled
        ? "var(--audioui-cursor-disabled)"
        : gatedOnClick || trulyEditable
          ? "var(--audioui-cursor-clickable)"
          : "var(--audioui-cursor-noneditable)";
    const svgStyle = useMemo(
        () => ({
            cursor,
            touchAction: "none" as const,
        }),
        [cursor]
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
                onClick={gatedOnClick}
                onMouseDown={trulyEditable ? handleMouseDownWithRef : undefined}
                onMouseUp={trulyEditable ? handleMouseUp : undefined}
                onMouseEnter={(e) => {
                    if (trulyEditable) {
                        handleMouseEnter(e);
                    }
                    onMouseEnter?.(e);
                }}
                onMouseLeave={(e) => {
                    if (trulyEditable) {
                        handleMouseLeave(e);
                    }
                    onMouseLeave?.(e);
                }}
                onTouchStart={
                    trulyEditable
                        ? handleTouchStartWithRef
                        : gatedOnClick
                          ? handleTouchStartForClick
                          : undefined
                }
                onTouchEnd={trulyEditable ? handleTouchEnd : gatedOnClick ? handleTouchEndForClick : undefined}
                onTouchMove={trulyEditable ? handleTouchMove : undefined}
                onKeyDown={trulyEditable ? handleKeyDown : undefined}
                onKeyUp={trulyEditable ? handleKeyUp : undefined}
                tabIndex={disabled ? -1 : effectiveEditable || gatedOnClick ? 0 : -1}
                role="button"
                aria-pressed={realValue}
                aria-label={effectiveLabel}
                aria-disabled={disabled || undefined}
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
