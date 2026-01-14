<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

# TypeScript Guidelines

**Meta**: Agent-optimized best practices for TypeScript type safety and maintainability. Enforce strict config; avoid
`any`; use DI in classes. For tasks, grep for "Quick Rules" or "RULE-TS-001"; apply in edits with `pnpm lint`.

## Quick Rules Summary (Load This First)

| Category       | Rule                                                                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Configuration  | `strict: true`; `noUnusedLocals: true`; `noUnusedParameters: true`; `noImplicitReturns: true`. Use shared `packages/config/typescript-config/`. |
| Annotations    | Explicit types for params/returns; interfaces for object shapes (prefer over types for unions); generics with constraints.                      |
| Null Handling  | Prefer `undefined` over `null`; `?` for optionals; no `any` without justification.                                                              |
| Assertions     | Use `as` syntax (not angle brackets).                                                                                                           |
| Interfaces     | Simple PascalCase (no "I" prefix, e.g., `EmailService`); inline JSDoc for props.                                                                |
| Classes/DI     | Implement interfaces with `implements`; constructor injection (e.g., `constructor(private dao: WaitlistDao)`); readonly for deps.               |
| Errors         | Extend `Error` for custom (e.g., `EmailServiceError`); use type guards in catches.                                                              |
| ESLint         | No `any`; no unused vars (underscore prefix if needed); escape JSX entities; run `pnpm lint`.                                                   |
| Avoiding `any` | Use `unknown` + guards; unions/generics first; disable with justification comment only if essential.                                            |
| Pre-Commit     | Lint passes; no unjustified `any`; errors guarded; build succeeds (`pnpm build`).                                                               |

## TypeScript Configuration

- Enforce strict mode via `packages/config/typescript-config/` (latest TS).
- Key flags: `strict: true` (all checks); `noUnusedLocals/Parameters: true`; `noImplicitReturns: true`.
- No implicit any; validate with `pnpm build` and `pnpm lint`.

## Best Practices

- **Annotations**: Explicit for functions (params/returns); use for clarity even if inferable.
- **Interfaces vs. Types**: Interfaces for shapes/objects (extendable); types for unions/intersections/primitives.
- **Generics**: Constrain (e.g., `<T extends string>`); single letters (T, K) or descriptive with 'T' suffix.
- **Optionals/Nulls**: `?` for optional props; prefer `undefined` (not `null`); exhaustive checks for unions.
- **Assertions**: `as Type` for narrowing; minimize.
- **Declarations**: `.d.ts` for third-party (with JSDoc); augment modules if extending types (e.g.,
  `declare global { interface Window { ... } }`).
- **Unused Vars**: Remove; underscore prefix (`_param`) or rest (`..._args`) if required.
- **JSX Rules**: Escape entities (`&apos;`, `&quot;`, `&lt;`, `&gt;`); or use JS strings `{"you're"}`.

## Class-Based Patterns (Merged)

- **Contracts**: Define interfaces (e.g., `WaitlistDao`) for services/DAOs; implement with classes (e.g.,
  `NeonWaitlistDao implements WaitlistDao`).
- **DI**: Constructor injection for deps (e.g., `constructor(private sql: NeonQueryFunction)`); readonly props for
  immutability.
- **Encapsulation**: Private/protected for internal; public methods for business logic.
- **Errors**: Throw custom subclasses of `Error` (e.g.,
  `class ServiceError extends Error { constructor(msg: string, public code: string) { ... } }`).
- **Focus**: Single responsibility; explicit `implements`; no singletons.
- **Organization**: Interfaces first; class with constructor; public methods; private helpers.

## ESLint Integration

- Run `pnpm lint` before commits; shared config in `packages/config/eslint-config/`.
- Critical Rules:
  - `@typescript-eslint/no-explicit-any`: Enforce (see avoiding `any` below).
  - `@typescript-eslint/no-unused-vars`: Prefix unused with `_` or remove.
  - `react/no-unescaped-entities`: Escape JSX specials.
- Disables: Only with inline `// eslint-disable-next-line [rule] - Justification`; no line-wide disables.
- Install types: `pnpm add -D @types/[pkg]` for third-party; prefer over manual `.d.ts`.

## Avoiding `any` Types

- **Philosophy**: `any` bypasses safety—exhaust alternatives.
- **Alternatives**:
  - Unknown data: `unknown` + guards (e.g., `if (typeof x === 'string')`).
  - Multiple types: Unions (`string | number`).
  - Params: Generics (`<T extends object>`).
  - Libs: `@types/*` or `.d.ts`.
- **If Essential**: Minimize scope; add
  `// eslint-disable-next-line @typescript-eslint/no-explicit-any - [reason, e.g., third-party untyped]`.
- **Patterns**: Discriminated unions for states; `readonly` arrays/objects for immutability; const assertions for
  literals.

## Error Handling Patterns

- **Type Guards**: Narrow in catches (e.g., `if (error instanceof Error) { console.error(error.message); }`).
- **Custom Errors**:

  ```ts
  export class ServiceError extends Error {
    constructor(
      message: string,
      public readonly code: string
    ) {
      super(message);
      this.name = this.constructor.name;
    }
  }

  export class EmailServiceError extends ServiceError {
    constructor(message: string) {
      super(message, "EMAIL_ERROR");
    }
  }

  // Usage
  try {
    // Operation
  } catch (error) {
    if (error instanceof EmailServiceError) {
      console.error(`Email error: ${error.message}`);
    } else {
      throw error; // Or handle generic
    }
  }
  ```

- **Don't**: Access `error.message` without check (type `unknown`).
- **Unused**: Prefix params (`_error`); use rest for ignores.

## Pre-Commit Checklist (Condensed)

- ✅ `pnpm lint` passes.
- ✅ No `any` without comment/justification.
- ✅ Errors handled with guards/custom throws.
- ✅ Unused vars prefixed/removed.
- ✅ JSX escaped.
- ✅ `@types/*` used; build succeeds (`pnpm build`).

**Agent Note**: For TS edits, enforce strict types/DI; no `any`; validate with `pnpm lint` and `pnpm build`. Prioritize
interfaces in services/DAOs.
