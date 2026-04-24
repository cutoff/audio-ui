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
- **Command**: `pnpm run version dev` (primitive) or `pnpm release:dev` (bumps and auto-commits)

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

### 2.2. Unstable Channel (develop Auto-Publish)

Every qualifying push to `develop` auto-publishes a snapshot to npm under the `unstable` dist-tag.

- **Format**: `1.0.0-unstable.YYYYMMDD.HHMM.<shortsha>`
- **Example**: `1.0.0-unstable.20260424.1530.a1b2c3d`
- **npm Dist-Tag**: `unstable`
- **Installation**: `npm install @cutoff/audio-ui-react@unstable`
- **Trigger**: the `publish-unstable` job in `.github/workflows/publish.yml` on push to `develop` when `packages/**`, workspace manifests, or build config change.
- **Committed version on `develop`**: stays at `1.0.0-dev`. The unstable version is computed in CI (`pnpm run version unstable`), applied to all `package.json` files for the publish, and never committed back.

**Why the workflow is consolidated with milestone publishing**: npm allows only one Trusted Publisher per package, so both milestone (`main`) and unstable (`develop`) publishes run from the same workflow file (`publish.yml`) to share that single OIDC authorization. Two branch-gated jobs (`publish-milestone` and `publish-unstable`) keep the two flows logically separate.

**Breakdown**:

- `1.0.0`: Target version for the next stable release.
- `-unstable`: Pre-release identifier signifying an ephemeral develop snapshot.
- `.YYYYMMDD.HHMM`: UTC timestamp — ensures a unique, chronologically sortable version even when republishing the same commit.
- `.<shortsha>`: 7-char git short sha — traceable back to the source commit.

**Reliability**: These builds are ephemeral and may break at any time. They exist to unblock downstream consumers who need bleeding-edge changes. `latest` and `preview` are never updated by this workflow.

### 2.3. Preview Channel (npm Releases)

For npm releases, the project uses a **preview channel** with timestamped versions:

- **Format**: `1.0.0-preview.YYYYMMDD.HHMM`
- **Example**: `1.0.0-preview.20260123.0958`
- **npm Dist-Tag**: `preview`
- **Installation**: `npm install @cutoff/audio-ui-react@preview`
- **Command**: `pnpm release:prepare preview` (runs quality checks, bumps version, and auto-commits)

**Breakdown**:

- `1.0.0`: The target version for the first stable release. All preview releases are considered pre-releases of this target.
- `-preview`: The pre-release identifier, signifying "Preview" release.
- `.YYYYMMDD.HHMM`: Timestamp in dot-separated format (date and time) for unique, sortable version identifiers.

**Why dot-separated timestamps**: SemVer 2.0.0 sorts dot-separated pre-release identifiers correctly, ensuring newer timestamps are treated as newer versions. This enables continuous releases without manual version management.

**Workflow**:

1. During development: All branches use `1.0.0-dev`
2. Prepare release: Run `pnpm release:prepare preview` — runs quality checks, bumps all package.json files, and auto-commits
3. Push to `main`: The `publish.yml` CI workflow detects the non-`-dev` version and automatically publishes to npm with the `preview` dist-tag and creates the `release/{version}` git tag
4. After release: Run `pnpm release:dev` to reset to `-dev` and auto-commit

### 2.4. Developer Preview Releases (dp.0+)

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

### 2.5. Release Progression

1.  **Development Versions**:
    - All branches use `1.0.0-dev`
    - Set via `pnpm release:dev` (bumps and auto-commits) or `pnpm run version dev` (bumps only)
    - Not published to npm from local / feature branches

2.  **Unstable Snapshots (develop)**:
    - Auto-published from `develop` by CI
    - Format: `1.0.0-unstable.YYYYMMDD.HHMM.<shortsha>`
    - npm dist-tag: `unstable`
    - The committed version on `develop` remains `1.0.0-dev`; CI computes the unstable version at publish time

3.  **Preview Releases (npm)**:
    - Timestamped versions: `1.0.0-preview.YYYYMMDD.HHMM`
    - Prepared via `pnpm release:prepare preview` (runs quality checks, bumps, auto-commits)
    - Published automatically by CI on push to `main` with `preview` npm dist-tag
    - Used for continuous releases and testing
    - Working toward first Developer Preview release (dp.0)

4.  **Developer Preview Releases**:
    - When ready, transition to numbered releases: `1.0.0-dp.0`, `1.0.0-dp.1`, etc.
    - Prepared via `pnpm release:prepare dp` (auto-increments from existing git tags)
    - Published automatically by CI on push to `main` with `preview` npm dist-tag
    - Used for gathering feedback and testing before a stable release

5.  **Stable Release**:
    - To transition from developer preview to the first stable release, remove the entire `-dp.X` pre-release suffix.
    - The first stable release is `1.0.0`.
    - Prepared via `pnpm release:prepare patch|minor|major`
    - Published automatically by CI on push to `main` with `latest` npm dist-tag

## 3. Post-1.0.0 Versioning

After the initial `1.0.0` stable release, all versioning will strictly follow the SemVer `MAJOR.MINOR.PATCH` rules. Pre-release identifiers (like `-alpha.1`, `-beta.1`, `-rc.1`) may be used for subsequent major or minor releases.
