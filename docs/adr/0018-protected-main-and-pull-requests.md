# ADR-0018: `main` is protected, all changes land through pull requests

**Status:** Accepted

## Context

Merging to `main` can trigger a release (see [ADR-0019](./0019-automated-release-with-trusted-publishing.md)), so what lands on `main` is effectively published. Direct pushes would bypass review and the CI checks.

## Decision

- `main` on GitHub is protected. Direct pushes are rejected, and changes land only through a pull request.
- Every piece of work happens on a dedicated branch named `<type>/<short-description>`: `feature/`, `fix/`, `chore/` (also for docs-only changes), in kebab-case. The project has no ticket system.
- Before a new commit on an existing branch, check that the branch is not already merged. New or unrelated changes get a fresh branch.
- Work is pushed with an upstream tracking ref and the pull request is opened and merged by a person in the GitHub UI. Merging is not automated.
- The repository carries a project skill, `feature-branch`, that applies this workflow for AI assistants.
- CI (build, test, lint, SBOM generation) runs on pushes and pull requests. Dependabot proposes dependency updates, with major bumps of `typescript` and `@types/node` excluded on purpose. Updates are tested locally (see `docs/testing-dependabot-prs-locally.md`).
- Contribution rules are in `CONTRIBUTING.md`, the code of conduct in `CODE_OF_CONDUCT.md`, and the security policy in `SECURITY.md`.

## Consequences

- No change reaches `main` without a pull request and passing CI.
- A task needs its branch before the first edit, and its own pull request.
- Workflows that hold credentials add their own guard on top (see [ADR-0019](./0019-automated-release-with-trusted-publishing.md)).
