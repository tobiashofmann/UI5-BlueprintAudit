# ADR-0008: Library projects have no `webapp/`, detection runs through `ui5.yaml`

**Status:** Accepted

## Context

Applications keep their sources in `webapp/` and have a `manifest.json`. UI5 libraries do not: the sources are under `src/<namespace-as-path>/` and there is no `manifest.json`. Rules written for applications cannot assume `webapp/`.

## Decision

- For libraries the project type is `ui5.yaml#type` (`application` or `library`), not the file layout.
- Rules that apply to libraries read different sources for `lib`: `src/<namespace-as-path>/` and `ui5.yaml` instead of `webapp/` and `manifest.json`.
- The mapping from application sources to library sources is documented in the catalog section "Special cases for libraries".
- Rules that make no sense for libraries do not list `lib` as a project type, for example `no-custom-controls`. A rule such as `xml-views` applies to libraries only if they contain UI5 controls.
- The helpers for this live in `util/library.ts` in the core plugin.

## Consequences

- Every rule that supports `lib` needs a library variant and its own fixtures (see [ADR-0017](./0017-testing-strategy.md)).
- Mixing up the type, for example auditing a library as `fs`, produces findings about a missing `webapp/`. That is the expected result of [ADR-0007](./0007-explicit-project-type.md).
