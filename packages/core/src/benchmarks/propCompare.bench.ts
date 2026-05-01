/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { bench, describe } from "vitest";
import { createPropComparator } from "../utils/propCompare";

describe("createPropComparator", () => {
    const comparator = createPropComparator({
        deepCompareProps: ["style"],
        alwaysCompareProps: ["children"],
    });

    const baseProps = {
        value: 50,
        min: 0,
        max: 127,
        label: "Cutoff",
        style: { color: "red", fontSize: 14 },
        children: null,
        onChange: () => {},
    };

    bench("compare identical props (equal)", () => {
        comparator(baseProps, baseProps);
    });

    bench("compare props with different primitive", () => {
        comparator(baseProps, { ...baseProps, value: 75 });
    });

    bench("compare props with different deep object", () => {
        comparator(baseProps, {
            ...baseProps,
            style: { color: "blue", fontSize: 14 },
        });
    });

    bench("compare props with identical deep object (new reference)", () => {
        comparator(baseProps, {
            ...baseProps,
            style: { color: "red", fontSize: 14 },
        });
    });
});
