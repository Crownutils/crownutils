import {
  Button,
  ButtonActionRow,
  type Container,
  Text,
} from '@/discord/components/index.js';

/** Total pages needed to show `length` items `pageSize` at a time (at least one). */
export function countPages(length: number, pageSize: number): number {
  return Math.max(1, Math.ceil(length / pageSize));
}

/** Clamps `page` into `[0, count - 1]`. */
export function clampPage(page: number, count: number): number {
  return Math.min(Math.max(page, 0), count - 1);
}

/** The clamped current page and its slice of `items`. */
export function paginate<T>(
  items: readonly T[],
  requestedPage: number | undefined,
  pageSize: number,
): { page: number; pageCount: number; slice: readonly T[] } {
  const pageCount = countPages(items.length, pageSize);
  const page = clampPage(requestedPage ?? 0, pageCount);
  return {
    page,
    pageCount,
    slice: items.slice(page * pageSize, (page + 1) * pageSize),
  };
}

/** Adds the `Page x/y` indicator and prev/next buttons when several pages exist. */
export function appendPaginationControls(
  container: Container,
  options: {
    readonly page: number;
    readonly pageCount: number;
    readonly prevId: string;
    readonly nextId: string;
    readonly indicator: (current: number, total: number) => string;
    readonly previousLabel: string;
    readonly nextLabel: string;
    readonly disabled: boolean;
  },
): void {
  if (options.pageCount <= 1) return;
  container.add(
    new Text(options.indicator(options.page + 1, options.pageCount)).size(
      'subtle',
    ),
  );
  const previous = new Button(options.prevId)
    .color('secondary')
    .label(options.previousLabel);
  const next = new Button(options.nextId)
    .color('secondary')
    .label(options.nextLabel);
  if (options.disabled || options.page <= 0) previous.disabled();
  if (options.disabled || options.page >= options.pageCount - 1) {
    next.disabled();
  }
  container.add(new ButtonActionRow().add(previous, next));
}
