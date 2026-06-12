import { icons } from '@/discord/icons.js';
import { md } from '@/discord/markdown.js';
import type { CommandLang } from './types.js';

/** Strings for the `/about` command. */
export const about = {
  commandDescription: 'Voir diverses informations à propos du bot.',
  messages: {
    title: `${icons.info} Informations du bot`,
    version: (botVersion: string): string =>
      `Version actuelle : ${md.bold(botVersion)}`,
    githubUrl: (url: string) =>
      `Le code source du bot est ${md.bold('entièrement')} public, retrouvez le sur le ${md.link('dépôt officiel', url)}.`,
    license: {
      licenseName: (license: string) => `Licence : ${md.bold(license)}`,
      compatibilityWithCrownicles:
        'La notice de compatibilité avec la licence de Crownicles est disponible sur le dépôt officiel.',
    },
    presentation: `Crownutils est un bot utilitaire open source créé par ${md.bold('Ntalcme')} pour faciliter la vie des joueurs de Crownicles. Profitez de fonctionnalités pratiques, tout est pensé pour rendre votre expérience de jeu plus agréable. Le respect de votre vie privée reste une priorité : seules les données indispensables au bon fonctionnement du bot sont conservées.`,
    usefulLinks: {
      title: 'Liens utiles',
      ownerGithubPage: (url: string) => `GitHub de Ntalcme : ${url}`,
      projectGithubPage: (url: string) => `GitHub du projet : ${url}`,
    },
  },
} as const satisfies CommandLang;
