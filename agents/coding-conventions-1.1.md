# Coding Conventions (JetBrains Defaults)

This document outlines JetBrains' default coding conventions for JavaScript and TypeScript. Adhering to these
conventions ensures code consistency and readability across projects. Prettier is configured with explicit project-wide
formatting options (see `.prettierrc.json`) and Tailwind CSS class sorting; the conventions below remain the source of truth
for any rules not enforced automatically.

## Version History

_For maintenance purposes only_

- Version 1.1 - 2025-10-09: Added class-based patterns, dependency injection conventions, and exception handling guidelines
- Version 1.0 - 2025-09-13: Initial version

## Formatting

- **Indentation**: 4 spaces (not tabs)
- **Line length**: Maximum 120 characters
- **Braces**:
    - Opening brace on the same line as the statement
    - Closing brace aligned with the original statement
- **Spacing**:
    - Space after keywords (`if`, `for`, `while`, etc.)
    - Space around operators (`+`, `-`, `=`, etc.)
    - No space between function name and parentheses
    - Space after commas in argument lists
    - No space after property name and before colon in object literals, but space after colon: `{width: 50}`
- **String literals**:
    - Use double quotes (`"`) rather than single quotes (`'`) for string literals
    - Use template literals (backticks) when string interpolation is needed or for multi-line strings
- **Line breaks**:
    - Line break after opening brace
    - Line break before closing brace
    - Line break after semicolons
- **Semicolons**: Required at the end of statements in all files (.ts, .tsx, .js, .jsx)
- **Trailing commas**: Use ES5 trailing comma style (trailing commas where valid in ES5)
- **Arrow functions**: Always use parentheses around arrow function parameters
- **Control structures**:
    - Switch-case statements have cases indented inside the switch block
    - Case blocks are further indented inside each case

> **Note**: The project uses Prettier for automated formatting and Tailwind CSS class sorting via `prettier-plugin-tailwindcss`.
> Run `pnpm format` to format all files. The Prettier configuration in `.prettierrc.json` defines the standard project formatting.
> Follow this document for any conventions not covered by Prettier.

## Naming Conventions

- **Variables and functions**: camelCase
- **Classes and interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE for true constants, camelCase for variables that won't be reassigned
- **Private properties**: camelCase with no underscore prefix
- **Type parameters**: PascalCase, typically single letters (T, K, V) or descriptive names with a 'T' suffix
- **Enum members**: PascalCase
- **File names**: Match the main export, typically PascalCase for components and classes
- **Interfaces**: PascalCase without "I" prefix (e.g., `EmailService`, not `IEmailService`)
- **Error classes**: PascalCase following pattern `<Domain>Error` (e.g., `EmailServiceError`)

## Code Organization

- **Imports**: Grouped and sorted:
    1. React and React-related imports
    2. Third-party library imports
    3. Project imports (absolute paths)
    4. Project imports (relative paths)
    5. CSS/style imports
- **Component structure**:
    1. Type definitions and interfaces
    2. JSDoc component documentation
    3. Component function
    4. Helper functions and hooks
    5. Default export
- **Props**: Destructured in function parameters with default values

## Class-Based Patterns

- **Constructor injection**: Dependencies injected via constructor parameters (e.g., `constructor(private dao: WaitlistDao)`)
- **Private properties**: Use private fields for injected dependencies and internal state
- **Method naming**: Public methods for business operations (camelCase), private methods for internal logic
- **Interface implementation**: Explicitly implement interfaces with `implements` clause
- **Exception handling**: Throw custom error classes instead of returning error objects
- **Class organization**:
    1. Interface definition (if separate file)
    2. Class declaration with implements
    3. Constructor with dependency injection
    4. Public business methods
    5. Private helper methods
- **Dependency injection**: Prefer constructor injection over setter injection or manual wiring
