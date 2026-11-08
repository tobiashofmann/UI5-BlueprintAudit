# CLI reference

```text
ui5-blueprint-audit [folder] [--type fs|fe|lib] [--lang de,en,pt-BR] [--out <dir>]
ui5-blueprint-audit --init [--force]
```

::: info
The built-in `--help` text is currently in German. The options below are the same.
:::

## Options

| Option | Description |
|---|---|
| `[folder]` | The project, or a folder that contains projects. Default: the current directory. |
| `--type fs\|fe\|lib` | Project type. Overrides `projectType` in `ui5-blueprint-audit.yaml`. Required if the config does not set it. |
| `--lang de,en,pt-BR` | Output languages. Overrides `languages` in the config. Default: `de,en`. |
| `--out <dir>` | Folder for the reports. Default: `ui5-blueprint-audit-report`. |
| `--init` | Write the default `ui5-blueprint-audit.yaml` into the current directory and exit without auditing. |
| `--force` | With `--init`: overwrite an existing `ui5-blueprint-audit.yaml`. |
| `--help` | Show the usage text. |

The command-line value always wins over the config file.

## Examples

### Create the config file

```bash
npx @abap/ui5-blueprint-audit --init
```

If the file exists, the command fails. Overwrite it on purpose with:

```bash
npx @abap/ui5-blueprint-audit --init --force
```

### Audit the current project

```bash
npx ui5-blueprint-audit --type fs
```

### Audit one project in another folder

```bash
npx ui5-blueprint-audit path/to/my-app --type fe
```

The folder counts as a single project if it has a `ui5.yaml` with `type: application` or `type: library`, or a `webapp/manifest.json`.

### Audit many projects in one run

```bash
npx ui5-blueprint-audit projects/ --type fs
```

If the folder is not a project itself, every direct subdirectory is audited as its own project. Hidden folders, `node_modules`, and `dist` are skipped. The reports contain one section per project.

### Audit a library

```bash
npx ui5-blueprint-audit --type lib
```

Libraries have no `webapp/` folder. The rules read from `src/` and `ui5.yaml` instead. See [special cases for libraries](/rules/catalog#special-cases-for-libraries).

### Choose the report languages and the output folder

```bash
npx ui5-blueprint-audit --type fs --lang en,pt-BR --out build/audit
```

The first language in `--lang` is the language of the console summary.

::: warning Console summary and the config file
The console summary uses the first language of `--lang`, or `de` if `--lang` is not given. It does not read `languages` from the config file. If your config sets `languages: [en]` and you run without `--lang`, the console summary is empty, and only the report files are written. Pass `--lang en` to get the summary.
:::

## Exit codes

| Code | Meaning |
|---|---|
| `0` | No `error` finding. Warnings alone do not fail the run. |
| `1` | At least one `error` finding, or a project could not be loaded (for example, the project type is missing). |

## Common errors

**No project type.** If neither `--type` nor `projectType` is set, the project is not audited. The run prints one error line (in the first report language, `de` by default) and exits with `1`:

```text
✗ prj-valid: Kein Projekttyp angegeben. Setze --type fs|fe|lib auf der Kommandozeile oder "projectType" in <project>/ui5-blueprint-audit.yaml.
```

Set `--type` or `projectType` and run again. See [Configuration](/guide/configuration).
