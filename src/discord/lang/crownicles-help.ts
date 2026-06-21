import { md } from '@/discord/markdown.js';
import type { CommandLang } from './types.js';

/**
 * Formats a game time-advance value (stored in minutes) as a readable French
 * duration: `45 min`, `2 h`, or `1 h 10`.
 */
function formatGameDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins}`;
}

/** Strings for the Crownicles help center. */
export const crowniclesHelp = {
  commandDescription: "Centre d'aide pour le jeu Crownicles.",
  options: {
    category: 'La rubrique à ouvrir directement (facultatif).',
  },
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
              return `Avance le temps de ${formatGameDuration(power)}${perDay ? ' chaque jour' : ''}`;
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
    pathfinder: {
      name: 'Itinéraire',
      description: 'Trouvez le chemin le plus court entre deux lieux.',
      messages: {
        intro: 'Trouvez le chemin le plus court entre deux lieux du continent.',
        loading: 'Chargement de la carte…',
        loadError:
          'Impossible de charger la carte. Veuillez réessayer plus tard.',
        typePlaceholder: 'Choisissez un type de lieu',
        locationPlaceholder: 'Choisissez un lieu',
        chooseDepartureType: 'Choisissez le type de votre lieu de départ.',
        chooseDestinationType: 'Choisissez le type de votre destination.',
        restart: 'Recommencer',
        departure: ({ name }: { name: string }) => `Départ : ${md.bold(name)}`,
        route: ({ steps }: { steps: readonly string[] }) => steps.join(' → '),
        routeTotal: ({ minutes }: { minutes: number }) =>
          `Durée totale : ${md.bold(formatGameDuration(minutes))}`,
        noRoute: 'Aucun itinéraire trouvé entre ces deux lieux.',
        dailyLimitReached:
          "Vous avez déjà calculé un itinéraire aujourd'hui. Revenez demain pour en calculer un nouveau.",
        // Liste des types présents sur le continent (faits, codés en dur car
        // affichés AVANT le chargement de la carte).
        types: [
          { code: 'vi', label: 'Village' },
          { code: 'ci', label: 'Ville' },
          { code: 'ro', label: 'Route' },
          { code: 'fo', label: 'Forêt' },
          { code: 'pl', label: 'Plaine' },
          { code: 'be', label: 'Plage' },
          { code: 'ri', label: 'Rivière' },
          { code: 'la', label: 'Lac' },
          { code: 'mo', label: 'Montagne' },
          { code: 'de', label: 'Désert' },
        ],
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
    events: {
      name: 'Événements',
      description: 'Bientôt disponible.',
      messages: {
        comingSoon: 'Cette rubrique sera disponible prochainement.',
      },
    },
    witch: {
      name: 'Sorcière',
      description: 'Bientôt disponible.',
      messages: {
        comingSoon: 'Cette rubrique sera disponible prochainement.',
      },
    },
    pets: {
      name: 'Familiers',
      description: 'Bientôt disponible.',
      messages: {
        comingSoon: 'Cette rubrique sera disponible prochainement.',
      },
    },
  },
} as const satisfies CommandLang;
