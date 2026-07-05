import type { SupportedLocale } from '@/core/types.js';
import type { Container } from '../components/index.js';
import type { InteractiveMessage } from '../interactions/index.js';
import { buildLegalContainer } from '../presentations/index.js';
import type { LegalDocument } from './register.js';

/** Toggle-button ids for the standalone `legal` viewer, kept distinct from the register flow's. */
const VIEW_CGU_ID = 'legal-view-cgu';
const VIEW_PRIVACY_ID = 'legal-view-privacy';

/**
 * Interactive controller for the `legal` command: shows the terms or privacy
 * document read-only, with buttons to switch between them. Reuses the register
 * viewer with `isRegistration = false` and its own button ids. Only the invoking
 * user can toggle.
 */
export function createLegalController(
  userId: string,
  language: SupportedLocale,
): InteractiveMessage<LegalDocument> {
  return {
    initialState: 'cgu',
    allowedIds: [userId],

    render(state, { disabled }): Container {
      return buildLegalContainer(language, state, disabled, false, {
        cgu: VIEW_CGU_ID,
        privacy: VIEW_PRIVACY_ID,
      });
    },

    reduce(state, interaction): LegalDocument {
      if (!interaction.isButton()) return state;
      switch (interaction.customId) {
        case VIEW_CGU_ID:
          return 'cgu';
        case VIEW_PRIVACY_ID:
          return 'privacy';
        default:
          return state;
      }
    },
  };
}
