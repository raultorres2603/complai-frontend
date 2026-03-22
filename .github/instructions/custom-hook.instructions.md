---
applyTo: "src/hooks/**/*.ts"
---
When implementing or editing custom hooks in this repository:

- Use **React Hooks API** (useState, useEffect, useCallback, etc.) as the foundation.
- Define a **return type interface** (e.g., `interface UseChat { ... }` or `interface UseChatReturn { ... }`) for every hook's return value.
- Keep hooks focused on **state management and side-effects**; delegate business logic to services.
- Preserve **multi-city awareness**: always accept city as a parameter or from context; pass it through service calls.
- Use **custom context** (if needed) sparingly; prefer props or hook parameters for dependency injection.
- Ensure **cleanup**: use useEffect cleanup functions for subscriptions, timers, and API calls.
- Use **useCallback** to memoize callback functions passed to child components or services.
- Handle **errors gracefully**: return error state from hooks; let consuming components decide how to display errors.
- Add **unit tests** using Vitest and `renderHook` from React Testing Library; test side-effects, state updates, and error handling.
- Document the hook's **purpose, parameters, and return value** with JSDoc comments.
