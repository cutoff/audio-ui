/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import React, { useCallback, useRef, useEffect } from "react";
import { BooleanInteractionController, BooleanInteractionMode } from "@cutoff/audio-ui-core";

export interface UseBooleanInteractionProps {
    /** Current value of the control */
    value: boolean;
    /** Interaction mode: toggle (latch) or momentary */
    mode: BooleanInteractionMode;
    /** Callback to update the value */
    onValueChange: (value: boolean) => void;
    /** Whether the control is disabled */
    disabled?: boolean;
    /** Optional user-provided mouse down handler (composed with hook handler) */
    onMouseDown?: React.MouseEventHandler;
    /** Optional user-provided mouse up handler (composed with hook handler) */
    onMouseUp?: React.MouseEventHandler;
    /** Optional user-provided touch start handler (composed with hook handler) */
    onTouchStart?: React.TouchEventHandler;
    /** Optional user-provided touch end handler (composed with hook handler) */
    onTouchEnd?: React.TouchEventHandler;
    /** Optional user-provided keyboard key down handler (composed with hook handler) */
    onKeyDown?: React.KeyboardEventHandler;
    /** Optional user-provided keyboard key up handler (composed with hook handler) */
    onKeyUp?: React.KeyboardEventHandler;
}

export interface UseBooleanInteractionResult {
    /** Handler for mouse down events */
    handleMouseDown: (e: React.MouseEvent) => void;
    /** Handler for mouse up events */
    handleMouseUp: (e: React.MouseEvent) => void;
    /** Handler for touch start events */
    handleTouchStart: (e: React.TouchEvent) => void;
    /** Handler for touch end events */
    handleTouchEnd: (e: React.TouchEvent) => void;
    /** Handler for keyboard key down events (Enter/Space to activate) */
    handleKeyDown: (e: React.KeyboardEvent) => void;
    /** Handler for keyboard key up events (Enter/Space to release momentary buttons) */
    handleKeyUp: (e: React.KeyboardEvent) => void;
}

/**
 * Hook to manage interactions for boolean controls (buttons, toggles).
 *
 * Provides standardized logic for:
 * - Toggle mode: Click or Space/Enter to flip the value
 * - Momentary mode: Press to activate, release to deactivate (with global mouseup handling)
 * - Keyboard support: Enter/Space for activation/release
 *
 * The hook wraps the framework-agnostic `BooleanInteractionController` and provides React
 * event handlers that can be attached directly to DOM elements. It maintains stable callback
 * references across renders using `useCallback` and updates the controller configuration via
 * `useEffect` when props change.
 *
 * For momentary buttons, the hook automatically attaches global mouseup and touchend listeners
 * to ensure the button releases even if the pointer is moved outside the button before release
 * (common in audio applications).
 *
 * @param {UseBooleanInteractionProps} props - Configuration for the boolean interaction hook
 * @param {boolean} props.value - Current value of the control
 * @param {BooleanInteractionMode} props.mode - Interaction mode: "toggle" or "momentary"
 * @param {(value: boolean) => void} props.onValueChange - Callback to update the value
 * @param {boolean} [props.disabled=false] - Whether the control is disabled
 * @param {React.MouseEventHandler} [props.onMouseDown] - Optional user-provided mouse down handler
 * @param {React.MouseEventHandler} [props.onMouseUp] - Optional user-provided mouse up handler
 * @param {React.TouchEventHandler} [props.onTouchStart] - Optional user-provided touch start handler
 * @param {React.TouchEventHandler} [props.onTouchEnd] - Optional user-provided touch end handler
 * @param {React.KeyboardEventHandler} [props.onKeyDown] - Optional user-provided keyboard key down handler
 * @param {React.KeyboardEventHandler} [props.onKeyUp] - Optional user-provided keyboard key up handler
 * @returns {UseBooleanInteractionResult} Object containing event handlers
 *
 * @example
 * ```tsx
 * const { handleMouseDown, handleMouseUp, handleTouchStart, handleTouchEnd, handleKeyDown, handleKeyUp } = useBooleanInteraction({
 *   value,
 *   mode: "momentary",
 *   onValueChange: (val) => setValue(val)
 * });
 *
 * <div
 *   onMouseDown={handleMouseDown}
 *   onMouseUp={handleMouseUp}
 *   onTouchStart={handleTouchStart}
 *   onTouchEnd={handleTouchEnd}
 *   onKeyDown={handleKeyDown}
 *   onKeyUp={handleKeyUp}
 * />
 * ```
 */
export function useBooleanInteraction({
    value,
    mode,
    onValueChange,
    disabled = false,
    onMouseDown: userOnMouseDown,
    onMouseUp: userOnMouseUp,
    onTouchStart: userOnTouchStart,
    onTouchEnd: userOnTouchEnd,
    onKeyDown: userOnKeyDown,
    onKeyUp: userOnKeyUp,
}: UseBooleanInteractionProps): UseBooleanInteractionResult {
    const controllerRef = useRef<BooleanInteractionController | null>(null);

    if (!controllerRef.current) {
        controllerRef.current = new BooleanInteractionController({
            value,
            mode,
            onValueChange,
            disabled,
        });
    }

    useEffect(() => {
        controllerRef.current?.updateConfig({
            value,
            mode,
            onValueChange,
            disabled,
        });
    }, [value, mode, onValueChange, disabled]);

    // Global mouseup handler for momentary buttons
    // This ensures the button releases even if the mouse is moved outside the button
    // before the mouse button is released (common in audio applications)
    const handleGlobalMouseUp = useCallback(() => {
        controllerRef.current?.handleGlobalMouseUp();
    }, []);

    // Global touchend handler for momentary buttons
    // This ensures the button releases even if the touch is moved outside the button
    // before the touch ends (common in audio applications, especially on tablets)
    // Note: Uses the same controller method as mouseup since the controller handles both cases
    const handleGlobalTouchEnd = useCallback(() => {
        controllerRef.current?.handleGlobalMouseUp();
    }, []);

    // Attach global mouseup and touchend listeners for momentary buttons
    // This is necessary because users may drag the pointer outside the button before releasing
    useEffect(() => {
        if (mode === "momentary" && !disabled) {
            window.addEventListener("mouseup", handleGlobalMouseUp);
            window.addEventListener("touchend", handleGlobalTouchEnd);
            return () => {
                window.removeEventListener("mouseup", handleGlobalMouseUp);
                window.removeEventListener("touchend", handleGlobalTouchEnd);
            };
        }
        return undefined;
    }, [mode, disabled, handleGlobalMouseUp, handleGlobalTouchEnd]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            // Call user handler first
            userOnMouseDown?.(e);
            // Only call hook handler if not prevented
            if (!e.defaultPrevented) {
                controllerRef.current?.handleMouseDown(e.defaultPrevented);
            }
        },
        [userOnMouseDown]
    );

    const handleMouseUp = useCallback(
        (e: React.MouseEvent) => {
            // Call user handler first
            userOnMouseUp?.(e);
            // Only call hook handler if not prevented
            if (!e.defaultPrevented) {
                controllerRef.current?.handleMouseUp(e.defaultPrevented);
            }
        },
        [userOnMouseUp]
    );

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            // Call user handler first
            userOnTouchStart?.(e);
            // Only call hook handler if not prevented
            if (!e.defaultPrevented) {
                // Prevent default to avoid mouse event emulation and double-firing
                e.preventDefault();
                controllerRef.current?.handleMouseDown(false);
            }
        },
        [userOnTouchStart]
    );

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            // Call user handler first
            userOnTouchEnd?.(e);
            // Only call hook handler if not prevented
            if (!e.defaultPrevented) {
                // Prevent default to avoid mouse event emulation and double-firing
                e.preventDefault();
                controllerRef.current?.handleMouseUp(false);
            }
        },
        [userOnTouchEnd]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            // Call user handler first
            userOnKeyDown?.(e);
            // Only call hook handler if not prevented
            if (!e.defaultPrevented) {
                const handled = controllerRef.current?.handleKeyDown(e.key);
                if (handled) {
                    e.preventDefault();
                }
            }
        },
        [userOnKeyDown]
    );

    const handleKeyUp = useCallback(
        (e: React.KeyboardEvent) => {
            // Call user handler first
            userOnKeyUp?.(e);
            // Only call hook handler if not prevented
            if (!e.defaultPrevented) {
                const handled = controllerRef.current?.handleKeyUp(e.key);
                if (handled) {
                    e.preventDefault();
                }
            }
        },
        [userOnKeyUp]
    );

    return {
        handleMouseDown,
        handleMouseUp,
        handleTouchStart,
        handleTouchEnd,
        handleKeyDown,
        handleKeyUp,
    };
}
