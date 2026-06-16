import type { HelpPage } from '../page.js';
import { homePage, HOME_PAGE_ID } from './home.js';

/** All help center pages, in menu order. Register new pages here. */
export const HELP_PAGES: readonly HelpPage[] = [homePage];

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
