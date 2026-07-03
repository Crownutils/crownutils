import { Client, GatewayIntentBits } from 'discord.js';

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
    await this.registerEvents();
    await this.loadSlashCommands();
    await this.loadPrefixCommands();
  }

  private async registerEvents(): Promise<void> {
    // TODO: Register events + log
  }

  private async loadSlashCommands(): Promise<void> {
    // TODO: Load slash commands + log.
  }

  private async loadPrefixCommands(): Promise<void> {
    // TODO: Load prefix commands + log.
  }

  public async login(token: string): Promise<void> {
    await this.client.login(token);
  }
}
