const RAW_BASE =
  'https://raw.githubusercontent.com/Crownicles/Crownicles/master';
const CONTENTS_API =
  'https://api.github.com/repos/Crownicles/Crownicles/contents';

/** Max concurrent Crownicles fetches; bounds the socket fan-out on a small host. */
export const HTTP_CONCURRENCY = 10;

/** GitHub's REST API requires a User-Agent; sent on every request for good measure. */
const USER_AGENT = 'crownutils-bot (+https://github.com/Crownutils/crownutils)';
/** Per-request ceiling so a slow/hung fetch fails fast instead of stalling a data load. */
const REQUEST_TIMEOUT_MS = 10_000;

/** `fetch` with a User-Agent and a hard timeout; `accept` sets the GitHub API media type. */
async function crowniclesFetch(
  url: string,
  accept?: string,
): Promise<Response> {
  const headers: Record<string, string> = { 'User-Agent': USER_AGENT };
  if (accept !== undefined) headers.Accept = accept;
  return fetch(url, {
    headers,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

/**
 * Fetches and parses a JSON file from the public Crownicles repository.
 * `path` is repo-relative, e.g. `Core/resources/events/1.json`.
 *
 * Reads public game data at runtime over the network, as allowed by the
 * project NOTICE; nothing is vendored into this repository.
 */
export async function fetchCrowniclesJson<T>(path: string): Promise<T> {
  const response = await crowniclesFetch(`${RAW_BASE}/${path}`);
  if (!response.ok) {
    throw new Error(`Crownicles fetch failed (${response.status}) for ${path}`);
  }
  return (await response.json()) as T;
}

/**
 * Fetches a Crownicles repo file as raw text, for sources that are not JSON
 * (e.g. the `CrowniclesIcons.ts` emote table).
 */
export async function fetchCrowniclesText(path: string): Promise<string> {
  const response = await crowniclesFetch(`${RAW_BASE}/${path}`);
  if (!response.ok) {
    throw new Error(`Crownicles fetch failed (${response.status}) for ${path}`);
  }
  return response.text();
}

/**
 * Lists the file names in a Crownicles repo directory via the GitHub contents
 * API. Used to discover ids without assuming a contiguous range. One call per
 * directory, meant to be cached by the caller (the API is rate-limited to 60
 * requests/hour unauthenticated).
 */
export async function listCrowniclesDir(path: string): Promise<string[]> {
  const response = await crowniclesFetch(
    `${CONTENTS_API}/${path}`,
    'application/vnd.github+json',
  );
  if (!response.ok) {
    throw new Error(
      `Crownicles listing failed (${response.status}) for ${path}`,
    );
  }
  const entries = (await response.json()) as { name: string }[];
  return entries.map((entry) => entry.name);
}

/**
 * Extracts the `key: { ... }` value object from a `CrowniclesIcons.ts` source
 * (after its `} = {` type/value split), brace-matched so nested objects and
 * later blocks are not captured. `undefined` when the block is absent.
 */
export function extractIconBlock(
  source: string,
  key: string,
): string | undefined {
  const value = source.split('} = {')[1] ?? source;
  const header = new RegExp(`\\n\\t${key}:\\s*\\{\\n`).exec(value);
  if (!header) return undefined;

  let depth = 1;
  let end = header.index + header[0].length;
  while (depth > 0 && end < value.length) {
    const char = value[end++];
    if (char === '{') depth++;
    else if (char === '}') depth--;
  }
  return value.slice(header.index + header[0].length, end - 1);
}

/**
 * Parses a flat `<id>: "<emote>"` icon block of the icon source into an
 * id -> emote record; empty when the block is absent.
 */
export function parseIconIdBlock(
  source: string,
  key: string,
): Record<string, string> {
  const block = extractIconBlock(source, key);
  const icons: Record<string, string> = {};
  if (block === undefined) return icons;
  for (const [, id, emote] of block.matchAll(/(\d+):\s*"([^"\\]*)"/g)) {
    if (id !== undefined && emote !== undefined) icons[id] = emote;
  }
  return icons;
}

/** Parses `<id>.json` file names into a sorted, de-duplicated list of numeric ids. */
export function numericIds(fileNames: readonly string[]): number[] {
  const ids = new Set<number>();
  for (const file of fileNames) {
    const id = parseInt(file, 10);
    if (Number.isInteger(id)) ids.add(id);
  }
  return [...ids].sort((a, b) => a - b);
}

/**
 * Maps `items` through async `task` with at most `concurrency` in-flight at a
 * time, preserving input order. Bounds the socket fan-out when loading a whole
 * resource directory (~90 files) on a small server.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  task: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  // One iterator shared by every worker, so each entry is claimed exactly once.
  const entries = items.entries();

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      for (const [index, item] of entries) {
        results[index] = await task(item, index);
      }
    },
  );

  await Promise.all(workers);
  return results;
}
