# ADR-0021: VitePress documentation site, with the catalog included, not copied

**Status:** Accepted

## Context

The documentation has several audiences: people who run the tool, people who write plugins, and people who work on the tool. The rule catalog must stay the single source of truth (see [ADR-0009](./0009-rule-catalog-source-of-truth.md)), and a second copy of it would drift. Diagrams are needed to explain the run flow.

## Decision

- The documentation is a VitePress site under `docs/`, with Mermaid diagrams (`vitepress-plugin-mermaid`), organized into Guide, Concepts, Packages, Rules, and Developers.
- The site includes the catalog and its overview table through region markers in `docs/ui5-blueprint-audit-rules.md`, through `rules/catalog.md`. It does not copy them.
- Repository-internal files stay out of the site (`srcExclude`): the catalog source itself, `linter-coverage.md`, and `testing-dependabot-prs-locally.md`.
- The site is built and deployed to GitHub Pages by `.github/workflows/docs.yml`, on push to `main` when docs, package files, or the workflow change, and on manual dispatch. The workflow follows the conventions of the release workflow: SHA-pinned actions, a protected-`main` guard, no persisted credentials, and least-privilege permissions.
- The Pages base path is set through the `DOCS_BASE` environment variable.
- TSDoc on the public API is rendered to HTML with TypeDoc (`npm run docs:api`). The output is not committed.
- Architecture decision records live in `docs/adr/` and are part of the site.

## Consequences

- A change to a rule is made once, in the catalog, and shows up on the site.
- Markdown links in the site must resolve, or the build fails.
- The dev server needs `fastdom` pre-bundled so Mermaid renders (a workaround in the VitePress config).
- Docs-only changes still go through a pull request (see [ADR-0018](./0018-protected-main-and-pull-requests.md)).
