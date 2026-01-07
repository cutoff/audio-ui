/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

/**
 * Predefined theme colors as CSS color values
 * These are just the primary color - variants (primary50, primary20) are computed automatically by components
 *
 * @example
 * ```tsx
 * import { themeColors } from '@cutoff/audio-ui-react';
 *
 * <AudioUiProvider initialColor={themeColors.blue}>
 *   <App />
 * </AudioUiProvider>
 * ```
 */
export const themeColors = {
    /** Default adaptive color (white in dark mode, black in light mode) */
    default: "var(--audioui-theme-default)",
    /** Blue theme color */
    blue: "var(--audioui-theme-blue)",
    /** Orange theme color */
    orange: "var(--audioui-theme-orange)",
    /** Pink theme color */
    pink: "var(--audioui-theme-pink)",
    /** Green theme color */
    green: "var(--audioui-theme-green)",
    /** Purple theme color */
    purple: "var(--audioui-theme-purple)",
    /** Yellow theme color */
    yellow: "var(--audioui-theme-yellow)",
} as const;

/**
 * Predefined theme colors as direct HSL values
 * Use these when CSS variables aren't available or you need direct color values
 */
export const themeColorsDirect = {
    default: {
        light: "hsl(0, 0%, 10%)",
        dark: "hsl(0, 0%, 96%)",
    },
    blue: {
        light: "hsl(204, 88%, 52%)",
        dark: "hsl(204, 88%, 53%)",
    },
    orange: {
        light: "hsl(29, 100%, 48%)",
        dark: "hsl(29, 100%, 50%)",
    },
    pink: {
        light: "hsl(332, 92%, 52%)",
        dark: "hsl(332, 95%, 54%)",
    },
    green: {
        light: "hsl(160, 95%, 44%)",
        dark: "hsl(160, 98%, 37%)",
    },
    purple: {
        light: "hsl(252, 96%, 54%)",
        dark: "hsl(252, 100%, 67%)",
    },
    yellow: {
        light: "hsl(50, 100%, 50%)",
        dark: "hsl(50, 100%, 50%)",
    },
} as const;
