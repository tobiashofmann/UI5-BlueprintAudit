# ADR-0012: Plugins load from local files or npm, resolved from the project with ESM conditions

**Status:** Accepted

## Context

Companies need to add their own rules (see [ADR-0004](./0004-core-rules-as-regular-plugin.md)). Some will keep a rule in a single file next to the project, others will publish a package to an internal npm registry.

Resolving npm plugins went wrong in a first version: it used `createRequire().resolve`, which applies the CommonJS conditions. Packages whose `exports` only declare an `import` condition (and scoped or subpath ones) failed with a misleading "could not be resolved" message. The built-in `import.meta.resolve(spec, parent)` is not an option either, because it needs an experimental Node.js flag.

## Decision

- Plugins are listed in `plugins:` in the config. An entry that starts with `./`, `../`, or `/` is a local file, resolved relative to the config file. Anything else is an npm package.
- npm packages are resolved from the **project directory** with the config file as parent, not from the directory of the audit tool, with `import-meta-resolve` and the ESM conditions (`import`, `default`). The module is then loaded with dynamic `import()`.
- A package that only declares `require` falls back to `createRequire(configPath).resolve(spec)` and loads as CommonJS.
- Plugins compiled to CommonJS arrive as `{ default: plugin }`, so the loader unwraps `exports.default`.
- Local plugins are `.mjs`, `.js`, or `.cjs`. Local `.ts` plugins are supported only if a TypeScript loader such as `jiti` is built in.
- The loader reports three distinct errors for npm packages: not installed (`plugin.npmResolveFailed`), installed but not exported (`plugin.npmNotExported`), and any other failure (`plugin.npmResolveError`).
- **Plugin contract:** a plugin exports `{ name, apiVersion, rules, configs?, locales? }`. Each rule has `meta` (`defaultSeverity`, `descriptionKey`, `projectTypes`) and a `check(ctx)` function that reports with `ctx.report(...)` and translates with `ctx.t(key, params?)`.
- **API version:** `apiVersion` declares the plugin API version, currently `"1"`. If it does not match, the tool reports it and does not load the plugin.
- The shape of each rule (`meta` and `check`) is validated when the plugin loads.

## Consequences

- A package installed next to the project is found, no matter where the audit tool is installed (global, `npx`, or local).
- Publishing a plugin to an internal registry needs nothing special from the tool. It resolves from the project's `node_modules`.
- `import-meta-resolve` is a runtime dependency of the CLI package.
- Plugins read project data through `ctx.projectContext` only (see [ADR-0006](./0006-project-context-loaded-once.md)).
- The `configs` field is part of the contract, but the engine does not use it yet.
