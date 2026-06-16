import type { CommandAuthorization } from '@/core/permissions/types.js';
import { filterByAuthorization } from '@/core/permissions/index.js';
import type { Container } from '@/discord/components/index.js';
import { buildErrorContainer } from '@/discord/errors.js';
import { lang } from '@/discord/lang/index.js';
import { HELP_PAGES, resolveHelpPage } from './pages/index.js';

/**
 * Builds the initial `/crownicles-help` container. `category` opens that page
 * directly if it's visible to `userAuthorization`, otherwise the home page.
 */
export function buildCrowniclesHelpContainer(
  userAuthorization: CommandAuthorization,
  category?: string,
): Container {
  const visiblePages = filterByAuthorization(
    HELP_PAGES,
    (page) => page.requiredAuthorization,
    userAuthorization,
  );

  const page = resolveHelpPage(visiblePages, category);
  if (!page) {
    return buildErrorContainer(lang.errors.unexpected);
  }

  return page.render(
    { pageId: page.id },
    { disabled: false, visiblePages, totalPageCount: HELP_PAGES.length },
  );
}
