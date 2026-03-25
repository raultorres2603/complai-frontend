/**
 * Text formatting utilities for normalizing message content
 */

/**
 * Normalize text by trimming whitespace and reducing excessive newlines
 * - Trims leading/trailing whitespace from entire text
 * - Replaces 3+ consecutive newlines (with possible spaces/tabs in between) with exactly 2 newlines
 * - Preserves single and double newlines for normal paragraph breaks
 *
 * @param text - The text to normalize
 * @returns Normalized text string
 */
export function normalizeText(text: string): string {
  return text
    .trim() // Remove leading/trailing whitespace
    .replace(/\n[\s]*\n[\s]*\n[\s]*/g, '\n\n'); // Replace 3+ newlines (with possible whitespace) with exactly 2
}
