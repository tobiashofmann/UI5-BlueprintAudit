# Testing Dependabot PRs locally (monorepo with npm workspaces + fixture projects)

Context: in this repo (`UI5-BlueprintAudit`), the regular CI (`lint`,
`typecheck`, `build`, `test` at the root) does **not** cover everything. In
particular, the fixture projects under `sample-prj/*` are standalone npm
projects, not workspaces — root-level `npm ci`/`build`/`test` never touches
them. A Dependabot PR can therefore be "green" while still breaking these
fixtures. This has happened multiple times in this repo:

- PR #30: `typescript` 5.5 → 7.0 in the root workspace, broke `npm ci`
  (typedoc peer dep) and `npm run lint` (typescript-eslint doesn't know TS 7).
- PR #31: the same TS 7 jump in `sample-prj/*` — CI stayed green, but
  `tsc --noEmit` in the fixtures broke (TS 7 removed `moduleResolution: node10`
  and `baseUrl`).
- PR #36: `@wdio/cli` 9 → 10 in `sample-prj/*` — `npm install` in the affected
  fixtures failed because `wdio-ui5-service` still requires `@wdio/cli@^9` via
  peer dependency.

The lesson: **"CI is green" isn't enough here.** For every dependency-bump PR,
it's worth a short local check, especially when `sample-prj/*` is affected.

## Step by step

### 1. Check out the PR branch in isolation

Never switch to the PR branch directly in your own working directory — use a
git worktree instead. That leaves your own checkout (including
`node_modules`) untouched and can be cleaned up with a single command.

```bash
# Know the PR number (e.g. from the GitHub URL: .../pull/36)
PR=36

git fetch origin main --quiet
git fetch origin "pull/$PR/head:pr-$PR-check"

git worktree add /tmp/pr-$PR-check pr-$PR-check
cd /tmp/pr-$PR-check
```

### 2. Look at what actually changes first

```bash
git diff origin/main...pr-$PR-check --stat
git diff origin/main...pr-$PR-check -- package.json packages/*/package.json sample-prj/*/package.json
```

What to look for:

- Which dependency(s) are being bumped, and how big is the version jump
  (major? minor? patch?)
- Does it affect the root workspace (`package.json`,
  `packages/*/package.json`) or the fixtures (`sample-prj/*/package.json`)?
- For a major bump: briefly check the package's changelog/release notes for
  relevant breaking changes.

### 3. Run the root scripts

```bash
npm ci --ignore-scripts        # fails early on peer-dep conflicts
npm run lint
npm run typecheck
npm run build
npm run test
```

If `npm ci` already fails (e.g. an `ERESOLVE` conflict), the PR isn't
mergeable as-is — done, no further steps needed.

### 4. If `sample-prj/*` is affected: check those fixtures individually

This is the step the regular CI does **not** do, and the one that caught the
regressions found so far:

```bash
for p in sample-prj/*/; do
  echo "=== $p ==="
  (cd "$p" && npm install --ignore-scripts)
done
```

For TypeScript fixtures (the ones with a `ts-typecheck` script), additionally:

```bash
cd sample-prj/prj-ts && npm run ts-typecheck
cd ../prj-ts-lib && npm run ts-typecheck
```

If `npm install` or `ts-typecheck` fails here while the root scripts in step 3
were green, that's exactly the kind of "hidden" regression that has slipped
through multiple times before.

### 5. If in doubt: compare against `main`

To rule out that a failure already existed before this PR (i.e. isn't a
regression it introduced), repeat the same check in a second worktree checked
out from `origin/main`:

```bash
git worktree add /tmp/main-check origin/main
cd /tmp/main-check/sample-prj/<affected-project>
npm install --ignore-scripts
npm run ts-typecheck   # if present
```

If the failure also occurs here → pre-existing issue, not the PR's fault
(still worth knowing about, but no reason to block the PR on its own).
If it only occurs on the PR branch → real regression, don't merge.

### 6. Clean up

```bash
cd /Users/tobias/dev/code/UI5-BlueprintAudit   # back to the main checkout
git worktree remove /tmp/pr-$PR-check --force
git branch -D pr-$PR-check
git worktree remove /tmp/main-check --force 2>/dev/null   # if step 5 was used
```

## Checklist (quick reference)

- [ ] Looked at `git diff origin/main...pr-<NR>` — what exactly changes?
- [ ] `npm ci --ignore-scripts` in the PR worktree succeeds
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] `npm run test` passes
- [ ] If `sample-prj/*` is affected: `npm install` passes in every affected
      fixture project
- [ ] If a TS fixture is affected: `npm run ts-typecheck` passes there
- [ ] If a failure looks pre-existing: compared against `origin/main`
- [ ] Worktrees and branches cleaned up again

---

## Instructions for an AI (e.g. Claude Code) to run this check

A prompt template you can hand directly to an AI with shell/git access to
this repo:

> Check pull request `https://github.com/tobiashofmann/UI5-BlueprintAudit/pull/<NR>`
> locally before it gets merged. Proceed as follows:
>
> 1. `git fetch origin main --quiet` and
>    `git fetch origin "pull/<NR>/head:pr-<NR>-check"`.
> 2. Check `git log --oneline origin/main..pr-<NR>-check` and
>    `git diff origin/main...pr-<NR>-check --stat` to understand what changes —
>    in particular which dependencies are bumped in which `package.json`
>    files, and whether any major-version jumps are involved.
> 3. Check out the PR branch in its **own git worktree** (not in the current
>    working directory), so my current checkout stays untouched:
>    `git worktree add <path> pr-<NR>-check`.
> 4. Run `npm ci --ignore-scripts`, `npm run lint`, `npm run typecheck`,
>    `npm run build`, and `npm run test` there. Report every failure with the
>    full error message, not just "there was an error".
> 5. **Important:** this repo's CI never checks `sample-prj/*` (standalone npm
>    projects, not workspaces, each with its own `package-lock.json`). If the
>    PR changes files under `sample-prj/*`, install and test **every affected
>    fixture project individually** (`npm install --ignore-scripts` in that
>    subdirectory; additionally run `npm run ts-typecheck` if the fixture has
>    that script). This is the step where hidden breaking changes have
>    repeatedly slipped past regular CI in this repo.
> 6. If a failure shows up: check, via a comparison worktree of `origin/main`,
>    whether the same failure already exists without the PR (pre-existing
>    issue) or only appears because of the PR (real regression). State the
>    result explicitly.
> 7. At the end, clean up every worktree and branch you created
>    (`git worktree remove`, `git branch -D`).
> 8. Finish with a clear verdict: is the PR mergeable, yes or no, and why —
>    backed by concrete error messages, not just "looks fine".

Important points an AI typically misses here unless told explicitly:

- That root-level `npm ci` says **nothing** about the fixtures under
  `sample-prj/*` — the AI must be explicitly told to check those separately.
- That a green CI status on GitHub is **no proof** of real compatibility in
  this repo's setup, especially for dependency bumps under `sample-prj/*`.
- The difference between "fails because it was already broken" and "fails
  because the PR caused it" — without a comparison against `main`, an AI will
  readily conflate the two and then wrongly recommend rejecting a PR, or
  wrongly recommend merging one.
