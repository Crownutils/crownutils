import type { SupportedLocale } from '@/core/types.js';
import { isSupportedLocale } from '@/core/types.js';
import { setUserLanguage } from '@/core/repositories/index.js';
import type { Container } from '../components/index.js';
import type { InteractiveMessage } from '../interactions/index.js';
import { buildLanguageContainer } from '../presentations/index.js';

/**
 * Interactive controller for the `language` command: state is the saved locale;
 * each selection persists it and re-renders the picker in the new language. Only
 * the invoking user can interact with the menu.
 */
export function createLanguageController(
  userId: string,
  current: SupportedLocale,
): InteractiveMessage<SupportedLocale> {
  return {
    initialState: current,
    allowedIds: [userId],
    render(state, { disabled }): Container {
      return buildLanguageContainer(state, disabled);
    },
    async reduce(state, interaction): Promise<SupportedLocale> {
      if (!interaction.isStringSelectMenu()) return state;
      const [selected] = interaction.values;
      if (selected === undefined || !isSupportedLocale(selected)) return state;
      await setUserLanguage(userId, selected);
      return selected;
    },
  };
}
