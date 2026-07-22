import type { CommandNode } from '../types.js';

export const crowniclesHelp = {
  description:
    'Parcourez les données de Crownicles (événements et leurs résultats).',
  messages: {
    categoryOption: 'Ouvrir directement une catégorie',
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

    materials: {
      name: 'Matériaux',
      description: "Les matériaux d'artisanat classés par type",
      intro:
        "Choisissez un type, puis un matériau pour voir sa rareté et comment l'obtenir.",
      typePlaceholder: 'Choisissez un type',
      materialPlaceholder: 'Choisissez un matériau',
      types: {
        metal: 'Métal',
        alloy: 'Alliage',
        nature: 'Nature',
        spiritual: 'Spirituel',
        magic: 'Magie',
        leather: 'Cuir',
        rope: 'Corde',
        poison: 'Poison',
        explosive: 'Explosif',
        wood: 'Bois',
      },
      selectedType: (name: string): string => `Type : ${name}`,
      noMaterials: 'Aucun matériau dans ce type.',
      previous: 'Précédent',
      next: 'Suivant',
      pageIndicator: (current: number, total: number): string =>
        `Page ${current}/${total}`,
      backToTypes: 'Retour aux types',
      backToMaterials: 'Retour aux matériaux',
      rarityLabel: 'Rareté',
      typeLabel: 'Type',
      obtainLabel: "Comment l'obtenir",
      terrains: {
        forest: 'Forêt',
        mountain: 'Montagne',
        desert: 'Désert',
        swamp: 'Marais',
        ruins: 'Ruines',
        cave: 'Grotte',
        plains: 'Plaines',
        coast: 'Côte',
      },
      sourceSmallEvent: 'Mini événement',
      sourceExpeditions: 'Expéditions',
      sourceBosses: 'Boss PVE',
      sourceCompost: 'Compost',
      sourceCooking: 'Cuisine',
      cookingRecipe: (level: number, quantity: number): string =>
        `(niveau ${level}, donne ×${quantity})`,
    },

    equipment: {
      name: 'Équipements',
      description: 'Les armes, armures, potions et objets du jeu',
      intro:
        'Choisissez une catégorie, une rareté, puis un item pour voir ses statistiques.',
      categoryPlaceholder: 'Choisissez une catégorie',
      rarityPlaceholder: 'Choisissez une rareté',
      itemPlaceholder: 'Choisissez un item',
      categories: {
        weapons: 'Armes',
        armors: 'Armures',
        potions: 'Potions',
        objects: 'Objets',
      },
      selectedCategory: (name: string): string => `Catégorie : ${name}`,
      selectedRarity: (name: string): string => `Rareté : ${name}`,
      itemCount: (count: number): string =>
        count === 1 ? '1 item' : `${count} items`,
      noItems: 'Aucun item de cette rareté.',
      previous: 'Précédent',
      next: 'Suivant',
      pageIndicator: (current: number, total: number): string =>
        `Page ${current}/${total}`,
      backToCategories: 'Retour aux catégories',
      backToRarities: 'Retour aux raretés',
      backToItems: 'Retour aux items',
      backToDetail: "Retour à l'item",
      rarityLabel: 'Rareté',
      valueLabel: 'Valeur de vente',
      usagesLabel: 'Consommations',
      upgradesButton: 'Amélioration',
      upgradesTitle: 'Amélioration',
      levelLabel: (level: number): string => `Niveau ${level}`,
    },
  },
} as const satisfies CommandNode;
