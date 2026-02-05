<!--
 Copyright (c) 2026 Tylium.
 SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 See LICENSE.md for details.
-->

**Version**: 1.0 | **Meta**: Outlines the dual-licensing model, legal document structure, repository implementation, and developer preview versioning scheme for the project.

## 1. Dual-Licensing Model

The project employs a dual-licensing strategy to support both open-source and commercial use cases.

### 1.1. Open Source License: GPL-3.0

- **SPDX Identifier**: `GPL-3.0-only`
- **Use Case**: For open-source projects where the source code of the derivative work can also be released under a GPL-3.0 compatible license.
- **Requirement**: This is a "copyleft" license, meaning any software that uses this library must also be made open-source under a compatible license.

### 1.2. Commercial License: Tylium Evolutive License Framework (TELF)

- **Use Case**: For proprietary, closed-source commercial applications where releasing the source code is not desired.
- **Benefits**:
  - Removes the copyleft restrictions of the GPL-3.0.
  - Grants the right to use the library in commercial products without disclosing the source code.
  - Includes a Service Level Agreement (SLA) for professional support.
- **Acquisition**: Commercial licenses can be acquired at **[https://cutoff.dev](https://cutoff.dev)**.

## 2. Legal Document Structure

The complete legal framework is located in the `/license` directory at the root of the monorepo.

- `license-telf/LICENSE.md`: The full text of the **Tylium Evolutive License Framework (TELF)** commercial license.
- `license/LICENSE-GPL3.md`: A verbatim reference copy of the **GNU General Public License v3.0** in Markdown format, as provided by the FSF.
- `license/CLA.md`: The **Contributor License Agreement**. All contributors must sign this agreement to grant the project the necessary rights to incorporate their code under the dual-license model.
- `license/SLA.md`: The **Service Level Agreement** that outlines the support terms for commercial licensees.

## 3. Repository Implementation

### 3.1. `package.json` Files

- All `package.json` files (root, library, and playground) must use the SPDX identifier for the open-source license.
  ```json
  "license": "GPL-3.0-only"
  ```
- This is standard practice for package managers. The commercial license is offered separately and documented in the READMEs.

### 3.2. `README.md` Files

- The root `README.md` and the `packages/react/README.md` must clearly explain the dual-licensing model.
- They must include a direct link for purchasing the commercial license: `https://cutoff.dev`.

### 3.3. `LICENSE.md` Files

- The `LICENSE.md` file at the root and within each package contains a header followed by the full text of the GPL-3.0. This ensures license visibility on platforms like GitHub and npm.

### 3.4. Source File Headers

- Source files use the SPDX line: `SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF`.
- `LicenseRef-TELF` is intentionally unversioned so that TELF license text updates do not require mass header changes across the repo. The current TELF version (e.g. 1.1) is specified in `license-telf/LICENSE.md`.
