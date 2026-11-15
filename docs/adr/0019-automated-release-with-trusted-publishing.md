# ADR-0019: Releases are triggered by a version bump and published with npm Trusted Publishing

**Status:** Accepted

## Context

Three packages must be published in dependency order, with exact pinned cross-dependencies (see [ADR-0003](./0003-monorepo-three-packages.md)). Doing this by hand is error-prone. A long-lived `NPM_TOKEN` in the repository secrets is a standing credential that can publish any code.

Automated security reviews of the first workflow found two problems: an unpinned `npm install -g npm@^11.5.1` ran inside the job that holds the OIDC publish credential, and a manual `workflow_dispatch` from a feature branch could have published unreviewed code, bypassing the pull-request protection of `main`.

## Decision

A release is a version bump merged to `main`.

- **Trigger:** `packages/ui5-blueprint-audit/package.json` changes on `main`, and its `version` differs from the previous one (compared with `github.event.before`, not just `HEAD^`). If the version is unchanged, there is no release.
- **Credentials:** npm Trusted Publishing (OIDC) instead of an `NPM_TOKEN`. It is configured once per package on npmjs.com for the workflow `release.yml`. Packages are published with provenance.
- **Job split:** a `verify` job (lint, typecheck, build, test) has `contents: read` only. The credentialed `publish-and-release` job runs checkout, `npm ci --ignore-scripts`, `npm publish`, and the GitHub release step, to keep dependency code with access to the token to a minimum.
- **No extra installs in the credentialed job:** the runner uses Node.js 24, which already bundles an npm version that supports Trusted Publishing.
- **Branch guard:** the release jobs run only for `refs/heads/main` when the ref is protected, also on manual dispatch. The credentialed job repeats the guard, and spells out `success()` for the `verify` result, because an explicit `if` replaces the implicit success check of `needs`.
- **Order and idempotency:** publish `types`, `plugin-core`, CLI, and skip versions that are already published.
- **Release:** the GitHub release gets the tag `v<version>`, generated notes, and the SBOMs (see [ADR-0020](./0020-sbom-generation.md)).
- GitHub Actions are pinned by SHA, with least-privilege permissions per job.

## Consequences

- No long-lived npm secret exists in the repository.
- A release needs a version-bump pull request that updates all three `package.json` files and the pinned cross-dependencies.
- A change to `release.yml`, such as renaming it, must be mirrored in the Trusted Publisher configuration on npmjs.com.
- A merge to `main` that does not change the version never publishes.
