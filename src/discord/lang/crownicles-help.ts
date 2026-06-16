import { md } from '@/discord/markdown.js';
import type { CommandLang } from './types.js';

/** Strings for the Crownicles help center. */
export const crowniclesHelp = {
  commandDescription: "Centre d'aide pour le jeu Crownicles.",
  messages: {
    home: {
      title: "Centre d'aide Crownicles",
      welcome:
        "Bienvenue dans le panel d'aide pour Crownicles, ici vous retrouverez toutes les informations pouvant faciliter votre jeu.",
      navSelectPlaceholder: 'Choisissez une rubrique',
      restricted:
        'Certaines rubriques sont masquées car elles nécessitent des droits supplémentaires.',
    },
  },
  pages: {
    home: {
      name: 'Accueil',
      description: "Page principale du centre d'aide.",
    },
    leagues: {
      name: 'Bonus de ligue',
      description: 'Calcule tes récompenses de fin de saison.',
      messages: {
        selectPlaceholder: 'Choisissez votre ligue',
        calculateButton: 'Calculer mon bonus',
        bonusLabels: {
          xp: 'Bonus XP',
          money: 'Bonus argent',
          rank: 'Bonus de classement',
        },
        bonusLine: ({
          icon,
          label,
          value,
        }: {
          icon: string;
          label: string;
          value: number;
        }) => `${icon} ${label} : ${md.bold(`+${value}`)}`,
        modal: {
          title: 'Mon classement',
          rankLabel: 'Classement dans la ligue',
          rankPlaceholder: 'Ex : 42',
        },
        invalidRank:
          'Classement invalide. Entre un nombre entier supérieur à 0.',
        modalTimeout:
          'Le formulaire a expiré. Réessaie en cliquant à nouveau sur le bouton.',
      },
    },
  },
} as const satisfies CommandLang;
