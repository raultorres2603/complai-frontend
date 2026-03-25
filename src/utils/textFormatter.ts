/**
 * Text formatting utilities for normalizing message content
 */

/**
 * Normalize text by trimming whitespace and reducing excessive newlines
 * - Trims leading/trailing whitespace from entire text
 * - Replaces 2+ consecutive newlines (with possible spaces/tabs in between) with exactly 2 newlines
 * - Removes trailing spaces/tabs before newlines
 * - Preserves single newlines for normal line breaks
 *
 * @param text - The text to normalize
 * @returns Normalized text string
 */
export function normalizeText(text: string): string {
  return text
    .trim() // Remove leading/trailing whitespace
    .replace(/\n(\s*\n)+/g, '\n\n') // Replace 2+ newlines (with optional whitespace) with exactly 2
    .replace(/[ \t]+\n/g, '\n');    // Remove trailing spaces/tabs before newlines
}
