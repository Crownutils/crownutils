import { REST, Routes } from 'discord.js';
import { loadSlashCommands } from '@/handlers/slash-handler.js';
import { slashCommands } from './registries/slash-registry.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const testGuildId = process.env.TEST_GUILD_ID;
const isProduction = process.env.NODE_ENV === 'production';

// In production we deploy globally (no guild needed).
// In development we deploy to the test guild (instant).
if (!token || !clientId) {
  throw new Error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in .env');
}

if (!isProduction && !testGuildId) {
  throw new Error('Missing DISCORD_GUILD_ID for development deployment');
}

await loadSlashCommands();

const rest = new REST().setToken(token);

if (isProduction) {
  const mainGuildId = process.env.MAIN_GUILD_ID;
  if (!mainGuildId) throw new Error('Missing MAIN_GUILD_ID in .env');

  const allCommands = [...slashCommands.values()];

  const guildCommands = allCommands.filter(
    (cmd) => cmd.requirements?.scope === 'main_guild_only',
  );
  const globalCommands = allCommands.filter(
    (cmd) => cmd.requirements?.scope !== 'main_guild_only',
  );

  const guildBody = guildCommands.map((cmd) => cmd.data.toJSON());
  const globalBody = globalCommands.map((cmd) => cmd.data.toJSON());

  const guildData = (await rest.put(
    Routes.applicationGuildCommands(clientId, mainGuildId),
    { body: guildBody },
  )) as unknown[];
  console.log(
    `✅ Deployed ${guildData.length} guild command(s) to main guild.`,
  );

  const globalData = (await rest.put(Routes.applicationCommands(clientId), {
    body: globalBody,
  })) as unknown[];
  console.log(`✅ Deployed ${globalData.length} global command(s).`);
} else {
  const body = [...slashCommands.values()].map((cmd) => cmd.data.toJSON());
  const data = (await rest.put(
    Routes.applicationGuildCommands(clientId, testGuildId!),
    { body },
  )) as unknown[];
  console.log(`✅ Deployed ${data.length} command(s) to test guild.`);
}
