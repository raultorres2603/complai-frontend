import type { SSEEvent } from '../types/api.types';

/**
 * Parse SSE lines from a buffer string.
 * Splits on double-newline boundaries. Each complete block is parsed as a JSON SSE event.
 * Returns parsed events and any remaining incomplete buffer.
 */
export function parseSSELines(buffer: string): { events: SSEEvent[]; remaining: string } {
  const events: SSEEvent[] = [];
  const blocks = buffer.split('\n\n');

  // Last element is either empty (if buffer ended with \n\n) or an incomplete block
  const remaining = blocks.pop() ?? '';

  for (const block of blocks) {
    if (!block.trim()) continue;

    const lines = block.split('\n');
    let data = '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        data += line.slice(6);
      } else if (line.startsWith('data:')) {
        data += line.slice(5);
      }
    }

    // Skip empty data (heartbeat / keep-alive)
    if (!data.trim()) continue;

    try {
      const parsed = JSON.parse(data) as SSEEvent;
      events.push(parsed);
    } catch {
      console.warn('SSE: Failed to parse event data:', data);
    }
  }

  return { events, remaining };
}
