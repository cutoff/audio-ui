# TypeScript Guidelines

This document outlines best practices and recommendations for TypeScript development. Following these guidelines ensures
type safety, code quality, and maintainability across projects.

## Version History

_For maintenance purposes only_

- Version 1.2 - 2025-10-09: Added class-based patterns, dependency injection guidelines, and exception handling for services package architecture
- Version 1.1 - 2025-10-03: Added strict linting rules, error handling patterns, and ESLint integration guidelines
- Version 1.0 - 2025-09-13: Initial version

## TypeScript Configuration

A strict TypeScript configuration is recommended with the following settings:

- `strict: true` - Enables all strict type checking options
- `noUnusedLocals: true` - Reports errors on unused locals
- `noUnusedParameters: true` - Reports errors on unused parameters
- `noImplicitReturns: true` - Reports error when not all code paths in function return a value

## TypeScript Best Practices

- **Type annotations**: Use explicit type annotations for function parameters and return types
- **Interfaces vs Types**: Prefer interfaces for object shapes, types for unions/intersections
- **Generics**: Use generics with constraints when appropriate
- **Optional properties**: Use the `?` operator for optional properties
- **Null handling**: Avoid `null`, prefer `undefined` for optional values
- **Type assertions**: Use `as` syntax rather than angle brackets

## Common TypeScript Issues and Solutions

- **Unused parameters**: Prefix with underscore (e.g., `_props`) to avoid TypeScript errors
- **Type conflicts**: Ensure consistent type definitions across the project
- **Missing properties**: Check interface definitions for required properties
- **Type narrowing**: Use type guards to narrow types in conditional blocks
- **Custom error classes**: Extend `Error` for domain-specific exceptions with proper inheritance

## Type Declaration Files

- Create declaration files (`.d.ts`) for third-party libraries without TypeScript definitions
- Include JSDoc comments in declaration files to provide usage documentation
- Use module augmentation to extend existing type definitions when necessary

## Class-Based Patterns

- **Interfaces over classes for contracts**: Define interfaces (e.g., `EmailService`) for service contracts, implement with classes (e.g., `ResendEmailService`)
- **Dependency injection via constructors**: Inject dependencies as constructor parameters; avoid singleton patterns
- **Exception-based error handling**: Throw custom error classes (e.g., `EmailServiceError`) instead of returning error objects
- **Private methods for encapsulation**: Use private/protected methods for internal logic; expose only public business methods

### Interface Guidelines

- Name interfaces with simple names (e.g., `EmailService`, not `IEmailService`)
- Define method signatures clearly with parameter and return types
- Export interfaces for public contracts; keep implementation classes internal when possible

### Class Guidelines

- Implement interfaces explicitly with `implements` clause
- Use constructor injection for dependencies (e.g., `constructor(private dao: WaitlistDao)`)
- Keep classes focused on single responsibilities
- Prefer readonly properties for injected dependencies

### Dependency Injection Example

```typescript
// Interface for contract
export interface WaitlistDao {
    addSubscriber(email: string, source: string, ip?: string | null, userAgent?: string | null): Promise<boolean>;
}

// Class implementation with injected SQL client
export class NeonWaitlistDao implements WaitlistDao {
    constructor(private sql: NeonQueryFunction<false, false>) {}

    async addSubscriber(email: string, source: string, ip?: string | null, userAgent?: string | null): Promise<boolean> {
        // Implementation using this.sql
    }
}

// Service with injected DAO
export class DefaultWaitlistService implements WaitlistService {
    constructor(private dao: WaitlistDao) {}

    async processWaitlistSignup(email: string, source: string, ip?: string | null, userAgent?: string | null): Promise<void> {
        await this.dao.addSubscriber(email, source, ip, userAgent);
        // Business logic here
    }
}
```

## Type-Safe Patterns

- Prefer discriminated unions for complex state management
- Use readonly arrays and objects for immutable data structures
- Leverage const assertions for literal types
- Implement exhaustive checking for switch statements with unions

## ESLint Integration

All code must pass ESLint validation before committing. Run the linter regularly:

```bash
pnpm run lint
```

### Critical ESLint Rules

The following rules are enforced and must not be violated:

- **`@typescript-eslint/no-explicit-any`**: Avoid using `any` type (see "Avoiding `any` Types" section below)
- **`@typescript-eslint/no-unused-vars`**: Remove or prefix unused variables with underscore
- **`react/no-unescaped-entities`**: Properly escape special characters in JSX (use `&apos;` for apostrophes)
- Never disable ESLint rules without explicit justification via inline comments

## Avoiding `any` Types

The `any` type defeats TypeScript's purpose and should be avoided. If you absolutely must use `any`:

1. **Exhaust all alternatives first**: Try `unknown`, generics, union types, or proper type definitions
2. **Add explicit ESLint disable comment** with clear justification:
    ```typescript
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrapper = (data: any) => {
        // Justification: Third-party library returns untyped data
    };
    ```
3. **Minimize scope**: Use `any` in the smallest possible scope
4. **Consider `unknown`**: If you don't know the type, use `unknown` and narrow it with type guards

### Better Alternatives to `any`

- **For unknown types**: Use `unknown` with type guards
- **For multiple possible types**: Use union types (e.g., `string | number`)
- **For function parameters**: Use generics with constraints
- **For third-party libraries**: Install `@types/*` packages or create `.d.ts` files

## Error Handling Patterns

Always handle errors with proper type safety:

### DO: Use type guards

```typescript
try {
    // ... operation
} catch (error) {
    // Check if error is an Error instance
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Operation failed:", errorMessage);
}
```

### DON'T: Access properties on unknown errors

```typescript
try {
    // ... operation
} catch (error) {
    // ❌ BAD: error is of type 'unknown', might not have 'message'
    console.error(error.message);
}
```

### Pattern for throwing custom errors

```typescript
// Custom error classes
export class ServiceError extends Error {
    constructor(message: string, public readonly code: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class EmailServiceError extends ServiceError {
    constructor(message: string) {
        super(message, "EMAIL_ERROR");
    }
}

// Throwing custom errors
try {
    // ... operation
} catch (error) {
    if (error instanceof EmailServiceError) {
        // Handle specific service error
        console.error(`Email error: ${error.message}`);
    } else {
        // Re-throw or handle unknown error
        throw error;
    }
}
```

## Unused Variables

- **Remove** truly unused variables
- **Prefix with underscore** if variable must exist but isn't used:
    ```typescript
    // Function signature requires parameter but we don't use it
    const handler = (_event: Event, data: Data) => {
        // Only use 'data'
    };
    ```
- **Use rest parameters** to ignore unused args:
    ```typescript
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return async (..._args: any[]) => {
        // Function that ignores all arguments
    };
    ```

## JSX and React-Specific Rules

- **Escape special characters**: Use HTML entities in JSX text
    - Apostrophe: `&apos;` or `'` → `you&apos;re`
    - Quote: `&quot;` → `&quot;hello&quot;`
    - Less than: `&lt;` → `&lt;div&gt;`
    - Greater than: `&gt;` → `&lt;div&gt;`
- **Or use JavaScript strings**: `{"you're"}` works too
- Never use raw special characters in JSX text content

## Using Type Definition Packages

When working with third-party libraries:

1. **Check for official types**: Search for `@types/[package-name]` on npm
2. **Install as dev dependency**:
    ```bash
    pnpm add -D @types/package-name
    ```
3. **Prefer official types over manual declarations**: Don't redefine types that already exist in `@types/*` packages
4. **Extend when needed**: Use module augmentation to add missing properties
    ```typescript
    declare global {
        interface Window {
            someLibrary?: SomeLibraryType;
        }
    }
    ```

## Pre-Commit Checklist

Before committing code, ensure:

- ✅ Code passes `pnpm run lint` without errors
- ✅ No `any` types without explicit justification
- ✅ All errors properly handled with type guards
- ✅ No unused variables (or properly prefixed with underscore)
- ✅ JSX special characters properly escaped
- ✅ Official `@types/*` packages used instead of manual type declarations where available
- ✅ Build succeeds: `pnpm run build`
