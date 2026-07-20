import type { CommandNode } from '../types.js';

export const crowniclesHelp = {
  description:
    'Parcourez les données de Crownicles (événements et leurs résultats).',
  messages: {
    categoryPlaceholder: 'Choisissez une catégorie',
    loading: 'Chargement des données Crownicles…',
    loadError:
      'Impossible de charger les données Crownicles. Veuillez réessayer plus tard.',
    outcomesTitle: 'Choix et résultats',
    autoOutcome: 'Ne pas répondre',
    labels: {
      xp: 'XP',
      points: 'points',
      money: 'argent',
      health: 'PV',
      energy: 'énergie',
      gems: 'gemmes',
      tokens: 'jetons',
      item: 'Objet',
      pet: 'Familier',
      timeLost: 'perdues',
      travelExcept: 'sauf',
    },
    minutes: (count: number): string => `${count} min`,
    hours: (count: number): string => `${count} h`,
    hoursMinutes: (hours: number, minutes: number): string =>
      `${hours} h ${minutes} min`,

    home: {
      name: 'Accueil',
      description: "Le point d'entrée du centre d'aide",
      title: "Centre d'aide Crownicles",
      welcome:
        'Choisissez une catégorie ci-dessous pour explorer le jeu. Pour le moment, vous pouvez parcourir les événements et les récompenses de leurs choix.',
    },

    events: {
      name: 'Événements',
      description: 'Les événements classés par lieu',
      intro:
        'Choisissez un lieu, puis un événement pour voir où ses choix peuvent mener.',
      noLocations: "Aucun lieu n'a encore d'événement.",
      locationPlaceholder: 'Choisissez un lieu',
      locationsPageIndicator: (current: number, total: number): string =>
        `Page ${current}/${total}`,
      previous: 'Précédent',
      next: 'Suivant',
      selectedLocation: (name: string): string => `Lieu : ${name}`,
      noEvents: "Aucun événement n'est disponible à ce lieu.",
      eventPlaceholder: 'Choisissez un événement',
      backToLocations: 'Retour aux lieux',
      backToEvents: 'Retour aux événements',
    },

    special: {
      name: 'Événements spéciaux',
      description: 'Les événements saisonniers sans lieu fixe',
      intro:
        "Les événements sans lieu (Halloween, Noël, poisson d'avril…). Choisissez-en un pour voir ses résultats.",
      noEvents: "Aucun événement spécial n'est disponible.",
      eventPlaceholder: 'Choisissez un événement',
      backToEvents: 'Retour aux événements',
    },
  },
} as const satisfies CommandNode;
