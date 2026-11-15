# ADR-0013: Plugin rule IDs are prefixed, core rule IDs are not

**Status:** Accepted

## Context

Rule IDs are the keys in the config and in the reports. Plugins from different authors may use the same rule name. The core rules are the baseline that everyone uses, and their short IDs (`namespace`, `theme`, `ui5-version`) are already in the catalog.

## Decision

All plugins are flattened into one rule map (`buildRuleMap`). The first plugin, the core plugin, keeps bare IDs. Every other plugin gets the prefix `<plugin>/<rule>`, where `<plugin>` is the plugin's `name` field, not the npm package name.

## Consequences

- Rules from different plugins cannot collide with each other or with core rules.
- Config entries for plugin rules use the prefix, for example `acme/readme-present: error`.
- The reports and the console output show the prefixed ID.
- Renaming a plugin's `name` field is a breaking change for everyone who configures its rules.
