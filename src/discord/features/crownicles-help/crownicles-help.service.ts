import { MessageFlags } from 'discord.js';
import type { SupportedLocale } from '@/core/types.js';
import type { TopLevelComponent } from '@/discord/components/index.js';
import {
  type InteractiveMessage,
  safeDiscord,
} from '@/discord/interactions/index.js';
import {
  buildCategorySelectRow,
  CATEGORY_SELECT_ID,
} from './crownicles-help.ui.js';
import { loadCrowniclesHelpData } from './data.js';
import type { HelpRenderContext, HelpState } from './page.js';
import { findHelpPage, HELP_PAGES, resolveHelpPage } from './pages/index.js';

/** Base state after switching category: page reset, help data carried over. */
function pageEntryState(pageId: string, data: HelpState['data']): HelpState {
  return {
    pageId,
    data,
    dataError: false,
    locationsPage: 0,
    selectedLocationId: undefined,
    selectedEventId: undefined,
  };
}

/**
 * Builds the `/crownicles-help` controller: one self-updating message whose
 * render and reduce delegate to the active page, while the router owns the
 * shared category select (rendered below every page) and the one-time network
 * load a data-backed page needs on first entry.
 *
 * Opening straight into `category` pre-loads its data here (there is no
 * interaction yet to drive the usual loading view), so the front should defer
 * the reply for a data-backed category.
 */
export async function createCrowniclesHelpController(
  userId: string,
  locale: SupportedLocale,
  category?: string,
): Promise<InteractiveMessage<HelpState>> {
  const renderContext = (disabled: boolean): HelpRenderContext => ({
    locale,
    pages: HELP_PAGES,
    disabled,
  });

  const renderTopLevel = (
    state: HelpState,
    context: HelpRenderContext,
  ): TopLevelComponent[] => {
    const page = findHelpPage(state.pageId) ?? resolveHelpPage();
    return [
      page.render(state, context),
      buildCategorySelectRow(page.id, context),
    ];
  };

  const payload = (state: HelpState) => ({
    flags: MessageFlags.IsComponentsV2 as const,
    components: renderTopLevel(state, renderContext(false)).map((component) =>
      component.build(),
    ),
  });

  /** Enters a data-backed page: show a loading view, fetch, then swap in the data. */
  const loadPage = async (
    base: HelpState,
    interaction: Parameters<InteractiveMessage<HelpState>['reduce']>[1],
    markHandled: () => void,
  ): Promise<HelpState> => {
    if (!interaction.isMessageComponent()) return base;
    await safeDiscord(
      interaction.update(payload({ ...base, data: undefined })),
      {
        action: 'crowniclesHelp.loading',
      },
    );
    markHandled();
    try {
      const data = await loadCrowniclesHelpData(locale);
      const loaded = { ...base, data };
      await safeDiscord(interaction.message.edit(payload(loaded)), {
        action: 'crowniclesHelp.loaded',
      });
      return loaded;
    } catch {
      const errored: HelpState = { ...base, data: undefined, dataError: true };
      await safeDiscord(interaction.message.edit(payload(errored)), {
        action: 'crowniclesHelp.loadError',
      });
      return errored;
    }
  };

  /** Initial state for a data-backed landing page: pre-load, or flag the error. */
  const loadInitialState = async (pageId: string): Promise<HelpState> => {
    try {
      return pageEntryState(pageId, await loadCrowniclesHelpData(locale));
    } catch {
      return { ...pageEntryState(pageId, undefined), dataError: true };
    }
  };

  const initialPage = resolveHelpPage(category);
  const initialState: HelpState = initialPage.requiresData
    ? await loadInitialState(initialPage.id)
    : { pageId: initialPage.id };

  return {
    initialState,
    allowedIds: [userId],

    render(state, { disabled }) {
      return renderTopLevel(state, renderContext(disabled));
    },

    async reduce(state, interaction, context) {
      if (
        interaction.isStringSelectMenu() &&
        interaction.customId === CATEGORY_SELECT_ID
      ) {
        const target = interaction.values[0];
        const page = target ? findHelpPage(target) : undefined;
        if (!page) return state;

        const base = pageEntryState(page.id, state.data);
        if (!page.requiresData || state.data) return base;
        return loadPage(base, interaction, () => {
          context.markHandled();
        });
      }

      const page = findHelpPage(state.pageId);
      return page ? page.reduce(state, interaction) : state;
    },
  };
}
