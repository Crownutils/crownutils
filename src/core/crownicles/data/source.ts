const RAW_BASE =
  'https://raw.githubusercontent.com/Crownicles/Crownicles/master';
const CONTENTS_API =
  'https://api.github.com/repos/Crownicles/Crownicles/contents';

/** Max concurrent fetches when loading a whole category/directory (~100 files). */
export const HTTP_CONCURRENCY = 10;

/** Parses `<id>.json` file names into a sorted list of numeric ids. */
export function numericIds(fileNames: readonly string[]): number[] {
  return fileNames
    .map((file) => parseInt(file, 10))
    .filter((id) => Number.isInteger(id))
    .sort((a, b) => a - b);
}

/**
 * Fetches and parses a JSON file from the public Crownicles repository.
 * `path` is repo-relative, e.g. `Core/resources/weapons/0.json`.
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
 * Fetches a file from the public Crownicles repository as raw text, for
 * sources that are not JSON (e.g. the `CrowniclesIcons.ts` emote table).
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
 * API. Used to discover the item ids of a category without assuming a
 * contiguous range. One call per directory, meant to be cached by the caller.
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

/**
 * Maps `items` through async `task` with at most `concurrency` in-flight at a
 * time, preserving input order. Bounds the socket fan-out when loading a whole
 * item category (~100 files) on a small server.
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

/**
 * Memoizes the promise returned by `load`: the result is cached for the process
 * lifetime and concurrent callers share the in-flight promise, but a *rejected*
 * load is evicted so the next call retries.
 */
export function cachedPromise<T>(load: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | undefined;
  return () =>
    (promise ??= load().catch((error: unknown) => {
      promise = undefined;
      throw error;
    }));
}
