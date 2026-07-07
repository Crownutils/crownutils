import type { SupportedLocale } from '@/core/types.js';
import { isSupportedLocale } from '@/core/types.js';
import {
  canUserRegister,
  getLegalAcceptance,
  hasAcceptedLegal,
  registerUser,
} from '@/core/repositories/index.js';
import type { Container } from '../components/index.js';
import type {
  CommandResponse,
  InteractiveMessage,
} from '../interactions/index.js';
import {
  buildLanguageContainer,
  buildLegalContainer,
  buildRegisterAlreadyContainer,
  buildRegisterCancelledContainer,
  buildRegisterCannotRegisterContainer,
  buildRegisterDoneContainer,
  LEGAL_ACCEPT_ID,
  LEGAL_DECLINE_ID,
  LEGAL_VIEW_CGU_ID,
  LEGAL_VIEW_PRIVACY_ID,
} from '../presentations/index.js';
import { isOwner } from '@/core/permissions/user.js';

/**
 * Whether `userId` may go through the registration flow, i.e. hasn't accepted
 * yet. Uses {@link hasAcceptedLegal}'s cache, so returning users hit no DB
 * round-trip; {@link runRegisterGateDenied} fetches the full record only when
 * the gate actually denies.
 */
export async function canRegister(userId: string): Promise<boolean> {
  return !(await hasAcceptedLegal(userId));
}

/** Response shown when `userId` runs `register` again after already accepting. */
export async function runRegisterGateDenied(
  userId: string,
  language: SupportedLocale,
): Promise<CommandResponse> {
  const acceptance = await getLegalAcceptance(userId);
  return {
    container: buildRegisterAlreadyContainer(
      language,
      acceptance!.acceptedVersion,
      acceptance!.acceptedAt,
    ),
  };
}

/** Which legal document the viewer is currently showing. */
export type LegalDocument = 'cgu' | 'privacy';

/** Steps of the registration flow: pick a language, read the legal docs, then a terminal screen. */
export type RegisterState =
  | { step: 'language' }
  | { step: 'cannotRegister'; language: SupportedLocale }
  | { step: 'legal'; language: SupportedLocale; document: LegalDocument }
  | { step: 'accepted'; language: SupportedLocale }
  | { step: 'declined' };

/**
 * Interactive controller for the `register` command: the user picks a language,
 * browses the legal documents, then either accepts - which creates the account
 * and stores their language - or declines. Only the invoking user can interact.
 */
export function createRegisterController(
  userId: string,
  initialLanguage: SupportedLocale,
): InteractiveMessage<RegisterState> {
  return {
    initialState: { step: 'language' },
    allowedIds: [userId],

    render(state, { disabled }): Container {
      switch (state.step) {
        case 'language':
          return buildLanguageContainer(initialLanguage, disabled);
        case 'legal':
          return buildLegalContainer(state.language, state.document, disabled);
        case 'accepted':
          return buildRegisterDoneContainer(state.language);
        case 'declined':
          return buildRegisterCancelledContainer(initialLanguage);
        case 'cannotRegister':
          return buildRegisterCannotRegisterContainer(state.language);
      }
    },

    async reduce(state, interaction, context): Promise<RegisterState> {
      if (state.step === 'language' && interaction.isStringSelectMenu()) {
        const [selected] = interaction.values;
        if (selected === undefined || !isSupportedLocale(selected))
          return state;
        if (isOwner(interaction.user.id)) {
          await registerUser(userId, selected);
          return { step: 'accepted', language: selected };
        }

        if (!(await canUserRegister(interaction.user.id))) {
          return { step: 'cannotRegister', language: selected };
        }
        return { step: 'legal', language: selected, document: 'cgu' };
      }

      if (state.step === 'legal' && interaction.isButton()) {
        switch (interaction.customId) {
          case LEGAL_VIEW_CGU_ID:
            return { ...state, document: 'cgu' };
          case LEGAL_VIEW_PRIVACY_ID:
            return { ...state, document: 'privacy' };
          case LEGAL_ACCEPT_ID:
            await registerUser(userId, state.language);
            context.stop();
            return { step: 'accepted', language: state.language };
          case LEGAL_DECLINE_ID:
            context.stop();
            return { step: 'declined' };
        }
      }

      return state;
    },
  };
}
