import type {
  ChatInputCommandInteraction,
  InteractionReplyOptions,
  Message,
} from 'discord.js';

/** Replies to `interaction` and returns the resulting message, in one step. */
export async function replyAndFetch(
  interaction: ChatInputCommandInteraction,
  payload: InteractionReplyOptions,
): Promise<Message> {
  await interaction.reply(payload);
  return interaction.fetchReply();
}
