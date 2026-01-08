/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

export type BooleanInteractionMode = "toggle" | "momentary";

export interface BooleanInteractionConfig {
    /** Current value of the control */
    value: boolean;
    /** Interaction mode: toggle (latch) or momentary */
    mode: BooleanInteractionMode;
    /** Callback to update the value */
    onValueChange: (value: boolean) => void;
    /** Whether the control is disabled */
    disabled?: boolean;
}

/**
 * Framework-agnostic controller for boolean interaction logic.
 *
 * Handles the logic for toggle and momentary button interactions, including:
 * - Mouse down/up events for activation and release
 * - Global mouse up handling for momentary buttons (when mouse leaves button before release)
 * - Keyboard events (Enter/Space) for activation and release
 * - Press state tracking for momentary mode
 *
 * This controller is designed to be framework-agnostic and can be used with any UI framework
 * by wrapping it in framework-specific hooks (e.g., `useBooleanInteraction` for React).
 */
export class BooleanInteractionController {
    private isPressed: boolean = false;

    constructor(private config: BooleanInteractionConfig) {}

    /**
     * Updates the controller configuration.
     *
     * This method should be called whenever the configuration changes (e.g., value, mode, disabled state).
     * The controller will use the new configuration for all subsequent interactions.
     *
     * @param {BooleanInteractionConfig} config - New configuration object
     */
    public updateConfig(config: BooleanInteractionConfig) {
        this.config = config;
    }

    /**
     * Handles mouse down events.
     *
     * Behavior depends on interaction mode:
     * - **Toggle mode**: Flips the current value (true ↔ false)
     * - **Momentary mode**: Sets value to true and tracks press state for later release
     *
     * @param {boolean} defaultPrevented - Whether the event's default action has been prevented. If true, the handler does nothing.
     */
    public handleMouseDown = (defaultPrevented: boolean) => {
        if (this.config.disabled) return;
        if (defaultPrevented) return;

        if (this.config.mode === "toggle") {
            // Toggle mode: flip the value on each press
            this.config.onValueChange(!this.config.value);
        } else {
            // Momentary mode: set to true on press, will be set to false on release
            this.isPressed = true;
            this.config.onValueChange(true);
        }
    };

    /**
     * Handles mouse up events.
     *
     * For momentary mode: Sets value to false if the button is currently pressed.
     * This prevents false releases if the button wasn't actually pressed.
     * Toggle mode: No action (toggle happens on mousedown only).
     *
     * @param {boolean} defaultPrevented - Whether the event's default action has been prevented. If true, the handler does nothing.
     */
    public handleMouseUp = (defaultPrevented: boolean) => {
        if (this.config.disabled) return;
        if (defaultPrevented) return;

        // Only handle release for momentary buttons that are currently pressed
        // This prevents false releases if the button wasn't actually pressed
        if (this.config.mode === "momentary" && this.isPressed) {
            this.isPressed = false;
            this.config.onValueChange(false);
        }
    };

    /**
     * Handles global mouse up events (for momentary buttons).
     *
     * This method is called when a mouseup event occurs outside the button element.
     * It ensures momentary buttons release properly even if the user drags the mouse
     * outside the button before releasing (common in audio applications).
     *
     * Only affects momentary mode buttons that are currently pressed.
     */
    public handleGlobalMouseUp = () => {
        if (this.config.disabled) return;
        if (this.config.mode === "momentary" && this.isPressed) {
            this.isPressed = false;
            this.config.onValueChange(false);
        }
    };

    /**
     * Handles keyboard key down events.
     *
     * Supported keys:
     * - `Enter` or `Space`: Activates the button
     *   - Toggle mode: Flips the value
     *   - Momentary mode: Sets value to true
     *
     * @param {string} key - The keyboard key that was pressed
     * @returns {boolean} `true` if the event was handled (and should be prevented), `false` otherwise
     */
    public handleKeyDown = (key: string): boolean => {
        if (this.config.disabled) return false;

        if (key === "Enter" || key === " ") {
            if (this.config.mode === "toggle") {
                // Toggle mode: flip the value
                this.config.onValueChange(!this.config.value);
            } else {
                // Momentary mode: set to true
                this.config.onValueChange(true);
            }
            return true;
        }
        return false;
    };

    /**
     * Handles keyboard key up events.
     *
     * Supported keys (momentary mode only):
     * - `Enter` or `Space`: Releases the button (sets value to false)
     *
     * Toggle mode: No action (toggle happens on keydown only).
     *
     * @param {string} key - The keyboard key that was released
     * @returns {boolean} `true` if the event was handled (and should be prevented), `false` otherwise
     */
    public handleKeyUp = (key: string): boolean => {
        if (this.config.disabled) return false;

        if (this.config.mode === "momentary" && (key === "Enter" || key === " ")) {
            this.config.onValueChange(false);
            return true;
        }
        return false;
    };

    /**
     * Gets the current press state (for momentary buttons).
     *
     * This is primarily used for internal state tracking. External code typically
     * doesn't need to check this, as the value reflects the button state.
     *
     * @returns {boolean} `true` if the button is currently pressed, `false` otherwise
     */
    public getIsPressed(): boolean {
        return this.isPressed;
    }
}
