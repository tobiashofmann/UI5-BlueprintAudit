# ADR-0011: YAML configuration that only overrides defaults, validated strictly

**Status:** Accepted

## Context

Teams adapt the blueprint per project: different namespaces, UI5 versions, or switched-off rules. The config should be easy to read and to comment, because the reason for an exception matters as much as the exception.

A first version accepted anything. A misspelled severity ran the rule but never counted as an error, and an unknown rule ID was silently ignored.

## Decision

- **Format:** YAML, in `ui5-blueprint-audit.yaml` in the project root. Comments are explicitly intended. `.json`, `.js`, and `.mjs` may be supported as well.
- **Overrides only:** the config overrides the defaults of the rule set. Each rule can be `off`, `warn`, or `error`, and may have parameters, written as `[severity, options]`.
- **Strict validation:** a severity other than `off`, `warn`, or `error`, a rule ID no loaded plugin provides, and a `languages`, `plugins`, or `rules` entry with the wrong shape fail the project with exit code `1`. A misspelled setting is never ignored silently.
- **Version strings** such as `"1.152"` are always strings and are compared semantically, never as string or number. `"1.152.0"` does not exceed `"1.152"`.
- **Priority:** command-line options (`--type`, `--lang`) take precedence over the config.
- **JSON Schema:** a schema for editors (`yaml-language-server`) is planned. The same schema would validate the config at runtime. It is not implemented yet and is on the backlog.

## Consequences

- Config mistakes are found immediately and reported as project errors.
- The default config is the single place where the blueprint's baseline is defined. Projects only record their deviations.
- A new rule parameter needs its handling in `ctx.options` and the documentation in the catalog and the configuration guide.
- Until the JSON Schema exists, editors give no autocompletion for rule names and parameters.
