# Architecture decision records

This folder records the architecture decisions behind UI5 BlueprintAudit: what was decided, why, and what follows from it. Each record is short and stands on its own.

The first set was captured from `CLAUDE.md`, the rule catalog, the documentation, and the Git history. Decisions made later get the next number.

## Format

Each record has a status, the context, the decision, and the consequences. A record is never rewritten when a decision changes. Instead, a new record supersedes it and the old one gets the status `Superseded by ADR-NNNN`.

Statuses: `Proposed`, `Accepted`, `Superseded`, `Deprecated`.

## Index

### Product and architecture

| ADR | Decision |
|---|---|
| [0001](./0001-standalone-cli.md) | Standalone CLI, not an ESLint or `@ui5/linter` plugin |
| [0002](./0002-typescript-esm-node-24.md) | TypeScript on Node.js, ESM, minimum Node.js 24 |
| [0003](./0003-monorepo-three-packages.md) | npm-workspaces monorepo with three packages |
| [0004](./0004-core-rules-as-regular-plugin.md) | The core rules are a regular plugin |
| [0005](./0005-translation-logic-in-types-package.md) | Translation logic lives in the types package |
| [0006](./0006-project-context-loaded-once.md) | The project context is loaded once, rules never touch the file system |
| [0007](./0007-explicit-project-type.md) | The user states the project type, no auto-detection |
| [0008](./0008-library-projects.md) | Library projects have no `webapp/`, detection runs through `ui5.yaml` |
| [0009](./0009-rule-catalog-source-of-truth.md) | The rule catalog is the source of truth |
| [0010](./0010-typescript-as-runtime-dependency.md) | `typescript` is a runtime dependency of the core plugin |

### Configuration and plugins

| ADR | Decision |
|---|---|
| [0011](./0011-yaml-configuration.md) | YAML configuration that only overrides defaults, validated strictly |
| [0012](./0012-plugin-loading.md) | Plugins load from local files or npm, resolved from the project with ESM conditions |
| [0013](./0013-rule-namespacing.md) | Plugin rule IDs are prefixed, core rule IDs are not |
| [0014](./0014-engine-error-isolation.md) | Errors in one rule or one project never abort the whole run |

### Output and localization

| ADR | Decision |
|---|---|
| [0015](./0015-localization.md) | Flat translation bundles with an English fallback, extensible by plugins |
| [0016](./0016-report-formats-and-exit-codes.md) | Report formats, the always-English JUnit file, and exit codes |

### Quality, delivery, and process

| ADR | Decision |
|---|---|
| [0017](./0017-testing-strategy.md) | Fixture tests per rule, sample projects as regression source, local mutation testing |
| [0018](./0018-protected-main-and-pull-requests.md) | `main` is protected, all changes land through pull requests |
| [0019](./0019-automated-release-with-trusted-publishing.md) | Releases are triggered by a version bump and published with npm Trusted Publishing |
| [0020](./0020-sbom-generation.md) | CycloneDX SBOMs per package, generated with `cyclonedx-npm` |
| [0021](./0021-vitepress-documentation-site.md) | VitePress documentation site, with the catalog included, not copied |
| [0022](./0022-english-only-written-content.md) | Everything an AI assistant writes in this repository is English |
