# ADR-0002: TypeScript on Node.js, ESM, minimum Node.js 24

**Status:** Accepted

## Context

The tool runs on developer machines and in CI, is installed through npm, and is used by teams that already work with UI5 and Node.js. The code is split over several packages that share types.

Node.js 24 was already used by the CI and release workflows. A wider supported range than the tested range gives no real guarantee.

## Decision

- All packages are written in TypeScript and run on Node.js as ECMAScript modules (`"type": "module"`).
- The minimum supported Node.js version is 24 (`engines.node` is `>=24` in the root and in all three packages).
- `@types/node` follows the minimum (`^24`). Dependabot ignores major bumps of it on purpose, so it is raised by hand when the minimum changes.

## Consequences

- One language and one module system across the CLI, the core plugin, and the types package.
- Node.js 24 bundles an npm version that supports Trusted Publishing, which the release workflow relies on (see [ADR-0019](./0019-automated-release-with-trusted-publishing.md)).
- The supported range equals the tested range. Raising the minimum later means changing `engines`, `@types/node`, the CI workflows, and the guide in one change.
- Local plugins must be plain JavaScript (`.mjs`, `.js`, `.cjs`). TypeScript plugins need to be compiled first, unless a TypeScript loader is added later (see [ADR-0012](./0012-plugin-loading.md)).
