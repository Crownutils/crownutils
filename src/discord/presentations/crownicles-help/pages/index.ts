import type { HelpPage } from '../page.js';
import { homePage, HOME_PAGE_ID } from './home.js';
import { leaguesPage } from './leagues.js';
import { itemsPage } from './items.js';
import { ragePage } from './rage.js';

/** All help center pages, in menu order. */
export const HELP_PAGES: readonly HelpPage[] = [
  homePage,
  leaguesPage,
  itemsPage,
  ragePage,
];

/** Finds a page by id among `pages`. */
export function findHelpPage(
  pages: readonly HelpPage[],
  id: string,
): HelpPage | undefined {
  return pages.find((page) => page.id === id);
}

/**
 * Resolves the page to open: `category` if it names a page in `pages`,
 * otherwise the home page.
 */
export function resolveHelpPage(
  pages: readonly HelpPage[],
  category?: string,
): HelpPage | undefined {
  const requested = category ? findHelpPage(pages, category) : undefined;
  return requested ?? findHelpPage(pages, HOME_PAGE_ID);
}
