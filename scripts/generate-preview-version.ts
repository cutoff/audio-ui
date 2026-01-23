#!/usr/bin/env node

/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

/**
 * Recursively finds all package.json files in the project.
 *
 * @param dir - Directory to search
 * @param fileList - Accumulator for found files
 * @returns Array of package.json file paths
 */
function findPackageJsonFiles(dir: string, fileList: string[] = []): string[] {
    const files = readdirSync(dir);

    for (const file of files) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            // Skip node_modules and other common directories
            if (
                file === "node_modules" ||
                file === ".git" ||
                file === "dist" ||
                file === ".next" ||
                file === ".turbo" ||
                file.startsWith(".")
            ) {
                continue;
            }
            findPackageJsonFiles(filePath, fileList);
        } else if (file === "package.json") {
            fileList.push(filePath);
        }
    }

    return fileList;
}

/**
 * Generates a timestamped preview version for npm releases and updates all package.json files.
 *
 * This script is used when preparing a release to npm. For development versions,
 * use `pnpm version:dev` instead, which sets the -dev suffix.
 *
 * Format: 1.0.0-preview.YYYYMMDD.HHMM
 * Example: 1.0.0-preview.20260123.0958
 *
 * Updates all package.json files in the project (root, packages, apps).
 *
 * @throws {Error} If package.json files cannot be read or written
 */
function generatePreviewVersion() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const timestamp = `${year}${month}${day}.${hours}${minutes}`;
    const version = `1.0.0-preview.${timestamp}`;

    // Find all package.json files in the project
    const rootDir = process.cwd();
    const packageJsonFiles = findPackageJsonFiles(rootDir);

    if (packageJsonFiles.length === 0) {
        throw new Error("No package.json files found in the project");
    }

    // Update all package.json files
    const updatedFiles: string[] = [];
    for (const filePath of packageJsonFiles) {
        try {
            const pkg = JSON.parse(readFileSync(filePath, "utf-8")) as { version?: string };
            // Only update if the package has a version field
            if (pkg.version !== undefined) {
                pkg.version = version;
                writeFileSync(filePath, JSON.stringify(pkg, null, 4) + "\n");
                // Store relative path for display
                const relativePath = filePath.replace(rootDir + "/", "");
                updatedFiles.push(relativePath);
            }
        } catch (error) {
            console.warn(`Warning: Failed to update ${filePath}: ${error}`);
        }
    }

    console.log(`✓ Generated version: ${version}`);
    console.log(`  Updated ${updatedFiles.length} package.json file(s):`);
    for (const file of updatedFiles) {
        console.log(`    - ${file}`);
    }
    return version;
}

generatePreviewVersion();
