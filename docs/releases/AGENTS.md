# Release notes (agent instructions)

**Purpose**: Release notes in this folder support the external documentation site and client app upgrades. They are written for humans (docs maintainers, app developers), not for LLM consumption only.

**Location**: `docs/releases/`

## Contents

- **`next.md`** – Release note for the next (unreleased) version. When cutting a release, move or copy its content into a versioned file (e.g. `1.0.0-preview.YYYYMMDD.HHMM.md`) and reset or update `next.md` for the following cycle.
- **Versioned files** (optional) – One file per published version if the project keeps historical release notes in this folder.

## When to update

- **Execute Check**: As part of the Check command, ensure `docs/releases/next.md` is updated for the latest codebase changes (new features, breaking changes, improvements, fixes). If recent work is not yet reflected in `next.md`, add or amend the relevant section(s).
- **After implementing a feature or fix**: Add or update a section in `next.md` so the documentation site and client upgrades stay in sync.

## Format of release notes

Each release note (e.g. `next.md`) can include:

- **New features** – New props, components, or behavior; include examples and migration hints where useful.
- **Breaking changes** – Incompatible API or behavior; include before/after and upgrade steps.
- **Improvements** – Non-breaking enhancements relevant to docs or apps.
- **Fixes** – Bug fixes that may affect integration or documentation.

Group sections by area (e.g. “Raster components”, “Layout”, “Theming”) so documentation and upgrade work can be done incrementally.

## Reference

- Root `AGENTS.md` lists this file in Sub-File Summaries.
- The **Check** command in `agents/coding-agent-commands-1.0.md` includes ensuring release notes are up to date.
