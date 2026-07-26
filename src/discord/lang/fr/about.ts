import { md } from '@/discord/theme/markdown.js';
import type { CommandNode } from '../types.js';

export const about = {
  description: 'Voir diverses informations à propos du bot.',
  messages: {
    title: 'Informations du bot',
    version: (botVersion: string): string =>
      `Version actuelle : ${md.bold(botVersion)}`,
    sourceCode: `Le code source du bot n'est ${md.bold('pas')} public.`,
    license: {
      licenseName: `Licence : ${md.bold('Tous droits réservés')}`,
      compatibilityWithCrownicles:
        "Crownutils est un programme indépendant, qui n'incorpore aucun code source de Crownicles.",
    },
    presentation: `Crownutils est un bot utilitaire créé par ${md.bold('Ntalcme')} pour faciliter la vie des joueurs de Crownicles. Profitez de fonctionnalités pratiques, tout est pensé pour rendre votre expérience de jeu plus agréable. Le respect de votre vie privée reste une priorité : seules les données indispensables au bon fonctionnement du bot sont conservées.`,
    usefulLinks: {
      title: 'Liens utiles',
      ownerGithubPage: (url: string) => `GitHub de Ntalcme : ${url}`,
      projectGithubPage: (url: string) => `GitHub du projet : ${url}`,
    },
  },
} as const satisfies CommandNode;
