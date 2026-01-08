/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import React, { useCallback, useRef, useEffect } from "react";
import { DiscreteInteractionController } from "@cutoff/audio-ui-core";

export interface UseDiscreteInteractionProps {
    /** Current value of the control */
    value: string | number;
    /** List of available options */
    options: Array<{ value: string | number }>;
    /** Callback to update the value */
    onValueChange: (value: string | number) => void;
    /** Whether the control is disabled */
    disabled?: boolean;
}

export interface UseDiscreteInteractionResult {
    /** Handler for click events (cycles through options) */
    handleClick: (e: React.MouseEvent) => void;
    /** Handler for keyboard events (Arrows to step, Space/Enter to cycle) */
    handleKeyDown: (e: React.KeyboardEvent) => void;
    /** Manually cycle to the next value (wrapping around) */
    cycleNext: () => void;
    /** Manually step to the next value (clamped) */
    stepNext: () => void;
    /** Manually step to the previous value (clamped) */
    stepPrev: () => void;
}

/**
 * Hook to manage interactions for discrete controls (switches, toggles, selectors).
 *
 * Provides standardized logic for:
 * - Cycling through options (wrapping) via Click or Space/Enter
 * - Stepping through options (clamped) via Arrow keys
 * - Finding the nearest valid option index when value doesn't match
 *
 * The hook wraps the framework-agnostic `DiscreteInteractionController` and provides React
 * event handlers that can be attached directly to DOM elements. It maintains stable callback
 * references across renders using `useCallback` and updates the controller configuration via
 * `useEffect` when props change.
 *
 * @param {UseDiscreteInteractionProps} props - Configuration for the discrete interaction hook
 * @param {string | number} props.value - Current value of the control
 * @param {Array<{ value: string | number }>} props.options - List of available options
 * @param {(value: string | number) => void} props.onValueChange - Callback to update the value
 * @param {boolean} [props.disabled=false] - Whether the control is disabled
 * @returns {UseDiscreteInteractionResult} Object containing event handlers and manual control methods
 *
 * @example
 * ```tsx
 * const { handleClick, handleKeyDown } = useDiscreteInteraction({
 *   value,
 *   options,
 *   onValueChange: (val) => setNormalizedValue(converter.normalize(val))
 * });
 *
 * <div onClick={handleClick} onKeyDown={handleKeyDown} />
 * ```
 */
export function useDiscreteInteraction({
    value,
    options,
    onValueChange,
    disabled = false,
}: UseDiscreteInteractionProps): UseDiscreteInteractionResult {
    const controllerRef = useRef<DiscreteInteractionController | null>(null);

    if (!controllerRef.current) {
        controllerRef.current = new DiscreteInteractionController({
            value,
            options,
            onValueChange,
            disabled,
        });
    }

    useEffect(() => {
        controllerRef.current?.updateConfig({
            value,
            options,
            onValueChange,
            disabled,
        });
    }, [value, options, onValueChange, disabled]);

    const cycleNext = useCallback(() => controllerRef.current?.cycleNext(), []);
    const stepNext = useCallback(() => controllerRef.current?.stepNext(), []);
    const stepPrev = useCallback(() => controllerRef.current?.stepPrev(), []);

    const handleClick = useCallback((e: React.MouseEvent) => {
        controllerRef.current?.handleClick(e.defaultPrevented);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const handled = controllerRef.current?.handleKeyDown(e.key);
        if (handled) {
            e.preventDefault();
        }
    }, []);

    return {
        handleClick,
        handleKeyDown,
        cycleNext,
        stepNext,
        stepPrev,
    };
}
