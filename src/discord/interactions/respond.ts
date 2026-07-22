import { MessageFlags } from 'discord.js';
import type {
  Message,
  MessageMentionOptions,
  OmitPartialGroupDMChannel,
  RepliableInteraction,
  SendableChannels,
  User,
} from 'discord.js';
import type {
  TopLevelComponent,
  TopLevelComponentBuilder,
} from '@/discord/components/index.js';
import { Container } from '@/discord/components/index.js';

/**
 * Transport-agnostic result a use-case hands back to a command front: what to
 * show and whether it is private. This module alone turns it into a discord.js
 * payload (`IsComponentsV2` flag, reply vs. follow-up).
 */
export interface CommandResponse {
  /** Sugar for a single top-level component; equivalent to `components: [container]`. */
  readonly container?: Container;
  /** An ordered list of top-level components, when the message is more than one. */
  readonly components?: readonly TopLevelComponent[];
  /** Slash only: reply privately. Ignored by the prefix front (messages can't be ephemeral). */
  readonly ephemeral?: boolean;
}

/** Resolves a response's top-level components to discord.js builders (e.g. to `message.edit` yourself). */
export function responseComponents(
  response: CommandResponse,
): TopLevelComponentBuilder[] {
  const items: readonly TopLevelComponent[] =
    response.components ?? (response.container ? [response.container] : []);
  return items.map((component) => component.build());
}

/** Wraps an interactive render's output in a {@link CommandResponse}. */
export function commandResponseFromRender(
  rendered: Container | readonly TopLevelComponent[],
): CommandResponse {
  return rendered instanceof Container
    ? { container: rendered }
    : { components: rendered };
}

/**
 * Deliver a response to a slash or message-component interaction. Errors are
 * **not** swallowed: a failed primary reply is a command failure and must
 * surface to the pipeline's `onUnexpectedError`. Add cross-cutting defaults
 * (e.g. `allowedMentions`) here.
 */
export async function sendResponseToInteraction(
  interaction: RepliableInteraction,
  response: CommandResponse,
): Promise<void> {
  const payload = {
    flags:
      response.ephemeral === true
        ? ([MessageFlags.IsComponentsV2, MessageFlags.Ephemeral] as const)
        : ([MessageFlags.IsComponentsV2] as const),
    components: responseComponents(response),
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
    components: responseComponents(response),
  });
}

/**
 * Deliver a response as a fresh message in `channel` (not a reply), for
 * bot-initiated sends like reminders. `allowedMentions` controls which pings fire.
 */
export async function sendResponseToChannel(
  channel: SendableChannels,
  response: CommandResponse,
  options?: { readonly allowedMentions?: MessageMentionOptions },
): Promise<Message> {
  // Collapse the SendableChannels union's send overloads to one call.
  return (async () =>
    channel.send({
      flags: [MessageFlags.IsComponentsV2] as const,
      components: responseComponents(response),
      ...(options?.allowedMentions
        ? { allowedMentions: options.allowedMentions }
        : {}),
    }))();
}

/**
 * Deliver a response via DM (works for both prefix and slash commands).
 * Never ephemeral since DMs are private.
 * Returns `false` if the DM fails (DMs closed, bot blocked, no shared server, ...)
 */
export async function sendResponseToDM(
  user: User,
  response: CommandResponse,
): Promise<boolean> {
  try {
    await user.send({
      flags: [MessageFlags.IsComponentsV2] as const,
      components: responseComponents(response),
    });

    return true;
  } catch {
    return false;
  }
}
