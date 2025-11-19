**Version**: 1.0 | **Meta**: Outlines the project's versioning strategy, based on Semantic Versioning (SemVer) 2.0.0, with specific conventions for the developer preview phase.

## 1. Core Principles: Semantic Versioning

This project adheres to **Semantic Versioning (SemVer) 2.0.0**. All version numbers follow the `MAJOR.MINOR.PATCH` format.

-   **MAJOR** version for incompatible API changes.
-   **MINOR** version for adding functionality in a backward-compatible manner.
-   **PATCH** version for backward-compatible bug fixes.

## 2. Developer Preview Phase

The project is currently in a **Developer Preview** phase, which introduces a pre-release identifier to the standard SemVer format.

### 2.1. Version Format

-   **Format**: `1.0.0-dp.X`
-   **Example**: `1.0.0-dp.1`, `1.0.0-dp.2`, etc.

**Breakdown**:
-   `1.0.0`: The target version for the first stable release. All developer previews are considered pre-releases of this target.
-   `-dp`: The pre-release identifier, signifying "Developer Preview".
-   `.X`: A numeric, dot-separated value that increments with each preview release.

### 2.2. The Importance of Dot Notation

The dot (`.`) separating the identifier (`dp`) from the number (`X`) is **mandatory**.

-   **Reason**: SemVer-compliant package managers (like npm and pnpm) correctly interpret dot-separated numeric identifiers for sorting.
    -   **Correct (`-dp.X`)**: `1.0.0-dp.9` is correctly treated as being **less than** `1.0.0-dp.10`.
    -   **Incorrect (`-dpX`)**: Without the dot, `1.0.0-dp9` would be incorrectly treated as **greater than** `1.0.0-dp10` due to lexicographical (alphabetical) comparison.

### 2.3. Release Progression

1.  **Developer Preview Releases**:
    -   To release a new developer preview, increment the final number: `1.0.0-dp.1` -> `1.0.0-dp.2`.
    -   This is used for gathering feedback and testing before a stable release.

2.  **Stable Release**:
    -   To transition from developer preview to the first stable release, remove the entire `-dp.X` pre-release suffix.
    -   The first stable release will be `1.0.0`.

## 3. Post-1.0.0 Versioning

After the initial `1.0.0` stable release, all versioning will strictly follow the SemVer `MAJOR.MINOR.PATCH` rules. Pre-release identifiers (like `-alpha.1`, `-beta.1`, `-rc.1`) may be used for subsequent major or minor releases.
