import type { Message } from 'discord.js';
import type { CommandAuthorization } from '@/core/permissions/types.js';
import { filterByAuthorization } from '@/core/permissions/index.js';
import { InteractiveMessage } from '@/discord/interactions/collector.js';
import { buildErrorContainer } from '@/discord/errors.js';
import { lang } from '@/discord/lang/index.js';
import type { HelpState } from './page.js';
import { NAV_SELECT_ID } from './nav.js';
import { HELP_PAGES, findHelpPage, resolveHelpPage } from './pages/index.js';
import { HOME_PAGE_ID } from './pages/home.js';

const IDLE_TIME_MS = 120_000;

/**
 * Mounts the Crownicles help center on `message`: a single InteractiveMessage
 * that delegates render/reduce to whichever page `state.pageId` points to,
 * filtered to pages `authorization` may see. Opens on `category` if it names
 * a visible page, otherwise the home page.
 */
export function attachCrowniclesHelp(
  message: Message,
  authorId: string,
  authorization: CommandAuthorization,
  category?: string,
): void {
  const visiblePages = filterByAuthorization(
    HELP_PAGES,
    (page) => page.requiredAuthorization,
    authorization,
  );

  const initialPageId =
    resolveHelpPage(visiblePages, category)?.id ?? HOME_PAGE_ID;

  new InteractiveMessage<HelpState>(
    message,
    { pageId: initialPageId },
    (state, { disabled }) => {
      const page = findHelpPage(visiblePages, state.pageId);
      if (!page) {
        return buildErrorContainer(lang.errors.unexpected);
      }
      return page.render(state, {
        disabled,
        visiblePages,
        totalPageCount: HELP_PAGES.length,
      });
    },
    (interaction, state, reduceCtx) => {
      // Nav select is shared across all pages; intercept here to avoid
      // duplicating the reduce logic in every page.
      if (
        interaction.isStringSelectMenu() &&
        interaction.customId === NAV_SELECT_ID
      ) {
        const pageId = interaction.values[0];
        return pageId !== undefined ? { ...state, pageId } : state;
      }
      const page = findHelpPage(visiblePages, state.pageId);
      if (!page) {
        return state;
      }
      return page.reduce(interaction, state, reduceCtx);
    },
    { idle: IDLE_TIME_MS, allowedIds: [authorId] },
  );
}
