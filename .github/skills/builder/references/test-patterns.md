# Test Patterns — ComplAI Frontend

## Test Runner & Setup

- **Framework**: Vitest ^1.0 + `@testing-library/react` ^14
- **Environment**: `jsdom` (configured in `vitest.config.ts`)
- **Setup file**: `src/__tests__/setup.ts` (imported automatically)
- **Run all tests**: `npm test -- --run`
- **Run single test**: `npm test -- --run --reporter=verbose path/to/test.ts`
- **Type check**: `npm run type-check`
- **Coverage**: `npm run coverage`

---

## Test File Location

| Source File | Test File |
|---|---|
| `src/hooks/useFoo.ts` | `src/hooks/__tests__/useFoo.test.ts` |
| `src/components/Foo.tsx` | `src/components/__tests__/Foo.test.tsx` or `src/__tests__/Foo.test.tsx` |
| `src/services/apiService.ts` | `src/services/__tests__/apiService.test.ts` or `src/__tests__/apiService.test.ts` |
| `src/utils/textFormatter.ts` | `src/utils/__tests__/textFormatter.test.ts` |

---

## Test Naming Convention

`describe('<HookOrComponentName>') > it('<methodName> <condition> <expectedResult>')`

Examples:
```ts
describe('useAuth') {
  it('getCityFromToken returns null when token is absent')
  it('getCityFromToken returns city when JWT contains city claim')
  it('isTokenValid returns false for expired token')
}
```

---

## Hook Tests (Vitest + `renderHook`)

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFoo } from '@/hooks/useFoo';

// Mock service dependencies at the module level
vi.mock('@/services/apiService', () => ({
  complaiService: {
    askQuestionStream: vi.fn(),
  },
}));

// Mock storageService if the hook reads/writes localStorage
vi.mock('@/services/storageService', () => ({
  storageService: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    has: vi.fn(() => false),
  },
  STORAGE_KEYS: { complai_foo: 'complai_foo' },
}));

describe('useFoo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initialState is correct', () => {
    const { result } = renderHook(() => useFoo());
    expect(result.current.value).toBe(null);
  });

  it('doAction updates state correctly', async () => {
    const { result } = renderHook(() => useFoo());
    await act(async () => {
      result.current.doAction('input');
    });
    expect(result.current.value).toBe('expected');
  });

  it('doAction sets error on failure', async () => {
    vi.mocked(complaiService.someMethod).mockRejectedValueOnce(new Error('fail'));
    const { result } = renderHook(() => useFoo());
    await act(async () => {
      result.current.doAction('input');
    });
    expect(result.current.error).not.toBeNull();
  });
});
```

---

## Component Tests (RTL)

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FooComponent } from '@/components/FooComponent';

describe('FooComponent', () => {
  it('renders the submit button', () => {
    render(<FooComponent onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('calls onSubmit when button clicked', () => {
    const onSubmit = vi.fn();
    render(<FooComponent onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not render error message when error is null', () => {
    render(<FooComponent onSubmit={vi.fn()} error={null} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders error message when error is provided', () => {
    const error = { message: 'Something failed', code: 'UNKNOWN' };
    render(<FooComponent onSubmit={vi.fn()} error={error} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something failed');
  });
});
```

---

## Service Tests (fetch mock)

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock global fetch before importing the module
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import { ApiClient } from '@/services/apiService';

describe('ApiClient.request', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient('http://localhost:3000', 'test-jwt');
    vi.clearAllMocks();
  });

  it('returns parsed JSON on success', async () => {
    mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const result = await client.request<{ ok: boolean }>('/test');
    expect(result.ok).toBe(true);
  });

  it('throws ApiError on 401', async () => {
    mockFetch.mockResolvedValueOnce(new Response(null, { status: 401 }));
    await expect(client.request('/test')).rejects.toMatchObject({ status: 401 });
  });
});
```

---

## SSE Tests

```ts
import { describe, it, expect } from 'vitest';
import { parseSSELines } from '@/services/sseParser';

describe('parseSSELines', () => {
  it('parses a single complete event', () => {
    const buffer = 'data: {"token":"hello"}\n\n';
    const { events, remaining } = parseSSELines(buffer);
    expect(events).toHaveLength(1);
    expect(events[0].token).toBe('hello');
    expect(remaining).toBe('');
  });

  it('returns partial data in remaining when event is incomplete', () => {
    const buffer = 'data: {"tok';
    const { events, remaining } = parseSSELines(buffer);
    expect(events).toHaveLength(0);
    expect(remaining).toBe(buffer);
  });
});
```

---

## What Must Be Tested

| New export type | Required test |
|---|---|
| Hook with state | `renderHook` — initial state, state transitions, error path |
| Hook with service call | Mock the service, test success + failure |
| Component with conditional render | RTL — renders correctly in each branch |
| Component with user interaction | RTL — `fireEvent` + assert callback or state change |
| Service function | Mock `fetch`, test success + error response + `ApiError` throw |
| Pure utility function | Plain Vitest `expect` — all inputs + edge cases |
| SSE parser function | Plain Vitest — complete events, partial events, malformed JSON |

---

## What Does NOT Need Tests

- Components that are pure pass-through renderers (no conditional logic, no handlers)
- CSS Modules
- Type-only files in `src/types/`
- Tour step definitions in `appTour.ts` (data, not logic)
- Translation strings in `languages.ts` (unless `getTranslation` logic is complex)
