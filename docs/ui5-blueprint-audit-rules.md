# Rule Catalog: UI5 BlueprintAudit

As of: 2026-10-16 (draft)

This catalog describes all rules of the company linter for UI5 projects. Every rule has a fixed ID, a default status, and optional parameters. The defaults can be overridden per project in the configuration file (`ui5-blueprint-audit.yaml`). Rules can be turned on or off there.

## Conventions

- **Severity:** `off`, `warn`, `error`
- **Project types:** `freestyle` (FS), `fiori-elements` (FE), `library` (LIB). A rule is only applied to projects of the listed types.
- **Project type specification:** The user specifies the type when starting the tool; it is not detected automatically. Example: `ui5-blueprint-audit --type fs`, `--type fe`, or `--type lib`. Alternatively, it can be set as `projectType` in the configuration file. The command-line value takes precedence. If the type is missing, the tool aborts with an error message.
- **Namespacing:** Rules from the core plugin have no prefix. Rules from plugins have the prefix `<plugin>/<rule>`.
- **Version values** are always configured as a string (`"1.152"`) and compared semantically.
- **Sources checked:** `manifest.json`, `ui5.yaml`, `ui5-*.yaml`, `index.html`, the file tree under `webapp`, XML views and fragments.

## Overview

| # | ID | Category | Default | Project types |
|---|---|---|---|---|
| 1 | `typescript` | Technology | error | FS, LIB |
| 2 | `xml-views` | Technology | error | FS, FE, LIB (only if it contains UI5 controls) |
| 3 | `controller-matches-view` | Structure | error | FS |
| 4 | `folder-structure` | Structure | error | FS |
| 5 | `no-custom-controls` | Technology | error | FS, FE |
| 6 | `odata-service` | Data | error | FS, FE |
| 7 | `odata-metadata-local` | Data | error | FS, FE |
| 8 | `odata-mockdata` | Data | off | FS, FE |
| 9 | `non-odata-json` | Data | error | FS |
| 10 | `no-custom-css` | Technology | error | FS, FE |
| 11 | `theme` | Configuration | error | FS |
| 12 | `cache-buster` | Configuration | error | FS |
| 13 | `namespace` | Namespace | error | FS, FE, LIB |
| 14 | `consistent-namespace` | Namespace | error | FS, FE, LIB |
| 15 | `fragments-folder` | Structure | error | FS |
| 16 | `dialogs-folder` | Structure | error | FS |
| 17 | `i18n-used` | i18n | error | FS, FE, LIB |
| 18 | `i18n-languages` | i18n | error | FS, FE, LIB |
| 19 | `i18n-fallback` | i18n | warn | FS, FE |
| 20 | `device-types` | Configuration | error | FS, FE |
| 21 | `flex-enabled` | Configuration | warn | FS, FE |
| 22 | `content-densities` | Configuration | error | FS, FE |
| 23 | `mockserver-config` | Data | warn | FS, FE |
| 24 | `framework` | Configuration | error | FS, FE, LIB |
| 25 | `ui5-version` | Configuration | error | FS, FE, LIB |
| 26 | `flp-config` | Configuration | error | FS, FE |
| 27 | `deploy-config` | Configuration | error | FS, FE |
| 28 | `app-title-description` | Configuration | error | FS, FE |
| 29 | `qunit-opa-tests` | Tests | warn | FS, FE, LIB |
| 30 | `wdi5-tests` | Tests | warn | FS |
| 31 | `playwright-tests` | Tests | warn | FS, FE |
| 32 | `app-icons` | Configuration | warn | FS, FE |
| 33 | `app-version` | Configuration | warn | FS, FE, LIB |

---

## Technology

### 1. `typescript`

**Description:** The project uses TypeScript.

**Check:**
- `tsconfig.json` exists in the project root.
- Under `webapp`, there are no `.js` files for controllers, components, or modules, only `.ts` files.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `allowJs` | `[]` | Glob patterns for `.js` files that are allowed (e.g. polyfills) |

### 2. `xml-views`

**Description:** Views are implemented as XML views.

**Check:** There are no files with the extensions `.view.js`, `.view.json`, `.view.html`, or `.view.ts`, and no use of `sap.ui.jsview`, `sap.ui.htmlview`, or `sap.ui.jsonview`.

**Project types:** Applies to freestyle apps, Fiori Elements apps, and libraries. For libraries, the rule is only applied if the library contains UI5 controls (classes that extend `Control`); otherwise it is skipped.

**Parameters:** none

### 5. `no-custom-controls`

**Description:** The project does not define its own UI5 controls. On by default, can be turned off per project.

**Check:** No class in the project extends `sap/ui/core/Control`, `sap/ui/core/Element`, or another control (`extends Control`, `Control.extend(...)`). Requires AST analysis.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `allow` | `[]` | Names of classes that are allowed |

### 10. `no-custom-css`

**Description:** The project does not contain its own CSS.

**Check:**
- There are no `.css` files under `webapp`.
- `sap.ui5/resources/css` in the manifest is empty or missing.
- Inline styles (`style=` in XML) are **not** checked and remain allowed.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `allow` | `[]` | Glob patterns for allowed CSS files |

---

## Structure

### 3. `controller-matches-view`

**Description:** Every XML view with a controller references a controller whose name matches
the view's file name, and that controller exists as a file.

**Check:** For every view with `controllerName`:
- The view's own name is authoritative (not the controller's): `Home.view.xml` must
  reference a controller `....Home`, e.g. not `....App` — even if `App.controller.ts`
  happens to exist.
- If the name matches, the corresponding controller file (`Home.controller.ts`/`.js`)
  must actually exist.
- Views without `controllerName` are not flagged.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `caseSensitive` | `false` | Whether to respect case when comparing |

### 4. `folder-structure`

**Description:** The minimum folder structure is present, and XML views and controllers live in the designated folders.

**Check:**
- `webapp/controller`, `webapp/view`, and `webapp/model` exist.
- `*.view.xml` files live under `webapp/view`, `*.controller.ts` files under `webapp/controller`.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `folders` | `controller`, `view`, `model` | Required folders under `webapp` |
| `viewPath` | `webapp/view` | Location of views |
| `controllerPath` | `webapp/controller` | Location of controllers |

### 15. `fragments-folder`

**Description:** XML fragments that are not dialogs live in a `fragments` folder.

**Check:** Every `*.fragment.xml` whose root element is not a dialog (see `dialogs-folder`) lives under `basePath`.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `basePath` | `webapp/view/fragments` | Folder for fragments |

### 16. `dialogs-folder`

**Description:** Fragments with a dialog as the root element live in a `dialogs` folder, separate from regular fragments.

**Check:** Every `*.fragment.xml` whose root element is listed in `dialogRoots` lives under `basePath`.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `dialogRoots` | `Dialog`, `Popover` | Root elements that count as a dialog |
| `basePath` | `webapp/view/dialogs` | Folder for dialogs |

---

## Data

**Special case, FLP plugins:** If `sap.app/type` in the manifest is `"component"` (instead of
`"application"`), all four rules in this section (`odata-service`,
`odata-metadata-local`, `odata-mockdata`, `non-odata-json`) skip themselves automatically. A Fiori
Launchpad plugin only hooks into the shell and, by design, has no
backend service of its own — unlike project-type detection (`fs`/`fe`/`lib`, see
the "Project type" section in `CLAUDE.md`), this is not a case of auto-detecting the
*project type*, but an additional, purely manifest-based condition within the
`fs`/`fe` type.

### 6. `odata-service`

**Description:** Number of OData services used. Also covers the requirement on the number of multiple services.

**Check:** All `dataSources` in `sap.app` with `type: OData` that are assigned to a model in `sap.ui5/models` are counted. The count must be between `min` and `max`.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `min` | `1` | Minimum count |
| `max` | no limit | Maximum count |

### 7. `odata-metadata-local`

**Description:** The OData metadata document is located locally in the `localService` directory.

**Check:** Every OData `dataSource` has a `settings.localUri`, and the `metadata.xml` it points to exists.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `basePath` | `webapp/localService` | Location of the local service files |

### 8. `odata-mockdata`

**Description:** Mock data for the OData service is present. Off by default, can be turned on per project.

**Check:** Depending on `mode`:
- `any`: at least one `.json` file exists in `dataPath`.
- `one-entity`: a `<EntitySet>.json` exists for at least one EntitySet from `metadata.xml`.
- `all-entities`: a `<EntitySet>.json` exists for every EntitySet.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `mode` | `any` | `any`, `one-entity`, or `all-entities` |
| `dataPath` | `webapp/localService/data` | Location of the mock data |

### 9. `non-odata-json`

**Description:** Other services that are not OData are implemented as a JSONModel.

**Check:** Every `dataSource` in `sap.app` that is not of type `OData` has `type: JSON`. The model in `sap.ui5/models` is a JSONModel. The number of OData services is checked by `odata-service`.

**Parameters:** none

### 23. `mockserver-config`

**Description:** A configuration for running the app with MockServer is present and uses the best-practice naming.

**Check:** The file `fileName` exists in the project root.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `fileName` | `ui5-mockserver.yaml` | Expected file name |

---

## Configuration

### 11. `theme`

**Description:** The theme is specified and configured consistently.

**Check:**
- The theme in `index.html` (`data-sap-ui-theme`) is in the `themes` list.
- The matching theme library (`themelib_<theme>`) is listed in `ui5.yaml`.
- If one of the two files is missing (e.g. for Launchpad apps), it is skipped. If the theme is found in neither, there is an error.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `themes` | `sap_horizon` | Allowed themes (list) |

### 12. `cache-buster`

**Description:** The app uses the cache buster.

**Check:** Either the cache-buster task or the corresponding middleware is configured in `ui5.yaml`, or `index.html` includes UI5 via the versioned cache-buster URL.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `sources` | `ui5.yaml`, `index.html` | Where to look |

### 20. `device-types`

**Description:** The supported device types are specified.

**Check:** `sap.ui/deviceTypes` in the manifest matches the expected values.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `desktop` | `true` | expected value |
| `tablet` | `true` | expected value |
| `phone` | `true` | expected value |

### 21. `flex-enabled`

**Description:** `flexEnabled` has the specified value.

**Check:** `sap.ui5/flexEnabled` in the manifest matches `value`.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `value` | `true` | expected value |

### 22. `content-densities`

**Description:** The content densities have the specified values.

**Check:** `sap.ui5/contentDensities` in the manifest matches the expected values.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `compact` | `true` | expected value |
| `cozy` | `true` | expected value |

### 24. `framework`

**Description:** The framework used is specified.

**Check:** `framework.name` in `ui5.yaml` matches `name`.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `name` | `SAPUI5` | `SAPUI5` or `OpenUI5` |

### 25. `ui5-version`

**Description:** The UI5 version meets the requirement.

**Check:**
- `sap.ui5/dependencies/minUI5Version` in the manifest and `framework.version` in `ui5.yaml` are at least `min`.
- Both values are consistent with each other.
- Versions are compared semantically, not as strings.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `min` | `"1.152"` | Minimum version (to be maintained regularly) |
| `max` | no limit | Maximum version |

### 26. `flp-config`

**Description:** The app has a Fiori Launchpad configuration for at least one tile.

**Check:** `sap.app/crossNavigation/inbounds` in the manifest has at least one entry with `semanticObject` and `action`.

**Parameters:** none

### 27. `deploy-config`

**Description:** A deployment configuration with a configured backend is present.

**Check:**
- The file `fileName` exists in the project root.
- It has a deploy task configured (e.g. `deploy-to-abap`) whose `configuration.target.destination` or `configuration.target.url` is set and not empty.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `fileName` | `ui5-deploy.yaml` | Expected file name |

### 28. `app-title-description`

**Description:** The app has a title and a description with actual text.

**Check:**
- `sap.app/title` and `sap.app/description` are set in the manifest and reference i18n (e.g. `{{appTitle}}`).
- The referenced key exists in the i18n base file (`i18n.properties`) and has a non-empty value there.

**Parameters:** none

### 32. `app-icons`

**Description:** The app has its own icons instead of the generator's placeholders.

**Check:** The fields listed in `requiredIcons` under `sap.ui/icons` in the manifest are set (not empty).

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `requiredIcons` | `icon`, `favIcon` | Fields to check under `sap.ui/icons` |

### 33. `app-version`

**Description:** The app version has been maintained and is not the generator's default.

**Check:** `sap.app/applicationVersion/version` in the manifest is not equal to `defaultValue`.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `defaultValue` | `0.0.1` | Value that counts as "not maintained" |

---

## Namespace

### 13. `namespace`

**Description:** The app uses the specified namespace.

**Check:** `sap.app/id` in the manifest starts with `value`.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `value` | `de.itsfullofstars` | Expected namespace |

### 14. `consistent-namespace`

**Description:** All artifacts of the app use the same namespace.

**Check:** `sap.app/id`, `controllerName`, `fragmentName`, `viewName`, and class IDs in views, fragments, and code all start with the same namespace as `sap.app/id`.

**Parameters:** none

---

## i18n

### 17. `i18n-used`

**Description:** i18n is used.

**Check:**
- An i18n model is configured in the manifest.
- The base file (`i18n.properties`) exists.
- Hardcoded texts in views are **not** checked.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `basePath` | `webapp/i18n` | Location of the i18n files |

### 18. `i18n-languages`

**Description:** The app supports the languages specified by the company.

**Check:** For every language in `languages`:
- It is listed in `supportedLocales` — checked in both places that UI5 does not
  synchronize automatically (see `i18n-fallback`): `sap.app/i18n/supportedLocales` and
  `sap.ui5/models/i18n/settings/supportedLocales`. If it is missing in either place,
  that produces its own error.
- A corresponding file `i18n_<xx>.properties` exists. For the fallback language
  (`sap.ui5/models/i18n/settings/fallbackLocale`, which governs loading the file at
  runtime), the base file `i18n.properties` is enough.

If either of these is missing (e.g. for `pt`), there is an error.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `languages` | `de`, `en` | Required languages |
| `strict` | `false` | If `true`, additional languages beyond those required are an error |

### 19. `i18n-fallback`

**Description:** A default language is specified.

**Check:** `fallbackLocale` matches `value` and is included in `supportedLocales` — checked in
two separate places in the manifest that UI5 does not synchronize automatically: `sap.app/i18n`
(descriptor level, used among other things for resolving `sap.app/title`/`sap.app/description` by
tools without a running UI5 runtime) and `sap.ui5/models/i18n/settings` (the runtime resource
model for `{i18n>...}` bindings). Both must explicitly set `fallbackLocale`; if `sap.app/i18n` is
given only as a string (the old short form, `bundleUrl` only), that counts as missing.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `value` | `en` | Expected fallback language |

---

## Tests

### 29. `qunit-opa-tests`

**Description:** The project has unit or integration tests with QUnit or OPA5.

**Check:** At least one test file exists under `basePath`: a QUnit test suite
(`*.qunit.js`, `*.qunit.ts`, or `*.qunit.html`) or an OPA5 journey (a file that
imports/requires `sap/ui/test/Opa5`). If both are missing, there is a warning.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `basePath` | `webapp/test` | Location of the tests |

### 30. `wdi5-tests`

**Description:** The project uses wdio-ui5 (`wdi5`) for end-to-end tests.

**Check:** A wdio configuration file (`configFile`) exists in the project root, and
`package.json` has `wdio-ui5-service` as a dependency.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `configFile` | `wdio.conf.js` | Expected file name (`.ts` is also accepted) |

### 31. `playwright-tests`

**Description:** The project uses Playwright for end-to-end tests.

**Check:** A Playwright configuration file (`configFile`) exists in the project root, and
`package.json` has `@playwright/test` as a dependency.

**Parameters:**
| Name | Default | Description |
|---|---|---|
| `configFile` | `playwright.config.ts` | Expected file name (`.js` is also accepted) |

---

## Special cases for libraries

Libraries have no `webapp/manifest.json` — the source code lives under `src/<namespace-as-path>/`,
tests under `test/` (not `webapp/test/`), and there is no app manifest. The following rules
therefore read from different sources than FS/FE when `projectType: lib`, but check
the same thing in substance:

| Rule | FS/FE source | LIB source |
|---|---|---|
| `typescript` | `.js` files under `webapp/` (except `webapp/test/`) | `.js` files under `src/` |
| `xml-views` | source files under `webapp/` | source files under `src/` |
| `namespace` | `sap.app/id` in `manifest.json` | `metadata.name` in `ui5.yaml` |
| `consistent-namespace` | `sap.app/id` as the base namespace | `metadata.name` in `ui5.yaml` as the base namespace |
| `i18n-used` | i18n model in `manifest.json` + `webapp/i18n/i18n.properties` | `src/<namespace>/messagebundle.properties` (no model to check, since there is no manifest) |
| `i18n-languages` | `supportedLocales` in `manifest.json` + `webapp/i18n/i18n_<xx>.properties` | `src/<namespace>/messagebundle_<xx>.properties` for **every** required language (no `supportedLocales`, so no fallback free pass for the base file either) |
| `framework` / `ui5-version` | `ui5.yaml` plus `sap.ui5/dependencies/minUI5Version` in `manifest.json` (including the consistency check) | `ui5.yaml` only — `manifest.json` doesn't exist, so the consistency check doesn't apply |
| `app-version` | `sap.app/applicationVersion/version` in `manifest.json`, default `"0.0.1"` | `version` in `package.json`, default `"1.0.0"` |
| `qunit-opa-tests` | tests under `webapp/test/` | tests under `test/` |

Two rules that listed `LIB` in earlier catalog versions now apply only to
FS/FE, because there is no corresponding configuration option for libraries:

- **`i18n-fallback`**: libraries do not declare a `fallbackLocale` — the base file
  (`messagebundle.properties`) is always the fallback by UI5 convention; there is nothing
  that could be misconfigured.
- **`app-icons`**: `sap.ui/icons` is an app/Launchpad-tile concept from `manifest.json`
  that doesn't exist for libraries.

## Open issues

None currently. New questions that come up during implementation are added here.
