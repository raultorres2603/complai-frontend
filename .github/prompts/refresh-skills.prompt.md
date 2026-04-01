---
agent: orchestrator
---

# Refresh Skills Audit

Audit all `.github` agent and skill files against the current state of the frontend codebase and patch any drift. Follow these four steps exactly.

## Step 1 — Snapshot

Read the following files to establish the current state of the project:

**Package & Build**
- `package.json` (dependencies, devDependencies, scripts)
- `vite.config.ts` (path aliases, proxy, base path, build config)
- `tsconfig.app.json` (compiler options, path aliases)
- `vitest.config.ts` (test environment, setup files, coverage)

**Source Structure**
- List all files in: `src/hooks/`, `src/services/`, `src/components/`, `src/types/`, `src/utils/`, `src/translations/`, `src/tours/`, `src/layouts/`

**Agent & Skill Files**
- `.github/copilot-instructions.md`
- `.github/agents/*.agent.md` (all 5 files)
- `.github/skills/builder/references/package-map.md`
- `.github/skills/builder/references/conventions.md`
- `.github/skills/builder/references/test-patterns.md`
- `.github/skills/documentator/references/readme-sections.md`
- `.github/skills/documentator/references/source-map.md`
- `.github/skills/*/SKILL.md` (all 5 SKILL.md files)

## Step 2 — Identify Drift

Produce a drift table comparing current codebase state vs. the skill/agent file descriptions:

| Drift Type | Location | Current State | Skill File State |
|---|---|---|---|
| NEW_FILE | package-map.md | src/hooks/useNewFoo.ts exists | not listed |
| REMOVED_FILE | package-map.md | src/hooks/useOldBar.ts gone | still listed |
| NEW_DEP | copilot-instructions.md | `some-new-package` in package.json | not mentioned |
| REMOVED_DEP | conventions.md | `old-lib` removed | still referenced |
| STALE_CONVENTION | conventions.md | Pattern X changed | old pattern still documented |
| STALE_SCRIPT | — | npm script renamed | old name in skill file |

Drift types to detect:
- `NEW_FILE` — a hook, service, component, or type file exists in `src/` but is not in `package-map.md`
- `REMOVED_FILE` — `package-map.md` lists a file that no longer exists
- `NEW_DEP` — a dependency in `package.json` is not reflected in `copilot-instructions.md` or skill files
- `REMOVED_DEP` — a package mentioned in skill/agent files is no longer in `package.json`
- `STALE_CONVENTION` — a coding convention in `conventions.md` contradicts the actual codebase
- `STALE_SCRIPT` — an npm script referenced in skill files does not match `package.json`
- `NEW_TYPE` — a new type file or significant type addition not reflected in `package-map.md`
- `NEW_TRANSLATION_KEY` — languages.ts has new language or key pattern not documented

## Step 3 — Patch

For each drift item found, apply the minimum targeted edit to bring the skill/agent file up to date:

**Priority order of files to patch:**
1. `.github/skills/builder/references/package-map.md` — add/remove component, hook, service, type entries
2. `.github/copilot-instructions.md` — update tech stack, dependencies, source structure
3. `.github/skills/builder/references/conventions.md` — update any stale code conventions
4. `.github/skills/builder/references/test-patterns.md` — update test commands or patterns
5. `.github/skills/documentator/references/source-map.md` — update file-to-section mappings
6. Agent files — only if their tool lists, constraints, or workflows are demonstrably wrong

Do **not** patch files that have no drift. Do **not** rewrite files wholesale — make targeted edits only.

## Step 4 — Report

Emit a structured summary:

```
## Skills Refresh — Audit Report

**Date**: <today>
**Files Snapshotted**: <N>

### Drift Found
| Type | File | Description |
|---|---|---|
| NEW_FILE | package-map.md | Added useTabDetection.ts to hooks table |
| … |

### Patches Applied
| File | Lines Changed | Description |
|---|---|---|
| .github/skills/builder/references/package-map.md | +3 -1 | Added new hooks, removed deleted service |
| … |

### No Drift
- <Files that were checked and required no changes>

### Could Not Verify
- <Anything that was ambiguous and left unchanged>
```
