# @abap/ui5-blueprint-audit

The command-line tool. It reads the config, loads the plugins, reads the project, runs the rules, and writes the reports.

[Source on GitHub](https://github.com/tobiashofmann/UI5-BlueprintAudit/tree/main/packages/ui5-blueprint-audit) · [npm](https://www.npmjs.com/package/@abap/ui5-blueprint-audit)

## Install and run

```bash
npm install --save-dev @abap/ui5-blueprint-audit
npx @abap/ui5-blueprint-audit --type fs --lang en
```

The package has one binary, `ui5-blueprint-audit`. All options are in the [CLI reference](/guide/cli).

## What it contains

| Part | Source | What it does |
|---|---|---|
| CLI entry point | [`src/cli.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit/src/cli.ts) | Parses the arguments, runs every project, writes the reports, sets the exit code. |
| Config loader | [`src/config/load-config.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit/src/config/load-config.ts) | Reads `ui5-blueprint-audit.yaml`. Resolves the project type and the languages. |
| Rule config merge | [`src/config/merge-rule-config.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit/src/config/merge-rule-config.ts) | Combines rule defaults with the overrides from the config. |
| Plugin loader | [`src/plugins/load-plugins.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit/src/plugins/load-plugins.ts) | Loads the core plugin and the plugins from the config. Builds the rule map. |
| Project context | [`src/context/load-project-context.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit/src/context/load-project-context.ts) | Reads the project files once. |
| Engine | [`src/engine/run-project.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit/src/engine/run-project.ts) | Runs one project from config to results. |
| Reports | [`src/report/`](https://github.com/tobiashofmann/UI5-BlueprintAudit/tree/main/packages/ui5-blueprint-audit/src/report) | Markdown, JUnit XML, HTML, and the console text summary. |
| CLI texts | [`src/locales/`](https://github.com/tobiashofmann/UI5-BlueprintAudit/tree/main/packages/ui5-blueprint-audit/src/locales) | Report titles, column headers, and error messages in `de`, `en`, and `pt-BR`. |

The [run flow](/dev/flow) shows how these parts work together.

## Use it as a library

The package also exports its building blocks, so you can embed the audit in another tool:

```ts
import { runProject, renderMarkdownReport } from "@abap/ui5-blueprint-audit";
```

Exports: `loadConfig`, `ConfigError`, `mergeRuleConfig`, `loadProjectContext`, `loadPlugins`, `buildRuleMap`, `PluginLoadError`, `runProject`, `resolveProjectDirs`, `hasErrorFindings`, `renderMarkdownReport`, `renderJUnitReport`, `renderHtmlReport`, `renderTextSummary`. The generated API reference comes from `npm run docs:api`.

## Dependencies

`@abap/ui5-blueprint-audit-plugin-core`, `@abap/ui5-blueprint-audit-types`, and `yaml`.
