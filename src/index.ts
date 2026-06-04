import { CrownutilsClient } from '@/client/crownutils-client.js';

const client = new CrownutilsClient();
await client.init();

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('Missing DISCORD_TOKEN in environment.');
}

await client.login(token);
