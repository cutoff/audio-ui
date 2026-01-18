/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import * as React from "react";

/**
 * MIDI icon component.
 * Uses currentColor for theming compatibility.
 *
 * @param props - SVG props
 * @returns MIDI icon SVG element
 */
export function MidiIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24" {...props}>
            <path
                fill="currentColor"
                fillRule="evenodd"
                d="M5 1a4 4 0 0 0 -4 4v14a4 4 0 0 0 4 4h14a4 4 0 0 0 4 -4V5a4 4 0 0 0 -4 -4H5Zm3.727 8H4v5.818h1.455v-4.364h0.727v4.364h1.454v-4.364h0.728v4.364h1.454v-4.727A1.09 1.09 0 0 0 8.728 9Zm1.819 5.818V9H12v5.818h-1.454Zm5.818 -4.364h-3.637V9h4a1.09 1.09 0 0 1 1.091 1.09v3.637a1.09 1.09 0 0 1 -1.09 1.091h-4v-3.636h1.454v2.182h2.182v-2.91Zm2.181 4.364V9H20v5.818h-1.454Z"
                clipRule="evenodd"
                strokeWidth="1"
            />
        </svg>
    );
}
