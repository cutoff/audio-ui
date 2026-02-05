#!/usr/bin/env node

/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
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
 * Syncs version across all package.json files in the monorepo.
 * Gets the version from the root package.json and applies it to all packages.
 */
function syncMonorepoVersions(): void {
    // Read root package.json to get the version
    const rootPackageJsonPath = join(process.cwd(), "package.json");
    const rootPackage = JSON.parse(readFileSync(rootPackageJsonPath, "utf-8")) as { version?: string };
    const version = rootPackage.version;

    if (!version) {
        throw new Error("No version found in root package.json");
    }

    // Find all package.json files
    const packageJsonFiles = findPackageJsonFiles(process.cwd());

    // Update all package.json files (except root, which is already updated by release-it)
    const updatedFiles: string[] = [];
    for (const filePath of packageJsonFiles) {
        // Skip root package.json as release-it already updated it
        if (filePath === rootPackageJsonPath) {
            continue;
        }

        try {
            const pkg = JSON.parse(readFileSync(filePath, "utf-8")) as { version?: string };
            // Only update if the package has a version field
            if (pkg.version !== undefined) {
                pkg.version = version;
                writeFileSync(filePath, JSON.stringify(pkg, null, 2) + "\n");
                const relativePath = filePath.replace(process.cwd() + "/", "");
                updatedFiles.push(relativePath);
            }
        } catch (error) {
            console.warn(`Warning: Failed to update ${filePath}: ${error}`);
        }
    }

    if (updatedFiles.length > 0) {
        console.log(`✓ Synced version ${version} to ${updatedFiles.length} package(s):`);
        for (const file of updatedFiles) {
            console.log(`    - ${file}`);
        }
    }
}

syncMonorepoVersions();
