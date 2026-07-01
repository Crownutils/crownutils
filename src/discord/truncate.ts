/** Truncates `text` to at most `max` characters, appending `…` when it is cut. */
export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
