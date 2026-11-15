# ADR-0005: Translation logic lives in the types package

**Status:** Accepted

## Context

`@abap/ui5-blueprint-audit-types` was meant to hold types only. But the core plugin needs a translator for its own tests, and the CLI package already depends on the core plugin. If the core plugin took the translator from the CLI package, the dependency would be circular.

## Decision

`@abap/ui5-blueprint-audit-types` also contains the small, stateless translation helpers: `buildLocaleRegistry`, `createTranslator`, and `mergeLocaleRegistries`. This is a deliberate exception to "types only". The types package is the only shared base of both the CLI and the core plugin.

## Consequences

- No circular dependency between `plugin-core` and the CLI package.
- The types package has a small runtime footprint and needs its own tests.
- Everything in it must stay stateless and free of other dependencies, so it stays cheap to depend on.
- See [ADR-0015](./0015-localization.md) for how the helpers are used.
