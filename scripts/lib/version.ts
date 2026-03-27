/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

export const VERSION_TYPES = ["dev", "preview", "dp", "patch", "minor", "major"] as const;
export type VersionType = (typeof VERSION_TYPES)[number];

/**
 * Recursively finds all package.json files in the project.
 *
 * @param dir - Directory to search
 * @param fileList - Accumulator for found files
 * @returns Array of package.json file paths
 */
export function findPackageJsonFiles(dir: string, fileList: string[] = []): string[] {
    const files = readdirSync(dir);

    for (const file of files) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
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
 * Reads the current version from the root package.json.
 *
 * @param rootDir - Root directory of the project
 * @returns Current version string
 */
export function getCurrentVersion(rootDir: string): string {
    const rootPkg = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf-8")) as { version: string };
    return rootPkg.version;
}

/**
 * Parses a semver version string into its components.
 *
 * @param version - Full version string (e.g. "1.0.0-dev")
 * @returns Object with major, minor, patch numbers and the base string
 */
export function parseBaseVersion(version: string): { major: number; minor: number; patch: number; base: string } {
    const base = version.replace(/-.*$/, "");
    const [major, minor, patch] = base.split(".").map(Number);
    return { major, minor, patch, base };
}

/**
 * Generates a timestamped preview version.
 *
 * @param base - Base version (e.g. "1.0.0")
 * @returns Timestamped preview version (e.g. "1.0.0-preview.20260327.1430")
 */
function generatePreviewVersion(base: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${base}-preview.${year}${month}${day}.${hours}${minutes}`;
}

/**
 * Determines the next dp (developer preview) number by inspecting existing git tags.
 *
 * @param base - Base version (e.g. "1.0.0")
 * @returns Next dp number (0 if no previous dp tags exist)
 */
function getNextDpNumber(base: string): number {
    try {
        const output = execSync(`git tag --list "release/${base}-dp.*"`, { encoding: "utf-8" });
        const numbers = output
            .trim()
            .split("\n")
            .filter(Boolean)
            .map((tag) => parseInt(tag.replace(`release/${base}-dp.`, ""), 10))
            .filter((n) => !isNaN(n));
        return numbers.length > 0 ? Math.max(...numbers) + 1 : 0;
    } catch {
        return 0;
    }
}

/**
 * Computes the target version based on the version type.
 *
 * @param type - Version type
 * @param currentVersion - Current version from root package.json
 * @returns Computed version string
 */
export function computeVersion(type: VersionType, currentVersion: string): string {
    const { major, minor, patch, base } = parseBaseVersion(currentVersion);

    switch (type) {
        case "dev":
            return `${base}-dev`;
        case "preview":
            return generatePreviewVersion(base);
        case "dp":
            return `${base}-dp.${getNextDpNumber(base)}`;
        case "patch":
            return `${major}.${minor}.${patch + 1}`;
        case "minor":
            return `${major}.${minor + 1}.0`;
        case "major":
            return `${major + 1}.0.0`;
    }
}

/**
 * Updates all package.json files in the project with the given version.
 *
 * @param rootDir - Root directory of the project
 * @param version - Version to set
 * @returns List of relative paths of updated files
 */
export function updateAllPackageJsonFiles(rootDir: string, version: string): string[] {
    const packageJsonFiles = findPackageJsonFiles(rootDir);

    if (packageJsonFiles.length === 0) {
        throw new Error("No package.json files found in the project");
    }

    const updatedFiles: string[] = [];
    for (const filePath of packageJsonFiles) {
        try {
            const pkg = JSON.parse(readFileSync(filePath, "utf-8")) as { version?: string };
            if (pkg.version !== undefined) {
                pkg.version = version;
                writeFileSync(filePath, JSON.stringify(pkg, null, 4) + "\n");
                const relativePath = filePath.replace(rootDir + "/", "");
                updatedFiles.push(relativePath);
            }
        } catch (error) {
            console.warn(`Warning: Failed to update ${filePath}: ${error}`);
        }
    }

    return updatedFiles;
}

/**
 * Stages and commits the given files with the provided message.
 *
 * @param rootDir - Root directory of the project
 * @param files - Relative file paths to stage
 * @param message - Commit message
 */
export function commitFiles(rootDir: string, files: string[], message: string): void {
    for (const file of files) {
        execSync(`git add "${file}"`, { cwd: rootDir });
    }
    execSync(`git commit -m "${message}"`, { cwd: rootDir, stdio: "inherit" });
}
