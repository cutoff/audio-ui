#!/usr/bin/env node

/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 * See LICENSE.md for details.
 */

import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

/**
 * Gets the last git tag, or returns null if no tags exist.
 * Release tags follow the format: release/{version} (e.g., release/1.0.0-preview.20260123.1117)
 *
 * @returns {string|null} The last release tag or null
 */
function getLastTag() {
  try {
    const tags = execSync("git tag --sort=-version:refname", {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .trim()
      .split("\n")
      .filter((tag) => tag.length > 0 && tag.startsWith("release/"));

    return tags.length > 0 ? tags[0] : null;
  } catch (error) {
    return null;
  }
}

/**
 * Gets the initial commit hash.
 *
 * @returns {string} The initial commit hash
 */
function getInitialCommit() {
  try {
    return execSync("git rev-list --max-parents=0 HEAD", {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch (error) {
    throw new Error("Failed to get initial commit");
  }
}

/**
 * Gets the list of changed files from git diff.
 *
 * @param {string} from - Starting commit/tag
 * @param {string} to - Ending commit/tag (default: HEAD)
 * @returns {string[]} Array of changed file paths with status
 */
function getChangedFiles(from, to = "HEAD") {
  try {
    const diff = execSync(`git diff ${from}..${to} --name-status`, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return diff
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch (error) {
    throw new Error(`Failed to get git diff: ${error.message}`);
  }
}

/**
 * Categorizes changes into Added, Changed, Fixed, Removed based on file paths and changes.
 *
 * @param {string[]} changedFiles - Array of changed file paths with status
 * @returns {Object} Categorized changes
 */
function categorizeChanges(changedFiles) {
  const categories = {
    Added: [],
    Changed: [],
    Fixed: [],
    Removed: [],
  };

  for (const line of changedFiles) {
    const match = line.match(/^([AMD])\s+(.+)$/);
    if (!match) continue;

    const [, status, file] = match;
    const relativePath = file.replace(/^packages\//, "").replace(/^apps\//, "");

    // Skip non-source files for categorization
    if (
      !file.includes("/src/") &&
      !file.endsWith(".tsx") &&
      !file.endsWith(".ts") &&
      !file.endsWith(".js") &&
      !file.endsWith(".jsx")
    ) {
      continue;
    }

    // Categorize based on status
    if (status === "A") {
      // Added
      categories.Added.push(relativePath);
    } else if (status === "M") {
      // Modified
      categories.Changed.push(relativePath);
    } else if (status === "D") {
      // Deleted
      categories.Removed.push(relativePath);
    }
  }

  // Filter out empty categories
  const result = {};
  for (const [key, value] of Object.entries(categories)) {
    if (value.length > 0) {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Formats changes into Keep a Changelog format.
 *
 * @param {Object} changes - Categorized changes
 * @returns {string} Formatted changelog entry
 */
function formatChangelogEntry(changes) {
  let entry = "";

  if (changes.Added && changes.Added.length > 0) {
    entry += "### Added\n\n";
    for (const item of changes.Added.slice(0, 20)) {
      entry += `- ${item}\n`;
    }
    if (changes.Added.length > 20) {
      entry += `- ... and ${changes.Added.length - 20} more files\n`;
    }
    entry += "\n";
  }

  if (changes.Changed && changes.Changed.length > 0) {
    entry += "### Changed\n\n";
    for (const item of changes.Changed.slice(0, 20)) {
      entry += `- ${item}\n`;
    }
    if (changes.Changed.length > 20) {
      entry += `- ... and ${changes.Changed.length - 20} more files\n`;
    }
    entry += "\n";
  }

  if (changes.Fixed && changes.Fixed.length > 0) {
    entry += "### Fixed\n\n";
    for (const item of changes.Fixed) {
      entry += `- ${item}\n`;
    }
    entry += "\n";
  }

  if (changes.Removed && changes.Removed.length > 0) {
    entry += "### Removed\n\n";
    for (const item of changes.Removed) {
      entry += `- ${item}\n`;
    }
    entry += "\n";
  }

  return entry.trim();
}

/**
 * Generates a changelog entry for the current version based on git diff.
 *
 * @param {string} version - The version to generate changelog for
 * @returns {string} The changelog entry
 */
function generateChangelogEntry(version) {
  const lastTag = getLastTag();
  const from = lastTag || getInitialCommit();

  console.log(`Generating changelog from ${from} to HEAD for version ${version}...`);

  const changedFiles = getChangedFiles(from);
  if (changedFiles.length === 0) {
    return "### Changed\n\n- No changes detected\n";
  }

  const changes = categorizeChanges(changedFiles);
  const entry = formatChangelogEntry(changes);

  if (!entry) {
    return "### Changed\n\n- Minor updates and improvements\n";
  }

  return entry;
}

/**
 * Adds a new version section to CHANGELOG.md.
 *
 * @param {string} version - The version number
 * @param {string} changelogEntry - The changelog entry content
 */
function addChangelogEntry(version, changelogEntry) {
  const changelogPath = join(process.cwd(), "CHANGELOG.md");
  const changelog = readFileSync(changelogPath, "utf-8");

  // Get current date
  const date = new Date().toISOString().split("T")[0];

  // Create new version section
  const newSection = `## [${version}] - ${date}\n\n${changelogEntry}\n\n`;

  // Insert after the header (after line 6, which is the blank line after "and this project adheres to...")
  const lines = changelog.split("\n");
  const headerEndIndex = lines.findIndex(
    (line, index) => index > 0 && line.includes("Semantic Versioning")
  );

  const insertIndex = headerEndIndex + 2; // After the blank line after the header

  lines.splice(insertIndex, 0, newSection);

  writeFileSync(changelogPath, lines.join("\n"));
  console.log(`✓ Added changelog entry for version ${version}`);
}

// Main execution
const version = process.argv[2];
if (!version) {
  console.error("Usage: node scripts/generate-changelog.js <version>");
  process.exit(1);
}

try {
  const changelogEntry = generateChangelogEntry(version);
  addChangelogEntry(version, changelogEntry);
} catch (error) {
  console.error(`Error generating changelog: ${error.message}`);
  process.exit(1);
}
