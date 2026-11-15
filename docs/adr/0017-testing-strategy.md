# ADR-0017: Fixture tests per rule, sample projects as regression source, local mutation testing

**Status:** Accepted

## Context

The rules are small functions over a context, but their behavior depends on many project shapes: Freestyle, Fiori Elements, and library projects, JavaScript and TypeScript, application and Launchpad plugin. Line coverage alone does not show whether the tests would notice a changed behavior.

## Decision

- **Every rule has tests with small fixture projects:** one valid and one invalid each. Fixtures cover `fs`, `fe`, and `lib`, as far as the rule applies to them.
- **Sample projects are the regression source of truth.** `sample-prj/` and `packages/ui5-blueprint-audit/src/integration/sample-projects.test.ts` document the actual state, described in `sample-prj/testcases.md`. They are checked first when the engine or a rule changes. Their dependencies are stripped of test and lint tooling, to keep the fixtures free of vulnerabilities.
- **Rules are tested without disk access:** `test-utils.ts` in the core plugin builds a context from plain objects and runs one rule. It is kept out of the published build.
- **Mutation testing is local only.** StrykerJS (`npm run mutation`) measures whether the tests catch behavior changes, with one root `stryker.config.json` and the shared root Vitest configuration. Reports go to `reports/mutation/`, which is ignored by Git. It is not part of CI.
- **Tooling:** Vitest for tests, with coverage and JUnit output. Allure 3 report generation and coverage badges are available as additional views.

## Consequences

- A new or changed rule is not done without its valid and invalid fixtures.
- Changes to the engine or rules must be checked against the sample projects, and `sample-prj/testcases.md` kept accurate.
- Tests that read the raw source text of rule files break under Stryker's instrumentation, and are skipped there.
- Stryker artifacts (`.stryker-tmp/`, `reports/`) are excluded from ESLint and Vitest, so a local mutation run does not disturb `npm run lint` and `npm test`.
