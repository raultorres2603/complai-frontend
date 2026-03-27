import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { complaiService } from '../services/apiService';
import type { SSECallbacks } from '../types/api.types';

/**
 * Helper: create a ReadableStream from an array of string chunks
 */
function createSSEStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index]));
        index++;
      } else {
        controller.close();
      }
    },
  });
}

function createMockCallbacks(): SSECallbacks & {
  onChunk: ReturnType<typeof vi.fn>;
  onSources: ReturnType<typeof vi.fn>;
  onDone: ReturnType<typeof vi.fn>;
  onError: ReturnType<typeof vi.fn>;
} {
  return {
    onChunk: vi.fn(),
    onSources: vi.fn(),
    onDone: vi.fn(),
    onError: vi.fn(),
  };
}

function encodeBase64(value: string): string {
  return globalThis.btoa(value);
}

describe('complaiService.askQuestionStream', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Set backend URL
    complaiService.setBackendUrl('http://localhost:3000');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should process chunk, sources, and done events correctly', async () => {
    const callbacks = createMockCallbacks();
    const stream = createSSEStream([
      'data: {"type":"chunk","content":"Hello"}\n\n',
      'data: {"type":"chunk","content":" world"}\n\n',
      'data: {"type":"chunk","content":"!"}\n\n',
      'data: {"type":"sources","sources":[{"url":"http://example.com","title":"Ex"}]}\n\n',
      'data: {"type":"done","conversationId":"conv-123"}\n\n',
    ]);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/event-stream' }),
      body: stream,
    });

    await complaiService.askQuestionStream(
      'test question',
      'conv-123',
      'jwt-token',
      'es',
      callbacks
    );

    expect(callbacks.onChunk).toHaveBeenCalledTimes(3);
    expect(callbacks.onChunk).toHaveBeenNthCalledWith(1, 'Hello');
    expect(callbacks.onChunk).toHaveBeenNthCalledWith(2, ' world');
    expect(callbacks.onChunk).toHaveBeenNthCalledWith(3, '!');
    expect(callbacks.onSources).toHaveBeenCalledTimes(1);
    expect(callbacks.onSources).toHaveBeenCalledWith([{ url: 'http://example.com', title: 'Ex' }]);
    expect(callbacks.onDone).toHaveBeenCalledTimes(1);
    expect(callbacks.onDone).toHaveBeenCalledWith('conv-123');
    expect(callbacks.onError).not.toHaveBeenCalled();
  });

  it('should call onError for backend error event', async () => {
    const callbacks = createMockCallbacks();
    const stream = createSSEStream([
      'data: {"type":"error","error":"Rate limit exceeded","errorCode":6}\n\n',
    ]);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'text/event-stream' }),
      body: stream,
    });

    await complaiService.askQuestionStream(
      'test',
      'conv-1',
      'jwt',
      'es',
      callbacks
    );

    expect(callbacks.onError).toHaveBeenCalledTimes(1);
    expect(callbacks.onError).toHaveBeenCalledWith('Rate limit exceeded', 6);
    expect(callbacks.onDone).not.toHaveBeenCalled();
  });

  it('should call onError for non-ok response', async () => {
    const callbacks = createMockCallbacks();

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockResolvedValue({ error: 'Unauthorized', errorCode: 8 }),
    });

    await complaiService.askQuestionStream(
      'test',
      'conv-1',
      'bad-jwt',
      'es',
      callbacks
    );

    expect(callbacks.onError).toHaveBeenCalledTimes(1);
    expect(callbacks.onError).toHaveBeenCalledWith('Unauthorized', 8);
  });

  it('should fallback to JSON for non-SSE content-type', async () => {
    const callbacks = createMockCallbacks();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockResolvedValue({
        success: true,
        message: 'Non-streaming response',
        sources: [],
        error: null,
        errorCode: 0,
      }),
    });

    await complaiService.askQuestionStream(
      'test',
      'conv-1',
      'jwt',
      'es',
      callbacks
    );

    expect(callbacks.onChunk).toHaveBeenCalledWith('Non-streaming response');
    expect(callbacks.onDone).toHaveBeenCalledTimes(1);
    expect(callbacks.onError).not.toHaveBeenCalled();
  });

  it('should process wrapped JSON responses whose body contains SSE text', async () => {
    const callbacks = createMockCallbacks();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockResolvedValue({
        statusCode: 200,
        headers: {
          'Content-Type': 'text/event-stream',
        },
        body: [
          'data: {"type":"chunk","content":"Hola"}\n\n',
          'data: {"type":"sources","sources":[{"url":"http://example.com","title":"Example"}]}\n\n',
          'data: {"type":"done","conversationId":"conv-wrapped"}\n\n',
        ].join(''),
        isBase64Encoded: false,
      }),
    });

    await complaiService.askQuestionStream('test', 'conv-1', 'jwt', 'es', callbacks);

    expect(callbacks.onChunk).toHaveBeenCalledWith('Hola');
    expect(callbacks.onSources).toHaveBeenCalledWith([{ url: 'http://example.com', title: 'Example' }]);
    expect(callbacks.onDone).toHaveBeenCalledWith('conv-wrapped');
    expect(callbacks.onError).not.toHaveBeenCalled();
  });

  it('should process wrapped base64-encoded SSE responses', async () => {
    const callbacks = createMockCallbacks();
    const sseBody = [
      'data: {"type":"chunk","content":"Base"}\n\n',
      'data: {"type":"chunk","content":"64"}\n\n',
      'data: {"type":"done","conversationId":"conv-b64"}\n\n',
    ].join('');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockResolvedValue({
        statusCode: 200,
        multiValueHeaders: {
          'content-type': ['text/event-stream'],
        },
        body: encodeBase64(sseBody),
        isBase64Encoded: true,
      }),
    });

    await complaiService.askQuestionStream('test', 'conv-1', 'jwt', 'es', callbacks);

    expect(callbacks.onChunk).toHaveBeenNthCalledWith(1, 'Base');
    expect(callbacks.onChunk).toHaveBeenNthCalledWith(2, '64');
    expect(callbacks.onDone).toHaveBeenCalledWith('conv-b64');
    expect(callbacks.onError).not.toHaveBeenCalled();
  });

  it('should report malformed wrapped base64 payloads', async () => {
    const callbacks = createMockCallbacks();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockResolvedValue({
        statusCode: 200,
        headers: {
          'content-type': 'text/event-stream',
        },
        body: '%%%not-base64%%%',
        isBase64Encoded: true,
      }),
    });

    await complaiService.askQuestionStream('test', 'conv-1', 'jwt', 'es', callbacks);

    expect(callbacks.onError).toHaveBeenCalledTimes(1);
    expect(callbacks.onDone).not.toHaveBeenCalled();
  });

  it('should report unexpected JSON payloads that are neither wrapped SSE nor OpenRouter DTOs', async () => {
    const callbacks = createMockCallbacks();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: vi.fn().mockResolvedValue({
        foo: 'bar',
      }),
    });

    await complaiService.askQuestionStream('test', 'conv-1', 'jwt', 'es', callbacks);

    expect(callbacks.onError).toHaveBeenCalledWith('Unexpected response payload from /complai/ask');
    expect(callbacks.onDone).not.toHaveBeenCalled();
  });

  it('should not call onError when signal is aborted', async () => {
    const callbacks = createMockCallbacks();
    const abortController = new AbortController();
    abortController.abort();

    const abortError = new Error('The operation was aborted.');
    abortError.name = 'AbortError';
    global.fetch = vi.fn().mockRejectedValue(abortError);

    await complaiService.askQuestionStream(
      'test',
      'conv-1',
      'jwt',
      'es',
      callbacks,
      abortController.signal
    );

    expect(callbacks.onError).not.toHaveBeenCalled();
    expect(callbacks.onDone).not.toHaveBeenCalled();
  });
});
