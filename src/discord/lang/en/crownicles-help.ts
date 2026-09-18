import type { CommandNode } from '../types.js';

/**
 * Milestone counts of the recipe discovery lines. Each names how many of a
 * thing the player has to have gone through, so the singular reads as an
 * occasion rather than a quantity.
 */
function finalBosses(count: number): string {
  return count === 1
    ? 'your first final boss'
    : `${count} different final bosses`;
}

function campaignMissions(count: number): string {
  return count === 1
    ? 'your first campaign mission'
    : `${count} campaign missions`;
}

function purchases(count: number): string {
  return count === 1 ? 'your first purchase' : `${count} purchases`;
}

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
      sourceScrapDealer: 'Gorim the Ironbreaker',
      sourceCooking: 'Cooking',
      cookingRecipe: (level: number, quantity: number): string =>
        `(level ${level}, gives ×${quantity})`,
      scrapItem: (name: string, quantity: number, level: number): string =>
        `${name} ×${quantity} (lvl ${level})`,
      scrapMore: (count: number): string => `(+${count} more)`,
    },

    recipes: {
      name: 'Cooking',
      description: 'Know everything about cooking system.',
      intro:
        'Everything about cooking: the recipes, the experience and the botches.',
      sectionPlaceholder: 'Choose a section',
      sections: {
        browse: 'The recipes',
        xp: 'Earning cooking XP',
        failure: 'Botching or nailing a dish',
      },
      sectionDescriptions: {
        browse: 'Ingredients, output and how each recipe is unlocked',
        xp: 'What every dish pays in cooking experience',
        failure: 'How the game works out your odds of botching',
      },
      backToSections: 'Back to sections',
      xp: {
        formula: (plantShare: string, materialShare: string): string =>
          `A dish you nail pays ${plantShare} of its plants' experience, plus ${materialShare} of its materials'.`,
        onFailure: (perLevel: number): string =>
          `A botched dish still pays ${perLevel} XP per difficulty level.`,
        noXp: (threshold: number): string =>
          `No experience at all once the difficulty runs ${threshold} levels or more above what your grade handles.`,
        plantsTitle: 'Experience per plant',
        materialsTitle: 'Experience per material, by rarity',
        amount: (xp: string): string => `${xp} XP`,
      },
      failure: {
        formula: (perLevel: string): string =>
          `Your odds of botching start at your grade's own rate, then climb ${perLevel} per difficulty level above what it handles.`,
        capped: 'The result is capped at 100%.',
        gradesTitle: 'The cooking grades',
        gradeStats: (rate: string, maxDifficulty: number): string =>
          `${rate} botched, up to difficulty ${maxDifficulty}`,
        /** Worked example; every value comes from the game's own tables. */
        example: (
          difficulty: number,
          grade: string,
          maxDifficulty: number,
          base: string,
          extraLevels: number,
          perLevel: string,
          total: string,
        ): string =>
          `Example: a difficulty ${difficulty} recipe attempted as a ${grade} (handles ${maxDifficulty}) gives ${base} + ${extraLevels} × ${perLevel} = ${total} botched.`,
      },
      gradeSpan: (from: number, to: number): string =>
        `levels ${from} to ${to}`,
      gradeSpanOpen: (from: number): string => `level ${from} and up`,
      categoryPlaceholder: 'Choose a category',
      familyPlaceholder: 'Choose a type',
      recipePlaceholder: 'Choose a recipe',
      categories: {
        material: 'Materials',
        potion: 'Potions',
        petFood: 'Pet food',
      },
      families: {
        POTION_HEALTH: 'Healing',
        POTION_ENERGY: 'Energy',
        POTION_TIME_SPEEDUP: 'Time',
        POTION_DEFENSE: 'Defence',
        POTION_ATTACK: 'Attack',
        POTION_SPEED: 'Speed',
        PETFOOD_SALAD: 'Salad',
        PETFOOD_CANDY: 'Treat',
        PETFOOD_MEAT: 'Meat',
        PETFOOD_ULTIMATE: 'Ultimate soup',
        MATERIAL_CRAFT: 'Crafting',
      },
      selectedCategory: (name: string): string => `Category: ${name}`,
      selectedFamily: (name: string): string => `Type: ${name}`,
      recipeCount: (count: number): string =>
        count === 1 ? '1 recipe' : `${count} recipes`,
      noRecipes: 'No recipe in this category.',
      previous: 'Previous',
      next: 'Next',
      pageIndicator: (current: number, total: number): string =>
        `Page ${current}/${total}`,
      backToCategories: 'Back to categories',
      backToFamilies: 'Back to types',
      backToRecipes: 'Back to recipes',
      outputLabel: 'Output',
      levelLabel: 'Difficulty',
      levelValue: (level: number, hardest: number): string =>
        `${level} of ${hardest}`,
      gradeLabel: 'No difficulty penalty from',
      gradeValue: (grade: string, cookingLevel: number): string =>
        `${grade} - cooking level ${cookingLevel}`,
      /** The anchors that make a difficulty concrete: odds here, odds at the bottom. */
      gradeRisk: (atGrade: string, worst: string): string =>
        `You botch it ${atGrade} of the time at that grade, against ${worst} at the lowest one.`,
      /** Used when no grade takes a penalty, so only the base rates separate them. */
      gradeRiskFlat: (worst: string, best: string): string =>
        `No grade takes a penalty on this recipe: you botch it ${worst} of the time at the lowest grade, ${best} at the highest.`,
      unlockLabel: 'Learnt from',
      /** Shown in place of the unlock lines when the viewer is not privileged. */
      unlockLocked: 'Reserved for privileged members',
      lovePointsLabel: 'Love points',
      ingredientsLabel: 'Ingredients',
      plantsLabel: 'Plants',
      materialsLabel: 'Materials',
      noIngredients: 'No ingredient.',
      amount: (name: string, quantity: number): string =>
        `${name} ×${quantity}`,
      foodAmount: (quantity: number, name: string): string =>
        `${quantity} ${name}`,
      randomPotion: (rarity: string): string =>
        `A random potion - ${rarity} rarity`,
      namedPotion: (name: string, rarity: string): string =>
        `${name} - ${rarity} rarity`,
      potionCandidatesLabel: 'Possible potions',
      /** Joins a fact's label to its value; English takes no space before the colon. */
      fact: (label: string, value: string): string => `${label}: ${value}`,
      recipeNotFound: 'This recipe could not be found.',
      optionSummary: (level: number, output: string): string =>
        `Difficulty ${level} - ${output}`,
      discoverySources: {
        DEFAULT: 'Known from the start',
        WITCH: 'By getting a potion from the witch',
        FARMER: 'Bought from the farmer when you meet them',
        GASPARD_JO: 'Bought from Gaspard Jo when you meet him',
        ISLAND_BOSS: 'By defeating a final island boss',
        COOKING_LEVEL:
          'Learnt automatically on reaching the required cooking level',
        PLAYER_LEVEL_MILESTONE: 'By gaining a player level',
        CAMPAIGN_MILESTONE: 'By completing a campaign mission',
      },
      /**
       * `rule` states how a source parts with its recipes, then how far the
       * player has to go to hold this one. `position` states that milestone
       * outright; `atLatest` is used when several recipes share this difficulty,
       * since the game's order between them is not reproducible and only the
       * last milestone is certain. Counts are of *distinct* milestones: beating
       * the same island boss twice advances nothing.
       */
      discoveryDetails: {
        cookingLevel: (level: number): string =>
          `Learnt as soon as your cooking level reaches ${level}.`,
        witch: 'The recipe you learn follows the nature of the potion you get.',
        playerLevel: {
          rule: 'Every level you gain teaches you one recipe, easiest first.',
          position: (level: number): string =>
            `Learnt after reaching level ${level}.`,
          atLatest: (level: number): string =>
            `Learnt after reaching level ${level} at the latest.`,
        },
        campaign: {
          rule: 'Every campaign mission you complete teaches you one recipe, easiest first.',
          position: (count: number): string =>
            `Learnt after completing ${campaignMissions(count)}.`,
          atLatest: (count: number): string =>
            `Learnt after completing ${campaignMissions(count)} at the latest.`,
        },
        islandBoss: {
          rule: 'Every final island boss teaches you one recipe the first time you beat it, easiest first.',
          position: (count: number): string =>
            `Learnt after beating ${finalBosses(count)}.`,
          atLatest: (count: number): string =>
            `Learnt after beating ${finalBosses(count)} at the latest.`,
        },
        shop: {
          rule: (merchant: string): string =>
            `${merchant} sells recipes easiest first, at a rising price.`,
          position: (count: number, price: string): string =>
            `Bought after ${purchases(count)} from them, for ${price} coins.`,
          atLatest: (count: number, price: string): string =>
            `Bought after ${purchases(count)} from them at the latest, for ${price} coins.`,
        },
      },
      /** Subject form, so the merchant can open the sentence stating its rule. */
      merchants: {
        FARMER: 'The farmer',
        GASPARD_JO: 'Gaspard Jo',
      },
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

    level: {
      name: 'Level',
      description: 'See how much experience needed to level up',
      intro:
        'Enter a starting level and then a target level by clicking the button below.',
      computeXpButton: 'Calculate experience',
      recomputeXpButton: 'Calculate again',
      result: (from: number, to: number, xp: string, xpIcon: string): string =>
        `From level ${from} to level ${to}, you need ${xp} ${xpIcon}.`,
      invalidInput: (max: number): string =>
        `Please enter two whole levels between 0 and ${max}, with the starting level below the target one.`,
      modal: {
        title: 'Choice of levels',
        fromLevelLabel: 'Starting level',
        toLevelLabel: 'Target level',
        fromLevelPlaceholder: 'E.g: 12 ',
        toLevelPlaceholder: 'E.g: 18',
      },
    },

    rage: {
      name: 'Rage',
      description: 'How rage works',
    },
    witch: {
      name: 'Witch',
      description: 'The witch event and its potions',
    },
    leagues: {
      name: 'Leagues',
      description: 'Leagues and their rewards',
    },
    route: {
      name: 'Route',
      description: 'The shortest-path calculator',
    },
    missions: {
      name: 'Missions',
      description: 'Missions and their goals',
    },
  },
} as const satisfies CommandNode;
