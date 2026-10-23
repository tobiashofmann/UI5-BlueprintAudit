---
name: feature-branch
description: Ensures every change in this repo happens on a dedicated feature branch and lands via pull request, never by committing or pushing directly to main. Use this whenever starting new feature/fix work, before the first commit of a task, or when asked to commit/push/open a PR.
---

# Feature Branch Workflow

`main` on this GitHub repo is protected — direct pushes are rejected. Changes only land
through a pull request. Follow this workflow for every piece of work, no exceptions.

## Before starting any change

1. Check the current branch and working tree state:
   ```
   git status
   git branch --show-current
   ```
2. If the current branch is `main` (or any other shared/protected branch), create a new
   branch **before** making or staging any edits:
   ```
   git checkout -b <type>/<short-description>
   ```
   Branch naming:
   - `feature/<short-description>` — new functionality (e.g. new rule, new CLI option)
   - `fix/<short-description>` — bug fixes
   - `chore/<short-description>` — tooling, deps, docs-only changes
   - Use kebab-case, no ticket system in this repo, so keep the description short and specific
     (e.g. `feature/library-blacklist-rule`, `fix/i18n-fallback-libs`).
3. If already on a non-main branch that matches the task at hand, keep working on it —
   don't create a new branch for every follow-up commit of the same task.

## While working

- Commit normally on the feature branch (see repo's general commit guidance).
- Never run `git push` directly to `main`, and never target `main` with `--force`.

## Finishing the work

The `gh` CLI is not available in this environment — do not rely on it. Use plain `git`.

1. Push the feature branch with an upstream tracking ref:
   ```
   git push -u origin <branch-name>
   ```
   `git push` prints a "Create a pull request" URL for the branch (e.g.
   `https://github.com/<owner>/<repo>/pull/new/<branch-name>`) — pass that URL straight to
   the user.
2. Do **not** merge locally and do **not** attempt to push to `main`. Opening and merging
   the pull request itself is done by the user in the GitHub UI (or with `gh` if they have
   it installed locally) — this is not something to automate here.
3. Tell the user the branch has been pushed, give them the compare/PR URL from step 1, and
   ask them to open the pull request against `main`.

## If asked to "just commit" or "just push" while on `main`

Don't commit directly to `main`. Create a feature branch first (see above), then commit
there, and explain briefly that `main` is protected and requires a PR.
