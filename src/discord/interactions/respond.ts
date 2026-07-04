import { MessageFlags } from 'discord.js';
import type {
  ChatInputCommandInteraction,
  Message,
  OmitPartialGroupDMChannel,
} from 'discord.js';
import type { Container } from '@/discord/components/index.js';

/**
 * Transport-agnostic result a use-case hands back to a command front: *what* to
 * show and *whether* it is private. Not a discord.js reply payload — turning it
 * into one (the `IsComponentsV2` flag, `container.build()`, reply vs. follow-up)
 * happens here, once, instead of in every command.
 */
export interface CommandResponse {
  readonly container: Container;
  /** Slash only: reply privately. Ignored by the prefix front (messages can't be ephemeral). */
  readonly ephemeral?: boolean;
}

/**
 * Deliver a response to a slash interaction. Errors are **not** swallowed: a
 * failed primary reply is a command failure and must surface to the pipeline's
 * `onUnexpectedError`. Add cross-cutting defaults (e.g. `allowedMentions`) here.
 */
export async function sendResponseToInteraction(
  interaction: ChatInputCommandInteraction,
  response: CommandResponse,
): Promise<void> {
  const payload = {
    flags:
      response.ephemeral === true
        ? ([MessageFlags.IsComponentsV2, MessageFlags.Ephemeral] as const)
        : ([MessageFlags.IsComponentsV2] as const),
    components: [response.container.build()],
  };
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp(payload);
  } else {
    await interaction.reply(payload);
  }
}

/** Deliver a response to a prefix message (never ephemeral). */
export async function sendResponseToMessage(
  message: Message,
  response: CommandResponse,
): Promise<OmitPartialGroupDMChannel<Message<boolean>>> {
  return await message.reply({
    flags: [MessageFlags.IsComponentsV2] as const,
    components: [response.container.build()],
  });
}
