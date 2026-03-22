/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { isPublicIndexingAllowed } from "@/lib/indexing-policy";
import { PLAYGROUND_ORIGIN } from "@/lib/playground-sitemap-paths";

/**
 * Route handler for `/robots.txt`.
 *
 * Body follows {@link isPublicIndexingAllowed}: allow-all plus `Sitemap:` when indexing is on,
 * otherwise `Disallow: /` with no sitemap line.
 *
 * @returns {Response} Plain text `robots.txt` with `Content-Type: text/plain`.
 */
export function GET() {
    const body = isPublicIndexingAllowed()
        ? `User-agent: *
Allow: /

Sitemap: ${PLAYGROUND_ORIGIN}/sitemap.xml`
        : `User-agent: *
Disallow: /`;

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain",
        },
    });
}
