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
const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

/**
 * Converts a MIDI note number to a note string
 * MIDI note 60 is middle C (C4)
 * 
 * @param noteNum - The MIDI note number to convert
 * @returns The corresponding note (e.g., "C4", "F#5")
 */
export const noteNumToNote = (noteNum: number): string => {
  const octave = Math.floor(noteNum / 12) - 1; // MIDI note 60 is C4
  const noteIndex = noteNum % 12;
  const noteName = CHROMATIC_NOTES[noteIndex];
  return `${noteName}${octave}`;
};

/**
 * Converts a note string to a MIDI note number
 * 
 * @param note - The note to convert (e.g., "C4", "F#5")
 * @returns The corresponding MIDI note number, or -1 if the note is invalid
 */
export const noteToNoteNum = (note: string): number => {
  // Match note pattern: noteName (with optional #) followed by octave
  const match = note.match(/^([A-G](#)?)(-?\d+)$/);
  if (!match) return -1;
  
  const [, noteName, , octave] = match;
  
  // Find the index of the noteName in the chromatic scale
  const noteIndex = CHROMATIC_NOTES.findIndex(n => n === noteName);
  if (noteIndex === -1) return -1;
  
  // Calculate MIDI note number: (octave + 1) * 12 + noteIndex
  // MIDI note 60 is C4, so C4 = (4 + 1) * 12 + 0 = 60
  return (parseInt(octave) + 1) * 12 + noteIndex;
};

/**
 * Checks if a note is in the notesOn array, handling both string notes and MIDI note numbers
 * 
 * @param noteInput - The note to check (either a string note like "C4" or a MIDI note number)
 * @param notesOn - Array of notes that are on (can contain string notes and/or MIDI note numbers)
 * @returns True if the note is in the notesOn array, false otherwise
 */
export const isNoteOn = (noteInput: string | number, notesOn: (string | number)[]): boolean => {
  if (notesOn.length === 0) return false;
  
  // If noteInput is a string (note)
  if (typeof noteInput === 'string') {
    // Check if the note is directly in the array
    if (notesOn.includes(noteInput)) return true;
    
    // Convert note to MIDI note number and check if that's in the array
    const noteNum = noteToNoteNum(noteInput);
    return noteNum !== -1 && notesOn.includes(noteNum);
  }
  
  // If noteInput is a number (MIDI note number)
  if (typeof noteInput === 'number') {
    // Check if the MIDI note number is directly in the array
    if (notesOn.includes(noteInput)) return true;

    // Convert MIDI note number to note and check if that's in the array
    const note = noteNumToNote(noteInput);
    if (notesOn.includes(note)) return true;

    return false;
  }
  
  return false;
};
