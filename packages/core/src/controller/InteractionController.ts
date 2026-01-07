import { InteractionDirection, InteractionMode } from "../types";
import { CIRCULAR_CURSOR } from "../constants/cursors";

export interface InteractionConfig {
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
     * Whether the control is disabled
     */
    disabled?: boolean;
}

/**
 * Framework-agnostic controller for handling user interactions (Drag, Wheel, Keyboard)
 * for continuous controls.
 */
export class InteractionController {
    private config: Required<Omit<InteractionConfig, "wheelSensitivity">> & { wheelSensitivity?: number };
    private startX = 0;
    private startY = 0;
    private centerX = 0;
    private centerY = 0;
    private isDragging = false;

    constructor(config: InteractionConfig) {
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

    public updateConfig(config: Partial<InteractionConfig>) {
        Object.assign(this.config, config);
    }

    public handleMouseDown = (clientX: number, clientY: number, target?: EventTarget) => {
        if (this.config.interactionMode === "wheel") return;
        this.startDrag(clientX, clientY, target);
    };

    public handleTouchStart = (clientX: number, clientY: number, target?: EventTarget) => {
        if (this.config.interactionMode === "wheel") return;
        this.startDrag(clientX, clientY, target);
    };

    private startDrag(x: number, y: number, target?: EventTarget) {
        if (this.config.disabled) return;

        this.startX = x;
        this.startY = y;
        this.isDragging = true;

        if (this.config.direction === "circular" && target && (target as HTMLElement).getBoundingClientRect) {
            const rect = (target as HTMLElement).getBoundingClientRect();
            this.centerX = rect.left + rect.width / 2;
            this.centerY = rect.top + rect.height / 2;
        }

        document.body.style.userSelect = "none";

        let cursor = "ns-resize";
        if (this.config.direction === "horizontal") cursor = "ew-resize";
        if (this.config.direction === "both") cursor = "move";
        if (this.config.direction === "circular") cursor = CIRCULAR_CURSOR;

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

    private handleGlobalMouseUp() {
        if (!this.isDragging) return;

        this.isDragging = false;

        document.body.style.userSelect = "";
        document.body.style.cursor = "";

        window.removeEventListener("mousemove", this.handleGlobalMouseMove);
        window.removeEventListener("mouseup", this.handleGlobalMouseUp);
        window.removeEventListener("touchmove", this.handleGlobalTouchMove);
        window.removeEventListener("touchend", this.handleGlobalMouseUp);
    }

    public handleWheel = (e: WheelEvent | any) => {
        if (this.config.disabled) return;
        if (this.config.interactionMode !== "wheel" && this.config.interactionMode !== "both") return;

        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();

        const delta = e.deltaY;
        const effectiveSensitivity = this.config.wheelSensitivity ?? this.config.sensitivity / 4;

        this.config.adjustValue(delta, effectiveSensitivity);
    };

    public handleKeyDown = (e: KeyboardEvent | any) => {
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

    public dispose() {
        this.handleGlobalMouseUp();
    }
}
