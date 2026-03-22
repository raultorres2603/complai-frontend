# Copilot Skills for ComplAI Frontend

## Skill: Create React Component
**Trigger**: "Build a new component for [Feature]", "Add a new UI component"
**Action**:
Generate a functional React component in `src/components/` with a TypeScript props interface.
Include proper HTML semantics, accessibility attributes (ARIA labels, semantic elements), and event handlers.
If component is city-dependent, accept city as a prop and pass it through to service calls or child components.
Use CSS Modules for styling (`ComponentName.module.css`). Add a corresponding component test using Vitest + React Testing Library.

## Skill: Implement Custom Hook
**Trigger**: "Create a new hook for [State/Logic]", "Extract state logic to a custom hook"
**Action**:
Create a custom hook in `src/hooks/` with a typed return interface.
Use useState, useEffect, useCallback as needed. Preserve multi-city support by accepting city as a parameter.
Handle side-effects with proper cleanup. Return typed state, loading indicators, and error states.
Add a corresponding unit test using Vitest with `renderHook`. Mock service dependencies.

## Skill: Add Service Method
**Trigger**: "Implement API call for [Feature]", "Add business logic service"
**Action**:
Create or extend a service in `src/services/` with typed function signatures.
Define DTOs/types matching backend API contracts in `src/types/`.
Use typed error modeling for API failures; map backend error codes to frontend enums.
Include JWT token in Authorization header for authenticated endpoints. Handle token expiry.
Add a corresponding unit test using Vitest with mocked fetch/axios calls.

## Skill: Define TypeScript Types
**Trigger**: "Update API types", "Add type definition for [Feature]"
**Action**:
Create or update interface definitions in `src/types/` matching backend DTO contracts.
Use interfaces (not types) for objects; mark optional fields with `?`.
Ensure backward compatibility and clear documentation with JSDoc.
Validate types against backend schema and test component props.

## Skill: Write Component Test
**Trigger**: "Test the new component"
**Action**:
Create a Vitest + React Testing Library test in `src/components/__tests__/`.
Test user interactions, prop changes, and error states. Use `screen.getByRole()` and `userEvent` for interactions.
Mock service dependencies; verify component renders correctly for success and error cases.
Run `npm test` and capture outcomes.

## Skill: Task Management
**Trigger**: "Update task.md"
**Action**:
Open `task.md`, parse the current unchecked steps `[ ]`, mark the just-completed step as `[x]`, and list the immediate next step to be worked on.

## Skill: Plan Multi-City Feature
**Trigger**: "Add city support", "make feature city-aware"
**Action**:
In `task.md`, explicitly include: city parameter passing through components/hooks/services, useCity hook usage, API endpoint changes to include city, and testing across multiple cities.