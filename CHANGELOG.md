# Changelog

All notable changes to AudioUI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-preview.20260407.2212] - 2026-04-07

### Security

- Dependency and lockfile updates to address known advisories (transitive packages such as `rollup`, `minimatch`, `picomatch`, `lodash`, `yaml`, `ajv`, `flatted`, `brace-expansion`, `defu`, and related chains).
- Playground: Next.js `^15.5.14`, caret-aligned `eslint-config-next`, patched `react-syntax-highlighter` (Prism `^1.30.0` via v16).

### Changed

- Library packages (`@cutoff/audio-ui-core`, `@cutoff/audio-ui-react`): build toolchain uses Vite 6, Vitest 3, and `vite-plugin-dts` 4 (dev-only; published artifacts remain JS/CSS/d.ts under `dist/`).
- Root `package.json`: `pnpm.overrides` to pin patched transitive versions where upstream trees lag.
- `@cutoff/audio-ui-react` Vite library build emits bundled CSS as `dist/style.css` so the `./style.css` export matches the built file (Vite 6 default naming had been `index.css`).
