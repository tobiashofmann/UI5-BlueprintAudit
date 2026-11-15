# ADR-0003: npm-workspaces monorepo with three packages

**Status:** Accepted

## Context

The tool has three parts with different audiences: the CLI with its engine, the default rules, and the contract that plugin authors build against. The default rules should not be special (see [ADR-0004](./0004-core-rules-as-regular-plugin.md)), and plugin authors should be able to install the contract without installing the whole tool.

## Decision

The repository is an npm-workspaces monorepo under the scope `@abap`:

| Package | Content |
|---|---|
| `@abap/ui5-blueprint-audit` | The CLI, config loader, plugin loader, engine, and report formatters |
| `@abap/ui5-blueprint-audit-plugin-core` | The default rules from the catalog, built as a regular plugin |
| `@abap/ui5-blueprint-audit-types` | The plugin contract as types, plus the small translation helpers (see [ADR-0005](./0005-translation-logic-in-types-package.md)) |

The dependency direction is `types` ← `plugin-core` ← CLI. Cross-dependencies use exact pinned versions, not `workspace:*`. All three packages are versioned and released together (see [ADR-0019](./0019-automated-release-with-trusted-publishing.md)).

The npm package name and the folder under `packages/` are separate things. TypeScript `references` paths and `package.json#repository.directory` point at folder names. They change only when the folders themselves are renamed, never as a side effect of renaming the npm package.

## Consequences

- Publishing must happen in dependency order, `types`, `plugin-core`, CLI, so each dependency is live before the package that needs it.
- Raising a version means editing all three `package.json` files and the pinned cross-dependencies.
- Plugin authors can depend on the small types package alone.
- Tests for all packages run from one root Vitest configuration.
