import { resolveUserLocale } from '@/discord/context/locale.js';
import { sendResponseToMessage } from '@/discord/interactions/index.js';
import {
  canRunDataCommand,
  runDataCommand,
  runDataCommandGateDenied,
} from '@/discord/usecases/index.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const command = {
  name: 'data',
  requirements: { scope: 'anywhere', authorization: 'normal' },
  gate: (message) => canRunDataCommand(message.author.id),
  async onGateDenied(message) {
    const language = await resolveUserLocale(message.author.id);
    await sendResponseToMessage(
      message,
      await runDataCommandGateDenied(message.author.id, language),
    );
  },
  async execute(message) {
    const language = await resolveUserLocale(message.author.id);
    await sendResponseToMessage(
      message,
      await runDataCommand(message.author.id, language),
    );
  },
} satisfies PrefixCommand;

export default command;
