# Coding Conventions (JetBrains Defaults)

This document outlines JetBrains' default coding conventions for JavaScript and TypeScript. Adhering to these
conventions ensures code consistency and readability across projects. These conventions are enforced by Prettier
using the configuration in `.prettierrc.json` at the project root.

## Version History

*For maintenance purposes only*

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
    
> **Note**: The project uses Prettier for automated code formatting. Run `pnpm prettier --write .` to format all files
> according to these conventions. Prettier configuration is defined in `.prettierrc.json` at the project root.

## Naming Conventions

- **Variables and functions**: camelCase
- **Classes and interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE for true constants, camelCase for variables that won't be reassigned
- **Private properties**: camelCase with no underscore prefix
- **Type parameters**: PascalCase, typically single letters (T, K, V) or descriptive names with a 'T' suffix
- **Enum members**: PascalCase
- **File names**: Match the main export, typically PascalCase for components

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
