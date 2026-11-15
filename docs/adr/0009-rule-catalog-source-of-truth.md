# ADR-0009: The rule catalog is the source of truth

**Status:** Accepted

## Context

The rules are agreed with people who do not read the code: ID, check, parameters, default severity, and the project types. If the code and a description drift apart, nobody knows which one is right, and details such as default severities, edge cases, and skipped situations are easy to get wrong.

## Decision

The rule catalog, `docs/ui5-blueprint-audit-rules.md`, is the source of truth for all rules. Rule changes are made there first, then in code. If code and catalog conflict, the catalog wins, unless the user decides otherwise.

Working rules that follow from this:

- New or changed rules are always kept in sync with the catalog.
- When a rule definition is unclear, ask, do not guess. Open questions go into the "Open issues" section of the catalog.
- The documentation site includes the catalog and its overview table instead of copying them (see [ADR-0021](./0021-vitepress-documentation-site.md)).

## Consequences

- Fixing a rule to match the catalog is a bug fix, not a behavior change. The commit `fix: align three rules with the catalog` is an example.
- The catalog contains behavior details, such as the FLP plugin skip for the data rules and the CDN case of the `theme` rule. Those details are part of the contract.
- A change of behavior needs a catalog change in the same pull request.
