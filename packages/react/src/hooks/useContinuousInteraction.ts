/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import React, { useEffect, useMemo, useRef } from "react";
import { ContinuousInteractionController, ContinuousInteractionConfig, CIRCULAR_CURSOR } from "@cutoff/audio-ui-core";

export type UseContinuousInteractionProps = Omit<ContinuousInteractionConfig, "adjustValue"> & {
    adjustValue: (delta: number, sensitivity?: number) => void;
    editable?: boolean;
    /** Optional user-provided mouse down handler (composed with hook handler) */
    onMouseDown?: React.MouseEventHandler;
    /** Optional user-provided touch start handler (composed with hook handler) */
    onTouchStart?: React.TouchEventHandler;
    /** Optional user-provided wheel handler (composed with hook handler) */
    onWheel?: React.WheelEventHandler;
    /** Optional user-provided keyboard key down handler (composed with hook handler) */
    onKeyDown?: React.KeyboardEventHandler;
};

export interface ContinuousInteractionHandlers {
    onMouseDown: React.MouseEventHandler;
    onTouchStart: React.TouchEventHandler;
    onWheel: React.WheelEventHandler;
    onKeyDown: React.KeyboardEventHandler;
    tabIndex: number;
    role: string;
    "aria-disabled"?: boolean;
    style?: React.CSSProperties;
}

/**
 * Hook to standardize user interaction for continuous controls (Knob, Slider).
 *
 * This hook provides a unified interface for handling all user input methods:
 * - Drag interactions (mouse and touch)
 * - Wheel scrolling
 * - Keyboard navigation (arrow keys, Home/End)
 *
 * The hook wraps the framework-agnostic `ContinuousInteractionController` and provides React
 * event handlers that can be attached directly to SVG elements. It handles focus
 * management, accessibility attributes, and cursor styling automatically.
 *
 * @param adjustValue Function to adjust the value based on a delta. Receives (delta, sensitivity).
 * @param keyboardStep Step size for keyboard interaction (normalized 0..1, default: 0.05)
 * @param interactionMode Interaction mode: "drag", "wheel", or "both" (default: "both")
 * @param direction Direction of drag interaction: "vertical", "horizontal", "circular", or "both" (default: "both")
 * @param sensitivity Sensitivity of the control (default: 0.005). Higher = more sensitive.
 * @param wheelSensitivity Optional separate sensitivity for wheel events. Defaults to sensitivity / 4.
 * @param disabled Whether the control is disabled (default: false)
 * @param editable Whether the control is editable (default: true). When false, cursor changes to "default".
 * @param onDragStart Callback when drag interaction starts
 * @param onDragEnd Callback when drag interaction ends
 * @param onMouseDown Optional user-provided mouse down handler (composed with hook handler)
 * @param onTouchStart Optional user-provided touch start handler (composed with hook handler)
 * @param onWheel Optional user-provided wheel handler (composed with hook handler)
 * @param onKeyDown Optional user-provided keyboard key down handler (composed with hook handler)
 * @returns Object containing React event handlers (onMouseDown, onTouchStart, onWheel, onKeyDown) and accessibility props
 *
 * @example
 * ```tsx
 * const interactiveProps = useContinuousInteraction({
 *   adjustValue: (delta, sensitivity) => {
 *     setValue(v => clamp(v + delta * sensitivity, 0, 100));
 *   },
 *   interactionMode: "both",
 *   direction: "vertical",
 *   sensitivity: 0.01
 * });
 *
 * <svg {...interactiveProps}>
 *   <circle cx={50} cy={50} r={30} />
 * </svg>
 * ```
 */
export function useContinuousInteraction({
    adjustValue,
    keyboardStep = 0.05,
    interactionMode = "both",
    direction = "both",
    sensitivity = 0.005,
    wheelSensitivity,
    disabled = false,
    editable = true,
    onDragStart,
    onDragEnd,
    onMouseDown: userOnMouseDown,
    onTouchStart: userOnTouchStart,
    onWheel: userOnWheel,
    onKeyDown: userOnKeyDown,
}: UseContinuousInteractionProps): ContinuousInteractionHandlers {
    const controllerRef = useRef<ContinuousInteractionController | null>(null);

    if (!controllerRef.current) {
        controllerRef.current = new ContinuousInteractionController({
            adjustValue,
            keyboardStep,
            interactionMode,
            direction,
            sensitivity,
            wheelSensitivity,
            disabled,
            onDragStart,
            onDragEnd,
        });
    }

    useEffect(() => {
        controllerRef.current?.updateConfig({
            adjustValue,
            keyboardStep,
            interactionMode,
            direction,
            sensitivity,
            wheelSensitivity,
            disabled,
            onDragStart,
            onDragEnd,
        });
    }, [
        adjustValue,
        keyboardStep,
        interactionMode,
        direction,
        sensitivity,
        wheelSensitivity,
        disabled,
        onDragStart,
        onDragEnd,
    ]);

    useEffect(() => {
        return () => {
            controllerRef.current?.dispose();
        };
    }, []);

    // Handlers with user handler composition
    const handlers = useMemo(() => {
        const ctrl = controllerRef.current!;

        return {
            onMouseDown: (e: React.MouseEvent) => {
                // Call user handler first
                userOnMouseDown?.(e);
                // Only call hook handler if not prevented
                if (!e.defaultPrevented) {
                    ctrl.handleMouseDown(e.clientX, e.clientY, e.currentTarget);
                }
            },
            onTouchStart: (e: React.TouchEvent) => {
                // Call user handler first
                userOnTouchStart?.(e);
                // Only call hook handler if not prevented
                if (!e.defaultPrevented) {
                    const touch = e.touches[0];
                    ctrl.handleTouchStart(touch.clientX, touch.clientY, e.currentTarget);
                }
            },
            onWheel: (e: React.WheelEvent) => {
                // Call user handler first
                userOnWheel?.(e);
                // Only call hook handler if not prevented
                if (!e.defaultPrevented) {
                    ctrl.handleWheel(e as unknown as WheelEvent);
                }
            },
            onKeyDown: (e: React.KeyboardEvent) => {
                // Call user handler first
                userOnKeyDown?.(e);
                // Only call hook handler if not prevented
                if (!e.defaultPrevented) {
                    ctrl.handleKeyDown(e as unknown as KeyboardEvent);
                }
            },
        };
    }, [userOnMouseDown, userOnTouchStart, userOnWheel, userOnKeyDown]);

    const cursor = disabled
        ? "not-allowed"
        : !editable
          ? "default"
          : interactionMode === "wheel"
            ? "ns-resize"
            : direction === "horizontal"
              ? "ew-resize"
              : direction === "vertical"
                ? "ns-resize"
                : direction === "both"
                  ? "move"
                  : direction === "circular"
                    ? CIRCULAR_CURSOR
                    : "pointer";

    return {
        ...handlers,
        tabIndex: disabled ? -1 : 0,
        role: "slider",
        "aria-disabled": disabled,
        style: {
            cursor,
            touchAction: "none",
        },
    };
}
