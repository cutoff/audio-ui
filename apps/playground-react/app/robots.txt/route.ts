/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

export async function GET() {
    return new Response(
        `User-agent: *
Disallow: /`,
        {
            headers: {
                "Content-Type": "text/plain",
            },
        }
    );
}
