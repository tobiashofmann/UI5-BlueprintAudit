---
layout: home

hero:
  name: UI5 BlueprintAudit
  text: Check UI5 projects against your guidelines
  tagline: One command audits project structure, manifest, and configuration, and writes Markdown, HTML, and JUnit reports.
  actions:
    - theme: brand
      text: Scan your first project
      link: /guide/
    - theme: alt
      text: See all 33 rules
      link: /rules/
    - theme: alt
      text: View on GitHub
      link: https://github.com/tobiashofmann/UI5-BlueprintAudit

features:
  - icon: 🧰
    title: ui5-blueprint-audit
    details: The CLI. Loads the config and plugins, reads the project once, runs the rules, and writes the reports.
    link: /packages/audit
    linkText: CLI package
  - icon: 📋
    title: ui5-blueprint-audit-plugin-core
    details: The 33 default rules from the catalog, built as a regular plugin with no special treatment.
    link: /packages/plugin-core
    linkText: Rules package
  - icon: 🧩
    title: ui5-blueprint-audit-types
    details: The plugin contract and the small translation helpers. Everything a plugin author needs.
    link: /packages/types
    linkText: Types package
---

## Why this tool exists

ESLint checks code quality. [`@ui5/linter`](https://github.com/UI5/linter) checks UI5 API usage. Neither one checks whether a project follows the **company blueprint**: the folder layout, the namespace, the manifest settings, the i18n languages, the deployment config. BlueprintAudit does that and nothing else. [Read why](/concepts/why).

## Get going in one minute

```bash
npm install --save-dev @abap/ui5-blueprint-audit
npx @abap/ui5-blueprint-audit --init          # writes ui5-blueprint-audit.yaml
npx @abap/ui5-blueprint-audit --type fs       # audits the current project
```

The [guide](/guide/) walks through each step, and the [rules table](/rules/) lists every check.
