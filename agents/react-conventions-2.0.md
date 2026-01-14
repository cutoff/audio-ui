<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF-1.0
 See LICENSE.md for details.
-->

# React Development Conventions

**Meta**: Agent-optimized conventions for React consistency, performance, and maintainability. Focus on functional
components/hooks; prefer shared `packages/ui/`. For tasks, grep for "Quick Rules" or "RULE-REACT-001"; apply in TSX
edits with `pnpm format`.

## Quick Rules Summary (Load This First)

| Category       | Rule                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Components     | Functional with hooks (no classes); PascalCase; define props via TS interfaces with JSDoc; defaults in params, not `defaultProps`.          |
| Hooks          | `useXxx` naming; top-level only in components/custom hooks; custom hooks for reusable logic; memoize with `useMemo`/`useCallback` for perf. |
| Events         | `handleXxx` naming; type events with React types; arrow functions for handlers.                                                             |
| TSX Formatting | Attributes indented/aligned; self-closing with space (`<Comp />`); Prettier + Tailwind plugin enforces; destruct props multi-line if many.  |
| State          | `useState` for simple; `useReducer` for complex; `useContext` to avoid drilling; keep near usage.                                           |
| Side Effects   | `useEffect` with deps array; cleanup on unmount; separate unrelated effects.                                                                |
| Performance    | `React.memo` for re-renders; `useMemo` for calcs; `useCallback` for prop functions; virtualize lists; avoid new objects/arrays in render.   |
| Testing        | Isolate components; use React Testing Library for interactions; mock deps; test behaviors/edges, not details.                               |

## React Patterns (Merged Guidelines)

1. **Component Structure**:
   - Use functional components with hooks; no classes.
   - Props: TS interfaces/types with JSDoc; destruct in params with defaults.
   - Naming: PascalCase for components, `use` prefix for hooks.
   - Order: Types/interfaces, JSDoc, function, helpers/hooks, export.
   - Event handlers: Arrow functions.

2. **Hooks and Custom Logic**:
   - Follow rules: Top-level calls only in React functions/custom hooks.
   - Custom hooks extract reusability (e.g., `useWaitlist`).
   - Memoization: `useMemo` for expensive values, `useCallback` for functions passed down.

3. **Event Handling**:
   - Name: `handleXxx` (e.g., `handleSubmit`).
   - Pass as props when needed; use callbacks for complexity.
   - Type: React event types (e.g., `React.MouseEvent`).

4. **State Management**:
   - Simple: `useState`.
   - Complex: `useReducer`.
   - Sharing: `useContext`; avoid drilling with it or libraries if scaling.
   - Locality: State closest to usage.

5. **Side Effects**:
   - `useEffect` for fetches/subscribes; deps prevent loops.
   - Cleanup: Return functions for unmount (e.g., subscriptions).
   - Split: One effect per concern.

6. **TSX/JSX Formatting**:
   - Multi-line props: Indent attributes, align tags.
   - Expressions: `{condition ? (...) : (...)}` with spacing.
   - Conditionals: Parens for multi-line.
   - Prettier handles via `.prettierrc.json` + Tailwind plugin; run `pnpm format`.

7. **Performance Optimization**:
   - Memo: `React.memo` for pure components.
   - Avoid: Inline objects/arrays in render; use memos.
   - Lists: Virtualize long ones (e.g., `react-window`).
   - Measure: Profile re-renders.

8. **Testing**:
   - Isolate: Mock externals.
   - Interactions: React Testing Library (e.g., `fireEvent`, `screen.getByRole`).
   - Coverage: States, edges, behaviors (not internals).

## Example Pattern (Condensed TSX Snippet)

```tsx
// packages/ui/Button.tsx
import React from "react";

/**
 * Customizable button component.
 * @param {string} [label="Button"] - Display text.
 * @param {() => void} [onClick] - Handler.
 * @returns {JSX.Element} Button element.
 */
function Button({ label = "Button", onClick }: ButtonProps): JSX.Element {
  const handleClick = (): void => onClick?.();
  return (
    <button onClick={handleClick} className="button">
      {label}
    </button>
  );
}

interface ButtonProps {
  /** Button label. */
  label?: string;
  /** Click handler. */
  onClick?: () => void;
}

export default Button;
```

**Agent Note**: For React edits, enforce functional patterns and shared UI; validate with `pnpm lint` and local tests
(light/dark modes).
