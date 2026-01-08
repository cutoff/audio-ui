/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React, { useMemo, useCallback } from "react";
import classNames from "classnames";
import AdaptiveBox from "@/primitives/AdaptiveBox";
import { AdaptiveBoxProps, AdaptiveSizeProps, BaseProps, ThemableProps } from "@/types";
import { generateColorVariants } from "@cutoff/audio-ui-core";
import { useAdaptiveSize } from "@/hooks/useAdaptiveSize";
import {
    createNoteNumSet,
    DIATONIC_TO_CHROMATIC,
    noteNumToNote,
    noteToNoteNum,
    WHITE_KEY_NAMES,
    WHITE_KEY_POSITIONS,
    WHITE_KEY_TO_CHROMATIC,
} from "@cutoff/audio-ui-core";
import "@cutoff/audio-ui-core/styles.css";
import { CLASSNAMES } from "@cutoff/audio-ui-core";
import { CSS_VARS } from "@cutoff/audio-ui-core";
import { useThemableProps } from "@/defaults/AudioUiProvider";
import { translateKeybedRoundness } from "@cutoff/audio-ui-core";
import { DEFAULT_ROUNDNESS } from "@cutoff/audio-ui-core";

/**
 * Type definition for note names (C to B)
 */
type NoteName = (typeof WHITE_KEY_NAMES)[number];
const notesCount = WHITE_KEY_NAMES.length;

/**
 * Props for the Keys component
 */
export type KeysProps = BaseProps &
    AdaptiveSizeProps &
    // Keys uses AdaptiveBox layout props but deliberately does not support labels.
    // labelMode/labelPosition/labelAlign are omitted on purpose.
    Omit<AdaptiveBoxProps, "labelMode" | "labelPosition" | "labelAlign"> &
    ThemableProps & {
        /** Number of keys on the keyboard
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
 * Piano Keys component that renders a piano keyboard visualization.
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
 * @property {boolean} adaptiveSize - Whether the keys component fills its container (ignores size constraints when true)
 * @property {number} nbKeys - Number of keys on the keyboard (default 61)
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
 * <Keys />
 *
 * // Full piano configuration with note names
 * <Keys
 *   nbKeys={88}
 *   startKey="A"
 *   octaveShift={0}
 *   notesOn={['C4', 'E4', 'G4']}
 * />
 *
 * // Using MIDI note numbers
 * <Keys
 *   notesOn={[60, 64, 67]} // C4, E4, G4
 * />
 *
 * // Mixing note names and MIDI note numbers
 * <Keys
 *   notesOn={['C4', 64, 'G4']} // C4, E4, G4
 * />
 *
 * // Custom styling with size
 * <Keys
 *   className="my-keyboard"
 *   style={{ marginTop: '20px' }}
 *   size="large"
 * />
 *
 * // Classic piano style
 * <Keys keyStyle="classic" />
 *
 * // Inverted classic style
 * <Keys keyStyle="classic-inverted" />
 * ```
 */
function Keys({
    nbKeys = 61,
    startKey = nbKeys === 88 ? "A" : "C",
    octaveShift = 0,
    notesOn = [],
    adaptiveSize = false,
    size = "normal",
    displayMode,
    keyStyle = "theme",
    color,
    roundness,
    className = "",
    style = {},
}: KeysProps) {
    // Ensure nbKeys is within valid range (1-128)
    const validNbKeys = Math.max(1, Math.min(128, nbKeys));
    // Memoize initial computations
    const keybedDimensions = useMemo(() => {
        const nbOctaves = Math.floor(validNbKeys / 12);
        const keyRemainder = validNbKeys % 12;

        // Calculate white keys: Each octave has 7 white keys (C, D, E, F, G, A, B)
        // For partial octaves, use the ratio 7/12 (white keys per semitone) to estimate
        // This ensures accurate white key count for any number of keys
        const whiteKeysInRemainder = Math.ceil((keyRemainder * 7) / 12);
        const nbWhite = nbOctaves * 7 + whiteKeysInRemainder;

        const startKeyIndex = WHITE_KEY_NAMES.indexOf(startKey);

        const middleKeyIndex = Math.floor((nbWhite - 1) / 2);
        const octavesFromMiddle = Math.floor(middleKeyIndex / 7);

        // Octave adjustment for keys starting with A or B:
        // In MIDI convention, A and B belong to the octave of the next C.
        // For example, A4 and B4 are in the same octave as C5, not C4.
        // This adjustment ensures correct octave calculation when starting with A or B.
        const octaveAdjustment = startKeyIndex >= 5 ? 1 : 0;

        // Calculate starting octave with special handling for extreme keyboard sizes
        let startOctave;
        if (validNbKeys <= 12) {
            // Very small keyboards (1-12 keys): Center around C4 (middle C) for usability
            startOctave = 4 - octaveAdjustment;
        } else if (validNbKeys >= 120) {
            // Very large keyboards (120-128 keys): Prevent going below C0 (MIDI note 0)
            // This ensures we don't generate invalid MIDI note numbers
            startOctave = Math.max(0, 4 - octavesFromMiddle - octaveAdjustment);
        } else {
            // Standard keyboards: Calculate octave based on middle key position
            // This centers the keyboard around middle C (C4) for typical sizes
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
                whiteFill: `var(${CSS_VARS.keysIvory})`,
                whiteStroke: `var(${CSS_VARS.keysIvoryStroke})`,
                blackFill: `var(${CSS_VARS.keysEbony})`,
                blackStroke: `var(${CSS_VARS.keysEbonyStroke})`,
            };
        } else {
            // classic-inverted
            return {
                whiteFill: `var(${CSS_VARS.keysEbony})`,
                whiteStroke: `var(${CSS_VARS.keysEbonyStroke})`,
                blackFill: `var(${CSS_VARS.keysIvory})`,
                blackStroke: `var(${CSS_VARS.keysIvoryStroke})`,
            };
        }
    }, [keyStyle]);

    // Memoize the active notes set for efficient lookups
    const activeNoteNumSet = useMemo(() => {
        return createNoteNumSet(notesOn || []);
    }, [notesOn]);

    // Calculate which white key positions should NOT have black keys above them
    // In a standard piano layout, there are no black keys between:
    // - E and F (semitone gap, no black key)
    // - B and C (semitone gap, no black key)
    // These correspond to white key indices 2 and 6 when starting with C
    // The modulo calculation adjusts for different starting keys
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

            // Color resolution: Active keys always use theme color for visual feedback
            // Inactive keys use theme colors (theme mode) or classic colors (classic modes)
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
    }, [keybedDimensions, octaveShift, isNoteActive, legacyRoundness, colorVariants, keyColors, keyStyle, startKey]);

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

        // Render black keys: There are nbWhite - 1 potential black key positions
        // (one less than white keys because black keys sit between white keys)
        return Array.from({ length: nbWhite - 1 }, (_, index) => {
            const octaveIndex = index % 7;
            // Skip positions that shouldn't have black keys (E-F and B-C gaps)
            if (correctBlackPass.includes(octaveIndex)) return null;

            // Calculate the diatonic index (white keys only)
            const currentNoteIndex = (startKeyIndex + index) % notesCount;

            // Calculate how many octaves we've moved from the start
            const octaveOffset = Math.floor((startKeyIndex + index) / notesCount);

            // Calculate the MIDI note number for this key
            // We need to find how many semitones we've moved from the start key
            const chromaticOffset = WHITE_KEY_TO_CHROMATIC[currentNoteIndex] - WHITE_KEY_TO_CHROMATIC[startKeyIndex];
            const adjustedOffset = chromaticOffset + octaveOffset * 12;

            // Black keys are positioned one semitone higher than the white key to their left
            // Add 1 to the chromatic offset to get the black key's MIDI note number
            const noteNum = baseNoteNum + adjustedOffset + 1 - octaveShift * 12;

            // Skip black keys that would map to white key positions (E-F and B-C gaps)
            // This prevents duplicate note assignments and ensures correct piano layout
            // The modulo 12 gives us the chromatic position within the octave
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
    }, [
        keybedDimensions,
        octaveShift,
        isNoteActive,
        correctBlackPass,
        legacyRoundness,
        colorVariants,
        keyColors,
        keyStyle,
        startKey,
    ]);

    // Get adaptive sizing values
    const { sizeClassName, sizeStyle } = useAdaptiveSize(adaptiveSize, size, "keys");

    // Memoize the classNames calculation: size class first, then base classes, then user className (user takes precedence)
    const componentClassNames = useMemo(() => {
        return classNames(sizeClassName, CLASSNAMES.root, className);
    }, [sizeClassName, className]);

    return (
        <AdaptiveBox
            displayMode={displayMode ?? "scaleToFit"}
            // Keys does not expose labels; hide label row explicitly.
            labelMode="none"
            className={componentClassNames}
            style={{ ...sizeStyle, ...style }}
            viewBoxWidth={keybedDimensions.width + keybedDimensions.innerStrokeWidth}
            viewBoxHeight={keybedDimensions.whiteHeight + keybedDimensions.innerStrokeWidth}
            minWidth={40}
            minHeight={40}
        >
            <AdaptiveBox.Svg>
                {renderWhiteKeys}
                {renderBlackKeys}
            </AdaptiveBox.Svg>
        </AdaptiveBox>
    );
}

// Wrap the component in React.memo to prevent unnecessary re-renders
export default React.memo(Keys);
