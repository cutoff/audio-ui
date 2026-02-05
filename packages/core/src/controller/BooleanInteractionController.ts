/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
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
 * - Global pointer tracking (works even when press starts outside button)
 * - Mouse enter/leave events for drag-in/drag-out behavior
 * - Keyboard events (Enter/Space) for activation and release
 * - Press state tracking for momentary mode
 *
 * **Drag-In/Drag-Out Behavior:**
 * The controller tracks global pointer state to enable hardware-like button interactions:
 * - **Momentary Mode**: Press inside → turns on; drag out while pressed → turns off; drag back in while pressed → turns on again. Works even when press starts outside the button.
 * - **Toggle Mode**: Press inside → toggles state; drag out while pressed → no change; drag back in while pressed → toggles again. Works even when press starts outside the button.
 *
 * This enables step sequencer-like interactions where multiple buttons can be activated with a single drag gesture.
 *
 * This controller is designed to be framework-agnostic and can be used with any UI framework
 * by wrapping it in framework-specific hooks (e.g., `useBooleanInteraction` for React).
 */
export class BooleanInteractionController {
    private isPressed: boolean = false;
    private isGlobalPointerDown: boolean = false;

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
     * Handles global pointer down events (mouse or touch).
     *
     * This tracks when a pointer is pressed anywhere on the page, not just on this button.
     * This allows the button to respond to drag-in behavior even when the press starts outside.
     *
     * @param {boolean} defaultPrevented - Whether the event's default action has been prevented. If true, the handler does nothing.
     */
    public handleGlobalPointerDown = (defaultPrevented: boolean) => {
        if (this.config.disabled) return;
        if (defaultPrevented) return;
        this.isGlobalPointerDown = true;
    };

    /**
     * Handles mouse down events on the button element.
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

        this.isGlobalPointerDown = true;

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
     * Handles mouse up events on the button element.
     *
     * For momentary mode: Sets value to false if the button is currently pressed.
     * This prevents false releases if the button wasn't actually pressed.
     * Toggle mode: No action (toggle happens on mousedown only).
     *
     * Note: This is called when mouse is released on the button. The global pointer up
     * handler will also be called to reset global state.
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
        // Note: Global pointer state is reset by handleGlobalPointerUp
    };

    /**
     * Handles global pointer up events (mouse or touch).
     *
     * This method is called when a pointer up event occurs anywhere on the page.
     * It resets the global pointer state and handles release for momentary buttons.
     *
     * Only affects momentary mode buttons that are currently pressed.
     */
    public handleGlobalPointerUp = () => {
        if (this.config.disabled) return;

        this.isGlobalPointerDown = false;

        if (this.config.mode === "momentary" && this.isPressed) {
            this.isPressed = false;
            this.config.onValueChange(false);
        }
    };

    /**
     * Handles mouse enter events (pointer enters the button element).
     *
     * When a pointer enters the button while globally pressed:
     * - **Momentary mode**: Sets value to true
     * - **Toggle mode**: Toggles the value
     *
     * This enables drag-in behavior: pressing outside and dragging into the button activates it.
     */
    public handleMouseEnter = () => {
        if (this.config.disabled) return;

        // Only react if pointer is globally pressed (drag-in scenario)
        if (this.isGlobalPointerDown) {
            if (this.config.mode === "toggle") {
                // Toggle mode: flip the value when entering while pressed
                this.config.onValueChange(!this.config.value);
            } else {
                // Momentary mode: set to true when entering while pressed
                this.isPressed = true;
                this.config.onValueChange(true);
            }
        }
    };

    /**
     * Handles mouse leave events (pointer leaves the button element).
     *
     * When a pointer leaves the button while globally pressed:
     * - **Momentary mode**: Sets value to false
     * - **Toggle mode**: No action (state remains as-is)
     *
     * This enables drag-out behavior: pressing inside and dragging out deactivates momentary buttons.
     */
    public handleMouseLeave = () => {
        if (this.config.disabled) return;

        // Only react if pointer is globally pressed (drag-out scenario)
        if (this.isGlobalPointerDown) {
            if (this.config.mode === "momentary" && this.isPressed) {
                // Momentary mode: set to false when leaving while pressed
                this.isPressed = false;
                this.config.onValueChange(false);
            }
            // Toggle mode: no action when leaving (state remains as-is)
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
