/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { InteractionDirection, InteractionMode } from "../types";

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
     * If not provided, defaults to sensitivity / 4.
     */
    wheelSensitivity?: number;

    /**
     * Step size for keyboard interaction (normalized 0..1)
     * @default 0.1
     */
    keyboardStep?: number;

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
    private config: Required<Omit<ContinuousInteractionConfig, "wheelSensitivity" | "onDragStart" | "onDragEnd">> & {
        wheelSensitivity?: number;
        onDragStart?: () => void;
        onDragEnd?: () => void;
    };
    private startX = 0;
    private startY = 0;
    private centerX = 0;
    private centerY = 0;
    private isDragging = false;

    constructor(config: ContinuousInteractionConfig) {
        this.config = {
            interactionMode: "both",
            direction: "both",
            sensitivity: 0.005,
            keyboardStep: 0.05,
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
            this.config.adjustValue(delta, this.config.sensitivity);
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
        const effectiveSensitivity = this.config.wheelSensitivity ?? this.config.sensitivity / 4;

        this.config.adjustValue(delta, effectiveSensitivity);
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
