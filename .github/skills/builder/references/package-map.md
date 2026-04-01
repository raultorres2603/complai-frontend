# Package Map — ComplAI Frontend

Use this file as an index before exploring any source file. Read the relevant entry first, then open the file only if you need implementation details.

---

## `src/components/`

| File | Purpose |
|---|---|
| `AccessibilityPanel.tsx` | Accessibility settings panel (color blindness, TTS/STT controls, font size) |
| `ChatWindow.tsx` | Main chat container; renders `MessageList` + `MessageInput` |
| `ControlDrawer.tsx` | Mobile-only slide-out drawer wrapping `ControlPanel` |
| `ControlPanel.tsx` | Side panel: language selector, city selector, feedback, tour button |
| `ErrorBoundary.tsx` | React error boundary wrapping the app |
| `FeedbackButton.tsx` | Button that opens `FeedbackModal` |
| `FeedbackModal.tsx` | Feedback submission form modal |
| `Header.tsx` | Desktop header bar |
| `LanguageSelector.tsx` | `es` / `en` / `ca` language switcher |
| `LoadingSpinner.tsx` | Reusable loading indicator |
| `Message.tsx` | Single chat message bubble (user or assistant); handles streaming state, sources, sanitized HTML |
| `MessageInput.tsx` | Text input + send button + microphone button |
| `MessageList.tsx` | Scrollable list of `Message` components |
| `MicrophoneButton.tsx` | STT record button; wired to `useSpeechToText` |
| `MobileHeader.tsx` | Mobile-specific header with drawer toggle |
| `MobileInputFooter.tsx` | Mobile-specific fixed-bottom input area |
| `SourceLink.tsx` | Renders a clickable source citation link |
| `TabConflictModal.tsx` | Modal shown when a duplicate tab is detected |
| `TourButton.tsx` | Button that restarts the intro.js guided tour |

Each component has a co-located `ComponentName.module.css`.

---

## `src/hooks/`

| File | Public API | Key Dependencies |
|---|---|---|
| `useAccessibility.ts` | `settings`, `updateSettings(partial)` | `storageService` |
| `useAuth.ts` | `token`, `decodeToken()`, `getCityFromToken()`, `isTokenValid()`, `clearToken()` | `storageService`, `VITE_JWT_TOKEN` |
| `useChat.ts` | `messages`, `isStreaming`, `error`, `sendQuestion()`, `sendRedactComplaint()`, `clearMessages()` | `complaiService`, `sessionService`, `useAuth` |
| `useCity.ts` | `cityId`, `setCity()`, `availableCities` | `storageService` |
| `useDrawerEscape.ts` | Side effect only — calls `onClose` on `Escape` keydown | — |
| `useFeedback.ts` | `isLoading`, `success`, `error`, `sendFeedback()` | `complaiService` |
| `useLanguage.ts` | `currentLanguage`, `setLanguage()`, `locale`, `availableLanguages` | `useAccessibility` |
| `useMobileLayout.ts` | `isMobile`, `isSuperSmall`, `isDrawerOpen`, `openDrawer()`, `closeDrawer()` | `window.innerWidth` |
| `usePdfPolling.ts` | `isPolling`, `progress`, `pdfUrl`, `startPolling(url)` | `fetch` (HEAD requests) |
| `useSpeechToText.ts` | `isListening`, `transcript`, `startListening()`, `stopListening()`, `cancelListening()`, `setLanguage()`, `resetTranscript()` | `SpeechRecognition` Web API |
| `useTabDetection.ts` | `isConflict`, `dismissConflict()` | `BroadcastChannel`, `localStorage` |
| `useTextToSpeech.ts` | `isEnabled`, `isSpeaking`, `readText()`, `pause()`, `resume()`, `stop()`, `setRate()`, `selectVoice()` | `window.speechSynthesis` |
| `useTour.ts` | `startTour()` | `intro.js`, `storageService`, `useTranslation` |
| `useTranslation.ts` | `t(key)`, `locale` | `useAccessibility`, `getTranslation` |

---

## `src/services/`

| File | Key Exports | Responsibility |
|---|---|---|
| `apiService.ts` | `complaiService` (singleton `ApiClient`), `ApiError` | All HTTP + SSE; JWT auth headers; wrapped/raw SSE detection |
| `errorService.ts` | `parseOpenRouterError(err) → ParsedError` | Normalizes any thrown value to `ParsedError` |
| `sessionService.ts` | `sessionService` object | Conversation CRUD in `localStorage` |
| `sseParser.ts` | `parseSSELines(buffer) → { events, remaining }` | Pure SSE line → `SSEEvent[]` parser |
| `storageService.ts` | `storageService`, `STORAGE_KEYS` | `localStorage` abstraction |

### `ApiClient` methods
| Method | Purpose |
|---|---|
| `askQuestionStream(conversationId, question, jwt, language, callbacks, signal)` | SSE streaming chat |
| `sendRedactComplaint(…)` | Submit complaint for redaction (async S3 flow) |
| `sendFeedback(…)` | Submit user feedback |
| `request<T>(…)` | Generic authenticated REST call |

---

## `src/types/`

| File | Key Types |
|---|---|
| `api.types.ts` | `ErrorCode`, `ParsedError`, `OpenRouterPublicDto`, `RedactAsyncResponse`, `AskRequest`, `RedactRequest`, `FeedbackRequest`, `SSECallbacks`, `SSEEvent`, `Source`, `OutputFormat` |
| `domain.types.ts` | `ChatMessage`, `ChatMessageError`, `ChatFile`, `ConversationSession`, `ChatState`, `ComplaintRedactContext`, `City`, `AuthState`, `Language` |
| `accessibility.types.ts` | `AccessibilitySettings`, `ColorBlindnessType`, `Language`, `LanguageOption`, `AVAILABLE_LANGUAGES`, `TextToSpeechState`, `SpeechToTextState`, `DEFAULT_ACCESSIBILITY_SETTINGS` |
| `layout.types.ts` | Layout-related types |
| `tabDetection.types.ts` | `TabClosureAckMessage`, `ClosureFeedback` |

---

## `src/translations/`

| File | Key Exports |
|---|---|
| `languages.ts` | `translations` (object keyed by `es`/`en`/`ca`), `getTranslation(lang, key) → string` |

Supported languages: `es` (Spanish), `en` (English), `ca` (Catalan)

---

## `src/tours/`

| File | Key Exports |
|---|---|
| `appTour.ts` | `getAppTourSteps(language) → IntroStep[]` |

---

## `src/utils/`

| File | Key Exports |
|---|---|
| `textFormatter.ts` | `formatMessage(html: string) → string` (DOMPurify sanitization + markdown rendering) |

---

## `src/layouts/`

| File | Purpose |
|---|---|
| `MainLayout.tsx` | Top-level layout: Header/MobileHeader + main content area + ControlPanel/ControlDrawer |

---

## `src/App.tsx`

Entry point. Wires all hooks, resolves `cityId` from JWT, initialises/restores conversation via `sessionService`, sets `backendUrl` from `VITE_BACKEND_URL`, renders `MainLayout`.

---

## Config Files

| File | Purpose |
|---|---|
| `package.json` | Dependencies, scripts (`dev`, `build`, `test`, `type-check`, `lint`, `coverage`) |
| `vite.config.ts` | Build config, base path, dev proxy (`/complai` → `VITE_BACKEND_URL`), `@/` alias |
| `vitest.config.ts` | jsdom env, setup file, 15s timeout, v8 coverage |
| `tsconfig.app.json` | ES2023, strict, `@/*` alias |
| `eslint.config.js` | ESLint 9 flat config |
| `.env` / `.env.example` | `VITE_BACKEND_URL`, `VITE_JWT_TOKEN`, `VITE_APP_NAME` |
