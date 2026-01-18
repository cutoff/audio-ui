/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import React, { useCallback, useRef, useEffect } from "react";
import { NoteInteractionController } from "@cutoff/audio-ui-core";

/**
 * Props for the useNoteInteraction hook.
 */
export interface UseNoteInteractionProps {
    /** Callback triggered when a note is pressed */
    onNoteOn: (note: number) => void;
    /** Callback triggered when a note is released */
    onNoteOff: (note: number) => void;
    /** Whether the interaction is disabled */
    disabled?: boolean;
    /** Optional user-provided pointer down handler */
    onPointerDown?: React.PointerEventHandler;
    /** Optional user-provided pointer move handler */
    onPointerMove?: React.PointerEventHandler;
    /** Optional user-provided pointer up handler */
    onPointerUp?: React.PointerEventHandler;
    /** Optional user-provided pointer cancel handler */
    onPointerCancel?: React.PointerEventHandler;
}

/**
 * Result object for the useNoteInteraction hook.
 */
export interface UseNoteInteractionResult {
    /** Pointer down handler to be attached to the target element */
    onPointerDown: React.PointerEventHandler;
    /** Pointer move handler to be attached to the target element */
    onPointerMove: React.PointerEventHandler;
    /** Pointer up handler to be attached to the target element */
    onPointerUp: React.PointerEventHandler;
    /** Pointer cancel handler to be attached to the target element */
    onPointerCancel: React.PointerEventHandler;
    /** Standardized styles for the interactive element (e.g., touchAction: "none") */
    style: React.CSSProperties;
}

/**
 * Hook to manage note interactions for keyboard-like components.
 *
 * Provides standardized logic for:
 * - Multi-touch support via PointerEvents
 * - Glissando (sliding across keys) detection
 * - Standardized note on/off event triggering
 *
 * It uses the framework-agnostic `NoteInteractionController` to handle the
 * core interaction logic and manages pointer capture for reliable glissando.
 *
 * The hook returns pointer event handlers and a style object containing
 * `touchAction: "none"` to prevent default touch behaviors. Cursor styling
 * is handled by the consuming component based on its interactivity state.
 *
 * @param {UseNoteInteractionProps} props - Configuration for the note interaction hook
 * @param {(note: number) => void} props.onNoteOn - Callback triggered when a note is pressed
 * @param {(note: number) => void} props.onNoteOff - Callback triggered when a note is released
 * @param {boolean} [props.disabled=false] - Whether the interaction is disabled
 * @param {React.PointerEventHandler} [props.onPointerDown] - Optional user-provided pointer down handler
 * @param {React.PointerEventHandler} [props.onPointerMove] - Optional user-provided pointer move handler
 * @param {React.PointerEventHandler} [props.onPointerUp] - Optional user-provided pointer up handler
 * @param {React.PointerEventHandler} [props.onPointerCancel] - Optional user-provided pointer cancel handler
 * @returns {UseNoteInteractionResult} Object containing pointer event handlers and styles
 *
 * @example
 * ```tsx
 * const { onPointerDown, onPointerMove, onPointerUp, style } = useNoteInteraction({
 *   onNoteOn: (note) => synth.noteOn(note),
 *   onNoteOff: (note) => synth.noteOff(note)
 * });
 *
 * return (
 *   <svg
 *     onPointerDown={onPointerDown}
 *     onPointerMove={onPointerMove}
 *     onPointerUp={onPointerUp}
 *     style={style}
 *   >
 *     {keys.map(key => (
 *       <rect key={key.note} data-note={key.note} {...key.rectProps} />
 *     ))}
 *   </svg>
 * );
 * ```
 */
export function useNoteInteraction({
    onNoteOn,
    onNoteOff,
    disabled = false,
    onPointerDown: userOnPointerDown,
    onPointerMove: userOnPointerMove,
    onPointerUp: userOnPointerUp,
    onPointerCancel: userOnPointerCancel,
}: UseNoteInteractionProps): UseNoteInteractionResult {
    const controllerRef = useRef<NoteInteractionController | null>(null);

    if (!controllerRef.current) {
        controllerRef.current = new NoteInteractionController({
            onNoteOn: (note) => onNoteOn(note),
            onNoteOff: (note) => onNoteOff(note),
            disabled,
        });
    }

    useEffect(() => {
        controllerRef.current?.updateConfig({
            onNoteOn: (note) => onNoteOn(note),
            onNoteOff: (note) => onNoteOff(note),
            disabled,
        });
    }, [onNoteOn, onNoteOff, disabled]);

    useEffect(() => {
        return () => {
            controllerRef.current?.cancelAll();
        };
    }, []);

    const getNoteFromEvent = useCallback((e: React.PointerEvent) => {
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (!element) return null;

        const noteAttr = element.getAttribute("data-note");
        if (noteAttr) {
            return parseInt(noteAttr, 10);
        }
        return null;
    }, []);

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            userOnPointerDown?.(e);
            if (e.defaultPrevented || disabled) return;

            // Capture the pointer to continue receiving events even if it leaves the element
            (e.currentTarget as Element).setPointerCapture(e.pointerId);

            const note = getNoteFromEvent(e);
            controllerRef.current?.handlePointerDown(e.pointerId, note);
        },
        [userOnPointerDown, disabled, getNoteFromEvent]
    );

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            userOnPointerMove?.(e);
            if (e.defaultPrevented || disabled) return;

            const note = getNoteFromEvent(e);
            controllerRef.current?.handlePointerMove(e.pointerId, note);
        },
        [userOnPointerMove, disabled, getNoteFromEvent]
    );

    const handlePointerUp = useCallback(
        (e: React.PointerEvent) => {
            userOnPointerUp?.(e);
            if (e.defaultPrevented || disabled) return;

            controllerRef.current?.handlePointerUp(e.pointerId);
        },
        [userOnPointerUp, disabled]
    );

    const handlePointerCancel = useCallback(
        (e: React.PointerEvent) => {
            userOnPointerCancel?.(e);
            if (e.defaultPrevented || disabled) return;

            controllerRef.current?.handlePointerUp(e.pointerId);
        },
        [userOnPointerCancel, disabled]
    );

    return {
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerCancel,
        style: {
            touchAction: "none",
        },
    };
}
