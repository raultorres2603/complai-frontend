# ComplAI Frontend - Project Instructions & Tech Stack

## Tech Stack
- **Framework**: React 18+ with TypeScript (strict mode, `ES2023` target)
- **Build Tool**: Vite 8 with `@vitejs/plugin-react`
- **Testing**: Vitest ^1.0 + React Testing Library ^14 (`jsdom` environment)
- **Linting & Code Quality**: ESLint 9 + TypeScript ESLint
- **Styling**: CSS Modules (component-scoped, one `.module.css` per component)
- **State Management**: Custom React hooks (`useChat`, `useAuth`, `useCity`, `useAccessibility`, etc.)
- **HTTP Client**: Native `fetch` API wrapped in `ApiClient` class (`src/services/apiService.ts`)
- **Backend Integration**: JWT authentication, REST + SSE streams to ComplAI Java/Micronaut backend
- **Routing / Layout**: Single-page, `MainLayout` wraps all views — no React Router
- **Accessibility & i18n**: `useAccessibility` hook, `src/translations/languages.ts` (`es`, `en`, `ca`)
- **Guided Tour**: `intro.js` v8 via `useTour` + `src/tours/appTour.ts`
- **HTML Sanitization**: `dompurify` in `src/utils/textFormatter.ts`

## Source Structure
```
src/
  App.tsx                  Entry point: wires hooks, resolves cityId from JWT, renders MainLayout
  components/              Presentational UI components (one TSX + one CSS Module each)
  hooks/                   All stateful logic lives here — never in components
  services/                API, session, storage, SSE parsing, error handling
  types/                   Shared TypeScript types (api.types.ts, domain.types.ts, accessibility.types.ts, …)
  translations/            languages.ts — getTranslation(lang, key) for es/en/ca
  tours/                   appTour.ts — intro.js step definitions
  layouts/                 MainLayout.tsx
  utils/                   textFormatter.ts (DOMPurify sanitization)
  styles/                  Global/third-party CSS overrides
  __tests__/               Co-located tests; mirrors src/ path where needed
```

## Code Style & Architectural Patterns
- **Components**: Functional components only — no class components. Props typed inline or via `interface`. One component per file.
- **Hooks**: All side-effects and state live in `src/hooks/`. Components are pure renderers.
- **CSS**: CSS Modules exclusively. No inline `style={}` for layout; use `styles.className`.
- **Imports**: Use `@/` path alias for `src/` (e.g. `import { foo } from '@/services/apiService'`).
- **Types**: Never use `any`. Prefer `unknown` + type guards at system boundaries. Keep types in `src/types/`.
- **Error Handling**: Catch at the service/hook boundary; propagate `ParsedError` to components. No silent failures.
- **No over-engineering**: No abstractions, utilities, or helpers for one-time use. No speculative features.
- **Security**: Always sanitize API-derived HTML through `textFormatter.ts`. Never log or store JWT payloads beyond what is needed.
- **Tests**: Every new public hook function and every component with conditional logic must have a test. Use `@testing-library/react` + Vitest.
- **Copilot Agents**: Use the `builder` agent for any work (it auto-detects planning, implementation, review, and documentation phases). Use `orchestrator` for large parallel requests. See `.github/agents/` for details.