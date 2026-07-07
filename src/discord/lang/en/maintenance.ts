import { md } from '@/discord/theme/markdown.js';
import type { CommandNode } from '../types.js';

export const maintenance = {
  description: 'Enable or disable maintenance mode (owner only).',
  messages: {
    stateOption: 'Whether to enable maintenance mode.',
    enabled:
      'Maintenance mode is now enabled. Only the owner can use the bot until it is disabled.',
    disabled:
      'Maintenance mode is now disabled. The bot is available to everyone again.',
    usage: `Usage: ${md.code('maintenance on')} or ${md.code('maintenance off')}.`,
  },
} satisfies CommandNode;
