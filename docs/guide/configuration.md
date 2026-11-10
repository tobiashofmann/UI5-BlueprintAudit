# Configuration

The config file is `ui5-blueprint-audit.yaml` in the project root. It only **overrides** the defaults, so you can delete every line you do not need. Comments are welcome.

Create a full reference file with all 33 rules and their defaults (see the [complete file](/guide/full-config)):

```bash
npx @abap/ui5-blueprint-audit --init
```

## Example

```yaml
# ui5-blueprint-audit.yaml
projectType: fs
languages: [de, en]   # Default if not set: [de, en]
plugins:
  - ./guardrails-rules/local.mjs                   # local file
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

## Top-level keys

| Key | Description |
|---|---|
| `projectType` | `fs`, `fe`, or `lib`. Required, unless you pass `--type`. |
| `languages` | Report languages. Default `[de, en]`. Available: `de`, `en`, `pt-BR`, plus any language added by a plugin. |
| `plugins` | Plugins to load: local files or npm packages. See [Bring your own rules](/concepts/own-rules). |
| `rules` | Rule settings. |

## Rule settings

Every rule can be turned on or off, and many take parameters. There are two forms.

**Severity only:**

```yaml
rules:
  flex-enabled: warn     # off | warn | error
```

**Severity with parameters:** a list with the severity first, then the parameters.

```yaml
rules:
  ui5-version:
    - error
    - min: "1.152"
```

| Severity | Effect |
|---|---|
| `off` | The rule does not run. |
| `warn` | Findings appear in the reports. They do not change the exit code. |
| `error` | Findings appear in the reports, and the exit code is `1`. |

Parameters for each rule are in the [rules table](/rules/) and the [full catalog](/rules/catalog).

::: tip Versions are strings
Always write version numbers as strings: `"1.152"`. They are compared as versions, not as numbers or text.
:::

## Plugin paths

- A path that starts with `./`, `../`, or `/` is a local file, resolved relative to the config file.
- Anything else is an npm package, resolved from the **project** folder, not from the folder of the audit tool.
- Local plugins must be `.mjs` or `.js` files.

## Rule IDs from plugins

Rules from the core plugin have no prefix: `namespace`. Rules from a plugin have the prefix `<plugin>/<rule>`, for example `acme/readme-present`.
