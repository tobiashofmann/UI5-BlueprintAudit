# ADR-0016: Report formats, the always-English JUnit file, and exit codes

**Status:** Accepted

## Context

The results are read by developers in a terminal, by reviewers and managers as documents, and by CI dashboards. These audiences need different formats. CI dashboards track tests by name over time, so names must not change with the language settings.

## Decision

| Output | Content |
|---|---|
| `report_<locale>.md` | One Markdown report per active language |
| `report.xml` | JUnit XML, always English, regardless of `languages` |
| `report.html` | One file with all active languages embedded and a language switcher |
| Console text | The summary in the first active language, with the rule ID after `error` or `warn` |
| `table_<locale>.md` | Optional compact table report, written with `--table` |

All files are written to `ui5-blueprint-audit-report/`. That folder is excluded from the file tree, so reports are not audited as project files (see [ADR-0006](./0006-project-context-loaded-once.md)).

**Exit codes:** `1` if at least one finding has the severity `error`. Findings with `warn` alone do not abort. Project errors, such as invalid config, also end with `1`.

The tool runs through `npx`, as an npm script, and in pre-commit hooks.

## Consequences

- CI dashboards stay stable when the report languages change.
- `warn` is a real middle level: visible in every report, but it does not fail a build.
- A new report format needs an implementation per language where it applies, and a decision about its language rules.
