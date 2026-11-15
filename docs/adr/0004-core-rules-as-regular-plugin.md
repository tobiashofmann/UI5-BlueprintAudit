# ADR-0004: The core rules are a regular plugin

**Status:** Accepted

## Context

Companies need rules of their own next to the shared blueprint. A plugin mechanism has to exist. If the built-in rules used a private path, the plugin mechanism would be exercised only by third parties and could rot.

## Decision

The default rules live in their own package, `@abap/ui5-blueprint-audit-plugin-core`, and implement the same plugin contract as any external plugin: `{ name, apiVersion, rules, configs?, locales? }`. The engine has no special treatment for built-in rules, beyond loading the core plugin first and giving its rules unprefixed IDs (see [ADR-0013](./0013-rule-namespacing.md)).

## Consequences

- The product itself exercises the plugin mechanism on every run.
- Anything the core rules need from the engine is available to plugin authors too, through `ctx`.
- Changes to the plugin contract affect the core rules first, which acts as an early compatibility check.
- Helpers the core rules use (XML, TypeScript AST, `.properties` parsing, version comparison) are internal to `plugin-core`. External plugins do not get them through the contract.
