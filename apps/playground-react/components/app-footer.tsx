/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import Link from "next/link";

/**
 * Application footer component.
 * Displays copyright information with a link to the Tylium website.
 *
 * @returns Footer component
 */
export function AppFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-background/50 backdrop-blur-sm">
            <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-center px-4 text-xs text-muted-foreground">
                <span>
                    © 2025-{currentYear}{" "}
                    <Link
                        href="https://tylium.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
                    >
                        Tylium
                    </Link>
                    . All rights reserved.
                </span>
            </div>
        </footer>
    );
}
