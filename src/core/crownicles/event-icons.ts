import { TtlCache } from '@/core/cache/ttl-cache.js';
import { fetchCrowniclesText } from './source.js';

/** Per-event map of possibility key → its choice emote (the reaction icon). */
export type EventChoiceIcons = ReadonlyMap<number, Record<string, string>>;

const ICONS_SOURCE_PATH = 'Lib/src/CrowniclesIcons.ts';
/** Game data changes rarely; a long TTL keeps it warm while still self-healing. */
const DATA_TTL_MS = 12 * 60 * 60 * 1000;
const CACHE_KEY = 'events';

const cache = new TtlCache<string, EventChoiceIcons>(1, DATA_TTL_MS);

/**
 * Returns the value object of the `key: { ... }` block in `source`, brace-matched
 * so nested objects (and later blocks) are not captured. `undefined` if absent.
 */
function extractBlock(source: string, key: string): string | undefined {
  const header = new RegExp(`\\n\\t${key}:\\s*\\{\\n`).exec(source);
  if (!header) return undefined;

  let depth = 1;
  let end = header.index + header[0].length;
  while (depth > 0 && end < source.length) {
    const char = source[end++];
    if (char === '{') depth++;
    else if (char === '}') depth--;
  }
  return source.slice(header.index + header[0].length, end - 1);
}

/**
 * Parses the `events` block of the icon source into `eventId → { possibility →
 * emote }`. The `end` possibility maps to a per-outcome object rather than a
 * single emote, so its inner object is stripped before reading the flat
 * `possibility: "emote"` pairs.
 */
function parseEventChoiceIcons(source: string): EventChoiceIcons {
  const value = source.split('} = {')[1] ?? source;
  const block = extractBlock(value, 'events');
  const result = new Map<number, Record<string, string>>();
  if (block === undefined) return result;

  const eventHeader = /(\d+):\s*\{/g;
  let match: RegExpExecArray | null;
  while ((match = eventHeader.exec(block)) !== null) {
    const id = Number(match[1]);
    let depth = 1;
    let end = match.index + match[0].length;
    const bodyStart = end;
    while (depth > 0 && end < block.length) {
      const char = block[end++];
      if (char === '{') depth++;
      else if (char === '}') depth--;
    }

    const body = block.slice(bodyStart, end - 1).replace(/\{[^{}]*\}/g, '');
    const emotes: Record<string, string> = {};
    for (const pair of body.matchAll(/(\w+):\s*"([^"\\]*)"/g)) {
      emotes[pair[1]!] = pair[2]!;
    }
    result.set(id, emotes);

    // Resume scanning past this event's (brace-matched) body.
    eventHeader.lastIndex = end;
  }
  return result;
}

/**
 * Choice emotes for every event, parsed from the game's `CrowniclesIcons.ts`
 * and cached ({@link DATA_TTL_MS}). A failed load throws before caching, so the
 * next call retries.
 */
export function getEventChoiceIcons(): Promise<EventChoiceIcons> {
  return cache.getOrLoad(CACHE_KEY, async () =>
    parseEventChoiceIcons(await fetchCrowniclesText(ICONS_SOURCE_PATH)),
  );
}
