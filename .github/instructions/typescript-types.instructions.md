---
applyTo: "src/types/**/*.ts"
---
When implementing or editing TypeScript type definitions in this repository:

- Define **interfaces (not types)** for object shapes; use `type` only for unions, primitives, or type aliases.
- Ensure all **DTOs match backend API contracts** from ComplAI backend (Java Micronaut endpi.nts).
- Use **strict typing**: no `any` types; use `unknown` if you must, with proper type guards.
- Mark **optional fields** with `?` (e.g., `field?: string`); be explicit about nullable fields (`null | undefined`).
- Group related types in **logical files** (e.g., `api.types.ts` for API DTOs, `chat.types.ts` for chat-specific types).
- Document **type purposes** with JSDoc comments, especially for union types and complex constraints.
- Import and re-export types from a **central index file** if needed for convenience.
- Ensure **backward compatibility**: when updating types, preserve existing field names and test against backend schema.
