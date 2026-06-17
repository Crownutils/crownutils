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
    items: {
      name: 'Équipements',
      description: 'Parcourez les équipements du jeu et leurs statistiques.',
      messages: {
        intro:
          'Choisissez une catégorie, puis une rareté, pour parcourir les équipements.',
        selection: ({
          category,
          rarity,
        }: {
          category: string;
          rarity?: string;
        }) =>
          rarity !== undefined
            ? `Sélection : ${category} | ${rarity}`
            : `Sélection : ${category}`,
        categoryPlaceholder: 'Choisissez une catégorie',
        rarityPlaceholder: 'Choisissez une rareté',
        loading: 'Chargement des équipements…',
        chooseRarity: 'Choisissez une rareté pour afficher les équipements.',
        empty: 'Aucun équipement pour cette rareté.',
        loadError:
          'Impossible de charger les équipements. Veuillez réessayer plus tard.',
        previous: 'Précédent',
        next: 'Suivant',
        categoryLabels: {
          weapons: 'Armes',
          armors: 'Armures',
          objects: 'Objets',
          potions: 'Potions',
        },
        rarityLabels: [
          'Basique',
          'Commun',
          'Peu commun',
          'Exotique',
          'Rare',
          'Spécial',
          'Épique',
          'Légendaire',
          'Mythique',
        ],
        pageIndicator: ({
          current,
          total,
        }: {
          current: number;
          total: number;
        }) => `Page ${current}/${total}`,
        itemLine: ({
          icon,
          name,
          stats,
        }: {
          icon: string;
          name: string;
          stats: string;
        }) => `${icon} ${md.bold(name)} | ${stats}`,
        statValue: ({ icon, value }: { icon: string; value: number }) =>
          `${icon} ${value}`,
        natureEffect: ({
          category,
          nature,
          power,
        }: {
          category: 'objects' | 'potions';
          nature: number;
          power: number;
        }) => {
          const perDay = category === 'objects';
          switch (nature) {
            case 1:
              return `Vie +${power}${perDay ? ' par jour' : ''}`;
            case 2:
              return `Vitesse +${power}${perDay ? ' en combat' : ' au prochain combat'}`;
            case 3:
              return `Attaque +${power}${perDay ? ' en combat' : ' au prochain combat'}`;
            case 4:
              return `Défense +${power}${perDay ? ' en combat' : ' au prochain combat'}`;
            case 5:
              return `Avance le temps de ${power}${perDay ? ' chaque jour' : ''}`;
            case 6:
              return `Argent +${power}${perDay ? ' par jour' : ''}`;
            case 7:
              return `Énergie +${power}${perDay ? ' par jour' : ''}`;
            default:
              return 'Aucun effet';
          }
        },
      },
    },
    leagues: {
      name: 'Bonus de ligue',
      description: 'Calculez vos récompenses de fin de saison.',
      messages: {
        intro:
          'Sélectionnez votre ligue pour estimer vos récompenses de fin de saison.',
        selectPlaceholder: 'Choisissez votre ligue',
        calculateButton: 'Calculer mon bonus',
        selectedLeague: ({ icon, name }: { icon: string; name: string }) =>
          `${icon} ${md.bold(name)}`,
        bonusLabels: {
          xp: 'Bonus XP',
          money: 'Bonus argent',
          rank: 'Bonus de points',
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
          'Classement invalide. Entrez un nombre entier supérieur à 0.',
        modalTimeout:
          'Le formulaire a expiré. Réessayez en cliquant à nouveau sur le bouton.',
      },
    },
    rage: {
      name: 'Rage',
      description: 'Bientôt disponible.',
      messages: {
        comingSoon: 'Cette rubrique sera disponible prochainement.',
      },
    },
  },
} as const satisfies CommandLang;
