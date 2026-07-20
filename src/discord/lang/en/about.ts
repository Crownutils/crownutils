import { icons } from '@/discord/theme/icons.js';
import { md } from '@/discord/theme/markdown.js';
import type { CommandNode } from '../types.js';

export const about = {
  description: 'Shows informations about the bot.',
  messages: {
    title: `${icons.info} Bot's informations`,
    version: (botVersion: string): string =>
      `Current version : ${md.bold(botVersion)}`,
    githubUrl: (url: string) =>
      `Bot's source code is ${md.bold('entirely')} public, find it on the ${md.link('official repository', url)}.`,
    license: {
      licenseName: (license: string) => `License : ${md.bold(license)}`,
      compatibilityWithCrownicles:
        "The compatibilty notice witb Crownicle's license is available on the official repository.",
    },
    presentation: `Crownutils is an open-source utility bot created by ${md.bold('Ntalcme')} to make life easier for Crownicles players. Enjoy a range of handy features everything has been designed to make your gaming experience more enjoyable. Respect for your privacy remains a priority: only data essential to the bot's proper functioning is retained.`,
    usefulLinks: {
      title: 'Useful links',
      ownerGithubPage: (url: string) => `Ntalcme's GitHub : ${url}`,
      projectGithubPage: (url: string) => `Project's GitHub : ${url}`,
    },
  },
} as const satisfies CommandNode;
