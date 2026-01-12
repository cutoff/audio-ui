/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

/**
 * Abbreviates text to a maximum number of characters.
 * Returns the first N characters of the text, or the original text if it's shorter.
 *
 * @param text - The text to abbreviate
 * @param maxLength - Maximum length (default: 3)
 * @returns Abbreviated text
 *
 * @example
 * abbreviateText("Volume", 3) // "Vol"
 * abbreviateText("Hi", 3) // "Hi"
 * abbreviateText("", 3) // ""
 */
export function abbreviateText(text: string, maxLength: number = 3): string {
    if (!text || text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength);
}
