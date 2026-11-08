# What it checks

BlueprintAudit ships **33 rules** in the core plugin. Each rule has an ID, a default severity, optional parameters, and a list of project types it applies to. The [rules table](/rules/) lists all of them, and the [full catalog](/rules/catalog) explains each check and its parameters.

## Categories

| Category | What the rules look at | Examples |
|---|---|---|
| Technology | Languages and constructs used in the project | `typescript`, `xml-views`, `no-custom-controls`, `no-custom-css` |
| Structure | Where files live | `folder-structure`, `controller-matches-view`, `fragments-folder`, `dialogs-folder` |
| Data | OData services, metadata, mock data | `odata-service`, `odata-metadata-local`, `odata-mockdata`, `non-odata-json`, `mockserver-config` |
| Configuration | `manifest.json`, `ui5.yaml`, `index.html` | `theme`, `ui5-version`, `device-types`, `flex-enabled`, `deploy-config`, `flp-config` |
| Namespace | The app namespace | `namespace`, `consistent-namespace` |
| i18n | Translation files and settings | `i18n-used`, `i18n-languages`, `i18n-fallback` |
| Tests | Test setup | `qunit-opa-tests`, `wdi5-tests`, `playwright-tests` |

## Sources the rules read

`manifest.json`, `ui5.yaml`, further `ui5-*.yaml` files, `package.json`, `index.html`, the file tree of the project, and XML views and fragments. Rules do not read the file system on their own. They read a project context that is loaded once per run. See [Project context and rules](/dev/context-and-rules).

## Project types

A rule only runs for the project types listed in the catalog. For example, `theme` runs for `fs` only, and `namespace` runs for `fs`, `fe`, and `lib`.

## Severity

Most rules are `error` by default. These are `warn` by default: `i18n-fallback`, `flex-enabled`, `mockserver-config`, `qunit-opa-tests`, `wdi5-tests`, `playwright-tests`, `app-icons`, `app-version`. `odata-mockdata` is `off` by default. Change any of them in [the config](/guide/configuration).

## Special cases

- **Fiori Launchpad plugins.** If `sap.app/type` in the manifest is `component`, the rules `odata-service`, `odata-metadata-local`, `odata-mockdata`, and `non-odata-json` skip themselves. A Launchpad plugin has no backend service of its own.
- **Libraries.** Libraries have no `webapp/` folder and no `manifest.json`. The rules read from `src/<namespace-as-path>/` and `ui5.yaml`. See [special cases for libraries](/rules/catalog#special-cases-for-libraries).
- **Missing files.** Some rules skip a comparison when one of the files is absent. For example, `theme` compares `index.html` with `ui5.yaml` only if both exist, so Launchpad apps without an `index.html` are not flagged for it.
