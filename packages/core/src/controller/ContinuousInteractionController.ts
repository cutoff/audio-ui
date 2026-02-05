/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { InteractionDirection, InteractionMode } from "../types";
import {
    DEFAULT_CONTINUOUS_SENSITIVITY,
    DEFAULT_KEYBOARD_STEP,
    DEFAULT_WHEEL_SENSITIVITY,
} from "../constants/interaction";

export interface ContinuousInteractionConfig {
    /**
     * Function to adjust the value based on a delta.
     * ...
     */
    adjustValue: (delta: number, sensitivity?: number) => void;

    /**
     * Interaction mode: drag, wheel, or both.
     * @default "both"
     */
    interactionMode?: InteractionMode;

    /**
     * Direction of the drag interaction.
     * @default "both"
     */
    direction?: InteractionDirection;

    /**
     * Sensitivity of the control.
     * ...
     * @default 0.005
     */
    sensitivity?: number;

    /**
     * Separate sensitivity for wheel events.
     * If not provided, defaults to DEFAULT_WHEEL_SENSITIVITY (0.005).
     */
    wheelSensitivity?: number;

    /**
     * Step size for keyboard interaction (normalized 0..1)
     * @default 0.05
     */
    keyboardStep?: number;

    /**
     * Normalized step size of the parameter (0..1).
     * Used for adaptive wheel interaction (accumulating deltas until a step is reached).
     * If not provided, wheel interaction is continuous.
     */
    step?: number;

    /**
     * Callback when a drag interaction starts
     */
    onDragStart?: () => void;

    /**
     * Callback when a drag interaction ends
     */
    onDragEnd?: () => void;

    /**
     * Whether the control is disabled
     */
    disabled?: boolean;
}

/**
 * Framework-agnostic controller for handling user interactions (Drag, Wheel, Keyboard)
 * for continuous controls.
 */
export class ContinuousInteractionController {
    private config: Required<
        Omit<ContinuousInteractionConfig, "wheelSensitivity" | "step" | "onDragStart" | "onDragEnd">
    > & {
        wheelSensitivity?: number;
        step?: number;
        onDragStart?: () => void;
        onDragEnd?: () => void;
    };
    private startX = 0;
    private startY = 0;
    private centerX = 0;
    private centerY = 0;
    private isDragging = false;
    private wheelAccumulator = 0;
    private dragAccumulator = 0;

    constructor(config: ContinuousInteractionConfig) {
        this.config = {
            interactionMode: "both",
            direction: "both",
            sensitivity: DEFAULT_CONTINUOUS_SENSITIVITY,
            keyboardStep: DEFAULT_KEYBOARD_STEP,
            disabled: false,
            // adjustValue is provided in config
            ...config,
        };

        this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
        this.handleGlobalMouseUp = this.handleGlobalMouseUp.bind(this);
        this.handleGlobalTouchMove = this.handleGlobalTouchMove.bind(this);
    }

    /**
     * Updates the configuration of the controller.
     * @param config Partial configuration to update.
     */
    public updateConfig(config: Partial<ContinuousInteractionConfig>) {
        Object.assign(this.config, config);
    }

    /**
     * Handles the start of a mouse drag interaction.
     * Should be called from the component's onMouseDown handler.
     * @param clientX The X coordinate of the mouse event.
     * @param clientY The Y coordinate of the mouse event.
     * @param target The event target (used for circular center calculation).
     */
    public handleMouseDown = (clientX: number, clientY: number, target?: EventTarget) => {
        if (this.config.interactionMode === "wheel") return;
        this.startDrag(clientX, clientY, target);
    };

    /**
     * Handles the start of a touch interaction.
     * Should be called from the component's onTouchStart handler.
     * @param clientX The X coordinate of the touch event.
     * @param clientY The Y coordinate of the touch event.
     * @param target The event target.
     */
    public handleTouchStart = (clientX: number, clientY: number, target?: EventTarget) => {
        if (this.config.interactionMode === "wheel") return;
        this.startDrag(clientX, clientY, target);
    };

    private startDrag(x: number, y: number, target?: EventTarget) {
        if (this.config.disabled) return;

        this.startX = x;
        this.startY = y;
        this.isDragging = true;
        this.dragAccumulator = 0;
        this.config.onDragStart?.();

        if (this.config.direction === "circular" && target && (target as HTMLElement).getBoundingClientRect) {
            const rect = (target as HTMLElement).getBoundingClientRect();
            this.centerX = rect.left + rect.width / 2;
            this.centerY = rect.top + rect.height / 2;
        }

        document.body.style.userSelect = "none";

        // Cursor selection based on interaction direction - uses CSS variables for customization
        // The logic (when to show which cursor) is fixed, but cursor types are customizable via CSS
        let cursor = "var(--audioui-cursor-vertical)";
        if (this.config.direction === "horizontal") cursor = "var(--audioui-cursor-horizontal)";
        if (this.config.direction === "both") cursor = "var(--audioui-cursor-bidirectional)";
        if (this.config.direction === "circular") cursor = "var(--audioui-cursor-circular)";

        document.body.style.cursor = cursor;

        window.addEventListener("mousemove", this.handleGlobalMouseMove);
        window.addEventListener("mouseup", this.handleGlobalMouseUp);
        window.addEventListener("touchmove", this.handleGlobalTouchMove, { passive: false });
        window.addEventListener("touchend", this.handleGlobalMouseUp);
    }

    private handleGlobalMouseMove(e: MouseEvent) {
        if (!this.isDragging) return;
        e.preventDefault();
        this.processDrag(e.clientX, e.clientY);
    }

    private handleGlobalTouchMove(e: TouchEvent) {
        if (!this.isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        this.processDrag(touch.clientX, touch.clientY);
    }

    private processDrag(x: number, y: number) {
        let delta = 0;
        if (this.config.direction === "vertical") {
            // Vertical drag: Up (negative Y) typically means increase value
            // Invert Y delta so dragging up increases value: (startY - y)
            delta = this.startY - y;
        } else if (this.config.direction === "horizontal") {
            // Horizontal drag: Right (positive X) means increase value
            delta = x - this.startX;
        } else if (this.config.direction === "both") {
            // Both directions: Sum horizontal (right+) and vertical (up+) movements
            // This allows diagonal drags to combine both axes for faster adjustment
            delta = x - this.startX + (this.startY - y);
        } else if (this.config.direction === "circular") {
            // Circular drag: Calculate angular change around the center point
            // atan2(y, x): 0° is right (x+, y0), 90° is down (x0, y+), clockwise rotation
            const currentAngle = Math.atan2(y - this.centerY, x - this.centerX);
            const startAngle = Math.atan2(this.startY - this.centerY, this.startX - this.centerX);

            let angleDelta = currentAngle - startAngle;

            // Handle wrapping across ±180° boundary (shortest path)
            // Without this, dragging across the 180° line would cause a large jump
            if (angleDelta > Math.PI) angleDelta -= 2 * Math.PI;
            else if (angleDelta < -Math.PI) angleDelta += 2 * Math.PI;

            // Convert radians to degrees (1 degree ≈ 1 pixel for sensitivity matching)
            delta = angleDelta * (180 / Math.PI);
        }

        if (delta !== 0) {
            const normalizedDelta = delta * this.config.sensitivity;

            if (this.config.step) {
                this.dragAccumulator += normalizedDelta;

                if (Math.abs(this.dragAccumulator) >= this.config.step) {
                    // How many whole steps?
                    const stepsToMove = Math.trunc(this.dragAccumulator / this.config.step);
                    const valueChange = stepsToMove * this.config.step;

                    this.config.adjustValue(valueChange, 1.0); // Pass 1.0 as sensitivity since we calculated the full normalized delta

                    // Keep the remainder in the accumulator
                    this.dragAccumulator -= valueChange;
                }
            } else {
                this.config.adjustValue(delta, this.config.sensitivity);
            }

            this.startX = x;
            this.startY = y;
        }
    }

    /**
     * Handles global mouse up event to end drag.
     */
    private handleGlobalMouseUp() {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.config.onDragEnd?.();

        document.body.style.userSelect = "";
        document.body.style.cursor = "";

        window.removeEventListener("mousemove", this.handleGlobalMouseMove);
        window.removeEventListener("mouseup", this.handleGlobalMouseUp);
        window.removeEventListener("touchmove", this.handleGlobalTouchMove);
        window.removeEventListener("touchend", this.handleGlobalMouseUp);
    }

    /**
     * Handles wheel events.
     * Should be called from the component's onWheel handler.
     * @param e The wheel event.
     */
    public handleWheel = (e: WheelEvent) => {
        if (this.config.disabled) return;
        if (this.config.interactionMode !== "wheel" && this.config.interactionMode !== "both") return;

        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();

        const delta = e.deltaY;
        // Use separate wheel sensitivity default (or user provided), ignoring adaptive drag sensitivity
        const effectiveSensitivity = this.config.wheelSensitivity ?? DEFAULT_WHEEL_SENSITIVITY;

        // If we have a discrete step size, we use an accumulator to ensure we don't land between steps
        // This solves "too fast" issues on notched mice (ensures 1 notch >= 1 step)
        // and "too slow" issues on trackpads (accumulates small deltas until 1 step)
        if (this.config.step) {
            this.wheelAccumulator += delta * effectiveSensitivity;

            if (Math.abs(this.wheelAccumulator) >= this.config.step) {
                const stepsToMove = Math.trunc(this.wheelAccumulator / this.config.step);
                // Move exactly N steps.
                // Note: we pass 1.0 as sensitivity so the first arg is the absolute normalized delta.
                this.config.adjustValue(stepsToMove * this.config.step, 1.0);
                this.wheelAccumulator -= stepsToMove * this.config.step;
            }
        } else {
            this.config.adjustValue(delta, effectiveSensitivity);
        }
    };

    /**
     * Handles keyboard events (Arrow keys, Home, End).
     * Should be called from the component's onKeyDown handler.
     * @param e The keyboard event.
     */
    public handleKeyDown = (e: KeyboardEvent) => {
        if (this.config.disabled) return;

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
                // Large negative delta to reach minimum
                delta = -1 / this.config.sensitivity;
                break;
            case "End":
                // Large positive delta to reach maximum
                delta = 1 / this.config.sensitivity;
                break;
            default:
                return;
        }

        e.preventDefault();

        // adjustValue(d, s) -> d * s. We want `keyboardStep`, so:
        // passed_delta = keyboardStep / sensitivity * direction
        const effectiveDelta = delta * (this.config.keyboardStep / this.config.sensitivity);
        this.config.adjustValue(effectiveDelta, this.config.sensitivity);
    };

    /**
     * Cleans up event listeners.
     */
    public dispose() {
        this.handleGlobalMouseUp();
    }
}
