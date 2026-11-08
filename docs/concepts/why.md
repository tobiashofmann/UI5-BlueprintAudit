# Why BlueprintAudit

A company that builds many UI5 apps usually has a blueprint: the same folder layout, the same namespace, the same manifest settings, the same languages, the same deployment setup. Without a check, every new app drifts a little. Reviews catch some of it, and the rest shows up later, in production.

BlueprintAudit turns the blueprint into an automatic check. It answers one question: **does this project follow our guidelines?**

## The main reasons

- **Same rules for every project.** The rules live in one catalog and one config, not in the heads of reviewers.
- **Fast feedback.** The audit reads files only. It does not start a UI5 server or a browser, so it runs in seconds, locally and in CI.
- **Findings you can act on.** Every finding names the file and says what is wrong.
- **Adjustable.** Every rule can be turned off or tuned per project, and you can add rules of your own.
- **Reports for every audience.** Markdown for people, HTML with a language switcher for sharing, JUnit XML for CI dashboards.

## How it fits next to other tools

BlueprintAudit complements your linters and does not replace them.

| Tool | Checks |
|---|---|
| ESLint | Code quality |
| [`@ui5/linter`](https://github.com/UI5/linter) | UI5 API usage and compatibility (UI5 2.x) |
| **BlueprintAudit** | Company guidelines for project structure, manifest, and configuration |

The [linter coverage check](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/docs/linter-coverage.md) compares all 33 rules with ESLint and `@ui5/linter` and shows where they overlap.

## Why a standalone tool

The rules mostly check the project as a whole: its structure, its manifest, and its config files. They do not check single source files. For that reason BlueprintAudit is its own CLI, not an ESLint plugin and not a plugin for `@ui5/linter`.

## What it does not do

- It does not check code quality or UI5 API usage. Use ESLint and `@ui5/linter`.
- It does not detect the project type. You say whether a project is `fs`, `fe`, or `lib`.
- It does not check hardcoded texts in views, and it does not check inline `style=` attributes in XML.
