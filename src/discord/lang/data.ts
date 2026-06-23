import { icons } from '@/discord/icons.js';
import type { CommandLang } from './types.js';

/** Strings for the `/data` command (personal-data access / export). */
export const data = {
  commandDescription:
    'Consulter les données personnelles que le bot conserve à votre sujet.',
  messages: {
    title: `${icons.shield} Vos données`,
    intro: 'Voici l’ensemble des données que Crownutils conserve à votre sujet.',
    empty:
      "Aucune donnée personnelle n'est actuellement conservée à votre sujet.",
    cooldown: ({ when }: { when: string }): string =>
      `${icons.warning} Vous avez récemment demandé l'accès à vos données. Vous pourrez en faire une nouvelle demande ${when}.`,
    legal: {
      title: 'Acceptation des documents légaux',
      accepted: ({ version, when }: { version: string; when: string }): string =>
        `Acceptée (version ${version}) ${when}.`,
      none: 'Non acceptée.',
    },
    reminders: {
      title: 'Rappels',
      summary: ({ count }: { count: number }): string =>
        `${count} rappel(s) programmé(s) :`,
      item: ({ when, message }: { when: string; message: string }): string =>
        `• ${when} — ${message}`,
      none: 'Aucun rappel programmé.',
    },
    pathfinder: {
      title: "Calcul d'itinéraire",
      last: ({ when }: { when: string }): string =>
        `Dernière utilisation ${when}.`,
      none: 'Jamais utilisé.',
    },
    mails: {
      title: 'Annonces',
      read: ({ count }: { count: number }): string =>
        `${count} annonce(s) marquée(s) comme lue(s).`,
      notice: ({ when }: { when: string }): string =>
        `Dernier rappel d'annonces non lues : ${when}.`,
      none: 'Aucune interaction avec les annonces.',
    },
    dataAccess: {
      title: "Demandes d'accès",
      last: ({ when }: { when: string }): string =>
        `Dernière demande d'accès ${when}.`,
    },
    footer: 'Pour supprimer ces données, utilisez la commande /delete-data.',
  },
} as const satisfies CommandLang;
