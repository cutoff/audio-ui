# React Development Conventions

This document outlines best practices and conventions for React development. Following these guidelines ensures
consistency, maintainability, and performance across React projects.

## Version History

*For maintenance purposes only*

- Version 1.0 - 2025-09-13: Initial version

## Component Structure

Components should follow these patterns:

1. Use functional components with hooks instead of class components
2. Define props using TypeScript interfaces or types with JSDoc comments
3. Provide default values using parameter defaults, not `defaultProps`
4. Use proper naming conventions for components (PascalCase) and hooks (camelCase with `use` prefix)
5. Use function declarations for React components, but arrow functions for event handlers and internal functions
   ```tsx
   function MyComponent({ prop1, prop2 = defaultValue }: MyComponentProps): JSX.Element {
       // Use arrow functions for event handlers
       const handleClick = (): void => {
           console.log(prop1);
       };
       
       // Component implementation
       return <div onClick={handleClick}>{prop1}</div>;
   }
   ```

## Hooks

- Follow React hooks naming convention (`useXxx`)
- Follow the rules of hooks:
    - Only call hooks at the top level
    - Only call hooks from React function components or custom hooks
- Create custom hooks to extract reusable logic
- Use memoization hooks (`useMemo`, `useCallback`) when appropriate for performance optimization

## Event Handling

- Name event handlers with `handleXxx` pattern
- Pass event handlers as props to child components when needed
- Use callback functions for complex event handling
- Properly type event objects using React's event types

## TSX/JSX Formatting

- TSX attributes are aligned and indented when they span multiple lines
- TSX closing tags are aligned with their opening tags
- Self-closing tags have a space before the closing bracket: `<Component />`
- TSX expressions in curly braces have consistent spacing: `{condition ? (...) : (...)}`
- TSX conditional rendering uses parentheses for multi-line expressions
- Component props are destructured with multi-line formatting and proper indentation when there are many props

> **Note**: All TSX/JSX formatting is enforced by Prettier according to the project's `.prettierrc.json` configuration.
> This includes special handling for .tsx files as specified in the Prettier configuration's "overrides" section.

Example of properly formatted TSX:

```tsx
function ComplexComponent({
                              label,
                              onClick,
                              size = "medium",
                              disabled = false
                          }: ComplexComponentProps): JSX.Element {
    const handleClick = (): void => {
        if (!disabled) {
            onClick();
        }
    };

    return (
        <div className="container">
            {label && (
                <span className="label">{label}</span>
            )}
            <button
                className={`button button--${size}`}
                disabled={disabled}
                onClick={handleClick}
            >
                {label || "Click me"}
            </button>
        </div>
    );
}
```

## State Management

- Use `useState` for simple component state
- Use `useReducer` for complex state logic
- Consider context API (`useContext`) for sharing state between components
- Avoid prop drilling by using context or state management libraries when appropriate
- Keep state as close as possible to where it's used

## Side Effects

- Use `useEffect` for side effects
- Properly define dependencies array to avoid unnecessary re-renders
- Clean up side effects when component unmounts
- Split unrelated side effects into separate `useEffect` calls

## Performance Optimization

- Use `React.memo` for components that re-render often with the same props
- Use `useMemo` for expensive calculations
- Use `useCallback` for functions passed as props to child components
- Avoid creating new objects or arrays in render functions
- Use virtualization for long lists

## Testing React Components

- Test components in isolation
- Test user interactions using React Testing Library
- Mock external dependencies
- Verify component behavior, not implementation details
- Write tests for different states and edge cases
