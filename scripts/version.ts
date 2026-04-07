#!/usr/bin/env node

/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { VERSION_TYPES, getCurrentVersion, computeVersion, updateAllPackageJsonFiles } from "./lib/version.js";
import type { VersionType } from "./lib/version.js";

const rootDir = process.cwd();
const type = process.argv[2] as VersionType | undefined;

// No argument: print the current version
if (!type) {
    console.log(getCurrentVersion(rootDir));
    process.exit(0);
}

// Validate argument
if (!VERSION_TYPES.includes(type)) {
    console.error(`Usage: pnpm version [${VERSION_TYPES.join("|")}]`);
    console.error(`       pnpm version          (prints current version)`);
    process.exit(1);
}

// Compute and apply
const currentVersion = getCurrentVersion(rootDir);
const version = computeVersion(type, currentVersion);
const updatedFiles = updateAllPackageJsonFiles(rootDir, version);

console.log(`✓ Set version: ${version}`);
console.log(`  Updated ${updatedFiles.length} package.json file(s):`);
for (const file of updatedFiles) {
    console.log(`    - ${file}`);
}
