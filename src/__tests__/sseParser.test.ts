import { describe, it, expect, vi } from 'vitest';
import { parseSSELines } from '../services/sseParser';

describe('parseSSELines', () => {
  it('should parse a single complete chunk event', () => {
    const buffer = 'data: {"type":"chunk","content":"hello"}\n\n';
    const { events, remaining } = parseSSELines(buffer);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'chunk', content: 'hello' });
    expect(remaining).toBe('');
  });

  it('should parse multiple events in one buffer', () => {
    const buffer =
      'data: {"type":"chunk","content":"a"}\n\n' +
      'data: {"type":"sources","sources":[{"url":"http://example.com","title":"Example"}]}\n\n' +
      'data: {"type":"done"}\n\n';

    const { events, remaining } = parseSSELines(buffer);

    expect(events).toHaveLength(3);
    expect(events[0]).toEqual({ type: 'chunk', content: 'a' });
    expect(events[1]).toEqual({
      type: 'sources',
      sources: [{ url: 'http://example.com', title: 'Example' }],
    });
    expect(events[2]).toEqual({ type: 'done' });
    expect(remaining).toBe('');
  });

  it('should return partial buffer as remaining when no trailing \\n\\n', () => {
    const buffer = 'data: {"type":"chunk","content":"partial"}';
    const { events, remaining } = parseSSELines(buffer);

    expect(events).toHaveLength(0);
    expect(remaining).toBe('data: {"type":"chunk","content":"partial"}');
  });

  it('should parse one complete event and keep partial as remaining', () => {
    const buffer =
      'data: {"type":"chunk","content":"first"}\n\n' +
      'data: {"type":"chunk","content":"sec';

    const { events, remaining } = parseSSELines(buffer);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'chunk', content: 'first' });
    expect(remaining).toBe('data: {"type":"chunk","content":"sec');
  });

  it('should skip empty data lines (heartbeat)', () => {
    const buffer = 'data: \n\n';
    const { events, remaining } = parseSSELines(buffer);

    expect(events).toHaveLength(0);
    expect(remaining).toBe('');
  });

  it('should skip malformed JSON gracefully', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const buffer = 'data: {invalid json}\n\n';
    const { events, remaining } = parseSSELines(buffer);

    expect(events).toHaveLength(0);
    expect(remaining).toBe('');
    expect(warnSpy).toHaveBeenCalledWith(
      'SSE: Failed to parse event data:',
      '{invalid json}'
    );
    warnSpy.mockRestore();
  });

  it('should parse error event with errorCode', () => {
    const buffer = 'data: {"type":"error","error":"Something went wrong","errorCode":4}\n\n';
    const { events, remaining } = parseSSELines(buffer);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: 'error',
      error: 'Something went wrong',
      errorCode: 4,
    });
    expect(remaining).toBe('');
  });

  it('should parse sources event with Source array', () => {
    const sources = [
      { url: 'http://a.com', title: 'A' },
      { url: 'http://b.com', title: 'B' },
    ];
    const buffer = `data: {"type":"sources","sources":${JSON.stringify(sources)}}\n\n`;
    const { events, remaining } = parseSSELines(buffer);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'sources', sources });
    expect(remaining).toBe('');
  });
});
