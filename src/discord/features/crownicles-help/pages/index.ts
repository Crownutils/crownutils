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
