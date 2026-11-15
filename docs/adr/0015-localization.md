# ADR-0015: Flat translation bundles with an English fallback, extensible by plugins

**Status:** Accepted

## Context

The tool is used by teams that read reports in different languages. Rule messages, rule descriptions, report labels, and error texts all need translations. Full ICU message formatting would add weight and a dependency for little gain. New languages should not require a change to the repository.

## Decision

- Three languages ship by default: `de`, `en`, and `pt-BR`. `en` is the reference language. A key missing in another language, including in an add-on, falls back to `en`. A key missing everywhere returns the raw key.
- The active languages are set with `languages` in the config (default `[de, en]`) or `--lang de,en,pt-BR` on the command line. The command line takes precedence.
- Texts are flat `Record<string, string>` bundles in `locales/{de,en,pt-BR}.ts`: rule content in `plugin-core`, report and CLI labels and error texts in `ui5-blueprint-audit`.
- `en.ts` is the source of truth for the key names. `de` and `pt-BR` are typed as `Record<keyof typeof en, string>`, so a missing key is a build error. One test per package also checks key parity between the languages.
- Interpolation is deliberately simple: only `{paramName}`. No ICU, no pluralization.
- **New languages as add-ons:** a plugin can bring translations through its optional `locales` field, `{ [locale]: { [key]: template } }`. That includes the keys the report itself uses, such as titles and column headers. No special loader is needed.

## Consequences

- Adding a language to the repository means a new bundle per package, and the build and the parity test tell what is missing.
- Companies can add a language, or override single texts, without forking the tool.
- Messages that depend on a count must be worded so they work without plural forms.
- The helpers live in the types package (see [ADR-0005](./0005-translation-logic-in-types-package.md)).
