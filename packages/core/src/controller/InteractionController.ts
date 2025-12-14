import { InteractionMode } from "../types";

export interface InteractionConfig {
    /**
     * Function to adjust the value based on a delta.
     */
    adjustValue: (delta: number, sensitivity?: number) => void;

    /**
     * Interaction mode: drag, wheel, or both.
     * @default "both"
     */
    interactionMode?: InteractionMode;

    /**
     * Direction of the drag interaction.
     * @default "vertical"
     */
    direction?: "vertical" | "horizontal";

    /**
     * Sensitivity of the control.
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
    private isDragging = false;

    constructor(config: InteractionConfig) {
        this.config = {
            interactionMode: "both",
            direction: "vertical",
            sensitivity: 0.005,
            keyboardStep: 0.05,
            disabled: false,
            // adjustValue is provided in config
            ...config,
        };

        // Bind methods for event listeners
        this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
        this.handleGlobalMouseUp = this.handleGlobalMouseUp.bind(this);
        this.handleGlobalTouchMove = this.handleGlobalTouchMove.bind(this);
    }

    public updateConfig(config: Partial<InteractionConfig>) {
        Object.assign(this.config, config);
    }

    // --- Drag Handling ---

    public handleMouseDown = (clientX: number, clientY: number) => {
        if (this.config.interactionMode === "wheel") return;
        this.startDrag(clientX, clientY);
    };

    public handleTouchStart = (clientX: number, clientY: number) => {
        if (this.config.interactionMode === "wheel") return;
        this.startDrag(clientX, clientY);
    };

    private startDrag(x: number, y: number) {
        if (this.config.disabled) return;

        this.startX = x;
        this.startY = y;
        this.isDragging = true;

        // Apply global cursor and user-select styles
        document.body.style.userSelect = "none";
        document.body.style.webkitUserSelect = "none";
        document.body.style.cursor = this.config.direction === "vertical" ? "ns-resize" : "ew-resize";

        // Attach global listeners
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
        e.preventDefault(); // Prevent scrolling
        const touch = e.touches[0];
        this.processDrag(touch.clientX, touch.clientY);
    }

    private processDrag(x: number, y: number) {
        let delta = 0;
        if (this.config.direction === "vertical") {
            // Up is negative Y, but usually means positive value
            // So we invert Y delta: (StartY - CurrentY)
            delta = this.startY - y;
        } else {
            // Right is positive X
            delta = x - this.startX;
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

        // Cleanup styles
        document.body.style.userSelect = "";
        document.body.style.webkitUserSelect = "";
        document.body.style.cursor = "";

        // Remove global listeners
        window.removeEventListener("mousemove", this.handleGlobalMouseMove);
        window.removeEventListener("mouseup", this.handleGlobalMouseUp);
        window.removeEventListener("touchmove", this.handleGlobalTouchMove);
        window.removeEventListener("touchend", this.handleGlobalMouseUp);
    }

    // --- Wheel Handling ---

    public handleWheel = (e: WheelEvent | any) => {
        if (this.config.disabled) return;
        if (this.config.interactionMode !== "wheel" && this.config.interactionMode !== "both") return;

        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();

        const delta = e.deltaY;
        const effectiveSensitivity = this.config.wheelSensitivity ?? this.config.sensitivity / 4;

        this.config.adjustValue(delta, effectiveSensitivity);
    };

    // --- Keyboard Handling ---

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
                delta = -1 / this.config.sensitivity; // Large negative to reach min
                break;
            case "End":
                delta = 1 / this.config.sensitivity; // Large positive to reach max
                break;
            default:
                return;
        }

        e.preventDefault();

        // Passed delta logic:
        // adjustValue(d, s) -> d * s. We want `keyboardStep`.
        // So passed_delta = keyboardStep / sensitivity * direction
        const effectiveDelta = delta * (this.config.keyboardStep / this.config.sensitivity);
        this.config.adjustValue(effectiveDelta, this.config.sensitivity);
    };

    public dispose() {
        this.handleGlobalMouseUp();
    }
}
