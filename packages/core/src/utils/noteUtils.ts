/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

/**
 * Utility functions for working with musical notes and MIDI note numbers
 *
 * Terminology:
 * - Note: A pitch with octave (e.g., "C4", "F#5")
 * - NoteName: The actual note without octave (e.g., "C", "F#")
 * - NoteNum: The MIDI note number (e.g., 60 for C4)
 */

/**
 * Array of note names in chromatic order (C to B with sharps)
 */
export const CHROMATIC_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

/**
 * Array of white key note names in order (C to B)
 */
export const WHITE_KEY_NAMES = ["C", "D", "E", "F", "G", "A", "B"] as const;

/**
 * Mapping from white key index to chromatic offset
 * This represents the semitone positions of white keys in a standard piano layout
 * C=0, D=2, E=4, F=5, G=7, A=9, B=11
 */
export const WHITE_KEY_TO_CHROMATIC = [0, 2, 4, 5, 7, 9, 11] as const;

/**
 * Mapping from diatonic note names to chromatic indices
 */
export const DIATONIC_TO_CHROMATIC: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
};

/**
 * Set of chromatic positions that correspond to white keys (C, D, E, F, G, A, B)
 * Used to determine if a note is a white key or black key
 */
export const WHITE_KEY_POSITIONS = new Set([0, 2, 4, 5, 7, 9, 11]);

/**
 * Lookup maps for fast note conversion
 * NUM_TO_NOTE_MAP: Maps MIDI note numbers to note strings
 * NOTE_TO_NUM_MAP: Maps note strings to MIDI note numbers
 */
const NUM_TO_NOTE_MAP: string[] = [];
const NOTE_TO_NUM_MAP = new Map<string, number>();

// Pre-populate lookup tables for all 128 MIDI notes (0-127)
for (let noteNum = 0; noteNum < 128; noteNum++) {
    const octave = Math.floor(noteNum / 12) - 1; // MIDI note 60 is C4
    const noteIndex = noteNum % 12;
    const noteName = CHROMATIC_NOTES[noteIndex];
    const note = `${noteName}${octave}`;

    // Store in lookup tables
    NUM_TO_NOTE_MAP[noteNum] = note;
    NOTE_TO_NUM_MAP.set(note, noteNum);
}

/**
 * Converts a MIDI note number to a note string using a pre-computed lookup table
 * MIDI note 60 is middle C (C4)
 *
 * @param noteNum - The MIDI note number to convert
 * @returns The corresponding note (e.g., "C4", "F#5")
 */
export const noteNumToNote = (noteNum: number): string => {
    // Check if the note number is within valid MIDI range (0-127)
    if (noteNum >= 0 && noteNum < 128) {
        return NUM_TO_NOTE_MAP[noteNum];
    }

    // Fallback to calculation for out-of-range values
    const octave = Math.floor(noteNum / 12) - 1;
    const noteIndex = noteNum % 12;
    const noteName = CHROMATIC_NOTES[noteIndex];
    return `${noteName}${octave}`;
};

/**
 * Converts a note string to a MIDI note number using a pre-computed lookup table
 *
 * @param note - The note to convert (e.g., "C4", "F#5")
 * @returns The corresponding MIDI note number, or -1 if the note is invalid
 */
export const noteToNoteNum = (note: string): number => {
    // Check if the note is in the lookup table
    const noteNum = NOTE_TO_NUM_MAP.get(note);
    if (noteNum !== undefined) {
        return noteNum;
    }

    // Fallback to calculation for notes not in the lookup table
    const match = note.match(/^([A-G](#)?)(-?\d+)$/);
    if (!match) return -1;

    const [, noteName, , octave] = match;

    // Find the index of the noteName in the chromatic scale
    const noteIndex = CHROMATIC_NOTES.findIndex((n) => n === noteName);
    if (noteIndex === -1) return -1;

    // Calculate MIDI note number: (octave + 1) * 12 + noteIndex
    // MIDI note 60 is C4, so C4 = (4 + 1) * 12 + 0 = 60
    return (parseInt(octave) + 1) * 12 + noteIndex;
};

/**
 * Creates a Set of MIDI note numbers from an array of notes (strings and/or numbers)
 * This can be used for efficient note lookups, especially when memoized in components
 *
 * @param notesOn - Array of notes that are on (can contain string notes and/or MIDI note numbers)
 * @returns A Set of MIDI note numbers
 */
export const createNoteNumSet = (notesOn: (string | number)[]): Set<number> => {
    const noteNumSet = new Set<number>();

    for (const note of notesOn) {
        if (typeof note === "number") {
            // If the note is already a number, add it directly
            noteNumSet.add(note);
        } else {
            // If the note is a string, convert it to a number and add it
            const noteNum = noteToNoteNum(note);
            if (noteNum !== -1) {
                noteNumSet.add(noteNum);
            }
        }
    }

    return noteNumSet;
};

/**
 * Checks if a note is in the notesOn array, handling both string notes and MIDI note numbers
 * Uses a Set for O(1) lookups instead of array includes
 *
 * @param noteInput - The note to check (either a string note like "C4" or a MIDI note number)
 * @param notesOn - Array of notes that are on (can contain string notes and/or MIDI note numbers)
 * @returns True if the note is in the notesOn array, false otherwise
 */
export const isNoteOn = (noteInput: string | number, notesOn: (string | number)[]): boolean => {
    if (notesOn.length === 0) return false;

    // Convert all notes to a Set of MIDI note numbers for O(1) lookups
    const noteNumSet = createNoteNumSet(notesOn);

    // If noteInput is a string (note), convert it to a MIDI note number
    if (typeof noteInput === "string") {
        const noteNum = noteToNoteNum(noteInput);
        return noteNum !== -1 && noteNumSet.has(noteNum);
    }

    // If noteInput is a number (MIDI note number), check if it's in the Set
    return noteNumSet.has(noteInput);
};

/**
 * Checks if a given MIDI note number corresponds to a black key
 *
 * @param noteNum - The MIDI note number
 * @returns true if black key, false if white key
 */
export const isBlackKey = (noteNum: number): boolean => {
    // 0=C (white), 1=C# (black), 2=D (white), 3=D# (black), 4=E (white)
    // 5=F (white), 6=F# (black), 7=G (white), 8=G# (black), 9=A (white)
    // 10=A# (black), 11=B (white)
    const chromaticIndex = noteNum % 12;
    return !WHITE_KEY_POSITIONS.has(chromaticIndex);
};
