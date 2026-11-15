# ADR-0001: Standalone CLI, not an ESLint or `@ui5/linter` plugin

**Status:** Accepted

## Context

The tool checks a UI5 project against company guidelines. ESLint already checks code quality, and `@ui5/linter` checks UI5 API usage and compatibility (UI5 2.x). The obvious question is whether the new checks should be an ESLint plugin or an extension of `@ui5/linter`.

The guideline rules mostly look at the project as a whole: folder structure, `manifest.json`, `ui5.yaml`, `index.html`, and which files exist. They rarely look at a single source file. No plugin API for custom rules is known for `@ui5/linter`.

## Decision

BlueprintAudit is a standalone npm package with its own CLI, `ui5-blueprint-audit`. It is neither an ESLint plugin nor a plugin for `@ui5/linter`. It complements both and does not replace them.

| Tool | Checks |
|---|---|
| ESLint | Code quality |
| `@ui5/linter` | UI5 API usage and compatibility |
| BlueprintAudit | Company guidelines for project structure, manifest, and configuration |

## Consequences

- The tool defines its own configuration, plugin contract, and reports (see [ADR-0011](./0011-yaml-configuration.md), [ADR-0012](./0012-plugin-loading.md), [ADR-0016](./0016-report-formats-and-exit-codes.md)).
- It can run through `npx`, as an npm script, and in pre-commit hooks, independent of any linter setup.
- Some overlap with the other tools is possible. The linter coverage check (`docs/linter-coverage.md`) compares the rules with ESLint and `@ui5/linter`.
- The tool does not check code quality or UI5 API usage. Teams keep using ESLint and `@ui5/linter` for that.
