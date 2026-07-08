import { resolveUserLocale } from '@/discord/context/locale.js';
import {
  mountInteractiveMessage,
  sendResponseToMessage,
} from '@/discord/interactions/index.js';
import { isOwner } from '@/core/permissions/index.js';
import {
  createDataLookupController,
  runDataCommand,
  runDataCommandViaDM,
  runDataLookupCommandViaDM,
} from '@/discord/features/data/data.service.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const MENTION_PATTERN = /^<@!?(\d+)>$/;

/** Parses a raw Discord id or a `<@id>`/`<@!id>` mention; `undefined` if neither. */
function parseTargetId(arg: string | undefined): string | undefined {
  if (arg === undefined) return undefined;
  const mention = MENTION_PATTERN.exec(arg)?.[1];
  if (mention) return mention;
  return /^\d+$/.test(arg) ? arg : undefined;
}

const command = {
  name: 'data',
  requirements: { scope: 'anywhere', authorization: 'normal' },
  async execute(message, args) {
    const language = await resolveUserLocale(message.author.id);

    if (isOwner(message.author.id)) {
      const targetId = parseTargetId(args[0]);

      if (targetId !== undefined && targetId !== message.author.id) {
        await sendResponseToMessage(
          message,
          await runDataLookupCommandViaDM(targetId, language, message.author),
        );
        return;
      }

      if (args.length === 0 && message.channel.isSendable()) {
        await mountInteractiveMessage(
          message.channel,
          createDataLookupController(message.author.id, language),
        );
        return;
      }
    }

    // Already in DM: reply there directly, no need to relay through another DM.
    const response = message.inGuild()
      ? await runDataCommandViaDM(message.author.id, language, message.author)
      : await runDataCommand(message.author.id, language, false);

    await sendResponseToMessage(message, response);
  },
} satisfies PrefixCommand;

export default command;
