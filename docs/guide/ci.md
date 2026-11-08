# Use it in CI

The audit is a normal CLI with an exit code, so it works as an npm script, in a pre-commit hook, and in CI.

## npm script

```json
{
  "scripts": {
    "audit": "ui5-blueprint-audit --type fs --lang en"
  }
}
```

```bash
npm run audit
```

## GitHub Actions

```yaml
- name: Audit UI5 project
  run: npx ui5-blueprint-audit --type fs --lang en

- name: Upload audit report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: ui5-blueprint-audit-report
    path: ui5-blueprint-audit-report/
```

The step fails when there is at least one `error` finding. `if: always()` uploads the reports either way.

## Test results in a CI dashboard

`report.xml` is JUnit XML, with one test case per rule and one test suite per project. Most CI systems can show it as a test result. It is always English, whatever `--lang` says.

## Pre-commit hook

Any hook runner that runs shell commands works. The command is the same:

```bash
npx ui5-blueprint-audit --type fs --lang en
```
