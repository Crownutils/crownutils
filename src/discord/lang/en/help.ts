import type { CommandNode } from '../types.js';

export const help = {
  description: 'Lists the commands you can use.',
  messages: {
    title: 'Commands',
    intro: 'Every command works as a slash command (/) or with the c! prefix.',
    categories: {
      general: 'General',
      crownicles: 'Crownicles',
      reminders: 'Reminders',
      privacy: 'Privacy',
      moderation: 'Moderation',
    },
    selectPlaceholder: 'Choose a command for details',
    backButton: 'Back',
    detail: {
      aliasesLabel: 'Aliases',
      scopeLabel: 'Where',
      scopes: {
        anywhere: 'Anywhere',
        guild: 'In servers',
        dm: 'In DMs',
        mainGuildOnly: 'Main server only',
      },
      rankLabel: 'Required rank',
      ranks: {
        privileged: 'Privileged',
        owner: 'Owner',
      },
      optionsLabel: 'Options',
    },
  },
} as const satisfies CommandNode;
