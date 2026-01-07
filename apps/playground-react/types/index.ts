/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

export type PropertiesInputProps = {
    label: string;
    name: string;
    value: string | number | boolean;
    onChange: (value: string | number | boolean) => void;
    type?: "text" | "number" | "checkbox";
};
