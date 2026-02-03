# GitHub Issues Management

**Version**: 1.0 | **Last Updated**: Use `now` tool for current timestamp.  
**Meta**: Guidelines for agent-driven GitHub issue creation, update, and closure via the GitHub MCP server. Used by "Execute Create Issue", "Execute Update Issue", "Execute Close Issue" in `agents/coding-agent-commands-1.0.md`. For tasks, grep for "Quick Rules" or section names below.

## Quick Rules Summary (Load This First)

| Category    | Rule                                                                                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository  | Current git repo from `git remote -v` unless the user specifies another. Derive owner/repo from remote URL.                                                 |
| Labels      | Use only labels documented in project agent instructions (root `AGENTS.md`, `apps/*/AGENTS.md`, `agents/*.md`). Do not create or apply undocumented labels. |
| Description | Problem statement, expected vs actual, scope. No implementation details or premature analysis.                                                              |
| Assignation | Do not assign (omit assignees).                                                                                                                             |
| Comments    | Detailed enough but concise; no verbosity, AI slop, or obvious AI markers (e.g. em-dashes).                                                                 |

## Writing Style (Descriptions and Comments)

Be detailed enough but concise. Avoid verbosity, AI slop, and obvious AI markers (e.g. em-dashes).

## Create Issue

- **Target repository**: Current git repository; run `git remote -v` to get default remote and derive `owner` and `repo`. If the user specifies another repository, use that.
- **Labels**: Per Quick Rules; only documented labels.
- **Title and body**: Stick to what the issue is (feature or bug): clear problem statement, expected vs actual behaviour, scope. Avoid implementation details and premature analysis.
- **Create**: Use GitHub MCP `issue_write` with `method: "create"`. Omit `assignees`. Leave the issue open (default).
- **Approved solution as comment**: If a possible solution was already discussed and approved by the user, add it in the first comment using `add_issue_comment`, framed as a suggestion (e.g. "Suggested approach: …").

## Update Issue

- **Target repository and issue**: Current git repo (from `git remote -v` unless specified) and issue number from the user or context.
- **Labels**: Per Quick Rules; only documented labels.
- **Progression and decisions**: Make progression clear and document decisions in comments. Use `add_issue_comment` to record findings, decisions, and next steps. Do not assign.
- **Description (body)**: If the issue has an evidently missing or weak description, create one (problem statement, expected vs actual, scope). Thereafter: only change the description if the nature of the issue has changed during investigations (e.g. root cause redefined, scope clarified). When updating, prefer an addendum (edit that appends or clarifies) rather than replacing the entire content. Use `issue_write` with `method: "update"` for body/title/state/labels only when needed.
- **Status**: Keep the issue open unless the user explicitly asks to close or change state; if closing, use the appropriate `state` and `state_reason` (e.g. completed, not_planned, duplicate).

## Close Issue

- **Target repository and issue**: Current git repo (from `git remote -v` unless specified) and issue number from the user or context.
- **Last comment**: Add a comment with `add_issue_comment` summarizing what was done (changes, outcome). Per writing style: detailed enough but concise; no verbosity or AI markers.
- **Close as completed**: Use `issue_write` with `method: "update"`, `state: "closed"`, and `state_reason: "completed"`. Do not close as "not planned" or "duplicate" when executing this command.
