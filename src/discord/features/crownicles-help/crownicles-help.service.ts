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
import type { HelpPage, HelpRenderContext, HelpState } from './page.js';
import { findHelpPage, HELP_PAGES, resolveHelpPage } from './pages/index.js';

/** Base state after switching category: page reset, every page's loaded data carried over. */
function pageEntryState(
  pageId: string,
  carried: Pick<HelpState, 'data' | 'materialsData'>,
): HelpState {
  return {
    pageId,
    data: carried.data,
    materialsData: carried.materialsData,
    loadError: false,
    locationsPage: 0,
    selectedLocationId: undefined,
    selectedEventId: undefined,
    selectedType: undefined,
    selectedMaterialId: undefined,
    materialsPage: 0,
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
    page: HelpPage,
    base: HelpState,
    interaction: Parameters<InteractiveMessage<HelpState>['reduce']>[1],
    markHandled: () => void,
  ): Promise<HelpState> => {
    if (page.loadData === undefined || !interaction.isMessageComponent()) {
      return base;
    }
    await safeDiscord(interaction.update(payload(base)), {
      action: 'crowniclesHelp.loading',
    });
    markHandled();
    try {
      const loaded = { ...base, ...(await page.loadData(locale)) };
      await safeDiscord(interaction.message.edit(payload(loaded)), {
        action: 'crowniclesHelp.loaded',
      });
      return loaded;
    } catch {
      const errored: HelpState = { ...base, loadError: true };
      await safeDiscord(interaction.message.edit(payload(errored)), {
        action: 'crowniclesHelp.loadError',
      });
      return errored;
    }
  };

  /** Initial state when opening straight into `page`: pre-load its data, or flag the error. */
  const loadInitialState = async (page: HelpPage): Promise<HelpState> => {
    const base = pageEntryState(page.id, {});
    if (page.loadData === undefined) return base;
    try {
      return { ...base, ...(await page.loadData(locale)) };
    } catch {
      return { ...base, loadError: true };
    }
  };

  const initialPage = resolveHelpPage(category);
  const initialState: HelpState = await loadInitialState(initialPage);

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

        const base = pageEntryState(page.id, state);
        if (page.loadData === undefined || (page.hasData?.(state) ?? false)) {
          return base;
        }
        return loadPage(page, base, interaction, () => {
          context.markHandled();
        });
      }

      const page = findHelpPage(state.pageId);
      return page ? page.reduce(state, interaction) : state;
    },
  };
}
