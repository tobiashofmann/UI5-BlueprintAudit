# UI5 BlueprintAudit

CLI command: `ui5-blueprint-audit`. Config file: `ui5-blueprint-audit.yaml`.

An npm package (CLI) that checks a UI5 project against company guidelines. It complements ESLint and `@ui5/linter`, but doesn't replace them:

| Tool | Checks |
|---|---|
| ESLint | Code quality |
| `@ui5/linter` | UI5 API usage and compatibility (UI5 2.x) |
| **this tool** | Company guidelines for project structure, manifest, and configuration |

## Source of truth

The rule catalog lives in `docs/ui5-blueprint-audit-rules.md`. It contains all rules with ID, check, parameters, default severity, and project types (the overview table in the catalog shows the current count). Rule changes are made there first, then in code. In case of conflicts between code and catalog, the catalog wins, unless the user decides otherwise.

## Architecture decisions

- **Standalone npm project**, not an ESLint plugin and not a plugin for `@ui5/linter`. Reason: the rules mostly check project structure, manifest, and config files, not individual source files. No plugin API for custom rules is known for `@ui5/linter`.
- **Language:** TypeScript on Node.js, ESM.
- **Monorepo** (npm workspaces):
  - `@abap/ui5-blueprint-audit`: core with CLI, config loader, plugin loader, formatter
  - `@abap/ui5-blueprint-audit-plugin-core`: the default rules from the catalog, itself built as a regular plugin (no special treatment of built-in rules)
  - `@abap/ui5-blueprint-audit-types`: types for plugin authors
  - Package scope: `@abap`.
  - `@abap/ui5-blueprint-audit-types` contains, besides the types, also the small, stateless translation logic (`buildLocaleRegistry`, `createTranslator`, `mergeLocaleRegistries`). This is a deliberate exception to "types only": `plugin-core` needs a translator for its own tests and must not get a dependency on the CLI package for that (otherwise circular, since `ui5-blueprint-audit` already depends on `plugin-core`) — `-types` is the only shared base of both packages.
- **Project Context:** A central layer reads `manifest.json`, `ui5.yaml`, `ui5-*.yaml`, `index.html`, and the file tree under `webapp` once. Rules operate on this context and don't access the file system themselves.
- **Careful when renaming package names:** `tsconfig.json` `references` paths (`../ui5-blueprint-audit-types` etc.) and `package.json#repository.directory` point to actual folder names under `packages/` — do NOT change them automatically when changing the npm package name (`name` field), only when the folders themselves are also renamed.
- **LIB projects have no `webapp/`:** source code lives under `src/<namespace-as-path>/`, no `manifest.json`. Project detection runs via `ui5.yaml#type` (`application`/`library`), not via file layout. Details/mapping table: catalog section "Special cases for libraries".
- **Parser:** `fast-xml-parser` (or similar) for XML views and fragments, `yaml` for YAML, JSON directly. For rules that check code (e.g. `no-custom-controls`), the TypeScript AST is used. That's why `typescript` is a regular `dependency` in `plugin-core`, not a `devDependency` — needed at runtime, not just for building.

## Configuration

- **Format:** YAML, file `ui5-blueprint-audit.yaml` in the project root. Comments are explicitly intended.
- **JSON Schema** is shipped so editors can autocomplete and validate rule names and parameters (`yaml-language-server`). The same schema validates the config at runtime.
- Optionally also support `.json` and `.js`/`.mjs`.
- The config only overrides the rule set's defaults. Every rule can be turned on or off (`off`, `warn`, `error`) and has optional parameters.
- **Version strings** are always strings (`"1.152"`) and compared semantically, never as string or number.

```yaml
# ui5-blueprint-audit.yaml
projectType: fs
languages: [de, en]   # Default if not set: [de, en]
plugins:
  - ./guardrails-rules/local.mjs   # local file
  - "@abap/ui5-blueprint-audit-rules-fiori"        # npm package
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

## Project type

- The user specifies the type. There is **no automatic detection**.
- CLI: `ui5-blueprint-audit --type fs|fe|lib`. Alternatively `projectType` in the config. The command line takes precedence.
- If the type is missing, the tool aborts with a clear error message.
- Types: `fs` (Freestyle), `fe` (Fiori Elements), `lib` (Library). A rule only runs for the types listed in the catalog.

## Plugins

- Plugins are loaded via the config: local file (path starts with `./`, `../`, or `/`, relative to the config file) or npm package.
- npm packages are resolved from the **project directory** (`createRequire(configPath).resolve(...)` or `import.meta.resolve`), not from the linter's directory. Loaded via dynamic `import()`.
- Local plugins are `.mjs` or `.js`. Local `.ts` plugins only if a loader (e.g. `jiti`) is built in.
- **Plugin contract:** A plugin exports `{ name, apiVersion, rules, configs?, locales? }`. Every rule has `meta` (among others `defaultSeverity`, `descriptionKey`, project types) and a `check(ctx)` function that reports findings via `ctx.report(...)` and resolves localized texts via `ctx.t(key, params?)`.
- **Namespacing:** Rule IDs from plugins have the prefix `<plugin>/<rule>`. Core plugin rules have no prefix.
- `apiVersion` declares the plugin API version. If it doesn't match, the linter reports this cleanly.

## Localization

- Three languages shipped by default: `de`, `en`, `pt-BR`. `en` is the reference language — if a key is missing in another language (including in an add-on), it falls back to `en`.
- Controlled via `languages` in `ui5-blueprint-audit.yaml` (default `[de, en]`) or `--lang de,en,pt-BR` on the CLI (CLI takes precedence).
- **New languages as add-ons:** A plugin can bring its own or additional translations via the optional `locales` field (`{ [locale]: { [key]: template } }`) — including for keys that the tool report itself uses (titles, column headers, etc.), not just for its own rules. Loaded the same way as any other plugin (local file or npm package via `plugins:` in the config) — no dedicated loader needed.
- Rule messages and `descriptionKey`s live as flat `Record<string, string>` bundles in `locales/{de,en,pt-BR}.ts` in `plugin-core` (rule content) and in `ui5-blueprint-audit` (report/CLI labels, error texts of `ConfigError`/`PluginLoadError`). `de`/`pt-BR` are typed as `Record<keyof typeof en, string>` — a missing key is a build error. In addition, one test per package checks key parity between the languages.
- Interpolation is deliberately simple: only `{paramName}`, no ICU/pluralization.
- **Output files:** `report_<locale>.md` per active language. `report.xml` (JUnit) always stays English regardless of `languages` (CI stability). `report.html` is a single file with all active languages embedded and a language switcher.

## Output and exit codes

- Formatters: Markdown (per language), JUnit XML (always English), HTML (all languages, with switcher), text (console, first active language).
- Exit code `1` on at least one `error`. `warn` alone doesn't abort.
- Can be invoked via `npx`, as an npm script, and in pre-commit hooks.

## Important details from the rule catalog

The catalog is authoritative. These points are especially easy to get wrong:

- `theme`: default `sap_horizon`. Checks `data-sap-ui-theme` in `index.html` and the theme library (`themelib_<theme>`) in `ui5.yaml`. If one of the files is missing (e.g. Launchpad apps without `index.html`), it is skipped.
- `mockserver-config`: file name `ui5-mockserver.yaml` (configurable), default `warn`.
- `fragments-folder` and `dialogs-folder`: `webapp/view/fragments` and `webapp/view/dialogs`. A fragment counts as a dialog if its root element is in `dialogRoots` (default `Dialog`, `Popover`).
- `no-custom-css`: inline styles (`style=` in XML) are **not** checked.
- `i18n-used`: hardcoded texts in views are **not** checked.
- `i18n-languages`: every configured language must be listed in `supportedLocales` and have an `i18n_<xx>.properties` file. For the fallback language, the base file `i18n.properties` is enough.
- `odata-mockdata`: default **off**. Modes `any`, `one-entity`, `all-entities`. EntitySets come from `metadata.xml`.
- **FLP plugins:** if `sap.app/type` in the manifest is `"component"` (instead of `"application"`), `odata-service`, `odata-metadata-local`, `odata-mockdata`, and `non-odata-json` skip themselves automatically — a Launchpad plugin has no backend service of its own by design. See `util/component.ts` in `plugin-core` and catalog section "Data".
- `no-custom-controls`: default **on**, applies to FS and FE, not to libraries.
- `xml-views`: applies to FS, FE, and LIB. For libraries, only if they contain UI5 controls.
- Default severity `warn`: `i18n-fallback`, `flex-enabled`, `mockserver-config`, `qunit-opa-tests`, `wdi5-tests`, `playwright-tests`, `app-icons`, `app-version`. All other active rules `error`.
- `namespace`: default `de.itsfullofstars`, configurable.
- `ui5-version`: default minimum version `"1.152"`, to be maintained regularly.

## Working practices

- Language of documentation and user communication: English. Code, identifiers, rule IDs, and commit messages: English too.
- This is independent of the tool's own `languages`/`--lang` option (see "Localization") — the CLI must keep offering `de`, `en`, and `pt-BR` as report/output languages regardless of which language this project's docs and chats are written in.
- Every rule gets tests with small fixture projects (one valid and one invalid each). Fixtures cover the project types `fs`, `fe`, and `lib`, as far as the rule applies to them.
- `sample-prj/` + `packages/ui5-blueprint-audit/src/integration/sample-projects.test.ts` are the regression source of truth (documented actual state in `sample-prj/testcases.md`) — check here first for engine/rule changes.
- Always keep new or changed rules in sync with the catalog `docs/ui5-blueprint-audit-rules.md`.
- When rule definitions are unclear, ask, don't guess. Record open questions in the "Open issues" section of the catalog.

## Future ideas (backlog)

- **JSON Schema for `ui5-blueprint-audit.yaml`** (see "Configuration" section) — not yet
  implemented. Everything else from the original setup plan (monorepo, plugin interface,
  config loader, project context, plugin loader, all 33 rules, formatter) is done.
- **Example plugin as a standalone npm package:** primarily meant to test the plugin
  loading mechanism (local file vs. npm package, see "Plugins" section) end-to-end, not
  intended as a core rule. First idea for a rule in it: check whether UI5 Web Components
  (`@ui5/webcomponents`) are used in the project.
- **New rule: library blacklist.** List of forbidden UI5 libraries; if one of them is used
  (e.g. in `sap.ui5/dependencies/libs` in the manifest or `ui5.yaml#framework.libraries`), `error`.
  Still to be clarified: where the blacklist is configured (rule parameter vs. company-wide
  setting) and whether it applies uniformly to FS/FE/LIB.
