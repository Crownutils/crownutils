import { md } from '@/lib/markdown.js';

export const about = {
  commandDescription: 'Voir diverses informations à propos du bot.',
  title: 'Informations du bot',
  description: {
    version: (botVersion: string): string =>
      `Version actuelle : ${md.bold(botVersion)}`,
    githubUrl: (url: string) =>
      `Le code source du bot est ${md.bold('entièrement')} public, retrouvez le ${md.link('ici', url)}.`,
    license: {
      licenseName: (license: string) => `Licence : ${md.bold(license)}`,
      compatibilityWithCrownicles:
        'La notice de compatbilité avec la licence de Crownicles est disponible sur le dépôt officiel.',
    },
  },
} as const;
