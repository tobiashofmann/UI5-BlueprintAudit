# Contributing

Thanks for your interest in improving UI5 BlueprintAudit!

## Bugs & ideas

Please open an [issue](https://github.com/tobiashofmann/UI5-BlueprintAudit/issues) first —
for bugs, feature ideas, or questions about a rule. It's recommended (not required) to have
an issue for every pull request, so the "why" behind a change is captured.

## Making a change

- Work on a feature branch (`feature/...`, `fix/...`, `chore/...`) — `main` is protected,
  no direct commits.
- Keep pull requests small and focused on one logical change. Several small PRs are
  preferred over one large one.
- Open the pull request against `main`.

## Before opening a PR

```bash
npm install
npm run lint && npm run typecheck && npm run build && npm run test
```

- Code should be documented where the *why* isn't obvious.
- New or changed behavior needs tests.
- The CI pipeline must pass.

## Changing a rule

Rule changes start in the catalog
([`docs/ui5-blueprint-audit-rules.md`](docs/ui5-blueprint-audit-rules.md)), then in code —
see [`CLAUDE.md`](CLAUDE.md) for details on the project's architecture and conventions.
