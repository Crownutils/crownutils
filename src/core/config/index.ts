import { readFileSync } from 'node:fs';

const NODE_ENV = process.env.NODE_ENV ?? 'development';

const packageJson = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'),
) as { version: string; license: string };

/** Runtime configuration sourced from environment variables and `package.json`. */
export const env = {
  nodeEnv: NODE_ENV,
  isProduction: NODE_ENV === 'production',
  botVersion: packageJson.version,
  license: packageJson.license,
  discordToken: process.env.DISCORD_TOKEN,
  discordClientId: process.env.DISCORD_CLIENT_ID,
  testGuildId: process.env.TEST_GUILD_ID,
  mainGuildId: process.env.MAIN_GUILD_ID,
  ownerId: process.env.OWNER_ID,
  privilegedIds: (process.env.PRIVILEGED_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL ?? 'file:./dev.db',
  githubUrl: 'https://github.com/Crownutils/crownutils',
  projectUrl: 'https://github.com/Crownutils',
  ownerUrl: 'https://github.com/Ntalcme',
  inviteUrl:
    'https://discord.com/oauth2/authorize?client_id=1485135115683368970',
} as const;

type RequirableEnvKey =
  | 'discordToken'
  | 'discordClientId'
  | 'testGuildId'
  | 'mainGuildId'
  | 'ownerId';

const ENV_VAR_NAMES: Record<RequirableEnvKey, string> = {
  discordToken: 'DISCORD_TOKEN',
  discordClientId: 'DISCORD_CLIENT_ID',
  testGuildId: 'TEST_GUILD_ID',
  mainGuildId: 'MAIN_GUILD_ID',
  ownerId: 'OWNER_ID',
};

/**
 * Returns `env[key]`, throwing if it's unset. Use for variables required at
 * startup (Discord credentials, guild/owner ids).
 */
export function requireEnv(key: RequirableEnvKey): string {
  const value = env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${ENV_VAR_NAMES[key]}`,
    );
  }
  return value;
}
