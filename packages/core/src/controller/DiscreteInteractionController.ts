/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

export interface DiscreteInteractionConfig {
    /** Current value of the control */
    value: string | number;
    /** List of available options */
    options: Array<{ value: string | number }>;
    /** Callback to update the value */
    onValueChange: (value: string | number) => void;
    /** Whether the control is disabled */
    disabled?: boolean;
}

/**
 * Framework-agnostic controller for discrete interaction logic.
 * Handles the logic for cycling and stepping through discrete options.
 */
export class DiscreteInteractionController {
    constructor(private config: DiscreteInteractionConfig) {}

    /**
     * Updates the configuration.
     * @param config New configuration object.
     */
    public updateConfig(config: DiscreteInteractionConfig) {
        this.config = config;
    }

    private getCurrentIndex(): number {
        const idx = this.config.options.findIndex((opt) => opt.value === this.config.value);
        return idx === -1 ? 0 : idx;
    }

    private setValueAtIndex(index: number) {
        if (this.config.disabled) return;
        const opt = this.config.options[index];
        if (opt) {
            this.config.onValueChange(opt.value);
        }
    }

    /**
     * Cycles to the next value, wrapping around to the start if needed.
     */
    public cycleNext() {
        if (this.config.options.length <= 1) return;
        const currentIdx = this.getCurrentIndex();
        const nextIdx = (currentIdx + 1) % this.config.options.length;
        this.setValueAtIndex(nextIdx);
    }

    /**
     * Steps to the next value, clamping at the end.
     */
    public stepNext() {
        if (this.config.options.length <= 1) return;
        const currentIdx = this.getCurrentIndex();
        if (currentIdx < this.config.options.length - 1) {
            this.setValueAtIndex(currentIdx + 1);
        }
    }

    /**
     * Steps to the previous value, clamping at the start.
     */
    public stepPrev() {
        if (this.config.options.length <= 1) return;
        const currentIdx = this.getCurrentIndex();
        if (currentIdx > 0) {
            this.setValueAtIndex(currentIdx - 1);
        }
    }

    /**
     * Handles click events.
     * Cycles to the next value if the event was not already prevented (e.g. by a drag).
     * @param defaultPrevented Whether the event's default action has been prevented.
     */
    public handleClick = (defaultPrevented: boolean) => {
        if (this.config.disabled) return;
        if (!defaultPrevented) {
            this.cycleNext();
        }
    };

    /**
     * Handles keyboard events for discrete controls.
     * Returns true if the event was handled (and thus should be prevented), false otherwise.
     */
    public handleKeyDown = (key: string): boolean => {
        if (this.config.disabled) return false;

        switch (key) {
            case " ":
            case "Enter":
                this.cycleNext();
                return true;
            case "ArrowUp":
            case "ArrowRight":
                this.stepNext();
                return true;
            case "ArrowDown":
            case "ArrowLeft":
                this.stepPrev();
                return true;
        }
        return false;
    };
}
