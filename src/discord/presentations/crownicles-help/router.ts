import type { Message } from 'discord.js';
import type { CommandAuthorization } from '@/core/permissions/types.js';
import { filterByAuthorization } from '@/core/permissions/index.js';
import { InteractiveMessage } from '@/discord/interactions/collector.js';
import type { Container } from '@/discord/components/index.js';
import { buildErrorContainer } from '@/discord/errors.js';
import { lang } from '@/discord/lang/index.js';
import type { HelpPage, HelpRenderContext, HelpState } from './page.js';
import { NAV_SELECT_ID } from './nav.js';
import { HELP_PAGES, findHelpPage, resolveHelpPage } from './pages/index.js';
import { HOME_PAGE_ID } from './pages/home.js';

const IDLE_TIME_MS = 120_000;

/** Pages `authorization` is allowed to see, in menu order. */
function visiblePagesFor(
  authorization: CommandAuthorization,
): readonly HelpPage[] {
  return filterByAuthorization(
    HELP_PAGES,
    (page) => page.requiredAuthorization,
    authorization,
  );
}

/** Builds the render context shared by every page render. */
function renderContext(
  visiblePages: readonly HelpPage[],
  disabled: boolean,
): HelpRenderContext {
  return { disabled, visiblePages, totalPageCount: HELP_PAGES.length };
}

/** Renders the page `state.pageId` points to, or an error container. */
function renderHelp(
  state: HelpState,
  visiblePages: readonly HelpPage[],
  disabled: boolean,
): Container {
  const page = findHelpPage(visiblePages, state.pageId);
  if (!page) {
    return buildErrorContainer(lang.errors.unexpected);
  }
  return page.render(state, renderContext(visiblePages, disabled));
}

/**
 * Builds the initial `/crownicles-help` container, sent in the first reply
 * before {@link attachCrowniclesHelp} mounts the collector. `category` opens
 * that page directly if it's visible to `authorization`, otherwise the home
 * page.
 */
export function buildCrowniclesHelpContainer(
  authorization: CommandAuthorization,
  category?: string,
): Container {
  const visiblePages = visiblePagesFor(authorization);
  const page = resolveHelpPage(visiblePages, category);
  if (!page) {
    return buildErrorContainer(lang.errors.unexpected);
  }
  return page.render({ pageId: page.id }, renderContext(visiblePages, false));
}

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
  const visiblePages = visiblePagesFor(authorization);
  const initialPageId =
    resolveHelpPage(visiblePages, category)?.id ?? HOME_PAGE_ID;

  new InteractiveMessage<HelpState>(
    message,
    { pageId: initialPageId },
    (state, { disabled }) => renderHelp(state, visiblePages, disabled),
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
      return page.reduce(
        interaction,
        state,
        reduceCtx,
        renderContext(visiblePages, false),
      );
    },
    { idle: IDLE_TIME_MS, allowedIds: [authorId] },
  );
}
