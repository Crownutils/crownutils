import { REST, Routes } from 'discord.js';
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import { config } from '@/core/config/index.js';
import { loadSlashCommands } from '@/discord/handlers/index.js';
import type { SlashCommand } from '@/discord/registries/index.js';
import { toError } from '@/discord/utils/errors.js';
import { logger } from '@/shared/index.js';

const rest = new REST().setToken(config.discordToken);

/** The three command scopes a deploy or clear can target. */
const SCOPE_ROUTES = {
  global: () => Routes.applicationCommands(config.applicationId),
  main: () =>
    Routes.applicationGuildCommands(
      config.applicationId,
      config.mainGuildDiscordId,
    ),
  test: () =>
    Routes.applicationGuildCommands(
      config.applicationId,
      config.testGuildDiscordId,
    ),
} as const;

type Scope = keyof typeof SCOPE_ROUTES;

/** Scopes that reach the production bot, since dev and prod share one application id. */
const PRODUCTION_SCOPES: readonly Scope[] = ['global', 'main'];

function toBody(
  commands: readonly SlashCommand[],
): RESTPostAPIApplicationCommandsJSONBody[] {
  return commands.map((command) => command.data.toJSON());
}

/** Dev deploy: every command goes to the test guild, where updates are instant. */
async function deployToTestGuild(
  commands: readonly SlashCommand[],
): Promise<void> {
  await rest.put(SCOPE_ROUTES.test(), { body: toBody(commands) });
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

  await rest.put(SCOPE_ROUTES.global(), { body: toBody(globalCommands) });
  await rest.put(SCOPE_ROUTES.main(), { body: toBody(mainGuildCommands) });

  logger.info(
    { global: globalCommands.length, mainGuild: mainGuildCommands.length },
    'Deployed commands globally and to the main guild',
  );
}

async function deploy(): Promise<void> {
  const commands = await loadSlashCommands();
  if (config.isProduction) {
    await deployToProduction(commands);
  } else {
    await deployToTestGuild(commands);
  }
}

/**
 * Empties a scope's command set (`PUT []`). Removing stale registrations that a
 * plain deploy can't reach: a deploy only prunes the scope it writes, so ghost
 * commands left in another scope (e.g. globals from a previous version) survive
 * until cleared here.
 */
async function clearScope(scope: Scope): Promise<void> {
  await rest.put(SCOPE_ROUTES[scope](), { body: [] });
  logger.info({ scope }, 'Cleared all commands for scope');
}

/** Clears `target`, or all three scopes when `target` is `all`. */
async function clear(target: Scope | 'all'): Promise<void> {
  const scopes: readonly Scope[] =
    target === 'all' ? ['global', 'main', 'test'] : [target];

  if (scopes.some((scope) => PRODUCTION_SCOPES.includes(scope))) {
    logger.warn(
      'Clearing a global/main scope affects the PRODUCTION bot (dev and prod share the application id)',
    );
  }
  for (const scope of scopes) {
    await clearScope(scope);
  }
}

function isClearTarget(value: string | undefined): value is Scope | 'all' {
  return (
    value === 'global' ||
    value === 'main' ||
    value === 'test' ||
    value === 'all'
  );
}

const [action, target] = process.argv.slice(2);

try {
  if (action === 'clear') {
    if (!isClearTarget(target)) {
      logger.error('Usage: deploy-commands clear <global|main|test|all>');
      process.exitCode = 1;
    } else {
      await clear(target);
    }
  } else {
    await deploy();
  }
} catch (error) {
  logger.error({ err: toError(error) }, 'Slash command deploy/clear failed');
  process.exitCode = 1;
}
