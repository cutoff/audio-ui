"use client";

import React, { useMemo } from "react";
import classNames from "classnames";
import AdaptiveBox from "./support/AdaptiveBox";
import { AdaptativeSize, Base, Themable } from "./types";
import { keybedSizeMap } from "./utils/sizeMappings";
import { generateColorVariants } from "./utils/colorUtils";
import {
    createNoteNumSet,
    DIATONIC_TO_CHROMATIC,
    noteNumToNote,
    noteToNoteNum,
    WHITE_KEY_NAMES,
    WHITE_KEY_POSITIONS,
    WHITE_KEY_TO_CHROMATIC,
} from "./utils/noteUtils";
import "../styles.css";
import { useThemableProps } from "./providers/AudioUiProvider";

/**
 * Type definition for note names (C to B)
 */
type NoteName = (typeof WHITE_KEY_NAMES)[number];
const notesCount = WHITE_KEY_NAMES.length;

/**
 * Props for the Keybed component
 */
export type KeybedProps = Base &
    AdaptativeSize &
    Themable & {
        /** Number of keys on the keybed
         * @default 61 */
        nbKeys?: number;
        /** Starting note name (A-G)
         * @default 'C' for 61 keys, 'A' for 88 keys */
        startKey?: NoteName;
        /** Octave transpose index (default: 0)
         * Positive values shift notes up by that many octaves, negative values shift down
         * @default 0 */
        octaveShift?: number;
        /** Array of notes that should be highlighted
         * Notes can be specified as:
         * - Strings in the format: NoteName + Octave (+ optional '#' for sharp), e.g., 'C4', 'F#5'
         * - Numbers representing MIDI note IDs (e.g., 60 for C4, 61 for C#4, etc.)
         * @example ['C4', 'E4', 'G4'] or [60, 64, 67] or ['C4', 64, 'G4'] */
        notesOn?: (string | number)[];
    };

/**
 * Calculate positive modulo (different from JavaScript's % operator for negative numbers)
 */
const positiveModulo = (number: number, modulus: number): number => {
    return ((number % modulus) + modulus) % modulus;
};

/**
 * Piano Keybed component that renders a piano keyboard visualization.
 * Supports variable number of keys, different starting positions, and note highlighting.
 *
 * Features:
 * - Configurable number of keys (default 61, supports any number from 1 to 128)
 * - Customizable starting position (note and octave)
 * - Highlights active notes (supports both note names and MIDI note numbers)
 * - Maintains proper piano key layout and proportions
 * - Responsive sizing through AdaptiveSvgComponent integration
 * - Multiple size variants (xsmall, small, normal, large, xlarge)
 *
 * This component inherits properties from:
 * - `Stretchable`: For responsive sizing
 *
 * @property {boolean} stretch - Whether the keybed should stretch to fill its container (from `Stretchable`)
 * @property {number} nbKeys - Number of keys on the keybed (default 61)
 * @property {NoteName} startKey - Starting note name (A-G) (default 'C' for 61 keys, 'A' for 88 keys)
 * @property {number} octaveShift - Octave transpose index (default 0). Positive values shift notes up by that many octaves, negative values shift down.
 * @property {(string | number)[]} notesOn - Array of notes that should be highlighted. Can contain note names (e.g., 'C4') or MIDI note numbers (e.g., 60 for C4).
 * @property {string} className - Additional CSS classes
 * @property {React.CSSProperties} style - Additional inline styles
 * @property {SizeType} size - Size of the component (xsmall, small, normal, large, xlarge)
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Keybed />
 *
 * // Full piano configuration with note names
 * <Keybed
 *   nbKeys={88}
 *   startKey="A"
 *   octaveShift={0}
 *   notesOn={['C4', 'E4', 'G4']}
 * />
 *
 * // Using MIDI note numbers
 * <Keybed
 *   notesOn={[60, 64, 67]} // C4, E4, G4
 * />
 *
 * // Mixing note names and MIDI note numbers
 * <Keybed
 *   notesOn={['C4', 64, 'G4']} // C4, E4, G4
 * />
 *
 * // Custom styling with size
 * <Keybed
 *   className="my-keyboard"
 *   style={{ marginTop: '20px' }}
 *   size="large"
 * />
 * ```
 */
function Keybed({
    nbKeys = 61,
    startKey = nbKeys === 88 ? "A" : "C",
    octaveShift = 0,
    stretch = false,
    notesOn = [],
    style = {},
    className = "",
    size = "normal",
    color,
}: KeybedProps) {
    // Ensure nbKeys is within valid range (1-128)
    const validNbKeys = Math.max(1, Math.min(128, nbKeys));
    // Memoize initial computations
    const keybedDimensions = useMemo(() => {
        const nbOctaves = Math.floor(validNbKeys / 12);
        const keyRemainder = validNbKeys % 12;

        // Calculate white keys mathematically
        const whiteKeysInRemainder = Math.ceil((keyRemainder * 7) / 12);
        const nbWhite = nbOctaves * 7 + whiteKeysInRemainder;

        const startKeyIndex = WHITE_KEY_NAMES.indexOf(startKey);

        const middleKeyIndex = Math.floor((nbWhite - 1) / 2);
        const octavesFromMiddle = Math.floor(middleKeyIndex / 7);

        // If we start with A or B, we need to subtract one more octave
        // because these notes belong to the octave of the next C
        const octaveAdjustment = startKeyIndex >= 5 ? 1 : 0;

        // Adjust startOctave calculation for extreme keyboard sizes
        let startOctave;
        if (validNbKeys <= 12) {
            // For very small keyboards (1-12 keys), center around C4
            startOctave = 4 - octaveAdjustment;
        } else if (validNbKeys >= 120) {
            // For very large keyboards (120-128 keys), ensure we don't go below C0
            startOctave = Math.max(0, 4 - octavesFromMiddle - octaveAdjustment);
        } else {
            // Standard calculation for normal keyboard sizes
            startOctave = 4 - octavesFromMiddle - octaveAdjustment;
        }

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
        const blackKeyShift = parseInt(startKey, 36) - parseInt("C", 36);
        const blackPass = [positiveModulo(2 + blackKeyShift, 7), positiveModulo(6 + blackKeyShift, 7)];

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
            blackPass,
        };
    }, [validNbKeys, startKey]);

    // Use the themable props hook to resolve color and roundness with proper fallbacks
    const { resolvedColor } = useThemableProps({ color }, { color: "blue" });

    // Generate color variants using the centralized utility
    const colorVariants = useMemo(() => {
        return generateColorVariants(resolvedColor, "luminosity");
    }, [color]);

    // Memoize the active notes set for efficient lookups
    const activeNoteNumSet = useMemo(() => {
        return createNoteNumSet(notesOn || []);
    }, [notesOn]);

    // Memoize the calculation of positions without black keys
    // In a standard piano layout, there are no black keys between E-F and B-C
    // These correspond to indices 2 and 6 when startKey is "C"
    const correctBlackPass = useMemo(() => {
        const startKeyIndex = WHITE_KEY_NAMES.indexOf(startKey);
        return [
            positiveModulo(2 - startKeyIndex, 7), // E-F gap (no black key after E)
            positiveModulo(6 - startKeyIndex, 7), // B-C gap (no black key after B)
        ];
    }, [startKey]);

    // Create a memoized function to check if a note is active
    const isNoteActive = useMemo(() => {
        return (note: string) => {
            // If it's a string note, convert to MIDI note number and check if it's in the set
            const noteNum = noteToNoteNum(note);
            return noteNum !== -1 && activeNoteNumSet.has(noteNum);
        };
    }, [activeNoteNumSet]);

    // Memoize white keys rendering
    const renderWhiteKeys = useMemo(() => {
        const { nbWhite, startKeyIndex, startOctave, whiteWidth, whiteHeight, innerStrokeWidth } = keybedDimensions;

        // Get the chromatic index of the start key
        const startKeyChromatic = DIATONIC_TO_CHROMATIC[startKey];

        // Calculate the base MIDI note number for the starting key
        const baseNoteNum = (startOctave + 1) * 12 + startKeyChromatic;

        return Array.from({ length: nbWhite }, (_, index) => {
            // Calculate the diatonic index (white keys only)
            const currentNoteIndex = (startKeyIndex + index) % notesCount;

            // Calculate how many octaves we've moved from the start
            const octaveOffset = Math.floor((startKeyIndex + index) / notesCount);

            // Calculate the MIDI note number for this key
            // We need to find how many semitones we've moved from the start key
            const chromaticOffset = WHITE_KEY_TO_CHROMATIC[currentNoteIndex] - WHITE_KEY_TO_CHROMATIC[startKeyIndex];
            const adjustedOffset = chromaticOffset + octaveOffset * 12;
            const noteNum = baseNoteNum + adjustedOffset - octaveShift * 12;

            // Convert the MIDI note number to a note name and octave
            const currentWhiteNote = noteNumToNote(noteNum);

            return (
                <rect
                    key={`white-${index}-${currentWhiteNote}`}
                    style={{
                        stroke: colorVariants.primary50,
                        fill: isNoteActive(currentWhiteNote) ? colorVariants.primary : "transparent",
                    }}
                    strokeWidth={innerStrokeWidth}
                    x={index * whiteWidth}
                    y={0}
                    width={whiteWidth}
                    height={whiteHeight}
                />
            );
        });
    }, [keybedDimensions, octaveShift, notesOn, startKey, isNoteActive]);

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
        } = keybedDimensions;

        // Get the chromatic index of the start key
        const startKeyChromatic = DIATONIC_TO_CHROMATIC[startKey];

        // Calculate the base MIDI note number for the starting key
        const baseNoteNum = (startOctave + 1) * 12 + startKeyChromatic;

        return Array.from({ length: nbWhite - 1 }, (_, index) => {
            const octaveIndex = index % 7;
            if (correctBlackPass.includes(octaveIndex)) return null;

            // Calculate the diatonic index (white keys only)
            const currentNoteIndex = (startKeyIndex + index) % notesCount;

            // Calculate how many octaves we've moved from the start
            const octaveOffset = Math.floor((startKeyIndex + index) / notesCount);

            // Calculate the MIDI note number for this key
            // We need to find how many semitones we've moved from the start key
            const chromaticOffset = WHITE_KEY_TO_CHROMATIC[currentNoteIndex] - WHITE_KEY_TO_CHROMATIC[startKeyIndex];
            const adjustedOffset = chromaticOffset + octaveOffset * 12;

            // Black keys are one semitone higher than the white key to their left
            const noteNum = baseNoteNum + adjustedOffset + 1 - octaveShift * 12;

            // Skip this black key if its note number corresponds to a white key position
            // This prevents duplicate note assignments between white and black keys
            if (WHITE_KEY_POSITIONS.has(noteNum % 12)) return null;

            // Convert the MIDI note number to a note name and octave
            const currentBlackNote = noteNumToNote(noteNum);

            return (
                <rect
                    key={`black-${index}-${currentBlackNote}`}
                    style={{
                        zIndex: 1,
                        stroke: colorVariants.primary50,
                        fill: isNoteActive(currentBlackNote) ? colorVariants.primary : colorVariants.primary50,
                    }}
                    strokeWidth={innerStrokeWidth}
                    x={index * whiteWidth + blackXShift}
                    y={0}
                    width={blackWidth}
                    height={blackHeight}
                />
            );
        }).filter(Boolean);
    }, [keybedDimensions, octaveShift, notesOn, startKey, isNoteActive, correctBlackPass]);

    // Memoize the classNames calculation
    const componentClassNames = useMemo(() => {
        return classNames(className, "cutoffAudioKit");
    }, [className]);

    // Get the preferred width based on the size prop
    const { width: preferredWidth, height: preferredHeight } = keybedSizeMap[size];

    return (
        <AdaptiveBox
            displayMode="scaleToFit"
            className={componentClassNames}
            style={{
                ...(style ?? {}),
                ...(stretch ? {} : { width: `${preferredWidth}px`, height: `${preferredHeight}px` }),
            }}
            minWidth={40}
            minHeight={40}
        >
            <AdaptiveBox.Svg viewBoxWidth={keybedDimensions.width} viewBoxHeight={keybedDimensions.whiteHeight}>
                <rect
                    style={{
                        stroke: colorVariants.primary50,
                        fill: "transparent",
                    }}
                    strokeWidth={keybedDimensions.outerStrokeWidth}
                    x={keybedDimensions.outerStrokeWidth / 2}
                    y={keybedDimensions.outerStrokeWidth / 2}
                    width={keybedDimensions.width - keybedDimensions.outerStrokeWidth}
                    height={keybedDimensions.whiteHeight - keybedDimensions.outerStrokeWidth}
                />
                {renderWhiteKeys}
                {renderBlackKeys}
            </AdaptiveBox.Svg>
        </AdaptiveBox>
    );
}

// Wrap the component in React.memo to prevent unnecessary re-renders
export default React.memo(Keybed);
