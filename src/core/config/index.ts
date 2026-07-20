import { readFileSync } from 'node:fs';

const isProduction = process.env.NODE_ENV === 'production';

const applicationId = process.env.APPLICATION_ID;

const packageJson = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'),
) as {
  version: string;
  license: string;
};

/**
 * Returns `value` narrowed to non-null, or throws if it is missing or empty.
 * The `== null` guard lets the compiler prove the return is present — no cast.
 */
function required<T>(key: string, value: T): NonNullable<T> {
  if (value == null || (typeof value === 'string' && value.length === 0)) {
    throw new Error(`Missing required config: ${key}`);
  }
  return value;
}

/** App config, resolved and validated once at first import; required keys are present. */
export const config = {
  nodeEnv: isProduction ? 'production' : 'development',
  isProduction,

  botVersion: packageJson.version,
  license: packageJson.license,

  discordToken: required('discordToken', process.env.DISCORD_TOKEN),
  applicationId: required('applicationId', applicationId),
  databaseUrl: required('databaseUrl', process.env.DATABASE_URL),

  mainGuildDiscordId: required(
    'mainGuildDiscordId',
    process.env.MAIN_GUILD_DISCORD_ID,
  ),
  testGuildDiscordId: required(
    'testGuildDiscordId',
    process.env.TEST_GUILD_DISCORD_ID,
  ),
  ownerDiscordId: required('ownerDiscordId', process.env.OWNER_DISCORD_ID),

  githubUrl: 'https://github.com/Crownutils/crownutils',
  projectUrl: 'https://github.com/Crownutils',
  ownerUrl: 'https://github.com/Ntalcme',

  inviteUrl: applicationId
    ? `https://discord.com/oauth2/authorize?client_id=${applicationId}`
    : undefined,

  saltKey: required('saltKey', process.env.SALT_KEY),
} as const;
