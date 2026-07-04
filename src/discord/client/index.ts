import { Client, GatewayIntentBits } from 'discord.js';
import {
  loadEvents,
  loadPrefixCommands,
  loadSlashCommands,
} from '../handlers/index.js';
import { toError } from '../errors.js';
import { logger } from '@/shared/index.js';

function buildDiscordClient(): Client {
  return new Client({
    intents: [
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
    ],
    presence: {
      status: 'online',
    },
  });
}

/**
 * Wires up the Discord client: registers events, then loads slash and prefix
 * commands into their registries. Call {@link init} before {@link login}.
 */
export class CrownutilsClient {
  private readonly client: Client;

  public constructor() {
    this.client = buildDiscordClient();
  }

  public async init(): Promise<void> {
    await Promise.all([
      this.registerEvents(),
      this.registerSlashCommands(),
      this.registerPrefixCommands(),
    ]);
  }

  private async registerEvents(): Promise<void> {
    const events = await loadEvents();

    for (const event of events) {
      const run = event.execute.bind(event) as (...args: unknown[]) => unknown;
      const eventListener = (...args: unknown[]): void => {
        void (async () => {
          try {
            await run(...args);
          } catch (error) {
            logger.error({ err: toError(error), event: event.name });
          }
        })();
      };

      if (event.once === true) {
        this.client.once(event.name, eventListener);
      } else {
        this.client.on(event.name, eventListener);
      }
    }

    logger.info({ count: events.length }, 'Events registered');
  }

  private async registerSlashCommands(): Promise<void> {
    const commands = await loadSlashCommands();

    for (const command of commands) {
      this.client.registries.slash.set(command.data.name, command);
    }

    logger.info({ slash: commands.length }, 'Slash commands loaded');
  }

  private async registerPrefixCommands(): Promise<void> {
    const commands = await loadPrefixCommands();

    for (const command of commands) {
      this.client.registries.prefix.set(command.name, command);
      for (const alias of command.aliases ?? []) {
        this.client.registries.prefix.set(alias, command);
      }
    }

    logger.info({ prefix: commands.length }, 'Prefix commands loaded');
  }

  public async login(token: string): Promise<void> {
    await this.client.login(token);
  }
}
