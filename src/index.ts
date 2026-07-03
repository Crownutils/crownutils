import { config } from '@/core/config/index.js';
import { CrownutilsClient } from '@/discord/client/index.js';

const client = new CrownutilsClient();
await client.init();
await client.login(config.discordToken);
