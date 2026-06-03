import { ActivityType, Client, GatewayIntentBits } from 'discord.js';
import { loadSlashCommands } from '@/handlers/command-handler.js';
import type { SlashCommand } from '@/types/command.js';

export class CrownutilsClient {
  private readonly discord: Client;
  public readonly slashCommands = new Map<string, SlashCommand>();

  public constructor() {
    this.discord = new Client({
      intents: [GatewayIntentBits.Guilds],
      presence: {
        status: 'online',
        activities: [
          {
            name: 'Crownutils',
            state: 'Helping players of Crownicles...',
            type: ActivityType.Playing
          }
        ]
      }
    });
  }

  /**
   * Async initialization: loads commands into the registry.
   * Must be awaited before login().
   */
  public async init(): Promise<void> {
    const loaded = await loadSlashCommands();
    for (const [name, command] of loaded) {
      this.slashCommands.set(name, command);
    }
    console.log(`Loaded ${this.slashCommands.size} slash command(s).`);
  }

  /**
   * Connects the bot to Discord.
   */
  public async login(token: string): Promise<void> {
    await this.discord.login(token);
  }
}
