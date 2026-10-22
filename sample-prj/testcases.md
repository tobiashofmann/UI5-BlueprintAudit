# Test projects

These projects are the test reference for `ui5-blueprint-audit`. Each row names the
current actual state of a project: which rules from `docs/ui5-blueprint-audit-rules.md`
it violates.

This table isn't just documentation — it is checked 1:1 by an automated test:
[`packages/ui5-blueprint-audit/src/integration/sample-projects.test.ts`](../packages/ui5-blueprint-audit/src/integration/sample-projects.test.ts)
loads the config (`ui5-blueprint-audit.yaml`, if present) and the project context for
each project here, and runs all 33 core rules from `@abap/ui5-blueprint-audit-plugin-core`.
If a rule is changed or a fixture project is adjusted, this test fails if the table here
no longer matches.

`prj-js` and `prj-ts` are unmodified `@sap/generator-fiori:basic` scaffolds and were
*not* cleaned up afterwards — the table therefore describes the real state, not a
deliberate single-violation scenario. `prj-js-flp-plugin` and `prj-ts-flp-plugin` are
likewise unmodified generator scaffolds, but of type Fiori Launchpad plugin
(`sap.app/type: component`, `sap.flp/type: plugin`, no `index.html`, no own OData
service) instead of a standalone app. `prj-violations-1`, `prj-valid`, and
`prj-violations-2`, on the other hand, are purpose-built.

## Rule matrix

One row per rule, one column per project — shows at a glance which rule actually fires
as a violation in which project. Derived from the same engine run as the table below
and the automated test (see above).

✅ rule ran, no findings — ❌ rule ran, at least 1 finding — ⬜ rule didn't run here at
all (project type doesn't match the rule, e.g. `theme` only for `fs`/`fe`; or default
severity `off` and not enabled via config in this project — only affects
`odata-mockdata`)

| Rule | `prj-js` | `prj-ts` | `prj-ts-lib` | `prj-violations-1` | `prj-valid` | `prj-violations-2` | `prj-js-flp-plugin` | `prj-ts-flp-plugin` |
|---|---|---|---|---|---|---|---|---|
| `app-icons` | ❌ | ❌ | ⬜ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `app-title-description` | ✅ | ✅ | ⬜ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `app-version` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| `cache-buster` | ❌ | ❌ | ⬜ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `consistent-namespace` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `content-densities` | ✅ | ✅ | ⬜ | ❌ | ✅ | ✅ | ❌ | ✅ |
| `controller-matches-view` | ✅ | ✅ | ⬜ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `deploy-config` | ❌ | ✅ | ⬜ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `device-types` | ✅ | ✅ | ⬜ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `dialogs-folder` | ✅ | ✅ | ⬜ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `flex-enabled` | ✅ | ✅ | ⬜ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `flp-config` | ❌ | ✅ | ⬜ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `folder-structure` | ✅ | ✅ | ⬜ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `fragments-folder` | ✅ | ✅ | ⬜ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `framework` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `i18n-fallback` | ❌ | ❌ | ⬜ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `i18n-languages` | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `i18n-used` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `mockserver-config` | ❌ | ❌ | ⬜ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `namespace` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `no-custom-controls` | ✅ | ✅ | ⬜ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `no-custom-css` | ❌ | ❌ | ⬜ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `non-odata-json` | ✅ | ✅ | ⬜ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `odata-metadata-local` | ✅ | ✅ | ⬜ | ✅ | ✅ | ❌ | ✅ | ✅ |
| `odata-mockdata` | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ❌ | ⬜ | ⬜ |
| `odata-service` | ❌ | ❌ | ⬜ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `playwright-tests` | ❌ | ❌ | ⬜ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `qunit-opa-tests` | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| `theme` | ✅ | ✅ | ⬜ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `typescript` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `ui5-version` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| `wdi5-tests` | ❌ | ❌ | ⬜ | ❌ | ✅ | ✅ | ❌ | ❌ |
| `xml-views` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |

**Note on `namespace`:** the rule compares `sap.app/id` (or `ui5.yaml#metadata.name` for
LIB) against a company namespace (catalog default: `de.itsfullofstars`). All projects
here use this prefix, so they already satisfy the rule without their own
`ui5-blueprint-audit.yaml`.

**Note on `odata-mockdata`:** default `off` in the catalog — doesn't run at all without
being explicitly enabled in the config, so it isn't counted in the table for
`prj-js`/`prj-ts`/`prj-violations-1`/`prj-valid`. `prj-violations-2` deliberately enables
the rule in its own `ui5-blueprint-audit.yaml` to actually test it once.

| Project | Violates | Remark |
|---|---|---|
| `prj-js` | `typescript`, `odata-service`, `no-custom-css`, `cache-buster`, `i18n-languages`, `i18n-fallback`, `mockserver-config`, `framework`, `ui5-version`, `flp-config`, `deploy-config`, `wdi5-tests`, `playwright-tests`, `app-icons`, `app-version` | JavaScript instead of TypeScript; otherwise identical gaps to `prj-ts` (see below) |
| `prj-ts` | `odata-service`, `no-custom-css`, `cache-buster`, `i18n-languages`, `i18n-fallback`, `mockserver-config`, `framework`, `ui5-version`, `wdi5-tests`, `playwright-tests`, `app-icons`, `app-version` | TypeScript, FLP inbound and deploy config (`target.url`) are present and correct |
| `prj-ts-lib` | `framework`, `ui5-version`, `app-version` | Real OpenUI5 TS library (`projectType: lib`); 10 of the 33 rules don't apply to LIB at all, or read from library-specific sources (see `docs/ui5-blueprint-audit-rules.md`, "Special cases for libraries" section) |
| `prj-violations-1` | `controller-matches-view`, `folder-structure`, `theme` (`sap_bluecrystal`), `consistent-namespace`, `i18n-languages`, `device-types` (only `tablet`), `content-densities` (only `cozy`), `qunit-opa-tests`, `wdi5-tests`, `playwright-tests`, `app-icons`, `app-version` | The first 7 are the originally purpose-built violations; the last 5 (`qunit-opa-tests` … `app-version`) were added only once these rules were later added to the catalog — the project was never retrofitted for them |
| `prj-valid` | *(none)* | Fully rule-compliant baseline project, including a real Northwind OData v4 service; FLP inbound and deploy config carried over 1:1 from `prj-ts` |
| `prj-violations-2` | `app-title-description`, `dialogs-folder`, `flex-enabled`, `fragments-folder`, `i18n-used`, `no-custom-controls`, `non-odata-json`, `odata-metadata-local`, `odata-mockdata`, `xml-views` | Based on `prj-valid`, but deliberately violates exactly the 10 rules that otherwise never appear in any other fixture (see below) |
| `prj-js-flp-plugin` | `typescript`, `folder-structure`, `cache-buster`, `namespace`, `i18n-languages`, `i18n-fallback`, `flex-enabled`, `content-densities`, `mockserver-config`, `ui5-version`, `deploy-config`, `wdi5-tests`, `playwright-tests`, `app-icons`, `app-version` | Unmodified FLP plugin generator scaffold, JavaScript |
| `prj-ts-flp-plugin` | `folder-structure`, `cache-buster`, `namespace`, `i18n-languages`, `i18n-fallback`, `flex-enabled`, `mockserver-config`, `deploy-config`, `app-title-description`, `qunit-opa-tests`, `wdi5-tests`, `playwright-tests`, `app-icons` | Unmodified FLP plugin generator scaffold, TypeScript |

## Details per rule

- **`typescript`**: `prj-js` has no `tsconfig.json` and only `.js` controllers/component (outside `webapp/test`, which is exempt from the rule). `prj-ts` satisfies the rule.
- **`odata-service`**: neither project has a `dataSource` of type `OData` in the manifest (`min: 1` not reached).
- **`no-custom-css`**: both have `webapp/css/style.css` (generator boilerplate, only a comment as content) and reference it under `sap.ui5/resources/css`.
- **`cache-buster`**: neither a cachebuster task/middleware in `ui5.yaml` nor a versioned cachebuster URL in `index.html`.
- **`i18n-languages`**: only the base file `i18n.properties` exists; `supportedLocales` isn't configured in the i18n model, `i18n_de.properties`/`i18n_en.properties` are missing.
- **`i18n-fallback`**: `fallbackLocale` isn't set in the i18n model.
- **`mockserver-config`**: no `ui5-mockserver.yaml` in the project root.
- **`framework`**: `ui5.yaml` has no `framework.name` (no `framework` block present).
- **`ui5-version`**: `sap.ui5/dependencies/minUI5Version` is set in the manifest (`1.152.x`), but `framework.version` is entirely missing from `ui5.yaml` — consistency check not possible.
- **`flp-config`**: `prj-js` has no `sap.app/crossNavigation/inbounds`. `prj-ts` has an inbound (`sample-display`) and satisfies the rule.
- **`deploy-config`**: `prj-js` has no `ui5-deploy.yaml`. `prj-ts` has a `ui5-deploy.yaml` with task `deploy-to-abap` and `configuration.target.url: http://a4h` — satisfies the rule.
- **`theme`**: *not* violated — `index.html` sets `data-sap-ui-theme="sap_horizon"` (allowed), and `ui5.yaml`, lacking a `framework` block, provides no conflicting value. The rule is only violated in `prj-violations-1` (see below), where both sources explicitly use `sap_bluecrystal`.
- **`wdi5-tests`** / **`playwright-tests`**: no `wdio.conf.*`/`playwright.config.*` and no matching dependency in `package.json`.
- **`app-icons`**: `sap.ui/icons/icon` and `/favIcon` are empty strings (generator placeholders).
- **`app-version`**: `sap.app/applicationVersion/version` is still `0.0.1`.
- **`app-title-description`**: all four projects satisfy the rule — `sap.app/title`/`description` reference i18n, and `appTitle`/`appDescription` are set to non-empty values in `i18n.properties`.
- Rules with no findings in `prj-js`/`prj-ts` (i.e. effectively satisfied or not applicable): `xml-views`, `controller-matches-view`, `folder-structure`, `no-custom-controls`, `non-odata-json` (no non-OData sources present), `fragments-folder`/`dialogs-folder` (no fragments present), `namespace` (`sap.app/id` starts with the catalog default `de.itsfullofstars`), `consistent-namespace`, `device-types`, `flex-enabled`, `content-densities`, `i18n-used`, `qunit-opa-tests` (both have QUnit test suites from the generator), `odata-mockdata` (default `off`).

### `prj-violations-1`

Originally a purpose-built counterpart to `prj-js`/`prj-ts`: the following seven rules
were deliberately violated, with every other rule that existed at the time deliberately
implemented correctly (including `odata-service`, `odata-metadata-local`, the `theme`
base mechanics, `framework`, `ui5-version`, `cache-buster`, `mockserver-config`,
`flp-config`, `deploy-config`, `fragments-folder`, `dialogs-folder`, `i18n-fallback`,
`app-title-description`, `no-custom-css`, `typescript`, `namespace`).

- **`controller-matches-view`**: `Detail.view.xml` has `controllerName` set to `...controller.Detail`, but no `Detail.controller.ts` exists. `View1.view.xml` is unaffected by this (see `consistent-namespace`) — `webapp/controller/View1.controller.ts` exists and the file name matches.
- **`folder-structure`**: there is no `webapp/model` (the device model is created inline in `Component.ts`, without its own module).
- **`theme`**: `index.html` and `ui5.yaml` (`framework.libraries`) are consistent, but use `sap_bluecrystal`/`themelib_sap_bluecrystal` instead of the mandated `sap_horizon`.
- **`consistent-namespace`**: `View1.view.xml` has `controllerName="de.itsfullofstars.gr.test.ts.prjts.controller.View1"` — the namespace of `prj-ts`, not its own (`de.itsfullofstars.gr.test.viol.prjviolations1`).
- **`i18n-languages`**: `supportedLocales` is `["en", "fr"]`; `de` is missing both there and as `i18n_de.properties`.
- **`device-types`**: `sap.ui/deviceTypes` is `{ desktop: false, tablet: true, phone: false }`.
- **`content-densities`**: `sap.ui5/contentDensities` is `{ compact: false, cozy: true }`.
- **OData**: `sap.app/dataSources/northwind` uses the real public Northwind service (`https://services.odata.org/v4/northwind/northwind.svc/`, OData v4), with a locally mirrored `$metadata` under `webapp/localService/metadata.xml`.

Since the original version, five new rules were added to the catalog
(`qunit-opa-tests`, `wdi5-tests`, `playwright-tests`, `app-icons`, `app-version`).
The project was never retrofitted for them and therefore violates them as well —
this isn't a flaw in the project, it just shows that it predates these rules.

### `prj-valid`

Fully rule-compliant baseline project — all active rules from the catalog are satisfied
(verified by the integration test, see above).

- **`typescript`** / **`xml-views`** / **`no-custom-controls`**: TypeScript controller/component, XML views, no own controls.
- **`controller-matches-view`** / **`folder-structure`** / **`consistent-namespace`**: only `App` and `View1`, each with a matching controller under `webapp/controller`; `webapp/model` exists (`models.ts`); the same namespace `de.itsfullofstars.gr.test.valid.prjvalid` everywhere.
- **`odata-service`** / **`odata-metadata-local`**: the only `dataSource` is `northwind` (OData v4, Northwind sample service), with local `$metadata` under `webapp/localService/metadata.xml`.
- **`no-custom-css`**: no `.css` file under `webapp`, no `sap.ui5/resources/css`.
- **`theme`**: `sap_horizon` consistently in `index.html` (`data-sap-ui-theme`) and `ui5.yaml` (`framework.libraries: themelib_sap_horizon`).
- **`cache-buster`**: `ui5.yaml` has an explicit `builder.customTasks` entry `generateCachebusterInfo`.
- **`fragments-folder`** / **`dialogs-folder`**: one correct example each under `webapp/view/fragments` and `webapp/view/dialogs`.
- **`i18n-used`** / **`i18n-languages`** / **`i18n-fallback`**: `i18n.properties` (= fallback `en`) plus `i18n_de.properties`; `supportedLocales: ["de", "en"]`, `fallbackLocale: "en"`.
- **`device-types`** / **`flex-enabled`** / **`content-densities`**: all at default (`true`/`true`/`true`).
- **`mockserver-config`**: `ui5-mockserver.yaml` present.
- **`framework`** / **`ui5-version`**: `framework.name: SAPUI5`, `framework.version` and `minUI5Version` both `1.152.1`.
- **`flp-config`**: `sap.app/crossNavigation/inbounds` — carried over 1:1 from `prj-ts` (`semanticObject: sample`, `action: display`).
- **`deploy-config`**: `ui5-deploy.yaml` with `deploy-to-abap` — carried over 1:1 from `prj-ts` (`target.url: http://a4h`, `client: "100"`, app `ZSAMPLE`/`ZTEST`).
- **`app-title-description`**: `title`/`description` reference i18n with non-empty values.
- **`namespace`**: `sap.app/id` starts with the catalog default `de.itsfullofstars`, no own config needed.
- **`qunit-opa-tests`**: `webapp/test/unit/unitTests.qunit.ts` present.
- **`wdi5-tests`**: `wdio.conf.ts` plus `wdio-ui5-service` in `package.json`.
- **`playwright-tests`**: `playwright.config.ts` plus `@playwright/test` in `package.json`.
- **`app-icons`**: `sap.ui/icons/icon` and `/favIcon` are set.
- **`app-version`**: `sap.app/applicationVersion/version` is `1.0.0`, not the generator default.

### `prj-violations-2`

Based 1:1 on `prj-valid` (same namespace prefix, FLP inbound, deploy config,
framework/version), but deliberately violates exactly the 10 rules that never appear
as a violation in any of the other four fixtures (see the project's README.md):

- **`app-title-description`**: `sap.app/title` is the fixed string `"Sample App"` instead of an i18n reference (`description` stays correct, so the rule isn't violated for two reasons at once).
- **`dialogs-folder`**: `ConfirmDialog.fragment.xml` (root element `Dialog`) sits directly under `webapp/view/` instead of `webapp/view/dialogs/`.
- **`flex-enabled`**: `sap.ui5/flexEnabled` is `false`.
- **`fragments-folder`**: `InfoFragment.fragment.xml` sits directly under `webapp/view/` instead of `webapp/view/fragments/`.
- **`i18n-used`**: the i18n model has `type: sap.ui.model.odata.v4.ODataModel` instead of `sap.ui.model.resource.ResourceModel` — `settings` (including `supportedLocales`/`fallbackLocale`) stay unchanged, so that `i18n-languages`/`i18n-fallback` aren't also violated.
- **`no-custom-controls`**: `webapp/control/MyCustomControl.ts` extends `sap/ui/core/Control`.
- **`non-odata-json`**: the additional `dataSource` `staticConfig` has `type: "XML"` instead of `"JSON"`.
- **`odata-metadata-local`**: the `localUri` of the `northwind` dataSource points to `data/metadata.xml` (the file exists, but lives outside `webapp/localService`).
- **`odata-mockdata`**: turned from `off` to `error` (mode `any`) in its own `ui5-blueprint-audit.yaml`; no `webapp/localService/data` folder exists.
- **`xml-views`**: `webapp/view/Legacy.view.ts` is a non-XML view and uses `sap.ui.jsview(...)` — deliberately `.ts` instead of `.js`, otherwise `typescript` would be violated too.

The project satisfies every other rule from the catalog, just like `prj-valid`.

### `prj-js-flp-plugin` / `prj-ts-flp-plugin`

Unmodified generator scaffolds for a Fiori Launchpad plugin (JS and TS respectively) —
unlike `prj-js`/`prj-ts`, not a standalone app, but a component that plugs into the
shell: `sap.app/type: "component"` instead of `"application"`, `sap.flp/type: "plugin"`,
no `index.html`, no `rootView`/routing, no own OData service. Serve primarily to verify
that the engine can handle this different app shape (in particular the `theme` rule,
which is skipped when `index.html` is missing, see
`docs/ui5-blueprint-audit-rules.md`) — not as a deliberately constructed violation
scenario.

- **`typescript`** (JS only): no `tsconfig.json`, `webapp/Component.js` and `webapp/appconfig/appstart.js` are JavaScript.
- **`folder-structure`**: no `webapp/view`, no `webapp/controller` (for JS, additionally no `webapp/model`) — a pure plugin without its own views/controllers.
- **`cache-buster`**: no `index.html`, so also no versioned cachebuster URL; no corresponding task in `ui5.yaml`.
- **`i18n-languages`** / **`i18n-fallback`**: for JS, `supportedLocales`/`fallbackLocale` aren't set at all in the runtime i18n model (`sap.ui5/models/i18n/settings`). For TS, the runtime model is correct (`supportedLocales: ["en", "de"]`, `fallbackLocale: "en"`), but `sap.app/i18n` is given only as a string (generator shorthand, `bundleUrl` only) instead of as an object with `supportedLocales`/`fallbackLocale` — per the catalog, that counts as a missing value at this second location.
- **`flex-enabled`**: `sap.ui5/flexEnabled` isn't set in either manifest.
- **`content-densities`** (JS only): `cozy` is `false`.
- **`mockserver-config`** / **`deploy-config`**: no `ui5-mockserver.yaml`/`ui5-deploy.yaml` in the project root.
- **`ui5-version`** (JS only): `minUI5Version` (`1.38.1`) and `framework.version` (`1.150.0`) are both below `1.152` and inconsistent with each other.
- **`wdi5-tests`**: `wdio.conf.js`/`.ts` sits under `webapp/test/e2e/` for both, not in the project root — per the catalog, the rule deliberately checks only the project root.
- **`playwright-tests`**: neither a config nor a dependency present.
- **`app-icons`**: `sap.ui/icons` is missing (JS) or empty (TS).
- **`app-version`** (JS only): `sap.app/applicationVersion/version` is still `0.0.1`.
- **`app-title-description`** (TS only): `manifest.json` references `{{appTitle}}`/`{{appDescription}}`, but `i18n.properties` only contains `btnText` — the keys are genuinely missing. For JS, the manifest references `{{pluginTitle}}`/`{{pluginDescription}}`, both set to non-empty values in `i18n.properties` — the rule is satisfied there.
- **`qunit-opa-tests`** (TS only): under `webapp/test` there's only the wdi5 E2E test (`sample.test.ts`), no QUnit/OPA5.
- Not violated by either: **`namespace`** — `sap.app/id` (`de.itsfullofstars.gr.test.flp.plugin`) starts with the catalog default; **`theme`** — skipped, since no `index.html` exists (see catalog); **`flp-config`** — `sap.app/crossNavigation/inbounds` (`Shell-plugin`) is present and correct; **`odata-service`**, **`odata-metadata-local`**, **`odata-mockdata`**, **`non-odata-json`** — skipped because `sap.app/type` is `"component"` (see catalog section "Data"), even though neither project has a `dataSource` that would otherwise violate these rules anyway.
