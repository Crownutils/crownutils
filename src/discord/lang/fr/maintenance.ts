import { md } from '@/discord/theme/markdown.js';
import type { CommandNode } from '../types.js';

export const maintenance = {
  description:
    'Activer ou désactiver le mode maintenance (propriétaire uniquement).',
  messages: {
    stateOption: 'Activer ou non le mode maintenance.',
    enabled:
      "Le mode maintenance est désormais activé. Seul le propriétaire peut utiliser le bot jusqu'à sa désactivation.",
    disabled:
      'Le mode maintenance est désormais désactivé. Le bot est de nouveau accessible à tous.',
    usage: `Utilisation : ${md.code('maintenance on')} ou ${md.code('maintenance off')}.`,
  },
} satisfies CommandNode;
