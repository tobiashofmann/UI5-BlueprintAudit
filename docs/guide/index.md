# Scan your first project

Five steps from nothing to a finished report. Each step links to the page with the details.

## 1. Install

```bash
npm install --save-dev @abap/ui5-blueprint-audit
```

Node.js 20 or newer is required.

## 2. Create the config file

```bash
npx ui5-blueprint-audit --init
```

This writes a `ui5-blueprint-audit.yaml` into the current folder. It lists all rules with their default severity and parameters. You can read the [complete file](/guide/full-config) here. The command stops if the file already exists. Add `--force` to overwrite it.

## 3. Pick the project type

Set `projectType` in `ui5-blueprint-audit.yaml`, or pass `--type` on the command line. There is no auto-detection.

| Type | Project |
|---|---|
| `fs` | Freestyle app |
| `fe` | Fiori Elements app |
| `lib` | Library |

## 4. Run the audit

```bash
npx ui5-blueprint-audit --type fs --lang en
```

The console shows a summary. This is the output for a project with violations (`sample-prj/prj-violations-1` in the repository):

```text
✗ prj-violations-1 (fs): 9 error(s), 8 warning(s)
  error  webapp/view/Detail.view.xml: View "webapp/view/Detail.view.xml" references controller "de.itsfullofstars.gr.test.viol.prjviolations1.controller.Detail", for which no file "Detail.controller.ts" exists.
  error  webapp/model: Required folder missing: webapp/model
  error  Theme "sap_bluecrystal" is not allowed (allowed: sap_horizon).
  error  webapp/view/View1.view.xml: controllerName "de.itsfullofstars.gr.test.ts.prjts.controller.View1" in webapp/view/View1.view.xml does not use the namespace "de.itsfullofstars.gr.test.viol.prjviolations1".
  error  webapp/manifest.json: sap.app/i18n: language "de" is missing from supportedLocales.
  error  webapp/manifest.json: sap.ui5/models/i18n: language "de" is missing from supportedLocales.
  error  webapp/manifest.json: sap.ui/deviceTypes/desktop is not true.
  error  webapp/manifest.json: sap.ui/deviceTypes/phone is not true.
  error  webapp/manifest.json: sap.ui5/contentDensities/compact is not true.
  warn   webapp/test: No QUnit or OPA5 tests found under webapp/test.
  warn   wdio.conf.js: Missing wdio.conf.js (or .ts) in the project root.
  warn   package.json: wdio-ui5-service is not a dependency in package.json.
  warn   playwright.config.ts: Missing playwright.config.ts (or .js) in the project root.
  warn   package.json: @playwright/test is not a dependency in package.json.
  warn   webapp/manifest.json: sap.ui/icons/icon is not set.
  warn   webapp/manifest.json: sap.ui/icons/favIcon is not set.
  warn   webapp/manifest.json: sap.app/applicationVersion/version is still the default "0.0.1".
```

A clean project prints one line:

```text
✓ prj-valid (fs): 0 error(s), 0 warning(s)
```

## 5. Read the reports and fix findings

The reports are in `ui5-blueprint-audit-report/`. Open `report.html` in a browser, or `report_en.md` in your editor. Fix the findings, then run the command again. See [Reports](/guide/reports).

The exit code is `1` if at least one `error` finding exists, so you can [run the audit in CI](/guide/ci). Warnings alone do not fail the run.

## What next

- Turn rules off or change their parameters: [Configuration](/guide/configuration)
- All command-line options: [CLI reference](/guide/cli)
- Add your own checks: [Bring your own rules](/concepts/own-rules)
