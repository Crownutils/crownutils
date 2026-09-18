import type { CommandNode } from '../types.js';

/**
 * Milestone counts of the recipe discovery lines. Each names how many of a
 * thing the player has to have gone through, so the singular reads as an
 * occasion rather than a quantity. `boss` is invariable, `final` is not.
 */
function finalBosses(count: number): string {
  return count === 1
    ? 'votre premier boss final'
    : `${count} boss finaux différents`;
}

function campaignMissions(count: number): string {
  return count === 1
    ? 'votre première mission de campagne'
    : `${count} missions de campagne`;
}

function purchases(count: number): string {
  return count === 1 ? 'votre premier achat' : `${count} achats`;
}

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
    comingSoon: 'Sort bientôt !',
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
        'Choisissez une catégorie ci-dessous pour explorer les données du jeu : les événements et leurs résultats, les équipements et leurs améliorations, et plus encore.',
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
      sourceScrapDealer: 'Gorim le Brise-Fer',
      sourceCooking: 'Cuisine',
      cookingRecipe: (level: number, quantity: number): string =>
        `(niveau ${level}, donne ×${quantity})`,
      scrapItem: (name: string, quantity: number, level: number): string =>
        `${name} ×${quantity} (niv. ${level})`,
      scrapMore: (count: number): string =>
        `(+${count} autre${count > 1 ? 's' : ''})`,
    },

    recipes: {
      name: 'Cuisine',
      description: 'Tout savoir sur la cuisine.',
      intro: "Tout sur la cuisine : les recettes, l'expérience et les échecs.",
      sectionPlaceholder: 'Choisissez une section',
      sections: {
        browse: 'Les recettes',
        xp: "Gagner de l'XP de cuisine",
        failure: 'Rater ou réussir un plat',
      },
      sectionDescriptions: {
        browse: 'Ingrédients, résultat et moyen de débloquer chaque recette',
        xp: 'Ce que chaque plat rapporte en expérience de cuisine',
        failure: 'Comment le jeu calcule vos chances de rater',
      },
      backToSections: 'Retour aux sections',
      xp: {
        formula: (plantShare: string, materialShare: string): string =>
          `Un plat réussi rapporte ${plantShare} de l'expérience de ses plantes, plus ${materialShare} de celle de ses matériaux.`,
        onFailure: (perLevel: number): string =>
          `Un plat raté rapporte quand même ${perLevel} XP par niveau de difficulté.`,
        noXp: (threshold: number): string =>
          `Aucune expérience si la difficulté dépasse de ${threshold} niveaux ou plus ce que votre grade encaisse.`,
        plantsTitle: 'Expérience par plante',
        materialsTitle: 'Expérience par matériau, selon sa rareté',
        amount: (xp: string): string => `${xp} XP`,
      },
      failure: {
        formula: (perLevel: string): string =>
          `Vos chances de rater partent du taux de votre grade, puis montent de ${perLevel} par niveau de difficulté au-dessus de ce qu'il encaisse.`,
        capped: 'Le résultat est plafonné à 100 %.',
        gradesTitle: 'Les grades de cuisine',
        gradeStats: (rate: string, maxDifficulty: number): string =>
          `${rate} d'échec, jusqu'à la difficulté ${maxDifficulty}`,
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
          `Exemple : une recette de difficulté ${difficulty} tentée en ${grade} (encaisse ${maxDifficulty}) donne ${base} + ${extraLevels} × ${perLevel} = ${total} d'échec.`,
      },
      gradeSpan: (from: number, to: number): string =>
        `niveaux ${from} à ${to}`,
      gradeSpanOpen: (from: number): string => `niveau ${from} et plus`,
      categoryPlaceholder: 'Choisissez une catégorie',
      familyPlaceholder: 'Choisissez un type',
      recipePlaceholder: 'Choisissez une recette',
      categories: {
        material: 'Matériaux',
        potion: 'Potions',
        petFood: 'Nourriture pour familier',
      },
      families: {
        POTION_HEALTH: 'Soin',
        POTION_ENERGY: 'Vigueur',
        POTION_TIME_SPEEDUP: 'Célérité',
        POTION_DEFENSE: 'Protection',
        POTION_ATTACK: 'Force',
        POTION_SPEED: 'Vélocité',
        PETFOOD_SALAD: 'Salade',
        PETFOOD_CANDY: 'Friandise',
        PETFOOD_MEAT: 'Viande',
        PETFOOD_ULTIMATE: 'Soupe ultime',
        MATERIAL_CRAFT: 'Artisanat',
      },
      selectedCategory: (name: string): string => `Catégorie : ${name}`,
      selectedFamily: (name: string): string => `Type : ${name}`,
      recipeCount: (count: number): string =>
        count === 1 ? '1 recette' : `${count} recettes`,
      noRecipes: 'Aucune recette dans cette catégorie.',
      previous: 'Précédent',
      next: 'Suivant',
      pageIndicator: (current: number, total: number): string =>
        `Page ${current}/${total}`,
      backToCategories: 'Retour aux catégories',
      backToFamilies: 'Retour aux types',
      backToRecipes: 'Retour aux recettes',
      outputLabel: 'Résultat',
      levelLabel: 'Difficulté',
      levelValue: (level: number, hardest: number): string =>
        `${level} sur ${hardest}`,
      gradeLabel: 'Sans pénalité de difficulté à partir de',
      gradeValue: (grade: string, cookingLevel: number): string =>
        `${grade} - niveau de cuisine ${cookingLevel}`,
      /** The anchors that make a difficulty concrete: odds here, odds at the bottom. */
      gradeRisk: (atGrade: string, worst: string): string =>
        `Vous la ratez ${atGrade} du temps à ce grade, contre ${worst} au grade le plus bas.`,
      /** Used when no grade takes a penalty, so only the base rates separate them. */
      gradeRiskFlat: (worst: string, best: string): string =>
        `Aucun grade ne subit de pénalité sur cette recette : vous la ratez ${worst} du temps au grade le plus bas, ${best} au plus haut.`,
      unlockLabel: 'Apprentissage',
      /** Shown in place of the unlock lines when the viewer is not privileged. */
      unlockLocked: 'Réservé aux membres privilégiés',
      lovePointsLabel: "Points d'amour",
      ingredientsLabel: 'Ingrédients',
      plantsLabel: 'Plantes',
      materialsLabel: 'Matériaux',
      noIngredients: 'Aucun ingrédient.',
      amount: (name: string, quantity: number): string =>
        `${name} ×${quantity}`,
      foodAmount: (quantity: number, name: string): string =>
        `${quantity} ${name}`,
      randomPotion: (rarity: string): string =>
        `Une potion au hasard - rareté ${rarity}`,
      namedPotion: (name: string, rarity: string): string =>
        `${name} - rareté ${rarity}`,
      potionCandidatesLabel: 'Potions possibles',
      /** Joins a fact's label to its value; the space before the colon is French. */
      fact: (label: string, value: string): string => `${label} : ${value}`,
      recipeNotFound: 'Cette recette est introuvable.',
      optionSummary: (level: number, output: string): string =>
        `Difficulté ${level} - ${output}`,
      discoverySources: {
        DEFAULT: 'Connue dès le départ',
        WITCH: 'En obtenant une potion de la sorcière',
        FARMER: "En l'achetant au fermier, lors de sa rencontre",
        GASPARD_JO: "En l'achetant à Gaspard Jo, lors de sa rencontre",
        ISLAND_BOSS: "En battant un boss final d'île",
        COOKING_LEVEL:
          'Apprise automatiquement en atteignant le niveau de cuisine requis',
        PLAYER_LEVEL_MILESTONE: 'En gagnant un niveau de joueur',
        CAMPAIGN_MILESTONE: 'En terminant une mission de campagne',
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
          `Apprise dès que votre niveau de cuisine atteint ${level}.`,
        witch:
          'La recette obtenue suit la nature de la potion que vous recevez.',
        playerLevel: {
          rule: 'Chaque niveau gagné vous apprend une recette, de la plus facile à la plus difficile.',
          position: (level: number): string =>
            `Apprise après avoir atteint le niveau ${level}.`,
          atLatest: (level: number): string =>
            `Apprise au plus tard après avoir atteint le niveau ${level}.`,
        },
        campaign: {
          rule: 'Chaque mission de campagne terminée vous apprend une recette, de la plus facile à la plus difficile.',
          position: (count: number): string =>
            `Apprise après avoir terminé ${campaignMissions(count)}.`,
          atLatest: (count: number): string =>
            `Apprise au plus tard après avoir terminé ${campaignMissions(count)}.`,
        },
        islandBoss: {
          rule: "Chaque boss final d'île vous apprend une recette la première fois que vous le battez, de la plus facile à la plus difficile.",
          position: (count: number): string =>
            `Apprise après avoir vaincu ${finalBosses(count)}.`,
          atLatest: (count: number): string =>
            `Apprise au plus tard après avoir vaincu ${finalBosses(count)}.`,
        },
        shop: {
          rule: (merchant: string): string =>
            `${merchant} vend ses recettes de la plus facile à la plus difficile, à prix croissant.`,
          position: (count: number, price: string): string =>
            `Achetée après ${purchases(count)} chez lui, pour ${price} pièces.`,
          atLatest: (count: number, price: string): string =>
            `Achetée au plus tard après ${purchases(count)} chez lui, pour ${price} pièces.`,
        },
      },
      /** Subject form, so the merchant can open the sentence stating its rule. */
      merchants: {
        FARMER: 'Le fermier',
        GASPARD_JO: 'Gaspard Jo',
      },
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
      levelIndicator: (current: number, total: number): string =>
        `Niveau ${current}/${total}`,
    },

    level: {
      name: 'Niveau',
      description:
        "Voir la quantité d'expérience requise pour passer des niveaux",
      intro:
        "Renseignez un niveau de départ puis un niveau d'arrivée en cliquant sur le bouton ci-dessous.",
      computeXpButton: "Calculer l'expérience",
      recomputeXpButton: 'Recalculer',
      result: (from: number, to: number, xp: string, xpIcon: string): string =>
        `Du niveau ${from} au niveau ${to}, il vous faut ${xp} ${xpIcon}.`,
      invalidInput: (max: number): string =>
        `Veuillez renseigner deux niveaux entiers entre 0 et ${max}, le niveau de départ étant inférieur au niveau d'arrivée.`,
      modal: {
        title: 'Choix des niveaux',
        fromLevelLabel: 'Niveau de départ',
        toLevelLabel: "Niveau d'arrivée",
        fromLevelPlaceholder: 'Ex: 12',
        toLevelPlaceholder: 'Ex: 18',
      },
    },

    rage: {
      name: 'Rage',
      description: 'Le fonctionnement de la rage',
    },
    witch: {
      name: 'Sorcière',
      description: "L'événement de la sorcière et ses potions",
    },
    leagues: {
      name: 'Ligues',
      description: 'Les ligues et leurs récompenses',
    },
    route: {
      name: 'Itinéraire',
      description: 'Le calculateur de plus court chemin',
    },
    missions: {
      name: 'Missions',
      description: 'Les missions et leurs objectifs',
    },
  },
} as const satisfies CommandNode;
