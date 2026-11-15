# ADR-0010: `typescript` is a runtime dependency of the core plugin

**Status:** Accepted

## Context

Most rules read structured files: JSON, YAML, and XML. XML views and fragments are parsed with `fast-xml-parser`, YAML with `yaml`, and JSON directly. Some rules check code, for example `no-custom-controls`, which looks for classes that extend a control. A regular expression is not a reliable way to find that in TypeScript and JavaScript sources.

## Decision

Rules that check code use the TypeScript AST. For that reason `typescript` is a regular `dependency` of `@abap/ui5-blueprint-audit-plugin-core`, not a `devDependency`. It is needed at runtime, not only for building.

## Consequences

- The installed size of the tool includes TypeScript.
- Code checks work the same for TypeScript and JavaScript projects.
- Parsed ASTs are cached per project, so the per-language rule runs do not parse a file twice (see [ADR-0006](./0006-project-context-loaded-once.md)).
- The SBOMs list `typescript` as a production dependency (see [ADR-0020](./0020-sbom-generation.md)).
