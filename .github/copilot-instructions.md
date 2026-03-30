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

## Code Style & Architectural Patterns
- **Component Structure**: Functional components with hooks, organized in a feature-based folder structure (e.g., `src/features/Chat`, `src/features/Auth`)
- **State Management**: Use custom hooks for managing state and side effects, following the principle of separation of concerns (e.g., `useChat` for chat-related logic, `useAuth` for authentication logic)
- **Error Handling**: Implement robust error handling in API calls and component logic, using try-catch blocks and providing user-friendly error messages
- **Testing**: Write comprehensive unit and integration tests for components and hooks, ensuring high test coverage and reliability
- **Documentation**: Provide clear and concise documentation for components, hooks, and utility functions, including JSDoc comments and `README.md` files where necessary to explain the purpose and usage of different parts of the codebase.
- **Code Reviews**: Follow best practices for code reviews, providing constructive feedback and ensuring that all code changes adhere to the project's coding standards and architectural patterns.