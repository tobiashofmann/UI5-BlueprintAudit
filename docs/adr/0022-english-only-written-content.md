# ADR-0022: Everything an AI assistant writes in this repository is English

**Status:** Accepted

## Context

The maintainer often chats with AI assistants in German, and parts of the project, such as test titles, comments, CLI texts, and the rule catalog, started out in German. A mixed repository is harder to read and to contribute to, and the project is published as an npm package.

## Decision

Everything an AI assistant (Claude or any other) writes in this repository is English, regardless of the language the user writes in. This covers code, identifiers, rule IDs, commit messages, pull request titles and descriptions, code comments, and any Markdown or docs file the assistant creates or edits, even one explicitly requested as a new file. If a user instruction conflicts with this, the assistant asks before writing non-English content.

This is independent of the tool's own `languages` and `--lang` options (see [ADR-0015](./0015-localization.md)). The CLI keeps offering `de`, `en`, and `pt-BR` as report languages, and the `de` and `pt-BR` bundles are not affected by this rule.

## Consequences

- The rule catalog, test titles, comments, CLI texts, and fixture comments were translated to English.
- Translation bundles for other languages are written as translations in their own files, not as repository prose.
- The rule is recorded in `CLAUDE.md` and in the assistant's memory, so it applies to every session.
