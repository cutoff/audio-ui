/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

"use client";

import React from "react";

export type OptionViewProps = {
    /** Value associated with this option */
    value?: string | number;
    /** Child content (Visual representation) */
    children?: React.ReactNode;
    /** Optional text label for the parameter model (accessibility/aria-label) */
    label?: string;
};

export default function OptionView(_props: OptionViewProps) {
    return null; // This component is never rendered directly
}
