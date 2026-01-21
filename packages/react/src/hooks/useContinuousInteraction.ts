/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import React, { useEffect, useMemo, useRef } from "react";
import { ContinuousInteractionController, ContinuousInteractionConfig } from "@cutoff/audio-ui-core";
import { DEFAULT_CONTINUOUS_SENSITIVITY, DEFAULT_KEYBOARD_STEP, TARGET_PIXELS_PER_STEP } from "@cutoff/audio-ui-core";

export type UseContinuousInteractionProps = Omit<ContinuousInteractionConfig, "adjustValue"> & {
    adjustValue: (delta: number, sensitivity?: number) => void;
    editable?: boolean;
    /** Minimum value (real domain). Used to calculate normalized step if step is not provided. */
    min?: number;
    /** Maximum value (real domain). Used to calculate normalized step if step is not provided. */
    max?: number;
    /** Step size (real domain). Used to calculate normalized step if step is not provided. */
    paramStep?: number;
    /** Function to reset the value to its default (called on double-click) */
    resetToDefault?: () => void;
    /** Optional user-provided mouse down handler (composed with hook handler) */
    onMouseDown?: React.MouseEventHandler;
    /** Optional user-provided touch start handler (composed with hook handler) */
    onTouchStart?: React.TouchEventHandler;
    /** Optional user-provided wheel handler (composed with hook handler) */
    onWheel?: React.WheelEventHandler;
    /** Optional user-provided keyboard key down handler (composed with hook handler) */
    onKeyDown?: React.KeyboardEventHandler;
    /** Optional user-provided double click handler (composed with hook handler) */
    onDoubleClick?: React.MouseEventHandler;
};

export interface ContinuousInteractionHandlers {
    onMouseDown: React.MouseEventHandler;
    onTouchStart: React.TouchEventHandler;
    onWheel: React.WheelEventHandler;
    onKeyDown: React.KeyboardEventHandler;
    onDoubleClick: React.MouseEventHandler;
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
 * - Double-click to reset to default value
 *
 * The hook wraps the framework-agnostic `ContinuousInteractionController` and provides React
 * event handlers that can be attached directly to SVG elements. It handles focus
 * management, accessibility attributes, and cursor styling automatically.
 *
 * Cursor types are customizable via CSS variables in themes.css (e.g., `--audioui-cursor-clickable`,
 * `--audioui-cursor-bidirectional`). The cursor selection logic (which cursor to show when) is
 * fixed based on interaction state, but the actual cursor values are customizable.
 *
 * @param adjustValue Function to adjust the value based on a delta. Receives (delta, sensitivity).
 * @param keyboardStep Step size for keyboard interaction (normalized 0..1, default: 0.05)
 * @param interactionMode Interaction mode: "drag", "wheel", or "both" (default: "both")
 * @param direction Direction of drag interaction: "vertical", "horizontal", "circular", or "both" (default: "both")
 * @param sensitivity Sensitivity of the control (default: 0.005). Higher = more sensitive.
 * @param wheelSensitivity Optional separate sensitivity for wheel events. Defaults to DEFAULT_WHEEL_SENSITIVITY (0.005).
 * @param step Normalized step size (0..1). Used for adaptive wheel interaction and sensitivity scaling.
 * @param min Minimum value (real domain). Used to calculate normalized step if step is not provided.
 * @param max Maximum value (real domain). Used to calculate normalized step if step is not provided.
 * @param paramStep Step size (real domain). Used to calculate normalized step if step is not provided.
 * @param disabled Whether the control is disabled (default: false)
 * @param editable Whether the control is editable (default: true). When false, uses `--audioui-cursor-noneditable`.
 * @param resetToDefault Function to reset the value to its default (called on double-click). Only active when editable and not disabled.
 * @param onDragStart Callback when drag interaction starts
 * @param onDragEnd Callback when drag interaction ends
 * @param onMouseDown Optional user-provided mouse down handler (composed with hook handler)
 * @param onTouchStart Optional user-provided touch start handler (composed with hook handler)
 * @param onWheel Optional user-provided wheel handler (composed with hook handler)
 * @param onKeyDown Optional user-provided keyboard key down handler (composed with hook handler)
 * @param onDoubleClick Optional user-provided double click handler (composed with hook handler)
 * @returns Object containing React event handlers (onMouseDown, onTouchStart, onWheel, onKeyDown, onDoubleClick) and accessibility props
 *
 * @example
 * ```tsx
 * const interactiveProps = useContinuousInteraction({
 *   adjustValue: (delta, sensitivity) => {
 *     setValue(v => clamp(v + delta * sensitivity, 0, 100));
 *   },
 *   resetToDefault: () => setValue(defaultValue),
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
    keyboardStep = DEFAULT_KEYBOARD_STEP,
    interactionMode = "both",
    direction = "both",
    sensitivity,
    wheelSensitivity,
    step,
    min,
    max,
    paramStep,
    disabled = false,
    editable = true,
    onDragStart,
    onDragEnd,
    resetToDefault,
    onMouseDown: userOnMouseDown,
    onTouchStart: userOnTouchStart,
    onWheel: userOnWheel,
    onKeyDown: userOnKeyDown,
    onDoubleClick: userOnDoubleClick,
}: UseContinuousInteractionProps): ContinuousInteractionHandlers {
    // Adaptive Sensitivity Logic
    // If a step is provided, ensure that dragging one step corresponds to at most TARGET_PIXELS_PER_STEP.
    // This prevents "dead zones" where you have to drag huge distances to change a low-resolution parameter.
    const effectiveStep = useMemo(() => {
        if (step !== undefined) return step;
        if (paramStep !== undefined && min !== undefined && max !== undefined && max !== min) {
            return paramStep / Math.abs(max - min);
        }
        return undefined;
    }, [step, min, max, paramStep]);

    const effectiveSensitivity = useMemo(() => {
        const base = sensitivity ?? DEFAULT_CONTINUOUS_SENSITIVITY;
        if (effectiveStep) {
            // e.g. Step = 0.1 (range 0-10). Target = 5px.
            // Required sensitivity = 0.1 / 5 = 0.02.
            // Base = 0.005.
            // Result = 0.02.
            const minSensitivityForStep = effectiveStep / TARGET_PIXELS_PER_STEP;
            return Math.max(base, minSensitivityForStep);
        }
        return base;
    }, [sensitivity, effectiveStep]);

    const controllerRef = useRef<ContinuousInteractionController | null>(null);

    if (!controllerRef.current) {
        controllerRef.current = new ContinuousInteractionController({
            adjustValue,
            keyboardStep,
            interactionMode,
            direction,
            sensitivity: effectiveSensitivity,
            wheelSensitivity,
            step: effectiveStep,
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
            sensitivity: effectiveSensitivity,
            wheelSensitivity,
            step: effectiveStep,
            disabled,
            onDragStart,
            onDragEnd,
        });
    }, [
        adjustValue,
        keyboardStep,
        interactionMode,
        direction,
        effectiveSensitivity,
        wheelSensitivity,
        effectiveStep,
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
            onDoubleClick: (e: React.MouseEvent) => {
                // Call user handler first
                userOnDoubleClick?.(e);
                // Only reset if not prevented and resetToDefault is provided
                if (!e.defaultPrevented && resetToDefault && editable && !disabled) {
                    e.preventDefault();
                    resetToDefault();
                }
            },
        };
    }, [
        userOnMouseDown,
        userOnTouchStart,
        userOnWheel,
        userOnKeyDown,
        userOnDoubleClick,
        resetToDefault,
        editable,
        disabled,
    ]);

    // Cursor selection based on interaction state - uses CSS variables for customization
    // The logic (when to show which cursor) is fixed, but cursor types are customizable via CSS
    const cursor = disabled
        ? "var(--audioui-cursor-disabled)"
        : !editable
          ? "var(--audioui-cursor-noneditable)"
          : interactionMode === "wheel"
            ? "var(--audioui-cursor-vertical)"
            : direction === "horizontal"
              ? "var(--audioui-cursor-horizontal)"
              : direction === "vertical"
                ? "var(--audioui-cursor-vertical)"
                : direction === "both"
                  ? "var(--audioui-cursor-bidirectional)"
                  : direction === "circular"
                    ? "var(--audioui-cursor-circular)"
                    : "var(--audioui-cursor-clickable)";

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
