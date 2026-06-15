import type { Message } from 'discord.js';
import type { CommandAuthorization } from '@/core/permissions/types.js';
import { filterByAuthorization } from '@/core/permissions/index.js';
import { InteractiveMessage } from '@/discord/interactions/collector.js';
import { buildErrorContainer } from '@/discord/errors.js';
import { lang } from '@/discord/lang/index.js';
import type { HelpPage, HelpState } from './page.js';
import { HELP_PAGES } from './pages/index.js';
import { HOME_PAGE_ID } from './pages/home.js';

const IDLE_TIME_MS = 120_000;

function findPage(
  pages: readonly HelpPage[],
  id: string,
): HelpPage | undefined {
  return pages.find((page) => page.id === id);
}

/**
 * Mounts the Crownicles help center on `message`: a single InteractiveMessage
 * that delegates render/reduce to whichever page `state.pageId` points to,
 * filtered to pages `authorization` may see.
 */
export function attachCrowniclesHelp(
  message: Message,
  authorId: string,
  authorization: CommandAuthorization,
): void {
  const visiblePages = filterByAuthorization(
    HELP_PAGES,
    (page) => page.requiredAuthorization,
    authorization,
  );

  new InteractiveMessage<HelpState>(
    message,
    { pageId: HOME_PAGE_ID },
    (state, ctx) => {
      const page = findPage(visiblePages, state.pageId);
      if (!page) {
        return buildErrorContainer(lang.errors.unexpected);
      }
      return page.render(state, ctx);
    },
    (interaction, state, reduceCtx) => {
      const page = findPage(visiblePages, state.pageId);
      if (!page) {
        return state;
      }
      return page.reduce(interaction, state, reduceCtx);
    },
    { idle: IDLE_TIME_MS, allowedIds: [authorId] },
  );
}
