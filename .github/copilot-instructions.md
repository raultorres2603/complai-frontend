# ComplAI Frontend - Project Instructions & Tech Stack

## Tech Stack
- **Framework**: React 18+ with TypeScript (strict mode)
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library
- **Linting & Code Quality**: ESLint + TypeScript ESLint
- **Styling**: CSS Modules (component-scoped)
- **State Management**: Custom React Hooks (useChat, useAuth, useCity)
- **HTTP Client**: Fetch API with axios or custom wrapper
- **Backend Integration**: JWT authentication, REST API calls to ComplAI backend

## Architecture & Patterns
- **Component Structure**: Located in `src/components/`. Each component is a functional component with TypeScript props interface.
- **Custom Hooks**: Located in `src/hooks/`. Encapsulate state and side-effect logic (e.g., `useChat`, `useAuth`, `useCity`, `usePdfPolling`).
- **Services**: Located in `src/services/`. Handle business logic and API calls (e.g., `apiService`, `sessionService`, `storageService`).
- **Types & DTOs**: Located in `src/types/`. Define TypeScript interfaces matching backend API contracts.
- **Pages**: Located in `src/pages/`. Page-level components that compose lower-level components and hooks.
- **Multi-city Support**: All components and hooks must respect city context from JWT claims/storage and pass it through service calls.
- **Security**: JWT tokens stored securely and passed in all API requests. Validate token expiry client-side.
- **Error Handling**: Typed error models matching backend error codes (`OpenRouterErrorCode`). Display user-friendly error messages.
- **Conversation Flow**: User messages → API call → streaming or batch response → UI update. Preserve conversation history via `sessionService`.
- **PDF Generation & Polling**: Complaint redaction returns presigned S3 URL; `usePdfPolling` polls until ready, then downloads/displays.

## Coding Standards
1. Use **functional components** with TypeScript props interfaces (no class components).
2. Maintain **strict TypeScript** (`tsconfig.json` has `strict: true`).
3. Follow **separation of concerns**: Components handle UI, Hooks manage state/side-effects, Services handle business logic and API calls.
4. **Constructor pattern equivalent**: Custom hooks use the constructor-like initialization pattern; avoid global state managers unless necessary.
5. **Immutability**: Use immutable state updates (spread operator, map, filter, etc.).
6. Write **unit tests** for services (plain Vitest) and **component tests** (Vitest + React Testing Library).
7. Preserve **city context** across all features; pass city as parameter through service calls and component props.
8. Use **error boundary** components to catch and display errors gracefully.
9. Keep **dependencies minimal**: Avoid large libraries for simple tasks; prefer built-in React patterns.
10. Ensure **accessibility**: Use semantic HTML, ARIA labels where needed, and test with keyboard navigation.
