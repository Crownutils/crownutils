import type { Message } from 'discord.js';
import { deleteUserData } from '@/core/legal/data-rights.js';
import {
  ActionRow,
  Button,
  Container,
  Text,
  Title,
} from '@/discord/components/index.js';
import { InteractiveMessage } from '@/discord/interactions/collector.js';
import { lang } from '@/discord/lang/index.js';

const CONFIRM_WINDOW_MS = 120_000;

const CONFIRM_BUTTON_ID = 'delete-data-confirm';
const CANCEL_BUTTON_ID = 'delete-data-cancel';

const m = lang.commands.deleteData.messages;

/** Outcome of the `/delete-data` confirmation flow. */
type DeleteResult = 'pending' | 'deleted' | 'nothing' | 'cancelled';

function renderDelete(result: DeleteResult, disabled: boolean): Container {
  switch (result) {
    case 'deleted':
      return new Container().color('success').add(new Text(m.success));
    case 'nothing':
      return new Container().color('info').add(new Text(m.nothing));
    case 'cancelled':
      return new Container().color('cancelled').add(new Text(m.cancelled));
    case 'pending': {
      const confirm = new Button(CONFIRM_BUTTON_ID)
        .label(m.confirmButton)
        .color('danger');
      const cancel = new Button(CANCEL_BUTTON_ID)
        .label(m.cancelButton)
        .color('secondary');
      if (disabled) {
        confirm.disabled();
        cancel.disabled();
      }
      return new Container()
        .color('warning')
        .add(
          new Title(m.title),
          new Text(m.confirmPrompt),
          new ActionRow(confirm, cancel),
        );
    }
  }
}

/** Builds the initial `/delete-data` confirmation prompt. */
export function buildDeleteConfirmContainer(): Container {
  return renderDelete('pending', false);
}

/**
 * Drives the `/delete-data` confirmation: confirming erases the user's data and
 * reports whether anything was removed; cancelling leaves the data untouched.
 * Restricted to `userId`.
 */
export function attachDeleteDataConfirm(
  message: Message,
  userId: string,
): void {
  new InteractiveMessage<DeleteResult>(
    message,
    'pending',
    (result, { disabled }) => renderDelete(result, disabled),
    async (interaction, result, { stop }) => {
      if (!interaction.isButton()) return result;
      if (interaction.customId === CANCEL_BUTTON_ID) {
        stop();
        return 'cancelled';
      }
      if (interaction.customId === CONFIRM_BUTTON_ID) {
        const summary = await deleteUserData(userId);
        stop();
        return summary.hadData ? 'deleted' : 'nothing';
      }
      return result;
    },
    { time: CONFIRM_WINDOW_MS, allowedIds: [userId] },
  );
}
