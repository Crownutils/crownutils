import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import { loadSlashCommands } from '@/discord/handlers/slash-handler.js';
import type { SlashCommand } from '@/discord/types/command.js';
import { loadEvents } from '@/discord/handlers/event-handler.js';
import { slashCommands } from '@/discord/registries/slash-registry.js';
import { logger } from '@/shared/logger.js';
import { loadPrefixCommands } from '@/discord/handlers/prefix-handler.js';
import { prefixCommands } from '@/discord/registries/prefix-registry.js';

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

  public async init(): Promise<void> {
    await this.registerEvents();
    await this.loadCommands();
    await this.loadPrefixCommands();
  }

  private async registerEvents(): Promise<void> {
    const events = await loadEvents();

    for (const event of events) {
      if (event.once) {
        this.discord.once(event.name, (...args) => {
          void event.execute(...args);
        });
      } else {
        this.discord.on(event.name, (...args) => {
          void event.execute(...args);
        });
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

  public async login(token: string): Promise<void> {
    await this.discord.login(token);
  }
}
