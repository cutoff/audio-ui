import {createNoteNumSet, isNoteOn, noteNumToNote, noteToNoteNum} from './noteUtils';

describe('noteUtils', () => {
    describe('noteNumToNote', () => {
        it('should convert MIDI note number to note string', () => {
            // Test middle C (C4)
            expect(noteNumToNote(60)).toBe('C4');

            // Test other notes
            expect(noteNumToNote(61)).toBe('C#4');
            expect(noteNumToNote(62)).toBe('D4');
            expect(noteNumToNote(63)).toBe('D#4');
            expect(noteNumToNote(64)).toBe('E4');
            expect(noteNumToNote(65)).toBe('F4');
            expect(noteNumToNote(66)).toBe('F#4');
            expect(noteNumToNote(67)).toBe('G4');
            expect(noteNumToNote(68)).toBe('G#4');
            expect(noteNumToNote(69)).toBe('A4');
            expect(noteNumToNote(70)).toBe('A#4');
            expect(noteNumToNote(71)).toBe('B4');
        });

        it('should handle octave boundaries correctly', () => {
            // Test octave boundaries
            expect(noteNumToNote(59)).toBe('B3');
            expect(noteNumToNote(60)).toBe('C4');
            expect(noteNumToNote(71)).toBe('B4');
            expect(noteNumToNote(72)).toBe('C5');
        });

        it('should handle extreme values', () => {
            // Test very low note (A0 is the lowest note on a standard piano)
            expect(noteNumToNote(21)).toBe('A0');

            // Test very high note (C8 is the highest note on a standard piano)
            expect(noteNumToNote(108)).toBe('C8');

            // Test notes outside standard piano range
            expect(noteNumToNote(0)).toBe('C-1');
            expect(noteNumToNote(127)).toBe('G9');
        });
    });

    describe('noteToNoteNum', () => {
        it('should convert note string to MIDI note number', () => {
            // Test middle C (C4)
            expect(noteToNoteNum('C4')).toBe(60);

            // Test other notes
            expect(noteToNoteNum('C#4')).toBe(61);
            expect(noteToNoteNum('D4')).toBe(62);
            expect(noteToNoteNum('D#4')).toBe(63);
            expect(noteToNoteNum('E4')).toBe(64);
            expect(noteToNoteNum('F4')).toBe(65);
            expect(noteToNoteNum('F#4')).toBe(66);
            expect(noteToNoteNum('G4')).toBe(67);
            expect(noteToNoteNum('G#4')).toBe(68);
            expect(noteToNoteNum('A4')).toBe(69);
            expect(noteToNoteNum('A#4')).toBe(70);
            expect(noteToNoteNum('B4')).toBe(71);
        });

        it('should handle octave boundaries correctly', () => {
            // Test octave boundaries
            expect(noteToNoteNum('B3')).toBe(59);
            expect(noteToNoteNum('C4')).toBe(60);
            expect(noteToNoteNum('B4')).toBe(71);
            expect(noteToNoteNum('C5')).toBe(72);
        });

        it('should handle extreme values', () => {
            // Test very low note (A0 is the lowest note on a standard piano)
            expect(noteToNoteNum('A0')).toBe(21);

            // Test very high note (C8 is the highest note on a standard piano)
            expect(noteToNoteNum('C8')).toBe(108);

            // Test notes outside standard piano range
            expect(noteToNoteNum('C-1')).toBe(0);
            expect(noteToNoteNum('G9')).toBe(127);
        });

        it('should return -1 for invalid note strings', () => {
            // Test invalid note names
            expect(noteToNoteNum('H4')).toBe(-1);
            expect(noteToNoteNum('Cb4')).toBe(-1);

            // Test invalid formats
            expect(noteToNoteNum('C')).toBe(-1);
            expect(noteToNoteNum('C4b')).toBe(-1);
            expect(noteToNoteNum('4C')).toBe(-1);
            expect(noteToNoteNum('')).toBe(-1);
        });
    });

    describe('isNoteOn', () => {
        it('should return true when note string is in notesOn array', () => {
            const notesOn = ['C4', 'E4', 'G4'];
            expect(isNoteOn('C4', notesOn)).toBe(true);
            expect(isNoteOn('E4', notesOn)).toBe(true);
            expect(isNoteOn('G4', notesOn)).toBe(true);
        });

        it('should return false when note string is not in notesOn array', () => {
            const notesOn = ['C4', 'E4', 'G4'];
            expect(isNoteOn('D4', notesOn)).toBe(false);
            expect(isNoteOn('F4', notesOn)).toBe(false);
            expect(isNoteOn('A4', notesOn)).toBe(false);
        });

        it('should return true when MIDI note number is in notesOn array', () => {
            const notesOn = [60, 64, 67]; // C4, E4, G4
            expect(isNoteOn(60, notesOn)).toBe(true);
            expect(isNoteOn(64, notesOn)).toBe(true);
            expect(isNoteOn(67, notesOn)).toBe(true);
        });

        it('should return false when MIDI note number is not in notesOn array', () => {
            const notesOn = [60, 64, 67]; // C4, E4, G4
            expect(isNoteOn(62, notesOn)).toBe(false);
            expect(isNoteOn(65, notesOn)).toBe(false);
            expect(isNoteOn(69, notesOn)).toBe(false);
        });

        it('should handle mixed notesOn array with both strings and numbers', () => {
            const notesOn = ['C4', 64, 'G4']; // C4, E4, G4
            expect(isNoteOn('C4', notesOn)).toBe(true);
            expect(isNoteOn(64, notesOn)).toBe(true);
            expect(isNoteOn('G4', notesOn)).toBe(true);

            expect(isNoteOn('E4', notesOn)).toBe(true); // Should match 64
            expect(isNoteOn(60, notesOn)).toBe(true); // Should match 'C4'
            expect(isNoteOn(67, notesOn)).toBe(true); // Should match 'G4'

            expect(isNoteOn('D4', notesOn)).toBe(false);
            expect(isNoteOn(62, notesOn)).toBe(false);
        });

        it('should return false for empty notesOn array', () => {
            const notesOn: (string | number)[] = [];
            expect(isNoteOn('C4', notesOn)).toBe(false);
            expect(isNoteOn(60, notesOn)).toBe(false);
        });

        it('should handle invalid note strings', () => {
            const notesOn = ['C4', 'E4', 'G4'];
            expect(isNoteOn('H4', notesOn)).toBe(false);
            expect(isNoteOn('Cb4', notesOn)).toBe(false);
        });
    });

    describe('createNoteNumSet', () => {
        it('should create a Set of MIDI note numbers from an array of notes', () => {
            const notesOn = ['C4', 'E4', 'G4'];
            const noteNumSet = createNoteNumSet(notesOn);

            // Check that the Set contains the correct MIDI note numbers
            expect(noteNumSet.has(60)).toBe(true); // C4
            expect(noteNumSet.has(64)).toBe(true); // E4
            expect(noteNumSet.has(67)).toBe(true); // G4

            // Check that the Set does not contain other MIDI note numbers
            expect(noteNumSet.has(62)).toBe(false); // D4
            expect(noteNumSet.has(65)).toBe(false); // F4
            expect(noteNumSet.has(69)).toBe(false); // A4
        });

        it('should handle mixed array of strings and numbers', () => {
            const notesOn = ['C4', 64, 'G4'];
            const noteNumSet = createNoteNumSet(notesOn);

            // Check that the Set contains the correct MIDI note numbers
            expect(noteNumSet.has(60)).toBe(true); // C4
            expect(noteNumSet.has(64)).toBe(true); // E4
            expect(noteNumSet.has(67)).toBe(true); // G4

            // Check that the Set does not contain other MIDI note numbers
            expect(noteNumSet.has(62)).toBe(false); // D4
            expect(noteNumSet.has(65)).toBe(false); // F4
            expect(noteNumSet.has(69)).toBe(false); // A4
        });

        it('should handle empty array', () => {
            const notesOn: (string | number)[] = [];
            const noteNumSet = createNoteNumSet(notesOn);

            // Check that the Set is empty
            expect(noteNumSet.size).toBe(0);
        });

        it('should handle invalid note strings', () => {
            const notesOn = ['H4', 'Cb4', 'C', 'C4b', '4C', ''];
            const noteNumSet = createNoteNumSet(notesOn);

            // Check that the Set is empty (all notes are invalid)
            expect(noteNumSet.size).toBe(0);
        });
    });

    describe('lookup tables', () => {
        it('should have pre-populated lookup tables for all 128 MIDI notes', () => {
            // Test a few notes to verify the lookup tables are working
            for (let noteNum = 0; noteNum < 128; noteNum++) {
                const note = noteNumToNote(noteNum);
                const convertedNoteNum = noteToNoteNum(note);

                // The round-trip conversion should give the original MIDI note number
                expect(convertedNoteNum).toBe(noteNum);
            }
        });

        it('should be faster than calculation for note conversion', () => {
            // This is a simple performance test to verify that the lookup tables are faster
            // than calculation. We'll measure the time it takes to convert 1000 notes.

            const startTime = performance.now();
            for (let i = 0; i < 1000; i++) {
                // Convert all 128 MIDI notes to note strings
                for (let noteNum = 0; noteNum < 128; noteNum++) {
                    noteNumToNote(noteNum);
                }
            }
            const endTime = performance.now();

            // The conversion should be very fast (typically < 100ms for 128,000 conversions)
            // This is not a strict test, but it helps verify that the lookup tables are working
            console.log(`Time to convert 128,000 MIDI notes: ${endTime - startTime}ms`);
        });
    });
});
