# ADR-0014: Errors in one rule or one project never abort the whole run

**Status:** Accepted

## Context

A run covers many rules, possibly several languages, and possibly several projects. Plugin rules are written by third parties. In a first version, a rule that threw aborted the run for every other rule and project, and an unparseable `manifest.json` was treated as if the file did not exist, which hid the real problem.

## Decision

- A rule that throws is reported as an `error` finding of that rule, and the other rules keep running.
- A `manifest.json`, `ui5.yaml`, `ui5-*.yaml`, or `package.json` that cannot be parsed is reported as a project error, not as a missing file.
- Invalid configuration is reported as a project error (see [ADR-0011](./0011-yaml-configuration.md)).
- Plugin load failures are reported as `PluginLoadError`, with a localized, specific message (see [ADR-0012](./0012-plugin-loading.md)).

## Consequences

- One broken plugin rule does not hide the results of all other rules.
- A crashing rule fails the audit through its `error` finding, so a CI run still exits with `1` (see [ADR-0016](./0016-report-formats-and-exit-codes.md)).
- Engine errors need localized texts like any other message (see [ADR-0015](./0015-localization.md)).
