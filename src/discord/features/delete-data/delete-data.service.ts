import {
  eraseUserData,
  hasErasableUserData,
  type GdprErasureSummary,
} from '@/core/repositories/index.js';
import type { SupportedLocale } from '@/core/types.js';
import type {
  CommandResponse,
  InteractiveMessage,
} from '@/discord/interactions/index.js';
import { reminderScheduler } from '@/discord/features/reminder/reminder.scheduler.js';
import {
  buildDeleteDataCancelledContainer,
  buildDeleteDataConfirmContainer,
  buildDeleteDataDoneContainer,
  buildDeleteDataEmptyContainer,
  DELETE_DATA_CANCEL_ID,
  DELETE_DATA_CONFIRM_ID,
} from './delete-data.ui.js';

/** `undefined` while awaiting confirmation, then the erasure result or a cancellation. */
interface DeleteDataState {
  readonly outcome?: GdprErasureSummary | 'cancelled';
}

/**
 * Either a plain "nothing to erase" response, or a confirmation controller the
 * front mounts. Split so the front can reply directly instead of mounting a
 * collector when there is nothing to delete.
 */
export type PrepareDeleteDataResult =
  | { readonly kind: 'empty'; readonly response: CommandResponse }
  | {
      readonly kind: 'confirm';
      readonly controller: InteractiveMessage<DeleteDataState>;
    };

/** Confirmation flow: the confirm button erases the data and shows what happened. */
function createDeleteDataController(
  userId: string,
  locale: SupportedLocale,
): InteractiveMessage<DeleteDataState> {
  return {
    initialState: {},
    allowedIds: [userId],

    render(state, { disabled }) {
      if (state.outcome === 'cancelled') {
        return buildDeleteDataCancelledContainer(locale);
      }
      if (state.outcome !== undefined) {
        return buildDeleteDataDoneContainer(locale);
      }
      return buildDeleteDataConfirmContainer(locale, { disabled });
    },

    async reduce(state, interaction, context) {
      if (!interaction.isButton()) return state;

      if (interaction.customId === DELETE_DATA_CANCEL_ID) {
        context.stop();
        return { outcome: 'cancelled' };
      }
      if (interaction.customId === DELETE_DATA_CONFIRM_ID) {
        const summary = await eraseUserData(userId);
        if (summary.deletedReminders > 0) reminderScheduler.notifyChanged();
        context.stop();
        return { outcome: summary };
      }
      return state;
    },
  };
}

/**
 * Prepares the `delete-data` command: a short notice when there is nothing to
 * erase, otherwise a confirmation controller the front mounts (privately).
 */
export async function prepareDeleteData(
  userId: string,
  locale: SupportedLocale,
): Promise<PrepareDeleteDataResult> {
  if (!(await hasErasableUserData(userId))) {
    return {
      kind: 'empty',
      response: {
        container: buildDeleteDataEmptyContainer(locale),
        ephemeral: true,
      },
    };
  }
  return {
    kind: 'confirm',
    controller: createDeleteDataController(userId, locale),
  };
}
