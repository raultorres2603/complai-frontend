# Source Map — README to Source Files

For each README section, this file lists the exact source files to read before writing that section. Always read source directly.

---

## Title Block & Project Description
- No source file required — describe the app from what you know after reading the codebase

## Architecture Overview
- `src/App.tsx` — entry point, hook wiring, component tree
- `src/layouts/MainLayout.tsx` — top-level layout structure
- `src/services/apiService.ts` — SSE/HTTP flow
- `src/hooks/useAuth.ts` — auth flow
- `src/hooks/useTabDetection.ts` — multi-tab flow
- `src/hooks/useChat.ts` — chat state machine

## Tech Stack
- `package.json` → `dependencies` + `devDependencies`

## Getting Started — Environment Variables
- `vite.config.ts` → search for `import.meta.env.VITE_`
- `src/services/storageService.ts` → `STORAGE_KEYS`
- `.env.example` (if present)

## Getting Started — Scripts
- `package.json` → `scripts`

## Getting Started — Dev Server / Proxy
- `vite.config.ts` → `server.proxy`, `base`, port

## Project Structure
- List directories under `src/`
- `src/App.tsx` first few lines for entry point description

## Components Reference
- All files matching `src/components/*.tsx`
- Read the `interface XxxProps` and the JSX return for each

## Hooks Reference
- All files matching `src/hooks/*.ts` or `src/hooks/*.tsx`
- Read the return type and purpose comment (if any) for each

## Services Reference
- `src/services/apiService.ts` — key methods of `ApiClient`, `ApiError`
- `src/services/errorService.ts` — `parseOpenRouterError`
- `src/services/sessionService.ts` — session CRUD methods
- `src/services/sseParser.ts` — `parseSSELines` signature
- `src/services/storageService.ts` — `STORAGE_KEYS`, method names

## API Integration — Endpoints
- `src/services/apiService.ts` → all URL strings used in `request()` calls
- `src/types/api.types.ts` → `AskRequest`, `RedactRequest`, `FeedbackRequest`, `OpenRouterPublicDto`, `RedactAsyncResponse`
- `src/hooks/useChat.ts` → how `askQuestionStream` and `sendRedactComplaint` are called

## Accessibility & i18n
- `src/types/accessibility.types.ts` → `ColorBlindnessType`, `AVAILABLE_LANGUAGES`, `AccessibilitySettings`
- `src/hooks/useAccessibility.ts` → public API
- `src/hooks/useLanguage.ts` → language switching
- `src/translations/languages.ts` → supported language codes and key count

## Authentication
- `src/hooks/useAuth.ts` → `decodeToken`, `getCityFromToken`, `isTokenValid`, `clearToken`
- `src/types/domain.types.ts` → `AuthState`
- `vite.config.ts` → `VITE_JWT_TOKEN` usage

## Testing
- `package.json` → `test`, `coverage`, `type-check` scripts
- `vitest.config.ts` → environment, setup file, timeout, coverage config
- `src/__tests__/setup.ts` → global test setup

## Copilot Agent Usage
- `.github/agents/*.agent.md` → each agent's `name`, `description`, and `user-invocable` frontmatter
- `.github/prompts/refresh-skills.prompt.md` → description of what it does

## Contributing
- `.github/copilot-instructions.md` → code style section
- `package.json` → lint and type-check scripts

---

## Priority Reading Order

When doing a FULL documentation pass, read in this priority order:

1. `package.json` — establishes dependencies and scripts
2. `vite.config.ts` — build config and env vars
3. `src/App.tsx` — entry point and component wiring
4. `src/layouts/MainLayout.tsx` — layout structure
5. `src/services/apiService.ts` — API endpoint inventory
6. `src/types/api.types.ts` — request/response shapes
7. `src/hooks/*.ts` — all hooks (alphabetical)
8. `src/components/*.tsx` — all components (alphabetical)
9. `src/translations/languages.ts` — i18n keys
10. `.github/agents/*.agent.md` — agent descriptions
