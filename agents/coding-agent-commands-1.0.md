<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

# Agents Commands

This file contains executable commands that can be invoked by the user with simple instructions like "Execute X". Each command defines a specific procedure to be followed by the agent.

## Usage

When a user requests "Execute [CommandName]", the agent should follow the procedure defined for that command in this file.

## Commands

### Review

**Invocation**: "Execute Review"

**Description**: Comprehensive code review procedure to be applied when explicitly asked by the user (typically before a final commit).

**Procedure**:

- Review the code for documentation, readability and performance.
  - Remove debug comments and iteration artifacts. Focus on documentation for external contributors and future maintainers.
  - Apply documentation standards from `agents/documentation-standards-2.0.md`:
    - Ensure all public APIs have comprehensive JSDoc with required tags (`@param`, `@returns`, `@example` where helpful)
    - Add inline comments for non-obvious business logic, domain conventions, and complex algorithms
    - **Verbosity is acceptable when justified** - thorough explanations of complex logic are better than brief, unclear comments
    - Avoid trivial comments that restate obvious code
  - Make sure the code doesn't feel "vibe-coded"
  - Make sure agents instructions and documentation (AGENTS.md and docs/ directories) are up-to-date with the latest changes.
- Make sure no unused imports remain.
- Launch prettier on modified files.
- Iterate on `pnpm check` until all errors are fixed (if any).

#### Documentation Review Guidelines

**Reference**: See `agents/documentation-standards-2.0.md` for complete documentation standards, JSDoc requirements, and detailed examples.

**Quick Checklist for Review:**

1. **JSDoc Coverage**: All public APIs (exported functions, classes, interfaces) must have JSDoc with:
   - `@param` for all parameters
   - `@returns` with description
   - `@example` for complex or non-obvious usage
   - Purpose explanation, not just signature

2. **Inline Comments**: Add comments for:
   - Domain-specific conventions (MIDI, coordinate systems, etc.)
   - Non-obvious business logic or calculations
   - Performance considerations or optimization decisions
   - Edge cases and why they're handled
   - **Verbosity is acceptable when justified** - thorough explanations are better than brief, unclear comments

3. **Remove**:
   - Debug comments and iteration artifacts
   - Comments that restate obvious code
   - Refactoring history or development process notes
   - Section markers that don't add value

**Examples of Good vs Bad Comments:**

See `agents/documentation-standards-2.0.md` for comprehensive examples of:

- Good JSDoc patterns (complete and minimal)
- Good inline comments (verbose but justified)
- Bad comments (trivial, refactoring history, etc.)

### Check

**Invocation**: "Execute Check"

**Description**: Iterate on `pnpm check` until no errors remain.

**Procedure**:

- Run `pnpm check` to identify errors.
- Fix all errors found.
- Repeat until `pnpm check` passes with no errors.

### Release

**Invocation**: "Execute Release"

**Description**: Comprehensive release procedure using release-it for version management, changelog generation, and git tagging.

**Procedure**:

1. **Prompt user for release type**:
   - `preview` - Timestamped preview release (1.0.0-preview.YYYYMMDD.HHMM)
   - `dp` - Numbered developer preview release (1.0.0-dp.X)
   - `patch` - Patch release (1.0.0 → 1.0.1)
   - `minor` - Minor release (1.0.0 → 1.1.0)
   - `major` - Major release (1.0.0 → 2.0.0)

2. **Run quality checks**:
   - Execute `pnpm check` to ensure all tests pass, build succeeds, linting passes, and type checking is clean
   - If checks fail, abort the release and report errors

3. **Generate changelog entry automatically**:
   - Get the last git tag (or initial commit if no tags exist)
   - Generate git diff between last tag and current HEAD using `git diff --name-status`
   - Parse changes and categorize into Added, Changed, Fixed, Removed
   - Format according to Keep a Changelog format
   - Add new version section to `CHANGELOG.md` using `scripts/generate-changelog.js`

4. **Execute release-it**:
   - For `preview`: Generate timestamped version using `scripts/generate-timestamped-preview.js`, then run `release-it --no-increment --preRelease=preview`
   - For `dp`: Run `release-it --preRelease=dp`
   - For `patch`/`minor`/`major`: Run `release-it ${type}` (e.g., `release-it patch`)
   - **Important**: Agent must never execute git modifying commands (commit, push, reset, etc.) without explicit user approval. Release-it will handle git tagging, but the agent should not commit or push automatically.

5. **Post-release cleanup** (if needed):
   - After successful release, optionally reset to `-dev` version using `pnpm version:dev` if continuing development
   - This step should be confirmed with the user

**Important Notes**:

- The agent must never execute git modifying commands (commit, push, reset, etc.) without explicit user approval
- Release-it handles git tagging automatically as part of its workflow
- Release tags follow the format: `release/{version}` (e.g., `release/1.0.0-preview.20260123.1117`)
- All package.json files (root, packages, apps) are automatically synchronized to the same version
- Changelog is auto-generated from git diff between last release tag and current state
- Publishing to npm is disabled by default in release-it config; enable with `--npm.publish` flag if needed
