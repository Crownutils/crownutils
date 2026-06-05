import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import { loadSlashCommands } from '@/handlers/slash-handler.js';
import type { SlashCommand } from '@/types/command.js';
import { loadEvents } from '@/handlers/event-handler.js';
import { slashCommands } from '@/registries/slash-registry.js';
import { logger } from '@/lib/logger.js';
import { loadPrefixCommands } from '@/handlers/prefix-handler.js';
import { prefixCommands } from '@/registries/prefix-registry.js';

export class CrownutilsClient {
  private readonly discord: Client;
  public readonly slashCommands = new Map<string, SlashCommand>();

  public constructor() {
    this.discord = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
      presence: {
        status: 'online',
        activities: [
          {
            name: 'Crownutils',
            state: 'Helping players of Crownicles...',
            type: ActivityType.Playing,
          },
        ],
      },
    });
  }

  /**
   * Async initialization: loads commands into the registry.
   * Must be awaited before login().
   */
  public async init(): Promise<void> {
    await this.registerEvents();
    await this.loadCommands();
    await this.loadPrefixCommands();
  }

  /** Loads event files and binds each one onto the discord client. */
  private async registerEvents(): Promise<void> {
    const events = await loadEvents();

    for (const event of events) {
      if (event.once) {
        this.discord.once(event.name, (...args) => event.execute(...args));
      } else {
        this.discord.on(event.name, (...args) => event.execute(...args));
      }
    }

    logger.info(`Registered ${events.length} event(s).`);
  }

  private async loadCommands(): Promise<void> {
    await loadSlashCommands();
    logger.info(`Loaded ${slashCommands.size} slash command(s).`);
  }

  private async loadPrefixCommands(): Promise<void> {
    await loadPrefixCommands();
    logger.info(`Loaded ${prefixCommands.size} prefix command(s).`);
  }

  /**
   * Connects the bot to Discord.
   */
  public async login(token: string): Promise<void> {
    await this.discord.login(token);
  }
}
