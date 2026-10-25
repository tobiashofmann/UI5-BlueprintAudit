# Dependabot-PRs lokal prüfen (Monorepo mit npm Workspaces + Fixture-Projekten)

Kontext: In diesem Repo (`UI5-BlueprintAudit`) deckt die normale CI (`lint`,
`typecheck`, `build`, `test` am Root) **nicht** alles ab. Insbesondere die
Fixture-Projekte unter `sample-prj/*` sind eigenständige npm-Projekte, keine
Workspaces — `npm ci`/`build`/`test` am Root rührt sie nie an. Ein Dependabot-PR
kann also "grün" sein, obwohl er diese Fixtures kaputt macht. Das ist mehrfach
in diesem Repo passiert:

- PR #30: `typescript` 5.5 → 7.0 im Root-Workspace, bricht `npm ci` (typedoc
  Peer-Dep) und `npm run lint` (typescript-eslint kennt TS 7 nicht).
- PR #31: derselbe TS-7-Sprung in `sample-prj/*` — CI blieb grün, aber
  `tsc --noEmit` in den Fixtures brach (TS 7 entfernt `moduleResolution: node10`
  und `baseUrl`).
- PR #36: `@wdio/cli` 9 → 10 in `sample-prj/*` — `npm install` in den
  betroffenen Fixtures schlägt fehl, weil `wdio-ui5-service` per Peer-Dependency
  noch `@wdio/cli@^9` verlangt.

Die Lehre: **"CI ist grün" reicht hier nicht.** Bei jedem Dependency-Bump-PR
lohnt sich ein kurzer lokaler Check, besonders wenn `sample-prj/*` betroffen
ist.

## Schritt für Schritt

### 1. PR-Branch isoliert auschecken

Niemals direkt im eigenen Arbeitsverzeichnis auf den PR-Branch wechseln —
dafür einen Git-Worktree verwenden. Das lässt den eigenen Checkout (inkl.
`node_modules`) unberührt und räumt sich mit einem Befehl wieder weg.

```bash
# PR-Nummer kennen (z. B. aus der GitHub-URL: .../pull/36)
PR=36

git fetch origin main --quiet
git fetch origin "pull/$PR/head:pr-$PR-check"

git worktree add /tmp/pr-$PR-check pr-$PR-check
cd /tmp/pr-$PR-check
```

### 2. Erst anschauen, was sich ändert

```bash
git diff origin/main...pr-$PR-check --stat
git diff origin/main...pr-$PR-check -- package.json packages/*/package.json sample-prj/*/package.json
```

Worauf achten:
- Welche Dependency(s) werden gebumpt, welche Versionssprünge (Major?
  Minor? Patch?)
- Betrifft es den Root-Workspace (`package.json`, `packages/*/package.json`)
  oder die Fixtures (`sample-prj/*/package.json`)?
- Bei einem Major-Bump: kurz nachsehen (Changelog/Release Notes des
  Pakets), ob bekannte Breaking Changes relevant sein könnten.

### 3. Root-Skripte laufen lassen

```bash
npm ci --ignore-scripts        # schlägt bei Peer-Dep-Konflikten schon hier fehl
npm run lint
npm run typecheck
npm run build
npm run test
```

Schlägt schon `npm ci` fehl (z. B. `ERESOLVE`-Konflikt), ist der PR in dieser
Form nicht mergebar — fertig, keine weiteren Schritte nötig.

### 4. Bei Änderungen unter `sample-prj/*`: diese Fixtures einzeln prüfen

Das ist der Schritt, den die normale CI **nicht** macht und der die bisher
gefundenen Regressionen aufgedeckt hat:

```bash
for p in sample-prj/*/; do
  echo "=== $p ==="
  (cd "$p" && npm install --ignore-scripts)
done
```

Für TypeScript-Fixtures (die ein `ts-typecheck`-Script haben) zusätzlich:

```bash
cd sample-prj/prj-ts && npm run ts-typecheck
cd ../prj-ts-lib && npm run ts-typecheck
```

Scheitert `npm install` oder `ts-typecheck` hier, aber die Root-Skripte in
Schritt 3 waren grün → genau die Art von "versteckter" Regression, die bisher
mehrfach durchgerutscht ist.

### 5. Bei Zweifel: Vergleich mit `main`

Um auszuschließen, dass ein Fehler schon vorher bestand (also keine Regression
dieses PRs ist), denselben Check auf einem zweiten Worktree von `origin/main`
wiederholen:

```bash
git worktree add /tmp/main-check origin/main
cd /tmp/main-check/sample-prj/<betroffenes-projekt>
npm install --ignore-scripts
npm run ts-typecheck   # falls vorhanden
```

Tritt der Fehler auch hier auf → vorbestehendes Problem, keine Schuld des PRs
(muss trotzdem nicht sofort gefixt werden, ist aber gut zu wissen).
Tritt er nur im PR-Branch auf → echte Regression, PR nicht mergen.

### 6. Aufräumen

```bash
cd /Users/tobias/dev/code/UI5-BlueprintAudit   # zurück ins Hauptverzeichnis
git worktree remove /tmp/pr-$PR-check --force
git branch -D pr-$PR-check
git worktree remove /tmp/main-check --force 2>/dev/null   # falls Schritt 5 genutzt wurde
```

## Checkliste (kurz zum Abhaken)

- [ ] `git diff origin/main...pr-<NR>` angeschaut — was genau ändert sich?
- [ ] `npm ci --ignore-scripts` im PR-Worktree läuft durch
- [ ] `npm run lint` grün
- [ ] `npm run typecheck` grün
- [ ] `npm run build` grün
- [ ] `npm run test` grün
- [ ] Falls `sample-prj/*` betroffen: `npm install` in jedem betroffenen
      Fixture-Projekt grün
- [ ] Falls TS-Fixture betroffen: `npm run ts-typecheck` dort grün
- [ ] Bei Verdacht auf vorbestehenden Fehler: gegen `origin/main` verglichen
- [ ] Worktrees und Branches wieder aufgeräumt

---

## Anleitung für eine KI (z. B. Claude Code), die diesen Check übernehmen soll

Prompt-Vorlage, die du 1:1 an eine KI mit Shell-/Git-Zugriff auf dieses Repo
geben kannst:

> Prüfe den Pull Request https://github.com/tobiashofmann/UI5-BlueprintAudit/pull/`<NR>`
> lokal, bevor er gemerged wird. Gehe so vor:
>
> 1. `git fetch origin main --quiet` und `git fetch origin "pull/<NR>/head:pr-<NR>-check"`.
> 2. Checke `git log --oneline origin/main..pr-<NR>-check` und
>    `git diff origin/main...pr-<NR>-check --stat`, um zu verstehen, was sich
>    ändert — insbesondere welche Dependencies in welchen `package.json`-Dateien
>    gebumpt werden und ob Major-Versionssprünge dabei sind.
> 3. Checke den PR-Branch in einem **eigenen Git-Worktree** aus (nicht im
>    aktuellen Arbeitsverzeichnis), damit mein aktueller Checkout unberührt
>    bleibt: `git worktree add <pfad> pr-<NR>-check`.
> 4. Führe dort `npm ci --ignore-scripts`, `npm run lint`, `npm run typecheck`,
>    `npm run build` und `npm run test` aus. Melde jeden Fehler mit vollständiger
>    Fehlermeldung, nicht nur "es gab einen Fehler".
> 5. **Wichtig:** Die CI dieses Repos prüft `sample-prj/*` nicht (keine npm
>    Workspaces, eigene `package-lock.json` je Unterordner). Wenn der PR Dateien
>    unter `sample-prj/*` ändert, installiere und teste **jedes betroffene
>    Fixture-Projekt einzeln** (`npm install --ignore-scripts` in dem jeweiligen
>    Unterordner; bei vorhandenem `ts-typecheck`-Script zusätzlich
>    `npm run ts-typecheck` ausführen). Das ist der Schritt, in dem bisher
>    mehrfach versteckte Breaking Changes aufgetaucht sind, die die normale CI
>    nicht gesehen hat.
> 6. Wenn dabei ein Fehler auftritt: prüfe per Vergleichs-Worktree von
>    `origin/main`, ob derselbe Fehler schon ohne den PR besteht (vorbestehendes
>    Problem) oder erst durch den PR entsteht (echte Regression). Nenne das
>    Ergebnis explizit.
> 7. Räume am Ende alle angelegten Worktrees und Branches wieder auf
>    (`git worktree remove`, `git branch -D`).
> 8. Fasse am Schluss klar zusammen: Ist der PR mergebar, ja oder nein, und
>    warum — mit konkreten Fehlermeldungen als Beleg, nicht nur "sieht gut aus".

Wichtige Punkte, die eine KI hier typischerweise übersieht, wenn man sie nicht
explizit erwähnt:
- Dass `npm ci` am Root **nichts** über die Fixtures unter `sample-prj/*`
  aussagt — die KI muss explizit angewiesen werden, dort zusätzlich zu prüfen.
- Dass ein grüner CI-Status auf GitHub bei diesem Repo-Setup **kein
  Beweis** für echte Verträglichkeit ist, besonders bei Dependency-Bumps in
  `sample-prj/*`.
- Den Unterschied zwischen "schlägt fehl, weil vorbestehend" und "schlägt fehl,
  weil der PR es verursacht hat" — ohne Vergleich gegen `main` vermischt eine
  KI das gerne und empfiehlt dann fälschlich, den PR abzulehnen oder
  fälschlich, ihn zu mergen.
