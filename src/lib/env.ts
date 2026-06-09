const NODE_ENV = process.env.NODE_ENV ?? 'development';

export const env = {
  nodeEnv: NODE_ENV,
  isProduction: NODE_ENV === 'production',
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

export function requireEnv(key: RequirableEnvKey): string {
  const value = env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${ENV_VAR_NAMES[key]}`,
    );
  }
  return value;
}
