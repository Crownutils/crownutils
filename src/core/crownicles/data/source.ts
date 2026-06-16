const RAW_BASE =
  'https://raw.githubusercontent.com/Crownicles/Crownicles/master';
const CONTENTS_API =
  'https://api.github.com/repos/Crownicles/Crownicles/contents';

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
    throw new Error(
      `Crownicles fetch failed (${response.status}) for ${path}`,
    );
  }
  return (await response.json()) as T;
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
