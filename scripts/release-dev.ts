#!/usr/bin/env node

/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { getCurrentVersion, computeVersion, updateAllPackageJsonFiles, commitFiles } from "./lib/version.js";

const rootDir = process.cwd();
const currentVersion = getCurrentVersion(rootDir);
const version = computeVersion("dev", currentVersion);
const updatedFiles = updateAllPackageJsonFiles(rootDir, version);

console.log(`✓ Set development version: ${version}`);
console.log(`  Updated ${updatedFiles.length} package.json file(s):`);
for (const file of updatedFiles) {
    console.log(`    - ${file}`);
}

// Auto-commit
try {
    commitFiles(rootDir, updatedFiles, `Bump version to ${version}`);
    console.log(`\n✓ Committed: Bump version to ${version}`);
} catch (error) {
    console.error(`\n✗ Failed to commit: ${error}`);
    process.exit(1);
}
