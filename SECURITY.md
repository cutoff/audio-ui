# Security policy

## Scope

This policy applies to security issues in this monorepo, including:

- Published npm packages **`@cutoff/audio-ui-react`** and **`@cutoff/audio-ui-core`**
- The **`apps/playground-react`** Next.js application and its deployment surface when built from this repository

AudioUI is in **Developer Preview**. Fixes target supported release lines and the default branch as maintainers determine appropriate.

## How to report a vulnerability

**Use GitHub private vulnerability reporting.** From this repository on GitHub: open the **Security** tab, then use **Report a vulnerability** to open a private security advisory.

Do **not** open a public issue, public discussion, or pull request that describes an undisclosed security vulnerability. Use [GitHub Issues](https://github.com/cutoff/audio-ui/issues) only for general bugs and defects that are not sensitive security reports.

## What to include

Include as much of the following as possible to speed up triage:

- A clear description of the issue and its impact
- Affected packages, code paths, or apps (e.g. playground vs library)
- Affected versions or commit range, if known
- Steps to reproduce or a proof of concept
- Suggested fix or mitigation, if you have one

## Response

Maintainers acknowledge receipt of valid reports when possible. Response and fix timelines are **best-effort** and depend on severity and capacity. This open-source policy does not replace commercial support terms; commercial customers follow their agreement for support and response commitments.

## Disclosure

Reports are handled under **coordinated disclosure**. Details stay non-public until maintainers have addressed the issue in a way they consider appropriate (for example, a published release or documented mitigation). Researchers who wish to be credited can say so in the advisory; credit is optional and at maintainers’ discretion.

## Safe harbor

Good-faith security research that complies with this policy, stays within the scope of this project and its dependencies as used by this software, and avoids harm to users, data, or third-party systems is welcomed. Do not test against production systems you do not own or lack permission to test.
