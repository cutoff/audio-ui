#!/usr/bin/env node

/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { execSync } from "child_process";
import {
    VERSION_TYPES,
    getCurrentVersion,
    computeVersion,
    updateAllPackageJsonFiles,
    commitFiles,
} from "./lib/version.js";
import type { VersionType } from "./lib/version.js";

const RELEASE_TYPES = VERSION_TYPES.filter((t) => t !== "dev");
type ReleaseType = Exclude<VersionType, "dev">;

const type = process.argv[2] as ReleaseType;

if (!type || !RELEASE_TYPES.includes(type)) {
    console.error(`Usage: pnpm release:prepare <${RELEASE_TYPES.join("|")}>`);
    process.exit(1);
}

// 1. Run quality gate
console.log("Running quality checks...\n");
try {
    execSync("pnpm check", { stdio: "inherit" });
} catch {
    console.error("\n✗ Quality checks failed. Aborting release preparation.");
    process.exit(1);
}

// 2. Compute and apply version
const rootDir = process.cwd();
const currentVersion = getCurrentVersion(rootDir);
const version = computeVersion(type, currentVersion);
const updatedFiles = updateAllPackageJsonFiles(rootDir, version);

console.log(`\n✓ Prepared release version: ${version}`);
console.log(`  Updated ${updatedFiles.length} package.json file(s):`);
for (const file of updatedFiles) {
    console.log(`    - ${file}`);
}

// 3. Auto-commit
try {
    commitFiles(rootDir, updatedFiles, `Release version ${version}`);
    console.log(`\n✓ Committed: Release version ${version}`);
} catch (error) {
    console.error(`\n✗ Failed to commit: ${error}`);
    process.exit(1);
}
