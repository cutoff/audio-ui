<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 See LICENSE.md for details.
-->

**Version**: 1.0 | **Meta**: Outlines the project's versioning strategy, based on Semantic Versioning (SemVer) 2.0.0, with specific conventions for the developer preview phase.

## 1. Core Principles: Semantic Versioning

This project adheres to **Semantic Versioning (SemVer) 2.0.0**. All version numbers follow the `MAJOR.MINOR.PATCH` format.

- **MAJOR** version for incompatible API changes.
- **MINOR** version for adding functionality in a backward-compatible manner.
- **PATCH** version for backward-compatible bug fixes.

## 2. Developer Preview Phase

The project is currently in a **Developer Preview** phase, which introduces a pre-release identifier to the standard SemVer format.

**Note**: During the developer preview phase, backward compatibility is **not** a concern. Breaking changes are expected and acceptable. The SemVer definitions above apply to future stable releases, not to the current development phase.

### 2.1. Development Versions (Maven-like Policy)

During development, the project uses a **single development suffix** following a Maven-like policy:

- **Format**: `{next-stable-version}-dev`
- **Example**: `1.0.0-dev`
- **Usage**: Set automatically for all development branches
- **Command**: `pnpm version:dev`

**Breakdown**:

- `1.0.0`: The target version for the first stable release.
- `-dev`: The development suffix (equivalent to Maven's `-SNAPSHOT`).

**Versioning Rules**:

- **All development branches**: Use `1.0.0-dev`
  - This includes `develop`, `staging`, `feature/*`, `bugfix/*`, `hotfix/*`, etc.
  - No distinction between branch types - all use the same `-dev` suffix

**Rationale**: This Maven-like approach provides:

- Simplicity: One suffix for all development work
- Familiarity: Similar to Maven's `-SNAPSHOT` convention
- Clarity: Clear distinction between development (`-dev`) and release versions
- Professional versioning that reflects the development context
- Automatic version management without manual updates

### 2.2. Preview Channel (npm Releases)

For npm releases, the project uses a **preview channel** with timestamped versions:

- **Format**: `1.0.0-preview.YYYYMMDD.HHMM`
- **Example**: `1.0.0-preview.20260123.0958`
- **npm Dist-Tag**: `preview`
- **Installation**: `npm install @cutoff/audio-ui-react@preview`
- **Command**: `pnpm release:preview` (generates timestamped version and creates release using release-it)

**Breakdown**:

- `1.0.0`: The target version for the first stable release. All preview releases are considered pre-releases of this target.
- `-preview`: The pre-release identifier, signifying "Preview" release.
- `.YYYYMMDD.HHMM`: Timestamp in dot-separated format (date and time) for unique, sortable version identifiers.

**Why dot-separated timestamps**: SemVer 2.0.0 sorts dot-separated pre-release identifiers correctly, ensuring newer timestamps are treated as newer versions. This enables continuous releases without manual version management.

**Workflow**:

1. During development: Use branch-based versions (`1.0.0-dev`)
2. Before npm release: Run `pnpm release:preview` to generate timestamped version and create release
3. Release-it automatically:
   - Generates timestamped version (`1.0.0-preview.YYYYMMDD.HHMM`)
   - Updates all package.json files in the monorepo
   - Generates changelog entry from git diff
   - Creates git tag
4. Publish to npm: Use the timestamped preview version (with `--npm.publish` flag if needed)
5. After release: Return to branch-based versioning for continued development using `pnpm version:dev`

### 2.3. Developer Preview Releases (dp.0+)

When ready for the first Developer Preview release:

- **Format**: `1.0.0-dp.X`
- **Example**: `1.0.0-dp.0`, `1.0.0-dp.1`, etc.
- **npm Dist-Tag**: `preview` (continues to be used)

**Breakdown**:

- `1.0.0`: The target version for the first stable release.
- `-dp`: The pre-release identifier, signifying "Developer Preview".
- `.X`: A numeric, dot-separated value that increments with each preview release (starting at `.0`).

**The Importance of Dot Notation**:

The dot (`.`) separating the identifier (`dp`) from the number (`X`) is **mandatory**.

- **Reason**: SemVer-compliant package managers (like npm and pnpm) correctly interpret dot-separated numeric identifiers for sorting.
  - **Correct (`-dp.X`)**: `1.0.0-dp.9` is correctly treated as being **less than** `1.0.0-dp.10`.
  - **Incorrect (`-dpX`)**: Without the dot, `1.0.0-dp9` would be incorrectly treated as **greater than** `1.0.0-dp10` due to lexicographical (alphabetical) comparison.

### 2.4. Release Progression

1.  **Development Versions**:
    - Branch-based versions: `1.0.0-dev`
    - Used during active development
    - Set automatically via `pnpm version:dev`
    - Not published to npm

2.  **Preview Releases (npm)**:
    - Timestamped versions: `1.0.0-preview.YYYYMMDD.HHMM`
    - Created via `pnpm release:preview` using release-it
    - Automatically generates changelog from git diff
    - Published to npm with `preview` dist-tag (with `--npm.publish` flag)
    - Used for continuous releases and testing
    - Working toward first Developer Preview release (dp.0)

3.  **Developer Preview Releases**:
    - When ready, transition to numbered releases: `1.0.0-dp.0`, `1.0.0-dp.1`, etc.
    - Created via `pnpm release:dp` using release-it
    - Automatically increments: `1.0.0-dp.0` → `1.0.0-dp.1`
    - Automatically generates changelog from git diff
    - Still published with `preview` dist-tag (with `--npm.publish` flag)
    - Used for gathering feedback and testing before a stable release

4.  **Stable Release**:
    - To transition from developer preview to the first stable release, remove the entire `-dp.X` pre-release suffix.
    - The first stable release will be `1.0.0`.
    - Created via `pnpm release patch|minor|major` using release-it
    - Automatically generates changelog from git diff
    - Published with `latest` dist-tag (default, with `--npm.publish` flag)

## 3. Post-1.0.0 Versioning

After the initial `1.0.0` stable release, all versioning will strictly follow the SemVer `MAJOR.MINOR.PATCH` rules. Pre-release identifiers (like `-alpha.1`, `-beta.1`, `-rc.1`) may be used for subsequent major or minor releases.
