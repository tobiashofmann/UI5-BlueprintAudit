# Rules

BlueprintAudit ships 33 rules. The table below is the overview from the [rule catalog](/rules/catalog), which is the source of truth. It lists each rule ID, its category, its default severity, and the project types it runs for.

- **FS**: Freestyle app (`--type fs`)
- **FE**: Fiori Elements app (`--type fe`)
- **LIB**: Library (`--type lib`)

<!--@include: ../ui5-blueprint-audit-rules.md#overview-->

## How to read the table

- **Default** is the severity that applies without any config. `off` means the rule does not run unless you turn it on.
- A rule runs only for the project types in the last column.
- Change the severity or the parameters of a rule in `ui5-blueprint-audit.yaml`. See [Configuration](/guide/configuration).
- The [full catalog](/rules/catalog) explains each check and lists the parameters with their defaults.

## Example: change one rule

```yaml
rules:
  namespace:
    - error
    - value: com.firma
  odata-mockdata:
    - warn
    - mode: one-entity
```

## Rules in sample projects

The repository has sample projects that show which rule fires where. See [`sample-prj/testcases.md`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/sample-prj/testcases.md).
