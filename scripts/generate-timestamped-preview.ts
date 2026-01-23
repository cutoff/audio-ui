#!/usr/bin/env node

/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * Generates a timestamped preview version.
 * Format: 1.0.0-preview.YYYYMMDD.HHMM
 *
 * @returns The timestamped preview version
 */
function generateTimestampedPreview(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timestamp = `${year}${month}${day}.${hours}${minutes}`;
    return `1.0.0-preview.${timestamp}`;
}

/**
 * Updates the root package.json with the new version.
 *
 * @param version - The version to set
 */
function updateRootVersion(version: string): void {
    const rootPackageJsonPath = join(process.cwd(), "package.json");
    const pkg = JSON.parse(readFileSync(rootPackageJsonPath, "utf-8")) as { version: string };
    pkg.version = version;
    writeFileSync(rootPackageJsonPath, JSON.stringify(pkg, null, 2) + "\n");
}

// Main execution
const version = generateTimestampedPreview();
updateRootVersion(version);
console.log(version);
