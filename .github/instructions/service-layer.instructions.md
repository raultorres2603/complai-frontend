---
applyTo: "src/services/**/*.ts"
---
When implementing or editing service-layer classes/functions in this repository:

- Keep services focused on **business logic and API calls**, not UI concerns.
- Define **typed function signatures** with explicit parameter and return types; avoid `any` unless documented.
- Preserve **multi-city awareness**: accept city as a parameter in city-dependent service calls; pass it to backend API endpoints.
- Use **constructor-based dependency injection** pattern (parameter passed to function) for HTTP client or external dependencies.
- Return **typed result objects or error enums** for clear success/failure modeling (e.g., `Result<Data, ErrorCode>`); avoid throwing broad exceptions for predictable errors.
- Use **typed error modeling** matching backend `OpenRouterErrorCode` for API errors; map HTTP status codes and response bodies to typed errors.
- Preserve **authentication behavior**: always include JWT token in Authorization header for authenticated endpoints; handle token expiry gracefully.
- Add **unit tests** using Vitest; mock fetch (or axios) and test success paths, error cases, and city parameter passing.
- Ensure **privacy-safe logging**: do not log sensitive data (JWT tokens, user PII, etc.).
- Document **preconditions and error handling** with JSDoc comments.
