<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

# Coding Conventions

**Meta**: Agent-optimized guidelines for consistent code style. Focus on Prettier-enforced formatting; apply via
`pnpm format`. For tasks, grep for "Quick Rules" or rules like RULE-FMT-001.

## Quick Rules Summary (Load This First)

| Category                    | Rule                                                                              |
| --------------------------- | --------------------------------------------------------------------------------- |
| Indentation                 | 4 spaces (not tabs)                                                               |
| Line Length                 | Maximum 120 characters                                                            |
| Braces                      | Opening on same line; closing aligned                                             |
| Spacing                     | After keywords/operators/commas; no space before function parens or object colons |
| Strings                     | Double quotes (`"`) for strings; template literals for interpolation/multi-line   |
| Semicolons                  | Required at end of all statements (.ts, .tsx, .js, .jsx)                          |
| Naming: Variables/Functions | camelCase                                                                         |
| Naming: Classes/Interfaces  | PascalCase                                                                        |
| Naming: Constants           | UPPER_SNAKE_CASE for true constants; camelCase for non-reassigned                 |
| Imports                     | Grouped: React > third-party > project absolute > relative > CSS                  |

## Formatting

**Indentation**: 4 spaces (not tabs). Prettier handles automatically.

- **Line Length**: Maximum 120 characters.
- **Braces**:
  - Opening brace on same line as statement.
  - Closing brace aligned with original statement.
- **Spacing**:
  - Space after keywords (`if`, `for`, `while`).
  - Space around operators (`+`, `-`, `=`, etc.).
  - No space between function name and parentheses.
  - Space after commas in argument lists.
  - No space after property name and before colon in objects; space after colon (e.g., `{width: 50}`).
- **String Literals**:
  - Double quotes (`"`) for strings.
  - Template literals (backticks) for interpolation or multi-line.
- **Line Breaks**:
  - After opening brace.
  - Before closing brace.
  - After semicolons.
- **Semicolons**: Required at end of all statements (.ts, .tsx, .js, .jsx).
- **Trailing Commas**: ES5 style (where valid).
- **Arrow Functions**: Always use parentheses around parameters.

> **Note**: Prettier + Tailwind plugin (`prettier-plugin-tailwindcss`) enforces most via `pnpm format`. See
> `.prettierrc.json` for project settings.

## Naming Conventions

- **Variables/Functions**: camelCase.
- **Classes/Interfaces**: PascalCase.
- **Constants**: UPPER_SNAKE_CASE for true constants; camelCase for non-reassigned variables.
- **Private Properties**: camelCase (no underscore prefix).
- **Type Parameters**: PascalCase (e.g., `T`, `K` or descriptive with 'T' suffix).
- **Enum Members**: PascalCase.
- **File Names**: Match main export (PascalCase for components/classes).
- **Interfaces**: PascalCase (no "I" prefix, e.g., `EmailService`).
- **Error Classes**: PascalCase as `<Domain>Error` (e.g., `EmailServiceError`).

## Code Organization

- **Imports**: Grouped and sorted:
  1. React/React-related.
  2. Third-party libraries.
  3. Project (absolute paths).
  4. Project (relative paths).
  5. CSS/style imports.
- **Component Structure**:
  1. Type definitions/interfaces.
  2. JSDoc documentation.
  3. Component function.
  4. Helper functions/hooks.
  5. Default export.
- **Props**: Destructured in parameters with defaults.

## Class-Based Patterns

- **Constructor Injection**: Dependencies via constructor (e.g., `constructor(private dao: WaitlistDao)`).
- **Private Properties**: Use private fields for dependencies/state.
- **Method Naming**: Public: camelCase for business ops; private: internal logic.
- **Interface Implementation**: Use `implements` clause.
- **Exception Handling**: Throw custom errors (no return-based errors).
- **Class Organization**:
  1. Interface (if separate).
  2. Class with `implements`.
  3. Constructor with injection.
  4. Public methods.
  5. Private helpers.
- **Dependency Injection**: Constructor over setter/manual.

**Agent Note**: For code edits, apply Quick Rules first; validate with `pnpm lint` and `diagnostics`.
