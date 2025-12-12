"use client";

import React, { useMemo, useCallback } from "react";
import classNames from "classnames";
import AdaptiveBox from "./primitives/AdaptiveBox";
import { AdaptiveSize, BaseProps, Themable } from "./types";
import { getSizeClassForComponent, getSizeStyleForComponent } from "./utils/sizeMappings";
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
import { CLASSNAMES } from "../styles/classNames";
import { CSS_VARS } from "../styles/cssVars";
import { useThemableProps } from "./theme/AudioUiProvider";
import { translateKeybedRoundness } from "./utils/normalizedProps";
import { DEFAULT_ROUNDNESS } from "./utils/themeDefaults";

/**
 * Type definition for note names (C to B)
 */
type NoteName = (typeof WHITE_KEY_NAMES)[number];
const notesCount = WHITE_KEY_NAMES.length;

/**
 * Props for the Keybed component
 */
export type KeybedProps = BaseProps &
    AdaptiveSize &
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
        /** Key styling mode
         * - 'theme': Uses theme colors (current behavior, uses color prop and themable hook)
         * - 'classic': Classic piano style with ivory white keys and ebony black keys
         * - 'classic-inverted': Inverted classic style with ebony white keys and ivory black keys
         * @default 'theme' */
        keyStyle?: "theme" | "classic" | "classic-inverted";
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
 * @property {"theme" | "classic" | "classic-inverted"} keyStyle - Key styling mode (default "theme")
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
 *
 * // Classic piano style
 * <Keybed keyStyle="classic" />
 *
 * // Inverted classic style
 * <Keybed keyStyle="classic-inverted" />
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
    roundness,
    keyStyle = "theme",
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

        const halfInnerStrokeWidth = innerStrokeWidth / 2;

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
            halfInnerStrokeWidth,
        };
    }, [validNbKeys, startKey]);

    // Use the themable props hook to resolve color and roundness with proper fallbacks
    // Color is always resolved (even in classic modes) so active keys can use theme color
    const defaultThemableProps = useMemo(() => ({ color: undefined, roundness: DEFAULT_ROUNDNESS }), []);
    const { resolvedColor, resolvedRoundness } = useThemableProps({ color, roundness }, defaultThemableProps);

    // Translate normalized roundness to legacy range (0-12)
    const legacyRoundness = useMemo(() => {
        const normalized = resolvedRoundness ?? DEFAULT_ROUNDNESS;
        return translateKeybedRoundness(normalized);
    }, [resolvedRoundness]);

    // Generate color variants using the centralized utility
    // Used for theme mode rendering and for active keys in classic modes
    const colorVariants = useMemo(() => {
        return generateColorVariants(resolvedColor, "luminosity");
    }, [resolvedColor]);

    // Determine key colors based on keyStyle
    // Active keys always use theme color (colorVariants.primary), regardless of keyStyle
    const keyColors = useMemo(() => {
        if (keyStyle === "theme") {
            return null; // Use colorVariants instead
        } else if (keyStyle === "classic") {
            return {
                whiteFill: `var(${CSS_VARS.keybedIvory})`,
                whiteStroke: `var(${CSS_VARS.keybedIvoryStroke})`,
                blackFill: `var(${CSS_VARS.keybedEbony})`,
                blackStroke: `var(${CSS_VARS.keybedEbonyStroke})`,
            };
        } else {
            // classic-inverted
            return {
                whiteFill: `var(${CSS_VARS.keybedEbony})`,
                whiteStroke: `var(${CSS_VARS.keybedEbonyStroke})`,
                blackFill: `var(${CSS_VARS.keybedIvory})`,
                blackStroke: `var(${CSS_VARS.keybedIvoryStroke})`,
            };
        }
    }, [keyStyle]);

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
    const isNoteActive = useCallback(
        (note: string) => {
            // If it's a string note, convert to MIDI note number and check if it's in the set
            const noteNum = noteToNoteNum(note);
            return noteNum !== -1 && activeNoteNumSet.has(noteNum);
        },
        [activeNoteNumSet]
    );

    // Memoize white keys rendering
    const renderWhiteKeys = useMemo(() => {
        const { nbWhite, startKeyIndex, startOctave, whiteWidth, whiteHeight, innerStrokeWidth, halfInnerStrokeWidth } =
            keybedDimensions;

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

            // Determine colors based on keyStyle
            // Active keys always use theme color (colorVariants.primary)
            let strokeColor: string;
            let fillColor: string;

            if (keyStyle === "theme") {
                strokeColor = colorVariants.primary50;
                fillColor = isNoteActive(currentWhiteNote) ? colorVariants.primary : "transparent";
            } else if (keyColors) {
                strokeColor = keyColors.whiteStroke;
                fillColor = isNoteActive(currentWhiteNote) ? colorVariants.primary : keyColors.whiteFill;
            } else {
                // Fallback (should not happen)
                strokeColor = "#000";
                fillColor = "transparent";
            }

            return (
                <rect
                    key={`white-${index}-${currentWhiteNote}`}
                    style={{
                        stroke: strokeColor,
                        fill: fillColor,
                    }}
                    strokeWidth={innerStrokeWidth}
                    x={index * whiteWidth + halfInnerStrokeWidth}
                    y={halfInnerStrokeWidth}
                    width={whiteWidth}
                    height={whiteHeight}
                    rx={legacyRoundness}
                />
            );
        });
    }, [keybedDimensions, octaveShift, isNoteActive, legacyRoundness, colorVariants, keyColors, keyStyle]);

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
            halfInnerStrokeWidth,
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

            // Determine colors based on keyStyle
            // Active keys always use theme color (colorVariants.primary)
            let strokeColor: string;
            let fillColor: string;

            if (keyStyle === "theme") {
                strokeColor = colorVariants.primary50;
                fillColor = isNoteActive(currentBlackNote) ? colorVariants.primary : colorVariants.primary50;
            } else if (keyColors) {
                strokeColor = keyColors.blackStroke;
                fillColor = isNoteActive(currentBlackNote) ? colorVariants.primary : keyColors.blackFill;
            } else {
                // Fallback (should not happen)
                strokeColor = "#000";
                fillColor = "#000";
            }

            return (
                <rect
                    key={`black-${index}-${currentBlackNote}`}
                    style={{
                        zIndex: 1,
                        stroke: strokeColor,
                        fill: fillColor,
                    }}
                    strokeWidth={innerStrokeWidth}
                    x={index * whiteWidth + blackXShift + halfInnerStrokeWidth}
                    y={halfInnerStrokeWidth}
                    width={blackWidth}
                    height={blackHeight}
                    rx={legacyRoundness}
                />
            );
        }).filter(Boolean);
    }, [keybedDimensions, octaveShift, isNoteActive, correctBlackPass, legacyRoundness, colorVariants, keyColors, keyStyle]);

    // Get the size class name based on the size prop
    const sizeClassName = stretch ? undefined : getSizeClassForComponent("keybed", size);

    // Memoize the classNames calculation: size class first, then base classes, then user className (user takes precedence)
    const componentClassNames = useMemo(() => {
        return classNames(sizeClassName, CLASSNAMES.root, className);
    }, [sizeClassName, className]);

    // Build merged style: size style (when not stretching), then user style (user takes precedence)
    const sizeStyle = stretch ? undefined : getSizeStyleForComponent("keybed", size);

    return (
        <AdaptiveBox
            displayMode="scaleToFit"
            className={componentClassNames}
            style={{ ...sizeStyle, ...style }}
            minWidth={40}
            minHeight={40}
        >
            <AdaptiveBox.Svg
                viewBoxWidth={keybedDimensions.width + keybedDimensions.innerStrokeWidth}
                viewBoxHeight={keybedDimensions.whiteHeight + keybedDimensions.innerStrokeWidth}
            >
                {renderWhiteKeys}
                {renderBlackKeys}
            </AdaptiveBox.Svg>
        </AdaptiveBox>
    );
}

// Wrap the component in React.memo to prevent unnecessary re-renders
export default React.memo(Keybed);
