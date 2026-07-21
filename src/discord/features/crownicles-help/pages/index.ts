import { SUPPORTED_LOCALES } from '@/core/types.js';
import type { HelpPage } from '../page.js';
import { homePage, HOME_PAGE_ID } from './home.js';
import { eventsPage } from './events.js';
import { specialEventsPage } from './special-events.js';

/** All help center pages, in category-select order. */
export const HELP_PAGES: readonly HelpPage[] = [
  homePage,
  eventsPage,
  specialEventsPage,
];

/** Pages a user can open directly (every one but the default home page). */
export const DEEP_LINK_PAGES: readonly HelpPage[] = HELP_PAGES.filter(
  (page) => page.id !== HOME_PAGE_ID,
);

/** Finds a page by id, or `undefined` if none matches. */
export function findHelpPage(id: string): HelpPage | undefined {
  return HELP_PAGES.find((page) => page.id === id);
}

/** Resolves `category` to a page, falling back to the home page. */
export function resolveHelpPage(category?: string): HelpPage {
  return (
    (category ? findHelpPage(category) : undefined) ??
    findHelpPage(HOME_PAGE_ID) ??
    HELP_PAGES[0]!
  );
}

/**
 * Resolves a free-form category argument (prefix command) to a page id: matches
 * a page id or one of its localized names, case-insensitively. `undefined` when
 * nothing matches, so the caller falls back to the home page.
 */
export function resolveCategoryArg(arg: string): string | undefined {
  const normalized = arg.trim().toLowerCase();
  if (normalized.length === 0) return undefined;
  for (const page of HELP_PAGES) {
    if (page.id === normalized) return page.id;
    for (const locale of SUPPORTED_LOCALES) {
      if (page.name(locale).toLowerCase() === normalized) return page.id;
    }
  }
  return undefined;
}
