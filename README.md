# ComplAI Frontend

A React + TypeScript single-page application providing a citizen-facing AI chat interface for municipal compliance assistance. Connects to a Java/Micronaut backend via REST and Server-Sent Events (SSE) for real-time streaming responses.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
4. [Available Scripts](#available-scripts)
5. [Environment Variables](#environment-variables)
6. [Project Structure](#project-structure)
7. [Key Features](#key-features)
8. [Architecture](#architecture)
9. [Testing](#testing)
10. [i18n and Accessibility](#i18n-and-accessibility)

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 + TypeScript (strict mode, `ES2023` target) |
| Build | Vite 8 + `@vitejs/plugin-react` |
| Styling | CSS Modules (one `.module.css` per component) |
| Testing | Vitest 1 + React Testing Library 14 (`jsdom`) |
| Linting | ESLint 9 + typescript-eslint |
| Guided Tour | intro.js v8 |
| HTML Sanitization | DOMPurify 3 |
| HTTP / Streaming | Native `fetch` + SSE (no external HTTP library) |

---

## Prerequisites

- **Node.js** 20 or later
- **npm** 10 or later
- A running ComplAI backend (default target: `http://localhost:3000`)

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (see the Environment Variables section)

# 3. Start the development server (opens http://localhost:5173 automatically)
npm run dev
```

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start Vite dev server on port 5173 with HMR |
| `build` | `tsc -b && vite build` | Type-check then produce a production bundle |
| `preview` | `vite preview` | Serve the production build locally on port 4173 |
| `lint` | `eslint .` | Run ESLint across the entire project |
| `test` | `vitest` | Run the Vitest test suite |
| `test:ui` | `vitest --ui` | Run tests with the Vitest browser UI |
| `coverage` | `vitest --coverage` | Generate v8 coverage report (text + JSON + HTML) |
| `type-check` | `tsc --noEmit` | Type-check without emitting files |

---

## Environment Variables

Create a `.env` file in the project root. All variables must be prefixed with `VITE_` to be exposed to the client bundle.

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_BACKEND_URL` | No | `http://localhost:3000` | Base URL of the ComplAI backend |
| `VITE_DEPLOYMENT_ENV` | No | _(local)_ | Set to `production` or `development` to adjust the Vite `base` path |
| `VITE_JWT_TOKEN` | No | _(from localStorage)_ | Pre-load a JWT token at startup (useful for development) |
| `VITE_APP_NAME` | No | `ComplAI` | Browser tab title |

> **Security**: Never commit a `.env` file containing real JWT tokens or production credentials to source control.

The Vite dev server proxies all requests matching `/complai/*` to `VITE_BACKEND_URL`, so no CORS configuration is needed during local development.

---

## Project Structure

```
src/
├── App.tsx                   Entry point — wires hooks, resolves cityId from JWT, renders MainLayout
├── main.tsx                  React DOM root
├── App.css / index.css       Global styles
│
├── components/               Presentational UI components (one TSX + one CSS Module each)
│   ├── AccessibilityPanel    Font size, contrast, color blindness, and language controls
│   ├── ChatWindow            Main chat container
│   ├── ControlDrawer         Mobile slide-out drawer for controls
│   ├── ControlPanel          Sidebar control panel (desktop)
│   ├── ErrorBoundary         React error boundary with fallback UI
│   ├── FeedbackButton        Per-message feedback trigger
│   ├── FeedbackModal         Feedback collection modal
│   ├── Header                Top navigation bar
│   ├── LanguageSelector      Language switcher (es / en / ca)
│   ├── LoadingSpinner        Loading indicator
│   ├── Message               Single chat message (user or assistant)
│   ├── MessageInput          Text input + send button
│   ├── MessageList           Scrollable message history
│   ├── MicrophoneButton      Speech-to-text trigger button
│   ├── MobileHeader          Mobile-specific top bar
│   ├── MobileInputFooter     Mobile-specific bottom input bar
│   ├── SourceLink            Renders document source links returned by the AI
│   ├── SpeechControls        Text-to-speech playback controls
│   ├── TabConflictModal      Warning when the app is open in multiple browser tabs
│   └── TourButton            Trigger for the guided onboarding tour
│
├── hooks/                    All stateful logic — components are pure renderers
│   ├── useAccessibility.ts   Accessibility settings (color filters, font size, language)
│   ├── useAuth.ts            JWT token management (env var → localStorage fallback)
│   ├── useChat.ts            Chat state, question/complaint dispatch, SSE streaming
│   ├── useCity.ts            City context derived from JWT
│   ├── useDrawerEscape.ts    Closes the mobile drawer on Escape key
│   ├── useFeedback.ts        Per-message thumbs up/down feedback
│   ├── useLanguage.ts        Language preference persistence
│   ├── useMobileLayout.ts    Responsive layout state (drawer open/close)
│   ├── usePdfPolling.ts      Polls for async PDF generation completion
│   ├── useSpeechToText.ts    Browser Web Speech API (STT)
│   ├── useTabDetection.ts    Detects multiple open tabs to prevent session conflicts
│   ├── useTextToSpeech.ts    Browser SpeechSynthesis API (TTS)
│   ├── useTour.ts            intro.js guided tour lifecycle
│   └── useTranslation.ts     Returns a `t(key)` function for the active language
│
├── services/
│   ├── apiService.ts         `ApiClient` class — fetch-based HTTP + SSE streaming
│   ├── sessionService.ts     Conversation creation and persistence
│   ├── storageService.ts     `localStorage` abstraction + `STORAGE_KEYS` constants
│   ├── errorService.ts       Error parsing, `ParsedError` shape
│   └── sseParser.ts          Line-level SSE chunk parser
│
├── types/
│   ├── api.types.ts          Request/response DTOs, `SSECallbacks`, `ErrorCode`
│   ├── domain.types.ts       `ChatMessage`, `ChatState`, `Conversation`, etc.
│   └── accessibility.types.ts `AccessibilitySettings`, `Language`, `ColorBlindnessType`
│
├── translations/
│   └── languages.ts          `getTranslation(lang, key)` — string maps for es / en / ca
│
├── tours/
│   └── appTour.ts            intro.js v8 step definitions
│
├── layouts/
│   └── MainLayout.tsx        Top-level layout shell
│
├── utils/
│   └── textFormatter.ts      DOMPurify sanitization for AI-generated HTML
│
├── styles/                   Global and third-party CSS overrides
└── __tests__/                Vitest test files (co-located with source)
```

---

## Key Features

- **JWT authentication** — Token loaded from `VITE_JWT_TOKEN` env var or persisted in `localStorage` via `useAuth`.
- **Multi-city context** — City ID is extracted from the JWT payload (`getCityFromToken`) and scopes every API call, enabling city-specific compliance answers.
- **Real-time streaming chat** — Questions are streamed back from the backend via SSE and rendered incrementally (`useChat` + `sseParser`).
- **Complaint drafting mode** — A dedicated mode collects optional requester information (name, surname, ID number) and sends it to the backend for formal redaction.
- **Async PDF generation** — After a complaint is drafted, `usePdfPolling` polls the backend until the PDF document is ready for download.
- **Accessibility panel** — Color blindness filters (deuteranopia, protanopia, tritanopia), font size controls, text-to-speech, and speech-to-text are available to all users.
- **Guided onboarding tour** — intro.js v8 walks new users through the interface (`useTour`, `appTour.ts`).
- **HTML sanitization** — All AI-generated content is passed through DOMPurify before being injected into the DOM (`textFormatter.ts`).
- **Tab conflict detection** — `useTabDetection` warns when the app is open in multiple browser tabs simultaneously, preventing session collisions.
- **i18n** — Spanish, English, and Catalan supported via `languages.ts` and `useTranslation`.

---

## Architecture

### Hooks-first pattern

All side effects and state live in `src/hooks/`. Components receive data and callbacks as props and contain no business logic. This separation makes hooks independently testable without mounting a full component tree.

### Request / SSE flow

```
User input
    │
    ▼
useChat.sendQuestion()
    │
    ▼
ApiClient.askQuestionStream()          ← src/services/apiService.ts
    │  POST /complai/ask  (JWT in Authorization header)
    ▼
Backend (Java/Micronaut)
    │  SSE response stream
    ▼
sseParser.parseSSELines()              ← src/services/sseParser.ts
    │  fires SSECallbacks: onToken / onComplete / onError
    ▼
useChat state update
    │
    ▼
MessageList → Message
    │  (AI HTML sanitized via textFormatter.ts before render)
    ▼
DOM
```

### CSS Modules

Every component has exactly one co-located `.module.css` file. No inline `style={}` props are used for layout. No global class names are shared between components.

### Path alias

`@/` maps to `src/` in both TypeScript (`tsconfig.app.json`) and Vitest (`vitest.config.ts`).

```ts
import { complaiService } from '@/services/apiService';
```

---

## Testing

Tests live in `src/__tests__/` and in co-located `__tests__/` subdirectories. The test environment is `jsdom`.

```bash
# Run all tests
npm run test

# Run tests with browser UI
npm run test:ui

# Generate coverage report (output: coverage/)
npm run coverage
```

Coverage is collected with the v8 provider and written as text (terminal), JSON, and HTML.

**Setup file**: `src/__tests__/setup.ts` is imported automatically before every test file (configured in `vitest.config.ts`).

---

## i18n and Accessibility

### Supported languages

| Code | Language |
|---|---|
| `es` | Spanish |
| `en` | English |
| `ca` | Catalan |

Language preference is persisted in `localStorage` under the key `complai_language`. Use the `useTranslation` hook to access the active language's strings:

```ts
const { t } = useTranslation();
// t('send') → 'Enviar' (es) | 'Send' (en) | 'Enviar' (ca)
```

All translation keys are defined in `src/translations/languages.ts`.

### Accessibility settings

Managed by `useAccessibility` and persisted under the key `complai_accessibility` in `localStorage`. Available controls:

- **Color blindness filters** — SVG CSS filter applied to the entire document (`deuteranopia`, `protanopia`, `tritanopia`)
- **Font size** — user-adjustable base font size
- **Text-to-speech** — reads assistant replies aloud via the browser `SpeechSynthesis` API
- **Speech-to-text** — fills the message input using the browser Web Speech API
