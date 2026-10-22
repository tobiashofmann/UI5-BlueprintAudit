# Linter coverage check: BlueprintAudit vs. ESLint/TS and `@ui5/linter`

Checks whether any of the 33 rules in `ui5-blueprint-audit-rules.md` overlap with a
generic JS/TS linter (ESLint) or with `@ui5/linter`. Sources: the rule catalog in this
repo, and `@ui5/linter`'s rule list at
[`https://github.com/UI5/linter/blob/main/docs/Rules.md`](https://github.com/UI5/linter/blob/main/docs/Rules.md)
(20 rules, checked 2026-10-22).

| # | Rule ID | Category | JS/TS linter (ESLint) | `@ui5/linter` | Reasoning |
|---|---|---|---|---|---|
| 1 | `typescript` | Technology | No | No | Project setup check (`tsconfig.json`, file extensions), not code content |
| 2 | `xml-views` | Technology | No | Partial | `no-deprecated-api` would flag the deprecated `sap.ui.jsview`/`htmlview`/`jsonview` factories, but doesn't check for the mere presence of `.view.js`/`.view.json` files |
| 3 | `controller-matches-view` | Structure | No | No | Naming convention between two files |
| 4 | `folder-structure` | Structure | No | No | Folder convention |
| 5 | `no-custom-controls` | Technology | No | No | Business rule, not a deprecation/syntax concern |
| 6 | `odata-service` | Data | No | No | Count/configuration of `dataSources` in the manifest |
| 7 | `odata-metadata-local` | Data | No | No | File existence check |
| 8 | `odata-mockdata` | Data | No | No | File existence check |
| 9 | `non-odata-json` | Data | No | No | Manifest convention |
| 10 | `no-custom-css` | Technology | No | No | File existence check |
| 11 | `theme` | Configuration | No | Partial | `no-deprecated-theme` detects *deprecated* themes; BlueprintAudit checks an *allowed* theme list (policy) — same data point, different purpose |
| 12 | `cache-buster` | Configuration | No | No | Build/config check |
| 13 | `namespace` | Namespace | No | No | Company policy for `sap.app/id` |
| 14 | `consistent-namespace` | Namespace | No | No | Consistency across multiple artifacts |
| 15 | `fragments-folder` | Structure | No | No | Folder convention |
| 16 | `dialogs-folder` | Structure | No | No | Folder convention |
| 17 | `i18n-used` | i18n | No | No | Configuration/file existence check |
| 18 | `i18n-languages` | i18n | No | No | Manifest/file convention for company languages |
| 19 | `i18n-fallback` | i18n | No | No | Manifest policy value |
| 20 | `device-types` | Configuration | No | No | Manifest policy value |
| 21 | `flex-enabled` | Configuration | No | No | Manifest policy value |
| 22 | `content-densities` | Configuration | No | No | Manifest policy value |
| 23 | `mockserver-config` | Data | No | No | File existence check |
| 24 | `framework` | Configuration | No | No | `ui5.yaml` policy value |
| 25 | `ui5-version` | Configuration | No | Partial | `no-legacy-ui5-version-in-manifest` reads the same path (`sap.ui5/dependencies/minUI5Version`), but flags *legacy* versions (UI5 2.x compatibility), not compliance with a configurable company minimum version |
| 26 | `flp-config` | Configuration | No | No | Manifest policy |
| 27 | `deploy-config` | Configuration | No | No | File/config existence check |
| 28 | `app-title-description` | Configuration | No | No | Manifest + i18n content check |
| 29 | `qunit-opa-tests` | Tests | No | Partial | `prefer-test-starter` checks whether tests follow the Test Starter concept (structure/wiring), not whether QUnit/OPA5 tests exist at all |
| 30 | `wdi5-tests` | Tests | No | No | E2E tooling outside `@ui5/linter`'s scope |
| 31 | `playwright-tests` | Tests | No | No | E2E tooling outside `@ui5/linter`'s scope |
| 32 | `app-icons` | Configuration | No | No | Manifest content check |
| 33 | `app-version` | Configuration | No | No | Manifest content check |

## Conclusion

- **ESLint/TS:** None of the 33 rules are covered by a generic JS/TS linter — that layer
  checks per-file code quality/syntax, while BlueprintAudit checks project structure,
  manifest, and config files.
- **`@ui5/linter`:** 4 of 33 rules have a *related* but not identical counterpart
  (`xml-views`, `theme`, `ui5-version`, `qunit-opa-tests`) — same data point, but a
  different purpose (deprecation/UI5 2.x compatibility instead of company policy). The
  remaining 29 rules have no counterpart at all.

This confirms the architecture decision in `CLAUDE.md`: there is no real redundancy with
the other two tools, only incidental overlap on the same data point for four rules.
