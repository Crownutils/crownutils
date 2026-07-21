import type { CommandNode } from '../types.js';

export const help = {
  description: 'Liste les commandes que vous pouvez utiliser.',
  messages: {
    title: 'Commandes',
    intro: "Chaque commande s'utilise en slash (/) ou avec le préfixe c!.",
    categories: {
      general: 'Général',
      crownicles: 'Crownicles',
      reminders: 'Rappels',
      privacy: 'Confidentialité',
      moderation: 'Modération',
    },
    selectPlaceholder: 'Choisissez une commande pour les détails',
    backButton: 'Retour',
    detail: {
      aliasesLabel: 'Alias',
      scopeLabel: 'Où',
      scopes: {
        anywhere: 'Partout',
        guild: 'En serveur',
        dm: 'En messages privés',
        mainGuildOnly: 'Serveur principal uniquement',
      },
      rankLabel: 'Rang requis',
      ranks: {
        privileged: 'Privilégié',
        owner: 'Propriétaire',
      },
      optionsLabel: 'Options',
    },
  },
} as const satisfies CommandNode;
