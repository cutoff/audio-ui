# Audio UI – Delivery Plan

## Objectives

- Deliver a production-ready React 18 component library for audio/MIDI UIs.
- Ship with clear licensing (Tylium), CI, versioning, and publish workflows.
- Guarantee performance and accessibility for core controls.
- Provide a polished playground for iteration and align with the external MDX docs site.

## Scope (What we’ll ship)

1) Release Engineering
- CI pipeline: lint, test:coverage, typecheck, build (root, library, playground)
- Changesets-based versioning and npm publish (library)
- Bundle-size analysis; `sideEffects` verification; Renovate/Dependabot; SECURITY.md

2) Accessibility (A11y)
- A11y spec + keyboard/ARIA matrix for Button, Knob, Slider, Keybed
- Implement keyboard/touch interactions, ARIA roles/labels, visible focus
- Add tests: @testing-library + axe checks

3) Controls Architecture & Theming
- Size/label rationalization via CSS variables and styles
- Integrate AdaptiveBox across controls; remove `size` prop; propagate style/dimensions
- Propagate `font*` CSS to inner text; value rendering via `valueFn`
- Min/max for `thickness` and `roundness`
- Alternate input for Knob/Slider (drag with sensitivity)
- Default value + reset interaction; pass `paramId` in `onChange`
- Consider splitting `Knob` and `KnobSwitch`

4) Playground (Internal)
- Shadcn look-and-feel for consistency (nav, layout, theming)
- Add props tables and copyable code snippets per page
- Keep focused on iteration/testing; mirror finalized examples into external docs site

5) Documentation Alignment (External site)
- Publish theming tokens and a “themable props” contract
- Align README and playground wording with MDX docs structure
- Add performance and a11y guarantees pages (claims backed by tests)

6) New Components/Features
- Icon Pack (Google Material Symbols)
- Switch Lever (2–N states)
- Pitch/Mod control (joystick + dual-wheel variants)
- Composite Keyboard (Keybed + Pitch/Mod)
- Keybed zones support
- Button “Switch” variant

## Milestones & Timeline

Milestone 1 (Week 1)
- CI matrix (root/library/playground)
- Changesets + canary/stable npm publish for library
- Bundle-size report + `sideEffects` review
- A11y: spec + matrix for core controls
- Playground: shadcn polish baseline

Milestone 2 (Week 2)
- A11y implementation + tests for Button, Knob, Slider, Keybed
- Controls: AdaptiveBox integration; remove `size`; style/font propagation
- Value pipeline: `valueFn`, thickness/roundness min/max, drag input, default/reset, `paramId`
- Docs: tokens contract; README uplift; external site alignment

Milestone 3 (Weeks 3–4, parallelizable)
- New components/features (lever, pitch/mod, composite keyboard, zones, button switch)
- Expand tests; cross-browser interaction checks; bundle-size budgets in CI
- Marketing polish: screenshots/GIFs sourced from playground

## Priorities (Rough Order)
1. CI + release + bundle-size + security
2. A11y spec → a11y implementation + tests
3. AdaptiveBox integration + sizing/theming refactor
4. Playground polish + props/snippets
5. Docs alignment + tokens contract
6. New feature components

## Risks & Mitigations
- A11y complexity for non-native controls → Start with spec + tests; iterate per-control
- Pointer/touch latency edge cases → Use passive listeners; test on mobile; memoization
- API churn during refactor → Mark experimental props; Changesets for semver signaling
- React 19 ecosystem drift → Keep React 18 policy; add compatibility tests in CI

## Definition of Done
- All CI checks green; coverage threshold met; bundle-size budgets enforced
- Core controls meet a11y spec (keyboard, ARIA, focus, contrast)
- AdaptiveBox integrated; no `size` prop; CSS/theming contracts documented
- Playground pages include props tables + copy snippets, match shadcn styling
- Library published via Changesets; tagged release notes; README/docs aligned

## Tracking

- The executable task list is maintained in the repo TODOs (see task IDs). This plan is the stable roadmap; TODO items reference these workstreams and milestones.

