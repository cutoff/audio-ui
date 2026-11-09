/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import type { Metadata } from "next";
import { isPublicIndexingAllowed } from "@/lib/indexing-policy";
import {
    PLAYGROUND_ORIGIN,
    PLAYGROUND_PAGES,
    type PlaygroundPageInfo,
    type PlaygroundPath,
} from "@/lib/playground-sitemap-paths";

/** Site name: Open Graph `siteName` and the suffix of every page title but the home page's. */
export const PLAYGROUND_SITE_NAME = "AudioUI Playground";

/** Link preview image: the square Cutoff mark (a Twitter `summary` card, not a large image). */
const PREVIEW_IMAGE = {
    url: "/android-chrome-512x512.png",
    width: 512,
    height: 512,
    alt: "Cutoff",
};

/** Open Graph fields shared by every page; a page adds its own `url`, `title` and `description`. */
export const PLAYGROUND_OPEN_GRAPH = {
    type: "website",
    locale: "en_US",
    siteName: PLAYGROUND_SITE_NAME,
    images: [PREVIEW_IMAGE],
} satisfies Metadata["openGraph"];

/** Twitter fields shared by every page; a page adds its own `title` and `description`. */
export const PLAYGROUND_TWITTER = {
    card: "summary",
    creator: "@CutoffDev",
    images: [PREVIEW_IMAGE],
} satisfies Metadata["twitter"];

/**
 * Metadata of one playground page: its own title and description, a self-referencing canonical URL, and Open
 * Graph and Twitter fields. Exported as `metadata` by the page itself when it is a Server Component, or by a
 * `layout.tsx` beside it when the page is a Client Component (which cannot export metadata).
 *
 * Every field is set in full: a child segment's `openGraph`, `twitter` and `alternates` replace the parent's
 * rather than merge, and the title is absolute because a parent's `title.template` does not reach past an
 * intermediate segment that sets a plain title.
 *
 * A page marked `noindex` gets no canonical URL and, when indexing is allowed, `noindex, follow`; otherwise it
 * keeps the root layout's `noindex, nofollow`.
 *
 * @param path - Pathname of the page, a key of {@link PLAYGROUND_PAGES}
 * @returns {Metadata} The page's metadata
 *
 * @example
 * ```ts
 * export const metadata = pageMetadata("/vector-components/knob");
 * // <title>Knob | AudioUI Playground</title>
 * // <link rel="canonical" href="https://playground.cutoff.dev/vector-components/knob"/>
 * ```
 */
export function pageMetadata(path: PlaygroundPath): Metadata {
    const { title, description, noindex }: PlaygroundPageInfo = PLAYGROUND_PAGES[path];
    const fullTitle = path === "/" ? title : `${title} | ${PLAYGROUND_SITE_NAME}`;
    const url = `${PLAYGROUND_ORIGIN}${path}`;
    const common: Metadata = {
        title: { absolute: fullTitle },
        description,
        openGraph: { ...PLAYGROUND_OPEN_GRAPH, url, title: fullTitle, description },
        twitter: { ...PLAYGROUND_TWITTER, title: fullTitle, description },
    };

    if (noindex) {
        return isPublicIndexingAllowed()
            ? { ...common, robots: { index: false, follow: true, googleBot: { index: false, follow: true } } }
            : common;
    }
    return { ...common, alternates: { canonical: url } };
}
