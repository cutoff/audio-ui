<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 See LICENSE.md for details.
-->

# Documentation Standards

**Meta**: Agent-optimized standards for code documentation, focusing on JSDoc for maintainability. Apply to
exports/interfaces; use MDX for project docs. For tasks, grep for "Quick Rules" or "RULE-DOC-001"; document post-edit.

**Related**: See `coding-agent-commands-1.0.md` for the Review command procedure that applies these standards.

## Quick Rules Summary (Load This First)

| Category             | Rule                                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| JSDoc Blocks         | Start with `/**` on separate line; `*` (space-asterisk-space) per line; close with `*/` on separate line. |
| Parameters           | `@param {type} name - Description`; optional with `[name=default]`.                                       |
| Returns              | `@returns {type} Description`.                                                                            |
| Examples             | Enclose in code blocks with language tag; use for components/functions.                                   |
| Components/Functions | Document with description, props/params, returns/exceptions; JSDoc before declaration.                    |
| Interfaces/Types     | Brief description above; inline JSDoc for properties if non-obvious.                                      |
| Inline Comments      | For non-obvious logic; verbosity acceptable when justified. See detailed guidelines below.                |
| Self-Documentation   | Descriptive variable/function names; types/interfaces for data structures; consistent patterns.           |
| READMEs              | Include overview, install, usage, API, contributing, license (bullet summaries).                          |

## JSDoc Comments

**All public APIs** (exported functions, classes, interfaces) must have JSDoc.

### Requirements

- **Components and Functions**: Include description, props/params, returns, exceptions. Place JSDoc immediately before declaration.
- **Properties**: Inline JSDoc in interfaces/types for purpose/explanation.
- **Formatting**: Empty lines in blocks use ` *`; align for readability. Avoid over-documentation of obvious code.

### Required Tags

- `@param {type} name - Description` for all parameters (use `[name=default]` for optional parameters)
- `@returns {type} Description` with description and type information
- `@example` for complex functions or non-obvious usage (enclose in code blocks with language tag)
- `@default` for optional parameters with defaults

### Best Practices

- Explain the **purpose**, not just the signature
- Include usage context and when to use the function
- Provide examples for complex or non-obvious APIs
- Document edge cases and constraints

## Inline Comments and Self-Documentation

**Verbosity is acceptable when justified** - if a comment explains important business logic, non-obvious behavior, or provides valuable context, it's better to be thorough than brief.

### When to Add Comments

- ✅ Explain **why** code exists (business logic, edge cases, non-obvious decisions)
- ✅ Document complex algorithms or non-intuitive behavior
- ✅ Clarify constraints or requirements that aren't obvious from the code
- ✅ Explain domain-specific conventions (e.g., MIDI conventions, audio parameter scaling, coordinate systems)
- ✅ Document performance considerations or optimization decisions
- ✅ Explain coordinate systems, angle conventions, or mathematical transformations
- ✅ Clarify interaction behavior or user experience decisions
- ✅ Provide context for future maintainers

### When NOT to Add Comments

- ❌ When the code is self-explanatory (e.g., `const x = 5;`)
- ❌ When the comment just restates what the code does (e.g., `// Set x to 5` above `x = 5`)
- ❌ When documenting refactoring history or development process
- ❌ When the comment describes implementation details that are clear from the code
- ❌ When using section markers that don't add value (prefer clear function/class organization)

### Best Practices

- Use inline comments for non-obvious business logic, even if it makes the comment longer
- Explain mathematical formulas or coordinate system conventions
- Document edge case handling and why it's necessary
- Explain performance optimizations and trade-offs
- Clarify interaction behavior (e.g., why global listeners are needed)
- Update comments during code changes to prevent staleness
- Prefer self-documenting code: Descriptive names (e.g., `handleUserSubmit`), helper functions, types for data shapes

## README Documentation

- Structure as bullets/sections: Project purpose, install (`pnpm install`), usage examples, API (key
  functions/components), contributing (e.g., `pnpm lint`), license.
- Use MDX for rich content (e.g., in `apps/audioui-dev/` docs); keep concise.

## Examples

### JSDoc Pattern (Complete)

````tsx
/**
 * Convert Real Value to MIDI Integer (The Pivot).
 *
 * This is the central conversion method that quantizes real-world values to MIDI integers.
 * The MIDI integer serves as the source of truth, ensuring deterministic behavior and
 * alignment with hardware standards.
 *
 * The conversion flow:
 * 1. Normalize the real value to 0..1 (applying scale transformation if needed)
 * 2. Quantize to the configured MIDI resolution (7-bit = 0-127, 14-bit = 0-16383, etc.)
 *
 * @param realValue The real-world value (number, boolean, or string depending on parameter type)
 * @returns The quantized MIDI integer value
 *
 * @example
 * ```ts
 * const converter = new AudioParameterConverter({
 *   type: "continuous",
 *   min: 0,
 *   max: 100,
 *   midiResolution: 7
 * });
 * converter.toMidi(50); // 64 (50% of 0-100 maps to 64 in 0-127 range)
 * ```
 */
toMidi(realValue: number | boolean | string): number {
    // ...
}
````

### JSDoc Pattern (Minimal - for simple functions)

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

### Inline Comments (Good Examples)

```typescript
// ✅ Good: Explains business logic
// Add pointer cursor when clickable but not draggable (onClick but no onChange)
const svgStyle = {
  ...(interactiveProps.style ?? {}),
  ...(onClick && !onChange ? { cursor: "pointer" as const } : {}),
};

// ✅ Good: Verbose but justified - explains complex domain logic
// Step quantization is always applied in the real value domain (after scale transformation).
// This means step creates a linear grid in real units (e.g., 0.1 dB increments),
// regardless of whether the scale is linear, logarithmic, or exponential.
//
// This design works well for:
// - Linear scales: Natural 1:1 mapping
// - Log/exp scales with linear units (dB, ms): Step still makes sense in real units
//
// For log scales with non-linear units (e.g., frequency in Hz), consider:
// - Omitting step entirely for smooth control
// - Using a very small step to allow fine control while providing some quantization
if (conf.step) {
  const steps = Math.round((val - conf.min) / conf.step);
  val = conf.min + steps * conf.step;
}

// ✅ Good: Explains coordinate system convention
// Calculate angular range: 0° is at 3 o'clock, increasing clockwise
// Standard knob (90° openness) goes from ~225° (7:30) to ~495° (4:30)
const { maxStartAngle, maxEndAngle, maxArcAngle } = useMemo(() => {
  const start = 180 + clampedOpenness / 2;
  const end = 540 - clampedOpenness / 2;
  return { maxStartAngle: start, maxEndAngle: end, maxArcAngle: end - start };
}, [clampedOpenness]);
```

### Inline Comments (Bad Examples)

```typescript
// ❌ Bad: Trivial, obvious from code
// Memoize classNames
const classNames = useMemo(() => {...}, [deps]);

// ❌ Bad: Documents refactoring, not code purpose
/* Since the class is now on the SVG element itself, we can target it directly */
```

**Agent Note**: Prioritize JSDoc for public exports/services; validate docs in `pnpm lint`. For MDX, follow root
`AGENTS.md` documentation rules. See `coding-agent-commands-1.0.md` for the Review command that applies these standards.
