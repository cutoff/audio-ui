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
    /** Handler for mouse enter events (for drag-in behavior) */
    handleMouseEnter: (e: React.MouseEvent) => void;
    /** Handler for mouse leave events (for drag-out behavior) */
    handleMouseLeave: (e: React.MouseEvent) => void;
    /** Handler for touch start events */
    handleTouchStart: (e: React.TouchEvent) => void;
    /** Handler for touch end events */
    handleTouchEnd: (e: React.TouchEvent) => void;
    /** Handler for touch move events (for touch drag-in/drag-out behavior) */
    handleTouchMove: (e: React.TouchEvent) => void;
    /** Ref callback to attach to the button element for touch tracking */
    setButtonElement: (element: HTMLElement | SVGSVGElement | null) => void;
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
 * - Momentary mode: Press to activate, release to deactivate (with global pointer tracking)
 * - Drag-in/drag-out behavior: Buttons respond to pointer entering/leaving while pressed, even when press starts outside the button
 * - Keyboard support: Enter/Space for activation/release
 *
 * The hook wraps the framework-agnostic `BooleanInteractionController` and provides React
 * event handlers that can be attached directly to DOM elements. It maintains stable callback
 * references across renders using `useCallback` and updates the controller configuration via
 * `useEffect` when props change.
 *
 * **Drag-In/Drag-Out Behavior:**
 * - **Momentary Mode**: Press inside → turns on; drag out while pressed → turns off; drag back in while pressed → turns on again. Works even when press starts outside the button.
 * - **Toggle Mode**: Press inside → toggles state; drag out while pressed → no change; drag back in while pressed → toggles again. Works even when press starts outside the button.
 *
 * The hook automatically attaches global pointer listeners (mousedown, mouseup, touchstart, touchmove, touchend)
 * to track pointer state globally, enabling drag-in behavior from anywhere on the page. For mouse interactions,
 * it handles mouseenter/mouseleave events to detect when the pointer crosses the button boundary while pressed.
 * For touch interactions, it manually tracks touch position using touchmove events and elementFromPoint to detect
 * when the touch point crosses button boundaries (since touch events don't fire mouseenter/mouseleave).
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
 * @returns {UseBooleanInteractionResult} Object containing event handlers including handleMouseEnter and handleMouseLeave for drag-in/drag-out behavior
 *
 * @example
 * ```tsx
 * const { handleMouseDown, handleMouseUp, handleMouseEnter, handleMouseLeave, handleTouchStart, handleTouchEnd, handleKeyDown, handleKeyUp } = useBooleanInteraction({
 *   value,
 *   mode: "momentary",
 *   onValueChange: (val) => setValue(val)
 * });
 *
 * <div
 *   onMouseDown={handleMouseDown}
 *   onMouseUp={handleMouseUp}
 *   onMouseEnter={handleMouseEnter}
 *   onMouseLeave={handleMouseLeave}
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
    const buttonElementRef = useRef<HTMLElement | SVGSVGElement | null>(null);
    const touchIsInsideRef = useRef<boolean>(false);
    const isGlobalPointerDownRef = useRef<boolean>(false);

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

    // Global pointer down handler - tracks when ANY pointer is pressed anywhere
    // This enables drag-in behavior: pressing outside and dragging into the button
    const handleGlobalMouseDown = useCallback((e: MouseEvent) => {
        // Only track primary button (left click)
        if (e.button === 0) {
            isGlobalPointerDownRef.current = true;
            controllerRef.current?.handleGlobalPointerDown(false);
        }
    }, []);

    const handleGlobalTouchStart = useCallback((_e: TouchEvent) => {
        isGlobalPointerDownRef.current = true;
        controllerRef.current?.handleGlobalPointerDown(false);
    }, []);

    // Global pointer up handler - resets global pointer state and handles release
    const handleGlobalMouseUp = useCallback(() => {
        isGlobalPointerDownRef.current = false;
        controllerRef.current?.handleGlobalPointerUp();
    }, []);

    // Global touchend handler - resets global pointer state and handles release
    const handleGlobalTouchEnd = useCallback(() => {
        isGlobalPointerDownRef.current = false;
        touchIsInsideRef.current = false;
        controllerRef.current?.handleGlobalPointerUp();
    }, []);

    // Global touchmove handler - tracks touch position to detect enter/leave for touch devices
    // Touch events don't fire mouseenter/mouseleave, so we need to manually track when touch
    // crosses button boundaries
    const handleGlobalTouchMove = useCallback((e: TouchEvent) => {
        if (!controllerRef.current || !buttonElementRef.current) return;

        // Only track if global pointer is down
        if (!isGlobalPointerDownRef.current) return;

        const controller = controllerRef.current;
        const buttonElement = buttonElementRef.current;

        // Get the first touch point
        if (e.touches.length === 0) return;
        const touch = e.touches[0];

        // Find element at touch point
        const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);

        // Check if touch is over this button (or any child of it)
        const isInside = elementAtPoint === buttonElement || buttonElement.contains(elementAtPoint);

        // Only react if state changed
        if (isInside !== touchIsInsideRef.current) {
            touchIsInsideRef.current = isInside;

            if (isInside) {
                // Touch entered the button
                controller.handleMouseEnter();
            } else {
                // Touch left the button
                controller.handleMouseLeave();
            }
        }
    }, []);

    // Attach global pointer listeners for drag-in/drag-out behavior
    // This enables buttons to respond even when press starts outside the button
    useEffect(() => {
        if (!disabled) {
            window.addEventListener("mousedown", handleGlobalMouseDown);
            window.addEventListener("mouseup", handleGlobalMouseUp);
            window.addEventListener("touchstart", handleGlobalTouchStart, { passive: true });
            window.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
            window.addEventListener("touchend", handleGlobalTouchEnd);
            return () => {
                window.removeEventListener("mousedown", handleGlobalMouseDown);
                window.removeEventListener("mouseup", handleGlobalMouseUp);
                window.removeEventListener("touchstart", handleGlobalTouchStart);
                window.removeEventListener("touchmove", handleGlobalTouchMove);
                window.removeEventListener("touchend", handleGlobalTouchEnd);
            };
        }
        return undefined;
    }, [
        disabled,
        handleGlobalMouseDown,
        handleGlobalMouseUp,
        handleGlobalTouchStart,
        handleGlobalTouchMove,
        handleGlobalTouchEnd,
    ]);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            // Call user handler first
            userOnMouseDown?.(e);
            // Only call hook handler if not prevented
            if (!e.defaultPrevented) {
                // Store button element reference for potential touch tracking
                buttonElementRef.current = e.currentTarget as HTMLElement;
                isGlobalPointerDownRef.current = true;
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
                isGlobalPointerDownRef.current = false;
                controllerRef.current?.handleMouseUp(e.defaultPrevented);
            }
        },
        [userOnMouseUp]
    );

    const handleMouseEnter = useCallback((_e: React.MouseEvent) => {
        controllerRef.current?.handleMouseEnter();
    }, []);

    const handleMouseLeave = useCallback((_e: React.MouseEvent) => {
        controllerRef.current?.handleMouseLeave();
    }, []);

    // Set button element reference (called when component mounts or element changes)
    const setButtonElement = useCallback((element: HTMLElement | SVGSVGElement | null) => {
        buttonElementRef.current = element;
    }, []);

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            // Call user handler first
            userOnTouchStart?.(e);
            // Only call hook handler if not prevented
            if (!e.defaultPrevented) {
                // Prevent default to avoid mouse event emulation and double-firing
                e.preventDefault();
                // Store button element reference for touch tracking
                buttonElementRef.current = e.currentTarget as HTMLElement;
                touchIsInsideRef.current = true; // Touch started on this button
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
                touchIsInsideRef.current = false;
            }
        },
        [userOnTouchEnd]
    );

    // Touch move handler - prevents default scrolling and allows touch tracking
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        // Prevent default scrolling during touch drag
        e.preventDefault();
    }, []);

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
        handleMouseEnter,
        handleMouseLeave,
        handleTouchStart,
        handleTouchEnd,
        handleTouchMove,
        setButtonElement,
        handleKeyDown,
        handleKeyUp,
    };
}
