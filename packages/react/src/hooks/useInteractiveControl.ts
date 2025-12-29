import React, { useEffect, useMemo, useRef } from "react";
import { InteractionController, InteractionConfig } from "@cutoff/audio-ui-core";

export type UseInteractiveControlProps = Omit<InteractionConfig, "adjustValue"> & {
    adjustValue: (delta: number, sensitivity?: number) => void;
    editable?: boolean;
};

export interface InteractiveControlHandlers {
    onMouseDown: React.MouseEventHandler;
    onTouchStart: React.TouchEventHandler;
    onWheel: React.WheelEventHandler;
    onKeyDown: React.KeyboardEventHandler;
    tabIndex: number;
    role: string;
    "aria-disabled"?: boolean;
    style?: React.CSSProperties;
}

/**
 * Hook to standardize user interaction for continuous controls (Knob, Slider).
 * Handles Drag (Mouse/Touch), Wheel, and Keyboard interactions.
 */
export function useInteractiveControl({
    adjustValue,
    keyboardStep = 0.05,
    interactionMode = "both",
    direction = "vertical",
    sensitivity = 0.005,
    wheelSensitivity,
    disabled = false,
    editable = true,
}: UseInteractiveControlProps): InteractiveControlHandlers {
    // Store controller in ref to persist across renders
    const controllerRef = useRef<InteractionController | null>(null);

    // Initialize controller lazily
    if (!controllerRef.current) {
        controllerRef.current = new InteractionController({
            adjustValue,
            keyboardStep,
            interactionMode,
            direction,
            sensitivity,
            wheelSensitivity,
            disabled,
        });
    }

    // Sync config on every render
    useEffect(() => {
        controllerRef.current?.updateConfig({
            adjustValue,
            keyboardStep,
            interactionMode,
            direction,
            sensitivity,
            wheelSensitivity,
            disabled,
        });
    }, [adjustValue, keyboardStep, interactionMode, direction, sensitivity, wheelSensitivity, disabled]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            controllerRef.current?.dispose();
        };
    }, []);

    // Handlers
    const handlers = useMemo(() => {
        const ctrl = controllerRef.current!;

        return {
            onMouseDown: (e: React.MouseEvent) => ctrl.handleMouseDown(e.clientX, e.clientY, e.currentTarget),
            onTouchStart: (e: React.TouchEvent) => {
                const touch = e.touches[0];
                ctrl.handleTouchStart(touch.clientX, touch.clientY, e.currentTarget);
            },
            onWheel: (e: React.WheelEvent) => ctrl.handleWheel(e as unknown as WheelEvent),
            onKeyDown: (e: React.KeyboardEvent) => ctrl.handleKeyDown(e as unknown as KeyboardEvent),
        };
    }, []);

    const cursor = disabled
        ? "not-allowed"
        : !editable
          ? "default"
          : interactionMode === "wheel"
            ? "ns-resize"
            : direction === "horizontal"
              ? "ew-resize"
              : direction === "vertical"
                ? "ns-resize"
                : "pointer"; // circular or default

    return {
        ...handlers,
        tabIndex: disabled ? -1 : 0,
        role: "slider",
        "aria-disabled": disabled,
        style: {
            cursor,
            touchAction: "none",
        },
    };
}
