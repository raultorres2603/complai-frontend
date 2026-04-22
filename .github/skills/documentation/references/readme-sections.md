# README Sections — ComplAI Frontend

All 16 sections below are required in a FULL README update. They must appear in this order.

---

## 1. Title Block

```markdown
# ComplAI Frontend

[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![React](https://img.shields.io/badge/React-18-blue.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)]()

> One-sentence description: what the app does and for whom.
```

---

## 2. Table of Contents

Auto-generated anchor links to all sections below.

---

## 3. What Is This Project?

Plain-language description (3–5 sentences) aimed at a non-technical audience:
- What does the app do?
- Who uses it?
- What problem does it solve?

---

## 4. Architecture Overview

Diagram + prose describing the high-level structure:
- Browser SPA (React + Vite)
- Auth flow: JWT resolved from `VITE_JWT_TOKEN` env var or `localStorage`
- Chat flow: user input → `useChat` → `ApiClient.askQuestionStream` → SSE stream → `parseSSELines` → rendered messages
- Tab conflict detection via `BroadcastChannel`
- Accessibility/i18n settings persisted via `useAccessibility` → `storageService`

Include a Mermaid or ASCII architecture diagram showing the main layers.

---

## 5. Tech Stack

Table format:

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| TypeScript | ~5.x | Type safety |
| Vite | 8.x | Build tool & dev server |
| Vitest | ^1.0 | Unit testing |
| React Testing Library | ^14 | Component testing |
| intro.js | ^8.x | Guided tour |
| DOMPurify | ^3.x | HTML sanitization |
| ESLint | 9.x | Linting |

Source: `package.json`

---

## 6. Getting Started

### Prerequisites
- Node.js (version from `package.json` `engines` or LTS)
- npm

### Clone & Install
```bash
git clone <repo-url>
cd frontend
npm install
```

### Environment Variables
Table of all `VITE_*` variables:

| Variable | Required | Description |
|---|---|---|
| `VITE_BACKEND_URL` | Yes | Backend base URL |
| `VITE_JWT_TOKEN` | Dev only | Pre-loaded JWT for local dev |
| `VITE_APP_NAME` | No | Browser tab title |

Copy `.env.example` to `.env` and fill in values.

### Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

---

## 7. Available Scripts

Table of all scripts from `package.json`:

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start dev server |
| `build` | `tsc -b && vite build` | Type-check + production build |
| `preview` | `vite preview` | Preview production build |
| `test` | `vitest` | Run tests in watch mode |
| `test:ui` | `vitest --ui` | Run tests with Vitest UI |
| `coverage` | `vitest run --coverage` | Run tests with coverage |
| `lint` | `eslint .` | Run ESLint |
| `type-check` | `tsc --noEmit` | TypeScript type check only |

---

## 8. Project Structure

```
src/
  App.tsx              Entry point
  components/          UI components (TSX + CSS Modules)
  hooks/               All state and side-effects
  services/            API client, SSE parser, storage, sessions
  types/               TypeScript interfaces and enums
  translations/        i18n strings for es/en/ca
  tours/               intro.js guided tour steps
  layouts/             MainLayout
  utils/               Text formatting and sanitization
  styles/              Global CSS overrides
  __tests__/           Test files
```

---

## 9. Components Reference

Table of all components with a one-line description. Source: `src/components/*.tsx`.

---

## 10. Hooks Reference

Table of all hooks with purpose and key return values. Source: `src/hooks/*.ts`.

---

## 11. Services Reference

Table of all services with purpose and key exports. Source: `src/services/*.ts`.

---

## 12. API Integration

Describe the backend endpoints called by `ApiClient`:
- `POST /complai/ask` — streaming SSE chat
- `POST /complai/redact` — async complaint redaction
- `POST /complai/feedback` — feedback submission

Include request/response shapes from `src/types/api.types.ts`.

Note: raw SSE and Lambda-wrapped SSE payloads are both supported.

---

## 13. Accessibility & Internationalisation

- Supported languages: Spanish (`es`), English (`en`), Catalan (`ca`)
- Language selection persisted to `localStorage`
- Color blindness filters: list types from `accessibility.types.ts`
- Text-to-speech, speech-to-text support via Web Speech API
- Font size preferences

---

## 14. Testing

```bash
npm test -- --run       # run all tests once
npm run coverage        # with coverage report
npm run type-check      # TypeScript only
```

Test layout:
- Unit tests for hooks: `src/hooks/__tests__/`
- Component tests: `src/__tests__/` or co-located
- Service tests: `src/__tests__/`

Framework: Vitest + React Testing Library + jsdom

---

## 15. Copilot Agent Usage

This project uses GitHub Copilot custom agents for multi-step work. Available agents:

| Agent | When to use |
|---|---|
| `@orchestrator` | Multi-step features: planning + implementation + review + docs |
| `planner` | Produces `task.md` from a feature request (invoked by orchestrator) |
| `builder` | Implements `task.md` (invoked by orchestrator) |
| `reviewer` | Validates builder output (invoked by orchestrator) |
| `documentator` | Updates README.md (invoked by orchestrator) |

To refresh skill files after structural changes: open `.github/prompts/refresh-skills.prompt.md` and run with `@orchestrator`.

---

## 16. Contributing

- Branch strategy: feature branches off `main`
- Code style: see `.github/copilot-instructions.md`
- Tests required for all hooks and components with conditional logic
- Run `npm test -- --run` and `npm run type-check` before pushing
