---
applyTo: "src/components/**/*.tsx"
---
When implementing or editing React components in this repository:

- Use **functional components** only; no class components.
- Define a **props interface** (e.g., `interface ChatWindowProps { ... }`) for every component; avoid untyped or `any` props.
- Keep components focused on UI rendering and event handling; delegate business logic to hooks and services.
- Use **constructor-based props**: always accept all dependencies as props, not through global state or context (unless explicitly required).
- Preserve existing **multi-city support**: ensure any city-dependent rendering or API calls use city from props or hooks (e.g., `useCity()`).
- Use **CSS Modules** (`ComponentName.module.css`) for component-scoped styling; avoid inline styles unless necessary.
- Implement error handling with **Error Boundary** components where appropriate.
- Add or preserve structured, user-friendly error messages that match backend error codes (`OpenRouterErrorCode`).
- Add **component tests** using Vitest + React Testing Library for UI logic, prop handling, and user interactions.
- Ensure **accessibility**: use semantic HTML (button, form, etc.), ARIA labels where needed, and test keyboard navigation.
