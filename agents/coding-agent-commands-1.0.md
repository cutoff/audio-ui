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
