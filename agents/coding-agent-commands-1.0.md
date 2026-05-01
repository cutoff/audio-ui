<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
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
- **Performance regression check** — audio/MIDI runtime is performance-critical (see "Performance Mandate" in root `AGENTS.md`). Treat any bench regression as a real issue, not noise — CodSpeed measurements are deterministic.
  - Open the CodSpeed dashboard for this repo (link in root `AGENTS.md` → "Performance & Benchmarks").
  - Locate the most recent run for the current branch. Compare against the prior commit on the same branch (or against `develop` if reviewing a feature branch) using **Compare Any Runs**.
  - Flag any benchmark with > 2% instruction-count regression and investigate before approving the review. Use the flamegraph to attribute the delta to a specific function.
  - If the touched code path is not yet covered by a benchmark, note it as a follow-up — do not block the review.
- Make sure no unused imports remain.
- Launch prettier on modified files.
- Execute "check"
- Ensure `docs/releases/next.md` is updated for the latest changes (new features, breaking changes, improvements, fixes). If recent work is not yet reflected there, add or amend the relevant section(s). See `docs/releases/AGENTS.md`.

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

**Description**: Iterate on `pnpm check` until no errors remain, and ensure release notes are up to date.

**Procedure**:

- Run `pnpm check` to identify errors.
- Fix all errors found.
- Ensure `docs/releases/next.md` is up to date and sections are in reverse chronological order (most recent first). See `docs/releases/AGENTS.md`.
- Repeat until `pnpm check` passes with no errors and release notes are current.

### Create Issue

**Invocation**: "Execute Create Issue"

**Description**: Report a previously discussed issue to GitHub Issues using the GitHub MCP server. Use when the user wants to turn a discussed topic into a tracked issue.

**Procedure**: Follow the **Create Issue** section in `agents/github-issues-guidelines-1.0.md`.

### Update Issue

**Invocation**: "Execute Update Issue"

**Description**: Update an existing GitHub issue so that progression is visible and decisions are documented, using the GitHub MCP server.

**Procedure**: Follow the **Update Issue** section in `agents/github-issues-guidelines-1.0.md`.

### Close Issue

**Invocation**: "Execute Close Issue"

**Description**: Add a final comment summarizing the work done and close the issue as completed, using the GitHub MCP server.

**Procedure**: Follow the **Close Issue** section in `agents/github-issues-guidelines-1.0.md`.

### Fix Issue

**Invocation**: "Execute Fix Issue" with an issue number or issue URL (e.g. "Execute Fix Issue 42" or "Execute Fix Issue https://github.com/owner/repo/issues/42").

**Description**: Read the GitHub issue (description, status, history), then produce a concrete plan to fix it. No code changes, commits, or GitHub updates are performed unless the user explicitly requests them.

**Reference**: Repository resolution and git/GitHub rules as in `agents/github-issues-guidelines-1.0.md` and root `AGENTS.md` (Git Operations, GitHub Operations).

**Procedure**:

1. **Resolve repository and issue**:
   - **Repository**: Current git repo from `git remote -v` unless the user provides an issue URL that implies another repository. Derive `owner` and `repo` from the remote URL. See `agents/github-issues-guidelines-1.0.md` (Repository).
   - **Issue**: Parse the user input for an issue number or a full issue URL; if URL is given, extract `owner`, `repo`, and issue number from it.

2. **Read the issue** (GitHub MCP):
   - Fetch issue details: `issue_read` with `method: "get"` (title, body, state, labels, assignees, etc.).
   - Fetch comments and history: `issue_read` with `method: "get_comments"` (and optionally further methods such as `get_labels` if needed).
   - If the issue references a pull request, optionally fetch PR details (e.g. `pull_request_read` with `method: "get"` or `get_files`) for context.

3. **Summarize and plan**:
   - Summarize the issue: problem statement, expected vs actual (if applicable), current status (open/closed), and any decisions or constraints from comments.
   - Propose a **fix plan**: ordered steps (e.g. files to touch, approach, tests), assumptions, and any open questions. Do not execute git commands (branch, commit, push) or GitHub write operations (comment, close, assign) unless the user explicitly asks to do so.

4. **Git and GitHub guidelines**:
   - Follow root `AGENTS.md` git and GitHub rules: do not run modifying git commands (`commit`, `merge`, `reset`, etc.) or update GitHub (comments, close issue, create/update PR) without explicit user request.
   - After presenting the plan, the user may ask to proceed with implementation or with specific git/GitHub actions; only then perform those actions with confirmation as per project rules.
