# Documentation Standards

**Version**: 2.0 | **Last Updated**: Use `now` tool for current timestamp.  
**Meta**: Agent-optimized standards for code documentation, focusing on JSDoc for maintainability. Apply to exports/interfaces; use MDX for project docs. For tasks, grep for "Quick Rules" or "RULE-DOC-001"; document post-edit.

## Quick Rules Summary (Load This First)
| Category | Rule |
|----------|------|
| JSDoc Blocks | Start with `/**` on separate line; `*` (space-asterisk-space) per line; close with `*/` on separate line. |
| Parameters | `@param {type} name - Description`; optional with `[name=default]`. |
| Returns | `@returns {type} Description`. |
| Examples | Enclose in code blocks with language tag; use for components/functions. |
| Components/Functions | Document with description, props/params, returns/exceptions; JSDoc before declaration. |
| Interfaces/Types | Brief description above; inline JSDoc for properties if non-obvious. |
| Inline Comments | For complex logic only; keep concise and focused. |
| Self-Documentation | Descriptive variable/function names; types/interfaces for data structures; consistent patterns. |
| READMEs | Include overview, install, usage, API, contributing, license (bullet summaries). |

## JSDoc Comments
- **Components and Functions**: Include description, props/params, returns, exceptions. Place JSDoc immediately before declaration.
- **Properties**: Inline JSDoc in interfaces/types for purpose/explanation.
- **Formatting**: Empty lines in blocks use ` *`; align for readability. Avoid over-documentation of obvious code.

## Inline Comments and Self-Documentation
- Use for non-obvious logic/decisions; concise and focused.
- Update comments during code changes to prevent staleness.
- Prefer self-documenting code: Descriptive names (e.g., `handleUserSubmit`), helper functions, types for data shapes.

## README Documentation
- Structure as bullets/sections: Project purpose, install (`pnpm install`), usage examples, API (key functions/components), contributing (e.g., `pnpm lint`), license.
- Use MDX for rich content (e.g., in `apps/audioui-dev/` docs); keep concise.

## Example Pattern (Minimal JSDoc)
```tsx
/**
 * Button component with customizable props.
 * @param {string} [label="Button"] - Display text.
 * @param {() => void} [onClick] - Click handler.
 * @returns {JSX.Element} Rendered button.
 */
function Button({ label = "Button", onClick }: ButtonProps): JSX.Element {
    return <button onClick={onClick}>{label}</button>;
}

interface ButtonProps {
    /** Button text. */
    label?: string;
    /** Click handler. */
    onClick?: () => void;
}
```
**Agent Note**: Prioritize JSDoc for public exports/services; validate docs in `pnpm lint`. For MDX, follow root `AGENTS.md` documentation rules.