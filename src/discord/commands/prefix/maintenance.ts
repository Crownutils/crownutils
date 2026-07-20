import { buildErrorContainer } from '@/discord/utils/errors.js';
import { sendResponseToMessage } from '@/discord/interactions/index.js';
import { lang } from '@/discord/lang/index.js';
import { resolveUserLocale } from '@/discord/context/locale.js';
import { runMaintenanceCommand } from '@/discord/features/maintenance/maintenance.service.js';
import type { PrefixCommand } from '@/discord/registries/index.js';

const ENABLE_ARGS: ReadonlySet<string> = new Set(['on', 'enable', 'true']);
const DISABLE_ARGS: ReadonlySet<string> = new Set(['off', 'disable', 'false']);

/** Parse the on/off argument; `undefined` when it is missing or unrecognized. */
function parseEnabled(arg: string | undefined): boolean | undefined {
  if (arg === undefined) return undefined;
  const normalized = arg.toLowerCase();
  if (ENABLE_ARGS.has(normalized)) return true;
  if (DISABLE_ARGS.has(normalized)) return false;
  return undefined;
}

const command = {
  name: 'maintenance',
  requirements: { scope: 'anywhere', authorization: 'owner' },
  async execute(message, args) {
    const language = await resolveUserLocale(message.author.id);
    const enabled = parseEnabled(args[0]);

    if (enabled === undefined) {
      await sendResponseToMessage(message, {
        container: buildErrorContainer(
          lang[language].commandMaintenance.messages.usage,
        ),
      });
      return;
    }

    await sendResponseToMessage(
      message,
      await runMaintenanceCommand(enabled, language),
    );
  },
} satisfies PrefixCommand;

export default command;
