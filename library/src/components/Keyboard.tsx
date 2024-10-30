import React from 'react';
import BaseComponent from './BaseComponent';

/**
 * Note names in order from C to B
 */
const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
type NoteName = typeof noteNames[number];
const notesCount = noteNames.length;

/**
 * Props for the Keyboard component
 */
type KeyboardProps = {
    /** Number of keys on the keyboard
     * @default 61 */
    nbKeys?: number;
    /** Starting note name (A-G)
     * @default 'C' for 61 keys, 'A' for 88 keys */
    startKey?: NoteName;
    /** Starting octave number
     * @default 2 */
    startOctave?: number;
    /** Array of notes that should be highlighted (e.g., ['C4', 'E4', 'G4'])
     * Notes should be in the format: NoteName + Octave (+ optional '#' for sharp) */
    notesOn?: string[];
    /** Additional styles to apply to the container */
    style?: React.CSSProperties;
    /** Additional CSS classes to apply to the container */
    className?: string;
};

/**
 * Calculate positive modulo (different from JavaScript's % operator for negative numbers)
 */
const positiveModulo = (number: number, modulus: number): number => {
    return ((number % modulus) + modulus) % modulus;
};

/**
 * Piano Keyboard component that renders an interactive piano keyboard visualization.
 * Supports variable number of keys, different starting positions, and note highlighting.
 *
 * Features:
 * - Configurable number of keys (default 61, supports 88 for full piano)
 * - Customizable starting position (note and octave)
 * - Highlights active notes
 * - Maintains proper piano key layout and proportions
 * - Responsive sizing through BaseComponent integration
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Keyboard />
 *
 * // Full piano configuration
 * <Keyboard
 *   nbKeys={88}
 *   startKey="A"
 *   startOctave={0}
 *   notesOn={['C4', 'E4', 'G4']}
 * />
 *
 * // Custom styling
 * <Keyboard
 *   className="my-keyboard"
 *   style={{ marginTop: '20px' }}
 * />
 * ```
 */
export default function Keyboard({
                                     nbKeys = 61,
                                     startKey = (nbKeys === 88) ? 'A' : 'C',
                                     startOctave = 2,
                                     notesOn = [],
                                     style = {},
                                     className = ''
                                 }: KeyboardProps) {
    // Calculate keyboard dimensions
    const nbOctaves = Math.floor(nbKeys / 12);
    const keyRemainder = nbKeys % 12;
    const nbWhite = nbOctaves * 7 + keyRemainder;

    // Key dimensions
    const whiteWidth = 25;
    const whiteHeight = 150;
    const blackWidth = 13;
    const blackXShift = 18;
    const blackHeight = (whiteHeight / 3) * 2;
    const outerStrokeWidth = 2;
    const innerStrokeWidth = 2;

    // Calculate total width
    const width = nbWhite * whiteWidth;

    // Calculate black key positions
    const blackKeyShift = parseInt(startKey, 36) - parseInt('C', 36);
    const blackPass = [
        positiveModulo(2 + blackKeyShift, 7),
        positiveModulo(6 + blackKeyShift, 7)
    ];

    const startKeyIndex = noteNames.indexOf(startKey);

    // Generate white keys
    const renderWhiteKeys = Array.from({ length: nbWhite }, (_, index) => {
        const currentNoteIndex = (startKeyIndex + index) % notesCount;
        const currentNoteName = noteNames[currentNoteIndex];
        const currentOctave = startOctave + Math.floor((startKeyIndex + index) / notesCount);
        const currentWhiteNote = currentNoteName + currentOctave.toString();

        return (
            <rect
                key={currentWhiteNote}
                className={`stroke-primary-50 ${notesOn?.includes(currentWhiteNote) ? 'fill-primary' : 'fill-transparent'}`}
                strokeWidth={innerStrokeWidth}
                x={index * whiteWidth}
                y={0}
                width={whiteWidth}
                height={whiteHeight}
            />
        );
    });

    // Generate black keys
    const renderBlackKeys = Array.from({ length: nbWhite - 1 }, (_, index) => {
        const octaveIndex = index % 7;
        if (blackPass.includes(octaveIndex)) return null;

        const currentNoteIndex = (startKeyIndex + index) % notesCount;
        const currentNoteName = noteNames[currentNoteIndex];
        const currentOctave = startOctave + Math.floor((startKeyIndex + index) / notesCount);
        const currentBlackNote = currentNoteName + "#" + currentOctave.toString();

        return (
            <rect
                key={currentBlackNote}
                className={`stroke-primary-50 ${notesOn?.includes(currentBlackNote) ? 'fill-primary' : 'fill-primary-50'}`}
                style={{ zIndex: 1 }}
                strokeWidth={innerStrokeWidth}
                x={index * whiteWidth + blackXShift}
                y={0}
                width={blackWidth}
                height={blackHeight}
            />
        );
    }).filter(Boolean);

    return (
        <BaseComponent
            className={className}
            style={{
                backgroundColor: "#f6f6f605",
                border: "0 0 0 0",
                ...style
            }}
            viewBoxWidth={width}
            viewBoxHeight={whiteHeight}
            preferredWidth={width}
            preferredHeight={whiteHeight}
            stretch={true}
        >
            <rect
                className="stroke-primary-50 fill-transparent"
                strokeWidth={outerStrokeWidth}
                x={outerStrokeWidth / 2}
                y={outerStrokeWidth / 2}
                width={width - outerStrokeWidth}
                height={whiteHeight - outerStrokeWidth}
            />
            {renderWhiteKeys}
            {renderBlackKeys}
        </BaseComponent>
    );
}