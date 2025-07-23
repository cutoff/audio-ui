import React, { useMemo } from 'react';
import classNames from 'classnames';
import AdaptiveSvgComponent from './support/AdaptiveSvgComponent';
import { Stretchable, SizeType } from "./types";
import { keyboardSizeMap } from "./utils/sizeMappings";
import "../styles.css";

/**
 * Note names in order from C to B
 */
const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
type NoteName = typeof noteNames[number];
const notesCount = noteNames.length;

/**
 * Props for the Keyboard component
 */
export type KeyboardProps = Stretchable & {
    /** Number of keys on the keyboard
     * @default 61 */
    nbKeys?: number;
    /** Starting note name (A-G)
     * @default 'C' for 61 keys, 'A' for 88 keys */
    startKey?: NoteName;
    /** Octave transpose index (default: 0)
     * @default 0 */
    octaveShift?: number;
    /** Array of notes that should be highlighted (e.g., ['C4', 'E4', 'G4'])
     * Notes should be in the format: NoteName + Octave (+ optional '#' for sharp) */
    notesOn?: string[];
    /** Additional styles to apply to the container */
    style?: React.CSSProperties;
    /** Additional CSS classes to apply to the container */
    className?: string;
    /** Size of the component
     * @default 'normal' */
    size?: SizeType;
};

/**
 * Calculate positive modulo (different from JavaScript's % operator for negative numbers)
 */
const positiveModulo = (number: number, modulus: number): number => {
    return ((number % modulus) + modulus) % modulus;
};

/**
 * Piano Keyboard component that renders a piano keyboard visualization.
 * Supports variable number of keys, different starting positions, and note highlighting.
 *
 * Features:
 * - Configurable number of keys (default 61, supports 88 for full piano)
 * - Customizable starting position (note and octave)
 * - Highlights active notes
 * - Maintains proper piano key layout and proportions
 * - Responsive sizing through AdaptiveSvgComponent integration
 * - Multiple size variants (xsmall, small, normal, large, xlarge)
 *
 * This component inherits properties from:
 * - `Stretchable`: For responsive sizing
 *
 * @property {boolean} stretch - Whether the keyboard should stretch to fill its container (from `Stretchable`)
 * @property {number} nbKeys - Number of keys on the keyboard (default 61)
 * @property {NoteName} startKey - Starting note name (A-G) (default 'C' for 61 keys, 'A' for 88 keys)
 * @property {number} octaveShift - Octave transpose index (default 0)
 * @property {string[]} notesOn - Array of notes that should be highlighted (e.g., ['C4', 'E4', 'G4'])
 * @property {string} className - Additional CSS classes
 * @property {React.CSSProperties} style - Additional inline styles
 * @property {SizeType} size - Size of the component (xsmall, small, normal, large, xlarge)
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
 *   octaveShift={0}
 *   notesOn={['C4', 'E4', 'G4']}
 * />
 *
 * // Custom styling with size
 * <Keyboard
 *   className="my-keyboard"
 *   style={{ marginTop: '20px' }}
 *   size="large"
 * />
 * ```
 */
function Keyboard({
    nbKeys = 61,
    startKey = (nbKeys === 88) ? 'A' : 'C',
    octaveShift = 0,
    stretch = false,
    notesOn = [],
    style = {},
    className = "",
    size = 'normal'
}: KeyboardProps) {
    // Memoize initial computations
    const keyboardDimensions = useMemo(() => {
        const nbOctaves = Math.floor(nbKeys / 12);
        const keyRemainder = nbKeys % 12;

        // Calculate white keys mathematically
        const whiteKeysInRemainder = Math.ceil(keyRemainder * 7 / 12);
        const nbWhite = (nbOctaves * 7) + whiteKeysInRemainder;

        const startKeyIndex = noteNames.indexOf(startKey);

        const middleKeyIndex = Math.floor((nbWhite - 1) / 2);
        const octavesFromMiddle = Math.floor(middleKeyIndex / 7);

        // If we start with A or B, we need to subtract one more octave
        // because these notes belong to the octave of the next C
        const octaveAdjustment = startKeyIndex >= 5 ? 1 : 0;
        const startOctave = 4 - octavesFromMiddle - octaveAdjustment;

        // Key dimensions (in SVG units)
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

        return {
            nbWhite,
            startKeyIndex,
            startOctave,
            whiteWidth,
            whiteHeight,
            blackWidth,
            blackXShift,
            blackHeight,
            outerStrokeWidth,
            innerStrokeWidth,
            width,
            blackPass
        };
    }, [nbKeys, startKey]);

    // Memoize white keys rendering
    const renderWhiteKeys = useMemo(() => {
        const {
            nbWhite,
            startKeyIndex,
            startOctave,
            whiteWidth,
            whiteHeight,
            innerStrokeWidth
        } = keyboardDimensions;

        return Array.from({ length: nbWhite }, (_, index) => {
            const currentNoteIndex = (startKeyIndex + index) % notesCount;
            const currentNoteName = noteNames[currentNoteIndex];
            const currentOctave = (startOctave + octaveShift) + Math.floor((startKeyIndex + index) / notesCount);
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
    }, [keyboardDimensions, octaveShift, notesOn]);

    // Memoize black keys rendering
    const renderBlackKeys = useMemo(() => {
        const {
            nbWhite,
            startKeyIndex,
            startOctave,
            whiteWidth,
            blackWidth,
            blackXShift,
            blackHeight,
            innerStrokeWidth,
            blackPass
        } = keyboardDimensions;

        return Array.from({ length: nbWhite - 1 }, (_, index) => {
            const octaveIndex = index % 7;
            if (blackPass.includes(octaveIndex)) return null;

            const currentNoteIndex = (startKeyIndex + index) % notesCount;
            const currentNoteName = noteNames[currentNoteIndex];
            const currentOctave = (startOctave + octaveShift) + Math.floor((startKeyIndex + index) / notesCount);
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
    }, [keyboardDimensions, octaveShift, notesOn]);

    // Memoize the classNames calculation
    const componentClassNames = useMemo(() => {
        return classNames(
            className,
            'cutoffAudioKit'
        );
    }, [className]);

    // Get the preferred dimensions based on the size prop
    const { width: preferredWidth, height: preferredHeight } = keyboardSizeMap[size];

    return (
        <AdaptiveSvgComponent
            className={componentClassNames}
            style={{
                backgroundColor: "#f6f6f605",
                border: "0 0 0 0",
                ...style
            }}
            viewBoxWidth={keyboardDimensions.width}
            viewBoxHeight={keyboardDimensions.whiteHeight}
            preferredWidth={preferredWidth}
            preferredHeight={preferredHeight}
            stretch={stretch}
        >
            <rect
                className="stroke-primary-50 fill-transparent"
                strokeWidth={keyboardDimensions.outerStrokeWidth}
                x={keyboardDimensions.outerStrokeWidth / 2}
                y={keyboardDimensions.outerStrokeWidth / 2}
                width={keyboardDimensions.width - keyboardDimensions.outerStrokeWidth}
                height={keyboardDimensions.whiteHeight - keyboardDimensions.outerStrokeWidth}
            />
            {renderWhiteKeys}
            {renderBlackKeys}
        </AdaptiveSvgComponent>
    );
}

// Wrap the component in React.memo to prevent unnecessary re-renders
export default React.memo(Keyboard);
