# Code Conventions — ComplAI Frontend

## Components

- **File naming**: `PascalCase.tsx` + `PascalCase.module.css` in `src/components/`
- **One component per file** — no co-located sibling exports
- **Props**: typed with `interface ComponentNameProps { … }` at the top of the file
- **No state, no effects, no service calls** in component files — delegate to hooks
- **Conditional rendering**: use early returns or ternaries, not complex `&&` chains that can render `0`
- **Keys**: always stable (use `id` from data — never array index) in `map()` renders

## Hooks

- **File naming**: `useX.ts` in `src/hooks/` — `.tsx` only if the hook renders JSX
- **Single responsibility**: each hook owns one domain (auth, chat, city, accessibility…)
- **Return shape**: return only what callers need; keep internal state private
- **Effect cleanup**: every `useEffect` that subscribes, opens a connection, or sets a timer must `return () => cleanup()`
- **No service calls directly in components**: all `fetch`/`ApiClient` calls go through a hook
- **Dependency arrays**: be explicit — never omit dependencies or add dummy ones to suppress warnings

## Services

| Service | Responsibility |
|---|---|
| `apiService.ts` / `ApiClient` | All outbound HTTP + SSE, JWT header injection, `ApiError` throwing |
| `sseParser.ts` | `parseSSELines(buffer)` — pure SSE chunk → `SSEEvent[]` |
| `storageService.ts` | `localStorage` read/write behind `STORAGE_KEYS` constants |
| `sessionService.ts` | Conversation CRUD backed by `storageService` |
| `errorService.ts` | `parseOpenRouterError(err) → ParsedError` — never throws |

- **No direct `localStorage` access** outside `storageService.ts`
- **No direct `fetch` calls** outside `apiService.ts`

## Types

- **Location**: `src/types/` — one file per domain
- **Never `any`**: use `unknown` + a type guard (`function isFoo(x: unknown): x is Foo`)
- **Prefer `interface`** for object shapes; `type` for unions/intersections
- **Export from types file**; import with `@/types/foo.types`
- **Extend existing types** before creating new ones — check `api.types.ts` and `domain.types.ts` first

## CSS Modules

- **Always `import styles from './Foo.module.css'`** — never global class strings
- **No `style={{ }}`** for layout, spacing, or visual properties
- **Naming**: `camelCase` selectors in `.module.css` (e.g. `.chatWindow`, `.messageList`)
- **Mobile**: use `@media (max-width: 768px)` breakpoints in the module file; don't use JS for CSS concerns

## Path Aliases

Use **`@/`** for all `src/` imports:

```ts
// ✅ correct
import { complaiService } from '@/services/apiService';
import type { ChatMessage } from '@/types/domain.types';
import styles from './Foo.module.css';   // relative OK for same-dir assets/CSS

// ❌ wrong
import { complaiService } from '../../services/apiService';
```

## Translations

- All user-visible strings must be in `src/translations/languages.ts`
- Add to **all three languages**: `es`, `en`, `ca`
- Access via `const { t } = useTranslation()` — never hardcode Spanish text in JSX
- Key naming: `snake_case`, scoped by feature (e.g. `chat_send_button`, `feedback_success`)

## Security

- **HTML sanitization**: any string from the API that will be rendered as HTML must pass through `formatMessage()` / DOMPurify in `textFormatter.ts`
- **`dangerouslySetInnerHTML`**: only ever used with pre-sanitized content — add a comment citing the sanitization call
- **JWT**: never log token payloads. Use `useAuth` for all token access; never read `localStorage` for JWT directly
- **Inputs**: validate user input at the hook boundary before passing to the API

## Error Handling

- Use `parseOpenRouterError(err)` from `errorService.ts` to produce `ParsedError` — never surface raw `Error` objects to components
- Propagate errors as state (`error: ParsedError | null`) in hooks
- Components display errors via `ParsedError.message`; never `err.message` directly
- No silent failures — if you catch an error, either re-throw or set the error state

## Logging

- `console.error` for caught errors at the service/hook boundary, with context: `console.error('[useChat] stream error:', err)`
- `console.warn` for degraded-but-functional states
- No `console.log` in production paths — use only in dev-only guards (`if (import.meta.env.DEV)`)
- Never log JWT tokens, user PII, or full API responses

## Environment Variables

All env vars are `VITE_`-prefixed and accessed via `import.meta.env.VITE_X`:

| Variable | Purpose |
|---|---|
| `VITE_BACKEND_URL` | Backend base URL (proxied in dev) |
| `VITE_JWT_TOKEN` | Dev-only pre-loaded JWT |
| `VITE_APP_NAME` | Browser tab title |

Never commit `.env` files. Document all variables in `.env.example`.
