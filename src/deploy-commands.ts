import { REST, Routes } from 'discord.js';
import { loadSlashCommands } from '@/handlers/command-handler.js';
import { slashCommands } from './registries/slash-registry.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const isProduction = process.env.NODE_ENV === 'production';

// In production we deploy globally (no guild needed).
// In development we deploy to the test guild (instant).
if (!token || !clientId) {
  throw new Error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in .env');
}

if (!isProduction && !guildId) {
  throw new Error('Missing DISCORD_GUILD_ID for development deployment');
}

await loadSlashCommands();
const body = [...slashCommands.values()].map((command) => command.data.toJSON());

const rest = new REST().setToken(token);

// Choose the route based on the environment.
const route = isProduction
  ? Routes.applicationCommands(clientId)
  : Routes.applicationGuildCommands(clientId, guildId!);

const target = isProduction ? 'globally' : `to guild ${guildId}`;
console.log(`Deploying ${body.length} command(s) ${target}...`);

const data = (await rest.put(route, { body })) as unknown[];

console.log(`✅ Successfully deployed ${data.length} command(s).`);
