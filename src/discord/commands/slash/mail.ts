import { SlashCommandBuilder } from 'discord.js';
import { createMail } from '@/core/mails/mail-repository.js';
import { buildErrorContainer } from '@/discord/errors.js';
import { lang } from '@/discord/lang/index.js';
import {
  MAIL_BODY_INPUT_ID,
  MAIL_MODAL_ID,
  MAIL_TITLE_INPUT_ID,
  buildMailModal,
  buildMailSentContainer,
} from '@/discord/presentations/mail-presentation.js';
import type { SlashCommand } from '@/discord/types/command.js';

const messages = lang.commands.mail.messages;

/** `/mail`: opens a modal to publish a rich team announcement. Owner-only. */
export const command = {
  data: new SlashCommandBuilder()
    .setName('mail')
    .setDescription(lang.commands.mail.commandDescription),
  requirements: {
    scope: 'main_guild',
    authorization: 'owner',
  },
  help: {
    usageSlash: '/mail',
  },

  async execute(interaction) {
    await interaction.showModal(buildMailModal().build());

    const submit = await interaction
      .awaitModalSubmit({
        filter: (i) =>
          i.customId === MAIL_MODAL_ID && i.user.id === interaction.user.id,
        time: 600_000,
      })
      .catch(() => undefined);
    if (!submit) {
      return; // The modal timed out; nothing to publish.
    }

    const title = submit.fields.getTextInputValue(MAIL_TITLE_INPUT_ID).trim();
    const body = submit.fields.getTextInputValue(MAIL_BODY_INPUT_ID).trim();
    if (body.length === 0) {
      await submit.reply(
        buildErrorContainer(messages.empty).build({ ephemeral: true }),
      );
      return;
    }

    await createMail(
      interaction.user.id,
      title.length > 0 ? title : undefined,
      body,
    );
    await submit.reply(buildMailSentContainer().build({ ephemeral: true }));
  },
} satisfies SlashCommand;
