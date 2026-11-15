# ADR-0006: The project context is loaded once, rules never touch the file system

**Status:** Accepted

## Context

Most rules read the same few sources: `manifest.json`, `ui5.yaml`, `ui5-*.yaml`, `index.html`, and the list of files under the project. With 33 rules, several languages, and several projects per run, repeated disk access would be slow. Rules that read files themselves would also be hard to test, because every test would need a real folder.

## Decision

A central layer, `loadProjectContext`, reads the project once and builds a context object with the manifest, `ui5.yaml`, the `ui5-*.yaml` extensions, `package.json`, `index.html`, the file tree, the project type, and `readFile(path)`. Rules operate on this context only and do not access the file system themselves.

Details:

- The file tree skips hidden directories, `node_modules`, `dist`, `coverage`, and `ui5-blueprint-audit-report`.
- `readFile` reads each path from disk once per project and caches it.
- Parsed XML and TypeScript AST results are cached, so the per-language rule runs reuse them.
- A manifest, `ui5.yaml`, `ui5-*.yaml`, or `package.json` that cannot be parsed is a project error, not a missing file.

## Consequences

- Rules are fast and can be tested with a context built from plain objects, without files on disk.
- A rule that needs another file inside the project uses `ctx.projectContext.readFile(path)`.
- Anything outside the file tree's skip list is part of the audit. Changing the skip list changes what rules can see.
- This applies to plugin authors as well (see [ADR-0012](./0012-plugin-loading.md)).
