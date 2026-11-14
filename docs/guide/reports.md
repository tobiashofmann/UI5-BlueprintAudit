# Reports

Every run writes these files to `ui5-blueprint-audit-report/` (change the folder with `--out`):

| File | Content |
|---|---|
| `report_<locale>.md` | One Markdown report per active language, for example `report_en.md` and `report_de.md`. |
| `table_<locale>.md` | Only with `--table`. Compact table per project: rule, status icon, and the message for failed rules. Includes project name and scan date. |
| `report.html` | One self-contained file with all active languages and a language switcher. |
| `report.xml` | JUnit XML. One test case per rule, one test suite per project. Always English, so CI dashboards stay stable. |

The console also prints a short text summary. See [Scan your first project](/guide/#_4-run-the-audit).

## HTML report

![The HTML report with the Details section expanded. It shows a summary table and, for each rule, its description, severity, status, and findings.](/images/report-html.png)

## Markdown report

The Markdown report starts with a summary table and then lists every rule of every project. This is the start of `report_en.md` for `sample-prj/prj-violations-1`:

```markdown
# UI5 BlueprintAudit Report

Generated: 2026-11-08T15:18:15.697Z

## Summary

| Project | Type | Errors | Warnings | Status |
|---|---|---|---|---|
| prj-violations-1 | fs | 9 | 8 | ❌ |

## prj-violations-1

Project type: fs

| Rule | Severity | Status | Findings |
|---|---|---|---|
| `typescript` | error | ✅ | – |
| `xml-views` | error | ✅ | – |
| `controller-matches-view` | error | ❌ | webapp/view/Detail.view.xml: View "webapp/view/Detail.view.xml" references controller "de.itsfullofstars.gr.test.viol.prjviolations1.controller.Detail", for which no file "Detail.controller.ts" exists. |
| `folder-structure` | error | ❌ | webapp/model: Required folder missing: webapp/model |
```

::: info Counts
The error and warning counts in the console, Markdown, and HTML summaries count **findings**. `report.xml` has one test case per rule, so it counts a rule with findings as one failure.
:::

## Languages

`en` is the reference language. Add `de` and `pt-BR` with `--lang en,de,pt-BR`. A plugin can add more languages. See [Plugins and localization](/dev/plugins-and-locales).
