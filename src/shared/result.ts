/**
 * Discriminated result for **expected** failures: the type forces the caller to
 * handle the error branch. Reserve exceptions for unexpected (bug) conditions.
 */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** Success `Result`; the `never` error type lets it fit any `Result<T, E>`. */
export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

/** Failure `Result`; the `never` value type lets it fit any `Result<T, E>`. */
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
