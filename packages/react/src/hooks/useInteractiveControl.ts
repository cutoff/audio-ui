import React, { useCallback, useRef, useEffect } from "react";
import { InteractionMode } from "../components/types";

export interface UseInteractiveControlProps {
    /**
     * Function to adjust the value based on a delta.
     * The delta should be applied to the normalized value (0..1).
     */
    adjustValue: (delta: number, sensitivity?: number) => void;

    /**
     * Step size for keyboard interaction (normalized 0..1)
     * @default 0.1
     */
    keyboardStep?: number;

    /**
     * Interaction mode: drag, wheel, or both.
     * @default "both"
     */
    interactionMode?: InteractionMode;

    /**
     * Direction of the drag interaction.
     * For Knobs, usually "vertical". For Sliders, depends on orientation.
     * @default "vertical"
     */
    direction?: "vertical" | "horizontal";

    /**
     * Sensitivity of the control.
     * Represents the amount of normalized value change per pixel (drag) or unit (wheel).
     * @default 0.005 (1/200)
     */
    sensitivity?: number;

    /**
     * Separate sensitivity for wheel events.
     * If not provided, defaults to sensitivity / 4 (assuming wheel events are higher magnitude).
     */
    wheelSensitivity?: number;

    /**
     * Whether the control is disabled
     */
    disabled?: boolean;
}

export interface InteractiveControlHandlers {
    onMouseDown: React.MouseEventHandler;
    onTouchStart: React.TouchEventHandler;
    onWheel: React.WheelEventHandler;
    onKeyDown: React.KeyboardEventHandler;
    tabIndex: number;
    role: string;
    "aria-disabled"?: boolean;
    style?: React.CSSProperties; // For cursor
}

/**
 * Hook to standardize user interaction for continuous controls (Knob, Slider).
 * Handles Drag (Mouse/Touch), Wheel, and Keyboard interactions.
 */
export function useInteractiveControl({
    adjustValue,
    keyboardStep = 0.05, // 5% per key press by default
    interactionMode = "both",
    direction = "vertical",
    sensitivity = 0.005,
    wheelSensitivity,
    disabled = false,
}: UseInteractiveControlProps): InteractiveControlHandlers {
    // Refs to avoid stale closures in event listeners
    const stateRef = useRef({
        startX: 0,
        startY: 0,
        isDragging: false,
        direction,
        sensitivity,
        adjustValue,
        disabled,
    });

    // Update refs when props change
    useEffect(() => {
        stateRef.current = {
            ...stateRef.current,
            direction,
            sensitivity,
            adjustValue,
            disabled,
        };
    }, [direction, sensitivity, adjustValue, disabled]);

    // --- Drag Handling (Mouse & Touch) ---

    const handleDragStart = useCallback(
        (clientX: number, clientY: number) => {
            if (stateRef.current.disabled) return;
            if (interactionMode !== "drag" && interactionMode !== "both") return;

            stateRef.current.startX = clientX;
            stateRef.current.startY = clientY;
            stateRef.current.isDragging = true;

            // Disable text selection during drag - CSS on body is heavy handed but standard for drag operations.
            document.body.style.userSelect = "none";
            document.body.style.webkitUserSelect = "none";
            document.body.style.cursor = stateRef.current.direction === "vertical" ? "ns-resize" : "ew-resize";

            // Attach global listeners
            window.addEventListener("mousemove", handleGlobalMouseMove);
            window.addEventListener("mouseup", handleGlobalMouseUp);
            window.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
            window.addEventListener("touchend", handleGlobalMouseUp);
        },
        [interactionMode]
    );

    const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
        if (!stateRef.current.isDragging) return;
        e.preventDefault();

        const { startX, startY, direction, sensitivity, adjustValue } = stateRef.current;

        let delta = 0;
        if (direction === "vertical") {
            // Up is negative Y, but usually means positive value for knobs/sliders
            // So we invert Y delta: (StartY - CurrentY)
            delta = startY - e.clientY;
        } else {
            // Right is positive X
            delta = e.clientX - startX;
        }

            // Reset start position for relative delta in next frame.
            // adjustValue takes a relative delta to add to current.
            if (delta !== 0) {
                adjustValue(delta, sensitivity);
                stateRef.current.startX = e.clientX;
                stateRef.current.startY = e.clientY;
            }
    }, []);

    const handleGlobalTouchMove = useCallback((e: TouchEvent) => {
        if (!stateRef.current.isDragging) return;
        e.preventDefault(); // Prevent scrolling

        const touch = e.touches[0];
        const { startX, startY, direction, sensitivity, adjustValue } = stateRef.current;

        let delta = 0;
        if (direction === "vertical") {
            delta = startY - touch.clientY;
        } else {
            delta = touch.clientX - startX;
        }

        if (delta !== 0) {
            adjustValue(delta, sensitivity);
            stateRef.current.startX = touch.clientX;
            stateRef.current.startY = touch.clientY;
        }
    }, []);

    const handleGlobalMouseUp = useCallback(() => {
        stateRef.current.isDragging = false;

        // Cleanup
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
        document.body.style.cursor = "";

        window.removeEventListener("mousemove", handleGlobalMouseMove);
        window.removeEventListener("mouseup", handleGlobalMouseUp);
        window.removeEventListener("touchmove", handleGlobalTouchMove);
        window.removeEventListener("touchend", handleGlobalMouseUp);
    }, [handleGlobalMouseMove, handleGlobalTouchMove]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.removeEventListener("mousemove", handleGlobalMouseMove);
            window.removeEventListener("mouseup", handleGlobalMouseUp);
            window.removeEventListener("touchmove", handleGlobalTouchMove);
            window.removeEventListener("touchend", handleGlobalMouseUp);
        };
    }, [handleGlobalMouseMove, handleGlobalMouseUp, handleGlobalTouchMove]);

    // --- Event Handlers ---

    const onMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (interactionMode === "wheel") return; // Drag disabled

            // Allow default behavior so the element receives focus.
            // Text selection is handled by the global user-select: none during drag.
            // e.preventDefault(); 
            
            handleDragStart(e.clientX, e.clientY);
        },
        [handleDragStart, interactionMode]
    );

    const onTouchStart = useCallback(
        (e: React.TouchEvent) => {
            if (interactionMode === "wheel") return; // Drag disabled
            const touch = e.touches[0];
            handleDragStart(touch.clientX, touch.clientY);
        },
        [handleDragStart, interactionMode]
    );

    const onWheel = useCallback(
        (e: React.WheelEvent) => {
            if (disabled) return;
            if (interactionMode !== "wheel" && interactionMode !== "both") return;

            // Prevent page scroll ALWAYS if the event targets this control,
            // assuming the user intends to adjust the value, not scroll the page.
            e.preventDefault();
            e.stopPropagation();

            // Normalize wheel delta (usually 100 or small values for trackpads)
            // Native DOM WheelEvent: deltaY > 0 is DOWN.
            // Original implementation: Positive deltaY increases value (Down = Increase)
            const delta = e.deltaY;

            // Use specific wheel sensitivity or derive from general sensitivity
            // Wheel deltas are often large (100), so we scale down by default
            const effectiveSensitivity = wheelSensitivity ?? sensitivity / 4;

            adjustValue(delta, effectiveSensitivity);
        },
        [interactionMode, adjustValue, sensitivity, wheelSensitivity, disabled]
    );

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (disabled) return;

            let delta = 0;
            switch (e.key) {
                case "ArrowUp":
                case "ArrowRight":
                    delta = 1;
                    break;
                case "ArrowDown":
                case "ArrowLeft":
                    delta = -1;
                    break;
                case "Home":
                    // Handle Min? adjustValue works on delta.
                    // We'd need setNormalizedValue(0) if supported.
                    // For now, large negative delta.
                    delta = -1 / sensitivity;
                    break;
                case "End":
                    // Max
                    delta = 1 / sensitivity;
                    break;
                default:
                    return;
            }

            e.preventDefault();
            // Keyboard step is usually larger than pixel step
            // We pass delta * (keyboardStep / sensitivity) so that adjustValue's (delta * sensitivity) results in keyboardStep
            // adjustValue(d, s) -> d * s. We want `keyboardStep`.
            // So passed_delta = keyboardStep / sensitivity * direction

            const effectiveDelta = delta * (keyboardStep / sensitivity);
            adjustValue(effectiveDelta, sensitivity);
        },
        [adjustValue, sensitivity, keyboardStep, disabled]
    );

    return {
        onMouseDown,
        onTouchStart,
        onWheel,
        onKeyDown,
        tabIndex: disabled ? -1 : 0,
        role: "slider",
        "aria-disabled": disabled,
        style: {
            cursor: disabled ? "not-allowed" : interactionMode === "wheel" ? "ns-resize" : "pointer",
            touchAction: "none", // vital for touch drag to not scroll
        },
    };
}
