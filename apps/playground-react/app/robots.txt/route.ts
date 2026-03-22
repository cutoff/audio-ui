/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { isPublicIndexingAllowed } from "@/lib/indexing-policy";

/** Serves `robots.txt`; content follows {@link isPublicIndexingAllowed}. */
export function GET() {
    const body = isPublicIndexingAllowed()
        ? `User-agent: *
Allow: /`
        : `User-agent: *
Disallow: /`;

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain",
        },
    });
}
