const RAW_BASE =
  'https://raw.githubusercontent.com/Crownicles/Crownicles/master';
const CONTENTS_API =
  'https://api.github.com/repos/Crownicles/Crownicles/contents';

/** Max concurrent Crownicles fetches; bounds the socket fan-out on a small host. */
export const HTTP_CONCURRENCY = 10;

/**
 * Fetches and parses a JSON file from the public Crownicles repository.
 * `path` is repo-relative, e.g. `Core/resources/events/1.json`.
 *
 * Reads public game data at runtime over the network, as allowed by the
 * project NOTICE; nothing is vendored into this repository.
 */
export async function fetchCrowniclesJson<T>(path: string): Promise<T> {
  const response = await fetch(`${RAW_BASE}/${path}`);
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
  const response = await fetch(`${RAW_BASE}/${path}`);
  if (!response.ok) {
    throw new Error(`Crownicles fetch failed (${response.status}) for ${path}`);
  }
  return response.text();
}

/**
 * Lists the file names in a Crownicles repo directory via the GitHub contents
 * API. Used to discover ids without assuming a contiguous range. One call per
 * directory, meant to be cached by the caller.
 */
export async function listCrowniclesDir(path: string): Promise<string[]> {
  const response = await fetch(`${CONTENTS_API}/${path}`);
  if (!response.ok) {
    throw new Error(
      `Crownicles listing failed (${response.status}) for ${path}`,
    );
  }
  const entries = (await response.json()) as { name: string }[];
  return entries.map((entry) => entry.name);
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
  let next = 0;

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await task(items[index]!, index);
      }
    },
  );

  await Promise.all(workers);
  return results;
}
