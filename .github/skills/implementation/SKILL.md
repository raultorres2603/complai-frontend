---
name: implementation
description: >
  Implements code changes for the ComplAI Frontend project. Covers writing
  components, hooks, services, tests, and type definitions. Load this skill
  when any source code must be written or modified.
---

# Implementation Skill — ComplAI Frontend

You are a senior React 18 / TypeScript / Vite engineer implementing a task against the ComplAI Frontend codebase. Follow these 7 phases in order.

---

## Phase 0 — Load Plan

1. Read `task.md` in full
2. Build a todo list from `## Tasks` — one item per checkbox
3. Identify the affected file list from `## Affected Areas`
4. Note any open questions in `## Open Questions / Blockers` — stop and ask the user if any are unresolved

---

## Phase 1 — Announce & Track

Before each task item, post: `✅ Step N/M — <task description>`

Keep the orchestrator informed of progress. After each file edit, confirm it was saved.

---

## Phase 2 — Explore Before Writing

Before touching any file, read it completely. Use `package-map.md` as your index:

- Which hook owns the relevant state?
- Which service makes the HTTP call?
- Which type interfaces apply?
- Are there existing translation keys to reuse?
- Are there existing CSS Module classes to extend?

Do not assume anything about a file's contents. Read first.

---

## Phase 3 — Implement

### Components
- One `.tsx` + one `.module.css` per component, in `src/components/`
- Functional components only — no class components
- Props typed with `interface ComponentNameProps { … }` in the same file
- Import path: `@/components/ComponentName`
- Never put state, effects, or service calls inside a component — move them to a hook

### Hooks
- All state and side-effects live in `src/hooks/`
- Custom hook files: `useX.ts` (no JSX) or `useX.tsx` only if rendering
- Return only what the component needs — keep internal state private
- Clean up effects: `return () => { … }` in every `useEffect` that sets up listeners or timers

### Services
- HTTP calls only in `src/services/apiService.ts` via `ApiClient`
- All SSE parsing via `src/services/sseParser.ts`
- Storage access via `src/services/storageService.ts`
- Session management via `src/services/sessionService.ts`
- Error parsing via `src/services/errorService.ts` → returns `ParsedError`

### Types
- All types in `src/types/` — never define types inline if reused
- Never use `any` — use `unknown` + type guards at service boundaries
- Use existing types before creating new ones

### CSS & Styling
- CSS Modules only: `import styles from './Foo.module.css'`
- No inline `style={{ }}` for layout or visual properties
- No global class names — all selectors scoped to the module

### Translations
- Every new user-visible string must be added to `src/translations/languages.ts`
- Add the key to all three languages: `es`, `en`, `ca`
- Retrieve via `const { t } = useTranslation()` in the component

### Path Aliases
- Always import with `@/` prefix: `import { foo } from '@/services/apiService'`
- Never use `../../../../` relative paths

### Security
- All API-derived or user-generated HTML must pass through `textFormatter.ts` (DOMPurify) before rendering
- Never `dangerouslySetInnerHTML` without DOMPurify sanitization
- Never log JWT payloads — only log non-sensitive metadata

---

## Phase 4 — Write Tests

Follow `test-patterns.md` exactly. Minimum coverage requirements:

- Every new public hook function → Vitest unit test
- Every component with conditional render logic → RTL test
- Every new service function → Vitest unit test with fetch mocked
- Test files in `__tests__/` co-located with source (or in `src/__tests__/` if at top level)

---

## Phase 5 — Verify

Run these two commands and fix all failures before marking the task done:

```bash
npm test -- --run
npm run type-check
```

A task is **not complete** if:
- Any test fails
- TypeScript reports errors
- ESLint reports errors on modified files

---

## Phase 6 — (No CDK here) — Final Summary

Report back with a markdown table of all file changes:

```
## Builder — Implementation Summary

| File | Action | Description |
|---|---|---|
| src/components/Foo.tsx | CREATED | New component |
| src/hooks/useFoo.ts | CREATED | Hook for Foo state |
| src/__tests__/useFoo.test.ts | CREATED | Unit tests |
| src/types/domain.types.ts | MODIFIED | Added FooState type |
| src/translations/languages.ts | MODIFIED | Added foo_label key |

**Test result**: npm test -- --run → exit 0, N tests passed
**Type check**: npm run type-check → exit 0
```
