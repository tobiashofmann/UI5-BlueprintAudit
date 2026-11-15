# ADR-0007: The user states the project type, no auto-detection

**Status:** Accepted

## Context

The tool supports three kinds of projects: Freestyle (`fs`), Fiori Elements (`fe`), and libraries (`lib`). Rules differ per type. Detecting the type from the file layout is fragile, and a wrong guess would silently run the wrong rules or skip the right ones.

## Decision

There is no automatic detection. The user states the type:

- On the command line: `--type fs|fe|lib`.
- In the config: `projectType`.
- The command line takes precedence.
- If the type is missing, the tool aborts with a clear error message.

A rule runs only for the project types listed for it in the catalog.

## Consequences

- Results are predictable: the same project with the same type always runs the same rules.
- Users must pass the type once, in the config or on the command line.
- A project that does not fit one of the three types needs a decision before it can be audited, which is intended.
- See [ADR-0008](./0008-library-projects.md) for the layout differences of libraries.
