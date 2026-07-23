import type { CommandNode } from '../types.js';

export const crowniclesHelp = {
  description: 'Browse Crownicles game data (events and their outcomes).',
  messages: {
    categoryOption: 'Open a category directly',
    categoryPlaceholder: 'Choose a category',
    loading: 'Loading Crownicles data…',
    loadError: 'Could not load Crownicles data. Please try again later.',
    outcomesTitle: 'Choices and outcomes',
    autoOutcome: 'No answer',
    comingSoon: 'Coming soon!',
    labels: {
      xp: 'XP',
      points: 'points',
      money: 'money',
      health: 'HP',
      energy: 'energy',
      gems: 'gems',
      tokens: 'tokens',
      item: 'Item',
      pet: 'Pet',
      timeLost: 'lost',
      travelExcept: 'except',
    },
    minutes: (count: number): string => `${count} min`,
    hours: (count: number): string => `${count} h`,
    hoursMinutes: (hours: number, minutes: number): string =>
      `${hours} h ${minutes} min`,

    home: {
      name: 'Home',
      description: 'The help center entry point',
      title: 'Crownicles help center',
      welcome:
        'Pick a category below to explore the game data: events and their outcomes, equipment and its upgrades, and more.',
    },

    events: {
      name: 'Events',
      description: 'Events browsable by location',
      intro:
        'Pick a location, then an event to see what its choices can lead to.',
      noLocations: 'No location has any event yet.',
      locationPlaceholder: 'Choose a location',
      locationsPageIndicator: (current: number, total: number): string =>
        `Page ${current}/${total}`,
      previous: 'Previous',
      next: 'Next',
      selectedLocation: (name: string): string => `Location: ${name}`,
      noEvents: 'No event is available at this location.',
      eventPlaceholder: 'Choose an event',
      backToLocations: 'Back to locations',
      backToEvents: 'Back to events',
    },

    special: {
      name: 'Special events',
      description: 'Seasonal events with no fixed location',
      intro:
        'Location-less events (Halloween, Christmas, April Fools…). Pick one to see its outcomes.',
      noEvents: 'No special event is available.',
      eventPlaceholder: 'Choose an event',
      backToEvents: 'Back to events',
    },

    materials: {
      name: 'Materials',
      description: 'Crafting materials browsable by type',
      intro:
        'Pick a type, then a material to see its rarity and how to get it.',
      typePlaceholder: 'Choose a type',
      materialPlaceholder: 'Choose a material',
      types: {
        metal: 'Metal',
        alloy: 'Alloy',
        nature: 'Nature',
        spiritual: 'Spiritual',
        magic: 'Magic',
        leather: 'Leather',
        rope: 'Rope',
        poison: 'Poison',
        explosive: 'Explosive',
        wood: 'Wood',
      },
      selectedType: (name: string): string => `Type: ${name}`,
      noMaterials: 'No material in this type.',
      previous: 'Previous',
      next: 'Next',
      pageIndicator: (current: number, total: number): string =>
        `Page ${current}/${total}`,
      backToTypes: 'Back to types',
      backToMaterials: 'Back to materials',
      rarityLabel: 'Rarity',
      typeLabel: 'Type',
      obtainLabel: 'How to obtain',
      terrains: {
        forest: 'Forest',
        mountain: 'Mountain',
        desert: 'Desert',
        swamp: 'Swamp',
        ruins: 'Ruins',
        cave: 'Cave',
        plains: 'Plains',
        coast: 'Coast',
      },
      sourceSmallEvent: 'Small event',
      sourceExpeditions: 'Expeditions',
      sourceBosses: 'PVE bosses',
      sourceCompost: 'Compost',
      sourceCooking: 'Cooking',
      cookingRecipe: (level: number, quantity: number): string =>
        `(level ${level}, gives ×${quantity})`,
    },

    equipment: {
      name: 'Equipment',
      description: 'The game weapons, armour, potions and objects',
      intro: 'Pick a category, a rarity, then an item to see its stats.',
      categoryPlaceholder: 'Choose a category',
      rarityPlaceholder: 'Choose a rarity',
      itemPlaceholder: 'Choose an item',
      categories: {
        weapons: 'Weapons',
        armors: 'Armour',
        potions: 'Potions',
        objects: 'Objects',
      },
      selectedCategory: (name: string): string => `Category: ${name}`,
      selectedRarity: (name: string): string => `Rarity: ${name}`,
      itemCount: (count: number): string =>
        count === 1 ? '1 item' : `${count} items`,
      noItems: 'No item of this rarity.',
      previous: 'Previous',
      next: 'Next',
      pageIndicator: (current: number, total: number): string =>
        `Page ${current}/${total}`,
      backToCategories: 'Back to categories',
      backToRarities: 'Back to rarities',
      backToItems: 'Back to items',
      backToDetail: 'Back to the item',
      rarityLabel: 'Rarity',
      valueLabel: 'Sell value',
      usagesLabel: 'Uses',
      upgradesButton: 'Upgrade',
      upgradesTitle: 'Upgrade',
      levelLabel: (level: number): string => `Level ${level}`,
      levelIndicator: (current: number, total: number): string =>
        `Level ${current}/${total}`,
    },
  },
} as const satisfies CommandNode;
