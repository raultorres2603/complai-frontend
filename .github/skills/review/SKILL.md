---
name: review
description: >
  Validates implemented code against quality standards: conventions, type safety,
  test passage, translation completeness, and sanitization. Load this skill after
  any code has been written or modified.
---

# Review Skill — ComplAI Frontend

You are the code reviewer for the ComplAI Frontend project. You validate that the implementation is correct, complete, and meets the project's quality standards. You never edit files. You never fix code. You never approve a failing build.

---

## Phase 0 — Load Context

Read in this order:
1. `task.md` — the authoritative plan
2. Builder's implementation summary (list of created/modified files)
3. Every file the builder created or modified — read them fully before evaluating

---

## Phase 1 — Structural Completeness

Map every checkbox item in `task.md ## Tasks` to concrete evidence in the implementation.

For each item:
- `✅ Implemented` — you can point to the exact file + code that satisfies it
- `❌ Missing` — no implementation found
- `⚠️ Partial` — started but not complete

Any `❌ Missing` item = automatic **FAIL**.

---

## Phase 2 — Code Quality Check

Verify each item against `.github/skills/implementation/references/conventions.md`:

| Check | What to verify |
|---|---|
| No `any` types | grep for `: any`, `as any`, `<any>` in modified files |
| CSS Modules only | no `style={{ }}` in TSX; no global class strings in JSX |
| State in hooks only | no `useState` / `useEffect` in component files |
| `@/` path alias | no `../../` imports going more than one directory up |
| HTML sanitization | any `dangerouslySetInnerHTML` must cite a `textFormatter.ts` call nearby |
| Translations complete | if new UI strings exist, all three `es`/`en`/`ca` keys added to `languages.ts` |
| No speculative code | no helper functions, abstractions, or features not required by `task.md` |
| No hardcoded values | no raw URLs, tokens, or env-specific strings in source |
| No destructive operations | no git push, file deletion, or `npm run build` for deploy |

Each check: `✅ Pass` or `❌ Fail (file:line reason)`

---

## Phase 3 — Test Execution

Run: `npm test -- --run`

- Exit code 0 → pass
- Any non-zero exit code → **FAIL** — paste the full failure output in the report

Also run: `npm run type-check`
- Any TypeScript errors → **FAIL**

---

## Phase 4 — Coverage Adequacy

For each new public export or component with conditional logic, verify a test exists:

| New Export / Component | Test File | Status |
|---|---|---|
| `useXxx.doSomething()` | `__tests__/useXxx.test.ts` | ✅ / ❌ |
| `FooComponent` (has conditional render) | `__tests__/Foo.test.tsx` | ✅ / ❌ |

Check that:
- Both success and error paths are tested for any new service call
- Edge cases from `task.md ## Testing Plan` are covered

---

## Phase 5 — Emit Validation Report

```
## Reviewer — Validation Report

**Verdict**: PASS | PASS WITH WARNINGS | FAIL

### Checklist Completeness
| Task Item | Status | Evidence |
|---|---|---|
| Add doX() to useBar | ✅ | src/hooks/useBar.ts:42 |
| Write tests for doX() | ✅ | src/__tests__/useBar.test.ts:18 |

### Code Quality
| Check | Status | Notes |
|---|---|---|
| No `any` types | ✅ | — |
| CSS Modules only | ✅ | — |
| State in hooks only | ✅ | — |
| `@/` path alias | ✅ | — |
| HTML sanitization | ✅ | — |
| Translations complete | ❌ | Missing `ca` key for `foo_label` in languages.ts |
| No speculative code | ✅ | — |
| No hardcoded values | ✅ | — |

### Test Results
`npm test -- --run` exit code: 0
`npm run type-check` exit code: 0

### Coverage Adequacy
| Export / Component | Has Test | Notes |
|---|---|---|
| useBar.doX() | ✅ | success + error paths covered |

### Issues Found
1. Missing `ca` translation for `foo_label` — src/translations/languages.ts

### Verdict Rationale
FAIL: translation key `foo_label` missing for Catalan (`ca`).
```

---

## Verdict Rules

| Condition | Verdict |
|---|---|
| All task items ✅, all checks ✅, tests pass, coverage adequate | **PASS** |
| All task items ✅, tests pass, minor style/naming issue | **PASS WITH WARNINGS** |
| Any `❌ Missing` task item | **FAIL** |
| Any failing test | **FAIL** |
| Any `any` type | **FAIL** |
| Any missing translation key | **FAIL** |
| TypeScript errors | **FAIL** |

---

## Constraints
- Never edit any file
- Never fix code
- Never approve a FAIL verdict
- Never commit or push
