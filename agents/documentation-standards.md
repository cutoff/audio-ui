# Documentation Standards

This document outlines best practices for code documentation using JSDoc and other documentation tools. Following these standards ensures code is well-documented, maintainable, and accessible to all developers.

## Version History
*For maintenance purposes only*

- Version 1.0 - 2025-09-13: Initial version

## JSDoc Comments

### Components and Functions

- **Components**: Document with JSDoc comments including description, properties, and examples
- **Functions**: Document parameters, return values, and thrown exceptions
- **Properties**: Document with inline JSDoc comments in interface/type definitions

### JSDoc Formatting

- JSDoc blocks start with `/**` on a separate line
- Each line within the block starts with ` * ` (space, asterisk, space)
- The closing `*/` is on a separate line
- Parameter descriptions use `@param {type} name - Description` format
- Return value descriptions use `@returns {type} Description` format
- Examples are enclosed in code blocks with the appropriate language tag
- Empty lines within JSDoc blocks have a ` *` (space, asterisk) without additional text

### Type Documentation

- Type definitions have a brief description above the type declaration
- Interface properties have inline JSDoc comments explaining their purpose
- Enum values have explanatory comments when their meaning isn't obvious

## Example JSDoc Comments

### Component Documentation

```tsx
/**
 * A button component with customizable appearance.
 * 
 * @example
 * <Button label="Click me" onClick={() => console.log('Clicked!')} />
 */
function Button({
    label = "Button",
    onClick,
    disabled = false
}: ButtonProps): JSX.Element {
    // Use arrow function for event handler
    const handleClick = (): void => {
        if (!disabled && onClick) {
            onClick();
        }
    };
    
    // Component implementation
    return (
        <button 
            className="button"
            onClick={handleClick}
            disabled={disabled}
        >
            {label}
        </button>
    );
}
```

### Function Documentation

```typescript
/**
 * Formats a number as a percentage string.
 * 
 * @param {number} value - The value to format (0-1)
 * @param {number} [decimals=0] - Number of decimal places
 * @returns {string} The formatted percentage string
 * 
 * @example
 * formatPercent(0.5); // "50%"
 * formatPercent(0.5, 1); // "50.0%"
 */
function formatPercent(value: number, decimals: number = 0): string {
    return `${(value * 100).toFixed(decimals)}%`;
}
```

### Interface Documentation

```tsx
/**
 * Properties for the Button component.
 */
interface ButtonProps {
    /** The text to display on the button */
    label?: string;
    
    /** Called when the button is clicked */
    onClick?: () => void;
    
    /** The button's visual appearance */
    variant?: "primary" | "secondary" | "danger";
    
    /** Whether the button is disabled */
    disabled?: boolean;
}
```

## README Documentation

- Project READMEs should include:
  - Project overview and purpose
  - Installation instructions
  - Usage examples
  - API documentation
  - Contributing guidelines
  - License information

## Inline Comments

- Use inline comments to explain complex logic or non-obvious decisions
- Keep inline comments concise and focused
- Update comments when changing code to avoid outdated documentation
- Don't comment on obvious code

## Code Self-Documentation

- Use descriptive variable and function names
- Extract complex logic into well-named helper functions
- Use types and interfaces to document data structures
- Follow consistent patterns across the codebase
