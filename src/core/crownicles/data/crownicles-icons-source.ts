import { fetchCrowniclesText } from './source.js';

/** Repo path of the Crownicles emote table that the icon loaders parse. */
export const ICONS_SOURCE_PATH = 'Lib/src/CrowniclesIcons.ts';

/** Fetches the raw `CrowniclesIcons.ts` source over the network. */
export function fetchIconsSource(): Promise<string> {
  return fetchCrowniclesText(ICONS_SOURCE_PATH);
}

/**
 * Extracts the `{ key: "emote" }` pairs of the top-level `blockKey` object from
 * the `CrowniclesIcons.ts` source. The leading type declaration is dropped by
 * splitting on the object literal's `} = {`, then `blockKey`'s value object is
 * brace-matched so nested or later blocks are not captured. `keyPattern` is the
 * regex fragment for a pair's key: `\\d+` for numeric item ids, or the default
 * `\\w+` for map-type codes. Returns an empty map if the block is absent.
 */
export function extractIconBlock(
  source: string,
  blockKey: string,
  keyPattern = '\\w+',
): Record<string, string> {
  const valueObject = source.split('} = {')[1] ?? source;

  const header = new RegExp(String.raw`\n\t${blockKey}:\s*\{\n`).exec(
    valueObject,
  );
  if (!header) {
    return {};
  }

  let depth = 1;
  let end = header.index + header[0].length;
  while (depth > 0 && end < valueObject.length) {
    const char = valueObject[end++];
    if (char === '{') depth++;
    else if (char === '}') depth--;
  }

  const block = valueObject.slice(header.index, end);
  const pair = new RegExp(
    String.raw`(${keyPattern}):\s*"((?:[^"\\]|\\.)*)"`,
    'g',
  );
  const entries: Record<string, string> = {};
  for (const match of block.matchAll(pair)) {
    const [, key, emote] = match;
    if (key !== undefined && emote !== undefined) {
      entries[key] = emote;
    }
  }
  return entries;
}
