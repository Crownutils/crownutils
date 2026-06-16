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
        leaguePreview: ({
          leagueIcon,
          leagueName,
          xpBonus,
          moneyBonus,
          xpIcon,
          moneyIcon,
        }: {
          leagueIcon: string;
          leagueName: string;
          xpBonus: number;
          moneyBonus: number;
          xpIcon: string;
          moneyIcon: string;
        }) =>
          `${leagueIcon} **${leagueName}**\n` +
          `• ${xpIcon} Bonus XP : **+${xpBonus}**\n` +
          `• ${moneyIcon} Bonus argent : **+${moneyBonus}**`,
        modal: {
          title: 'Mon classement',
          rankLabel: 'Classement dans la ligue',
          rankPlaceholder: 'Ex : 42',
        },
        invalidRank:
          'Classement invalide. Entre un nombre entier supérieur à 0.',
        modalTimeout:
          'Le formulaire a expiré. Réessaie en cliquant à nouveau sur le bouton.',
        result: ({
          leagueName,
          leagueIcon,
          xpBonus,
          moneyBonus,
          rankBonus,
          xpIcon,
          moneyIcon,
          pointsIcon,
        }: {
          leagueName: string;
          leagueIcon: string;
          xpBonus: number;
          moneyBonus: number;
          rankBonus: number;
          xpIcon: string;
          moneyIcon: string;
          pointsIcon: string;
        }) =>
          `${leagueIcon} **${leagueName}**\n` +
          `• ${xpIcon} Bonus XP : **+${xpBonus}**\n` +
          `• ${moneyIcon} Bonus argent : **+${moneyBonus}**` +
          (rankBonus > 0
            ? `\n• ${pointsIcon} Bonus de classement : **+${rankBonus}**`
            : ''),
      },
    },
  },
} as const satisfies CommandLang;
