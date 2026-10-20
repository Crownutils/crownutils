import { md } from '@/discord/theme/markdown.js';
import type { CommandNode } from '../types.js';

export const about = {
  description: 'Shows informations about the bot.',
  messages: {
    title: "Bot's informations",
    archived: `${md.bold('Archived')} project: the bot will not evolve any further and will get no new feature.`,
    version: (botVersion: string): string =>
      `Current version : ${md.bold(botVersion)}`,
    sourceCode: `The bot's source code is ${md.bold('public')}.`,
    license: {
      licenseName: `License: ${md.bold('MIT')}`,
      compatibilityWithCrownicles: (url: string): string =>
        `Crownutils is an independent program, incorporating no Crownicles source code. The ${md.link('compatibility notice', url)} stays public.`,
    },
    presentation: `Crownutils is a utility bot created by ${md.bold('Ntalcme')} to make life easier for Crownicles players. Enjoy a range of handy features everything has been designed to make your gaming experience more enjoyable. Respect for your privacy remains a priority: only data essential to the bot's proper functioning is retained.`,
    usefulLinks: {
      title: 'Useful links',
      ownerGithubPage: (url: string) => `Ntalcme's GitHub : ${url}`,
      projectGithubPage: (url: string) => `Project's GitHub : ${url}`,
    },
  },
} as const satisfies CommandNode;
