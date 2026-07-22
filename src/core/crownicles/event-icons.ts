import { cacheShared } from './cache.js';
import { extractIconBlock, fetchCrowniclesText } from './source.js';

/** Per-event map of possibility key → its choice emote (the reaction icon). */
export type EventChoiceIcons = ReadonlyMap<number, Record<string, string>>;

const ICONS_SOURCE_PATH = 'Lib/src/CrowniclesIcons.ts';

/**
 * Parses the `events` block of the icon source into `eventId → { possibility →
 * emote }`. The `end` possibility maps to a per-outcome object rather than a
 * single emote, so its inner object is stripped before reading the flat
 * `possibility: "emote"` pairs.
 */
function parseEventChoiceIcons(source: string): EventChoiceIcons {
  const block = extractIconBlock(source, 'events');
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

/** Choice emotes for every event, parsed from `CrowniclesIcons.ts` and cached (see {@link cacheShared}). */
export const getEventChoiceIcons = cacheShared(async () =>
  parseEventChoiceIcons(await fetchCrowniclesText(ICONS_SOURCE_PATH)),
);
