# ADR-0020: CycloneDX SBOMs per package, generated with `cyclonedx-npm`

**Status:** Accepted

## Context

Consumers of the packages, and companies that run the tool in their pipelines, may need a software bill of materials. The repository has a monorepo root and three published packages, and the production dependencies must be separate from the development ones.

`npm sbom --omit=dev` was found to silently drop packages that are a `devDependency` anywhere in the workspace, even when another package needs them in production. This was confirmed for `typescript` and `yaml`, which are real production dependencies.

## Decision

- `npm run sbom` generates two CycloneDX SBOMs, a `devdependencies` variant with the full tree and a `production` variant with `--omit=dev`, for the monorepo root and for each of the three packages, into `sbom/<project>/<variant>.cdx.json`.
- The generator is `@cyclonedx/cyclonedx-npm`, not `npm sbom`, because it resolves `--omit` correctly.
- For the package-scoped SBOMs, the script `scripts/generate-sboms.mjs` promotes the package's own entry into `metadata.component` and strips the monorepo-root `bom-ref` prefix from all references, so each SBOM is self-contained.
- The monorepo root has a `version` because the tools need one to resolve the root identity.
- CI generates and uploads all SBOMs as a workflow artifact on every push and pull request. The release workflow generates them and attaches them to the GitHub release (see [ADR-0019](./0019-automated-release-with-trusted-publishing.md)).

## Consequences

- Every release ships verifiable dependency lists, with production and development dependencies kept apart.
- The post-processing in `scripts/generate-sboms.mjs` has to be maintained if `cyclonedx-npm` changes how it describes the main component.
- The `sbom/` folder is generated output and is removed by `npm run clean`.
