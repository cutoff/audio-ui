/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

/**
 * Configuration for the NoteInteractionController.
 */
export interface NoteInteractionConfig {
    /** Callback triggered when a note is pressed (on) */
    onNoteOn: (note: number, pointerId: number | string) => void;
    /** Callback triggered when a note is released (off) */
    onNoteOff: (note: number, pointerId: number | string) => void;
    /** Whether the interaction is disabled */
    disabled?: boolean;
}

/**
 * Framework-agnostic controller for keyboard/note interaction logic.
 *
 * Handles polyphonic glissando-style interactions:
 * - Tracks multiple concurrent pointers (mouse, multi-touch)
 * - Detects note changes when sliding across keys
 * - Triggers onNoteOn/onNoteOff events
 *
 * This controller is designed to be used by any UI framework by providing
 * coordinates-to-note mapping and pointer events.
 *
 * @example
 * ```ts
 * const controller = new NoteInteractionController({
 *   onNoteOn: (note) => console.log('Note On:', note),
 *   onNoteOff: (note) => console.log('Note Off:', note)
 * });
 *
 * // On mouse/touch down
 * controller.handlePointerDown(1, 60); // C4
 *
 * // On movement
 * controller.handlePointerMove(1, 62); // D4 (triggers Note Off 60, Note On 62)
 *
 * // On mouse/touch up
 * controller.handlePointerUp(1); // triggers Note Off 62
 * ```
 */
export class NoteInteractionController {
    private pointerNotes: Map<number | string, number | null> = new Map();

    /**
     * Creates a new NoteInteractionController.
     * @param config Initial configuration
     */
    constructor(private config: NoteInteractionConfig) {}

    /**
     * Updates the controller configuration.
     * @param config New configuration object
     */
    public updateConfig(config: NoteInteractionConfig) {
        this.config = config;
    }

    /**
     * Handles the start of a pointer interaction (down).
     *
     * Tracks the pointer state globally and triggers onNoteOn if the pointer
     * is over a specific note.
     *
     * @param pointerId Unique identifier for the pointer
     * @param note The MIDI note number at the pointer location, or null if none
     */
    public handlePointerDown(pointerId: number | string, note: number | null) {
        if (this.config.disabled) return;

        // If this pointer was already active, release it first (safety)
        this.handlePointerUp(pointerId);

        // Always track that the pointer is down, even if not over a specific note
        this.pointerNotes.set(pointerId, note);

        if (note !== null) {
            this.config.onNoteOn(note, pointerId);
        }
    }

    /**
     * Handles pointer movement (move).
     *
     * Enables glissando behavior by detecting when a tracked pointer moves
     * from one note to another.
     *
     * @param pointerId Unique identifier for the pointer
     * @param note The MIDI note number at the current pointer location, or null if none
     */
    public handlePointerMove(pointerId: number | string, note: number | null) {
        if (this.config.disabled) return;

        // If pointer is not tracked as "down", ignore movement (prevents glissando when mouse is up)
        if (!this.pointerNotes.has(pointerId)) return;

        const currentNote = this.pointerNotes.get(pointerId);

        // If note changed (glissando)
        if (note !== currentNote) {
            // Note off previous
            if (currentNote !== null && currentNote !== undefined) {
                this.config.onNoteOff(currentNote, pointerId);
            }

            // Update tracked note (can be null if moved to non-key area while down)
            this.pointerNotes.set(pointerId, note);

            // Note on new
            if (note !== null) {
                this.config.onNoteOn(note, pointerId);
            }
        }
    }

    /**
     * Handles the end of a pointer interaction (up).
     *
     * Releases any active note associated with the pointer and removes it
     * from the tracking map.
     *
     * @param pointerId Unique identifier for the pointer
     */
    public handlePointerUp(pointerId: number | string) {
        const currentNote = this.pointerNotes.get(pointerId);
        if (currentNote !== undefined) {
            if (currentNote !== null) {
                this.config.onNoteOff(currentNote, pointerId);
            }
            this.pointerNotes.delete(pointerId);
        }
    }

    /**
     * Cancels all active pointer interactions.
     * Useful when the component is unmounted or focus is lost.
     */
    public cancelAll() {
        this.pointerNotes.forEach((note, pointerId) => {
            if (note !== null) {
                this.config.onNoteOff(note, pointerId);
            }
        });
        this.pointerNotes.clear();
    }
}
