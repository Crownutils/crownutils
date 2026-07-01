/** A lazily-loaded in-memory cache for one value that a writer keeps in sync. */
export interface MemoCell<T> {
  /** Returns the cached value, loading it via `load` on the first miss. */
  get(load: () => Promise<T>): Promise<T>;
  /** Overwrites the cached value (write-through, so no reload is needed). */
  set(value: T): void;
  /** Drops the cached value so the next `get` reloads it. */
  clear(): void;
}

/**
 * Creates a {@link MemoCell}. A boxed slot is used so falsy loaded values
 * (`false`, `0`, `[]`) are cached correctly, distinguished from "not loaded".
 */
export function memoCell<T>(): MemoCell<T> {
  let slot: { value: T } | undefined;
  return {
    async get(load) {
      slot ??= { value: await load() };
      return slot.value;
    },
    set(value) {
      slot = { value };
    },
    clear() {
      slot = undefined;
    },
  };
}
