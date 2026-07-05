import { REST, Routes } from 'discord.js';
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import { config } from '@/core/config/index.js';
import { loadSlashCommands } from '@/discord/handlers/index.js';
import type { SlashCommand } from '@/discord/registries/index.js';
import { toError } from '@/discord/errors.js';
import { logger } from '@/shared/index.js';

const rest = new REST().setToken(config.discordToken);

function toBody(
  commands: readonly SlashCommand[],
): RESTPostAPIApplicationCommandsJSONBody[] {
  return commands.map((command) => command.data.toJSON());
}

/** Dev deploy: every command goes to the test guild, where updates are instant. */
async function deployToTestGuild(
  commands: readonly SlashCommand[],
): Promise<void> {
  await rest.put(
    Routes.applicationGuildCommands(
      config.applicationId,
      config.testGuildDiscordId,
    ),
    { body: toBody(commands) },
  );
  logger.info(
    { count: commands.length },
    'Deployed all commands to the test guild',
  );
}

/**
 * Production deploy: commands scoped `mainGuildOnly` are registered to the main
 * guild; everything else (`anywhere`/`guild`/`dm`) is registered globally.
 */
async function deployToProduction(
  commands: readonly SlashCommand[],
): Promise<void> {
  const mainGuildCommands = commands.filter(
    (command) => command.requirements.scope === 'mainGuildOnly',
  );
  const globalCommands = commands.filter(
    (command) => command.requirements.scope !== 'mainGuildOnly',
  );

  await rest.put(Routes.applicationCommands(config.applicationId), {
    body: toBody(globalCommands),
  });
  await rest.put(
    Routes.applicationGuildCommands(
      config.applicationId,
      config.mainGuildDiscordId,
    ),
    { body: toBody(mainGuildCommands) },
  );

  logger.info(
    { global: globalCommands.length, mainGuild: mainGuildCommands.length },
    'Deployed commands globally and to the main guild',
  );
}

try {
  const commands = await loadSlashCommands();
  if (config.isProduction) {
    await deployToProduction(commands);
  } else {
    await deployToTestGuild(commands);
  }
} catch (error) {
  logger.error({ err: toError(error) }, 'Failed to deploy slash commands');
  process.exitCode = 1;
}
