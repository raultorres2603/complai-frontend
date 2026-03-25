/**
 * Unit tests for textFormatter utility
 */

import { describe, it, expect } from 'vitest';
import { normalizeText } from '../textFormatter';

describe('normalizeText', () => {
  // Test case 1: Multiple consecutive newlines (4+) reduced to 2
  it('should reduce 4+ consecutive newlines to exactly 2 newlines', () => {
    const input = 'First paragraph\n\n\n\nSecond paragraph';
    const expected = 'First paragraph\n\nSecond paragraph';
    expect(normalizeText(input)).toBe(expected);
  });

  // Test case 2: Single newlines preserved
  it('should preserve single newlines', () => {
    const input = 'Line 1\nLine 2\nLine 3';
    const expected = 'Line 1\nLine 2\nLine 3';
    expect(normalizeText(input)).toBe(expected);
  });

  // Test case 3: Double newlines preserved
  it('should preserve double newlines', () => {
    const input = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3';
    const expected = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3';
    expect(normalizeText(input)).toBe(expected);
  });

  // Test case 4: Leading/trailing whitespace trimmed
  it('should trim leading and trailing whitespace', () => {
    const input = '   \n\nSome text\n\n   ';
    const expected = 'Some text';
    expect(normalizeText(input)).toBe(expected);
  });

  // Test case 5: Mixed content with multiple normalizations applied
  it('should handle mixed content with multiple blocks of excessive newlines', () => {
    const input = 'Block 1\n\n\n\n\nBlock 2\n\n\nBlock 3\n\nBlock 4';
    const expected = 'Block 1\n\nBlock 2\n\nBlock 3\n\nBlock 4';
    expect(normalizeText(input)).toBe(expected);
  });

  // Test case 6: Empty string returns empty
  it('should return empty string for empty input', () => {
    const input = '';
    const expected = '';
    expect(normalizeText(input)).toBe(expected);
  });

  // Test case 7: String with only whitespace returns empty
  it('should return empty string for whitespace-only input', () => {
    const input = '   \n\n\t\n   ';
    const expected = '';
    expect(normalizeText(input)).toBe(expected);
  });

  // Test case 8: Real-world bot response with irregular newlines (10+ newlines)
  it('should normalize real-world bot response with irregular formatting', () => {
    const input = `Hola! L'adreça exacta...




Però et puc indicar...




    
Consulta la pàgina web...`;
    const expected = `Hola! L'adreça exacta...

Però et puc indicar...

Consulta la pàgina web...`;
    expect(normalizeText(input)).toBe(expected);
  });
});
