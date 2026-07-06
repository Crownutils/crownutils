import type { CommandScope } from '@/core/permissions/index.js';
import type { LangNode } from '../types.js';
import { md } from '@/discord/theme/markdown.js';

/** Cross-cutting user-facing strings */
export const commonLang = {
  maintenance:
    'Le bot est en maintenance. Merci de réessayer dans quelques instants.',
  banned: 'Vous êtes banni de ce bot.',
  permissionDenied: "Vous n'avez pas la permission d'utiliser cette commande.",
  unexpectedError:
    "Une erreur inattendue est survenue. L'incident a été consigné.",
  gateDenied: "Vous n'avez pas accès à cette commande pour le moment.",
  interactionNotAllowed: 'Vous ne pouvez pas interagir avec ce message.',
  legalNotAccepted: `Merci de vous enregistrer (${md.code('register')}) dans le bot avant toute utilisation.`,
  scopeDenied: (scope: CommandScope): string => {
    switch (scope) {
      case 'guild':
        return 'Cette commande ne peut être utilisée que dans un serveur.';
      case 'dm':
        return "Cette commande ne peut être utilisée qu'en message privé.";
      case 'mainGuildOnly':
        return 'Cette commande ne peut être utilisé que sur le serveur principal.';
      case 'anywhere':
        return 'Cette commande ne peut pas être utilisée ici.';
    }
  },
} as const satisfies LangNode;
