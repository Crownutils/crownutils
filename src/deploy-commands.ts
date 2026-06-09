import { REST, Routes } from 'discord.js';
import { loadSlashCommands } from '@/handlers/slash-handler.js';
import { slashCommands } from '@/registries/slash-registry.js';
import { env, requireEnv } from '@/lib/env.js';
import { logger } from '@/lib/logger.js';

const token = requireEnv('discordToken');
const clientId = requireEnv('discordClientId');

if (!env.isProduction && !env.testGuildId) {
  throw new Error('Missing TEST_GUILD_ID for development deployment');
}

await loadSlashCommands();

const rest = new REST().setToken(token);

if (env.isProduction) {
  const mainGuildId = requireEnv('mainGuildId');

  const allCommands = [...slashCommands.values()];

  const guildCommands = allCommands.filter(
    (cmd) => cmd.requirements?.scope === 'main_guild',
  );
  const globalCommands = allCommands.filter(
    (cmd) => cmd.requirements?.scope !== 'main_guild',
  );

  const guildBody = guildCommands.map((cmd) => cmd.data.toJSON());
  const globalBody = globalCommands.map((cmd) => cmd.data.toJSON());

  const guildData = (await rest.put(
    Routes.applicationGuildCommands(clientId, mainGuildId),
    { body: guildBody },
  )) as unknown[];
  logger.info(`Deployed ${guildData.length} guild command(s) to main guild.`);

  const globalData = (await rest.put(Routes.applicationCommands(clientId), {
    body: globalBody,
  })) as unknown[];
  logger.info(`Deployed ${globalData.length} global command(s).`);
} else {
  const testGuildId = requireEnv('testGuildId');
  const body = [...slashCommands.values()].map((cmd) => cmd.data.toJSON());
  const data = (await rest.put(
    Routes.applicationGuildCommands(clientId, testGuildId),
    { body },
  )) as unknown[];
  logger.info(`Deployed ${data.length} command(s) to test guild.`);
}
