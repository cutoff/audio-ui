/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import type { MetadataRoute } from "next";
import { isPublicIndexingAllowed } from "@/lib/indexing-policy";
import { PLAYGROUND_ORIGIN, PLAYGROUND_SITEMAP_PATHS } from "@/lib/playground-sitemap-paths";

/**
 * Next.js App Router sitemap served at `/sitemap.xml`.
 *
 * When {@link isPublicIndexingAllowed} is false, returns no entries so crawlers do not receive
 * a URL list while `robots.txt` disallows crawling and HTML `robots` is noindex.
 *
 * @returns {MetadataRoute.Sitemap} One entry per path in {@link PLAYGROUND_SITEMAP_PATHS} with
 *   `lastModified` set to generation time, or an empty array when indexing is disallowed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
    if (!isPublicIndexingAllowed()) {
        return [];
    }

    const lastModified = new Date();
    return PLAYGROUND_SITEMAP_PATHS.map((path) => ({
        url: `${PLAYGROUND_ORIGIN}${path}`,
        lastModified,
    }));
}
