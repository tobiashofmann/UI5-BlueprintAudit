# UI5 BlueprintAudit

[![CI](https://github.com/tobiashofmann/UI5-BlueprintAudit/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/tobiashofmann/UI5-BlueprintAudit/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/tobiashofmann/UI5-BlueprintAudit/badges/coverage.json)](https://github.com/tobiashofmann/UI5-BlueprintAudit/actions/workflows/ci.yml)

CLI that checks a UI5 project against company guidelines: project structure, manifest,
and configuration. Complements ESLint (code quality) and `@ui5/linter` (UI5 API usage),
doesn't replace them. The full rule catalog is in
[`docs/ui5-blueprint-audit-rules.md`](docs/ui5-blueprint-audit-rules.md).

## Installation

```bash
npm install --save-dev @abap/ui5-blueprint-audit
```

## Usage

The project type is required: `fs` (Freestyle), `fe` (Fiori Elements), or `lib`
(Library) — via `--type` or `projectType` in `ui5-blueprint-audit.yaml`.

```bash
# check the current project
npx ui5-blueprint-audit --type fs

# check a specific project (the folder has its own webapp/manifest.json)
npx ui5-blueprint-audit path/to/my-app --type fs

# check multiple projects in one folder (each direct subdirectory = one project)
npx ui5-blueprint-audit projects/ --type fs
```

As an npm script (`package.json`):

```json
{
  "scripts": {
    "audit": "ui5-blueprint-audit --type fs"
  }
}
```

More options:

- `--lang de,en,pt-BR` – output languages, overrides `languages` in `ui5-blueprint-audit.yaml`. Default `de,en`.
- `--out <dir>` – target folder for the reports (default `ui5-blueprint-audit-report/`).
- `--help`

Exit code `1` if at least one `error` finding is present. `warn` alone doesn't abort.

## Configuration

`ui5-blueprint-audit.yaml` in the project root, only overrides what's specified:

```yaml
projectType: fs
languages: [de, en]   # Default if not set: [de, en]
plugins:
  - ./guardrails-rules/local.mjs
  - "@abap/ui5-blueprint-audit-rules-fiori"
rules:
  no-custom-controls: error
  namespace:
    - error
    - value: com.firma
  ui5-version:
    - error
    - min: "1.152"
  odata-mockdata: off
```

## Localization

Three languages are shipped by default: `de`, `en`, `pt-BR` (`en` is the reference
language — if a translation is missing in `de`/`pt-BR`, it falls back to `en`). New
languages can be added as a regular plugin, without forking the tool:

```js
// my-locale-fr.mjs
export default {
  name: "my-locale-fr",
  apiVersion: "1",
  rules: {},
  locales: {
    fr: {
      "report.title": "Rapport UI5 BlueprintAudit",
      // further keys optional — anything missing falls back to English automatically
    },
  },
};
```

Load it in `ui5-blueprint-audit.yaml` like any other plugin
(`plugins: ["./my-locale-fr.mjs"]`), then use `--lang fr`.

## Reports

Every run writes these files to `ui5-blueprint-audit-report/`:

- `report_<locale>.md` – one Markdown file per active language (e.g. `report_de.md`, `report_en.md`)
- `report.xml` – JUnit, always English (one testcase per rule, project = testsuite) — independent of `languages`, for stable CI dashboards
- `report.html` – a single file with all active languages embedded and a language switcher

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## NPMJS

Dependency chain: types → plugin-core → ui5-blueprint-audit. Since these are exact pinned versions (not workspace:*), publish in this order, so each dependency is live on the registry before the package that needs it:

Run from repo root:

```sh
npm publish -w @abap/ui5-blueprint-audit-types
npm publish -w @abap/ui5-blueprint-audit-plugin-core
npm publish -w @abap/ui5-blueprint-audit
```

### Automated release

Bumping `version` in `packages/ui5-blueprint-audit/package.json` and merging that to `main`
triggers [`.github/workflows/release.yml`](.github/workflows/release.yml), which:

1. Runs lint, typecheck, build, and the full test suite (same gate as CI).
2. Publishes each of the three packages to npm in the order above, skipping any package
   whose `name@version` is already on the registry (safe to merge version bumps that aren't
   perfectly in lockstep across the three packages).
3. Creates a GitHub release tagged `v<version>` with auto-generated release notes.

Authenticates to npm via [Trusted Publishing](https://docs.npmjs.com/trusted-publishers)
(OIDC) — no `NPM_TOKEN` secret to manage or rotate. Each of the three packages needs its own
Trusted Publisher connection configured once on its npmjs.com package settings page:
GitHub Actions, organization/user `tobiashofmann`, repository `UI5-BlueprintAudit`, workflow
filename `release.yml`, "Allow npm publish" enabled.

Pushing to `main` without touching that file's `version` field does not trigger a release.
