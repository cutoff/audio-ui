/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/page-metadata";

/** Metadata of the Client Component page beside this layout, which cannot export it itself. */
export const metadata = pageMetadata("/primitives/adaptive-box");

export default function Layout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
