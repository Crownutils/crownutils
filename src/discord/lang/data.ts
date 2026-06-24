import { icons } from '@/discord/icons.js';
import { md } from '@/discord/markdown.js';
import type { CommandLang } from './types.js';

/** Strings for the `/data` command (personal-data access / export). */
export const data = {
  commandDescription:
    'Consulter les données personnelles que le bot conserve à votre sujet.',
  options: {
    user: 'L’utilisateur dont consulter les données (réservé au propriétaire).',
  },
  messages: {
    title: `${icons.shield} Vos données`,
    titleOther: ({ user }: { user: string }): string =>
      `${icons.shield} Données de ${user}`,
    intro:
      'Voici l’ensemble des données que Crownutils conserve à votre sujet.',
    introOther:
      'Voici l’ensemble des données conservées au sujet de cet utilisateur.',
    empty:
      "Aucune donnée personnelle n'est actuellement conservée à votre sujet.",
    emptyOther: 'Aucune donnée n’est conservée au sujet de cet utilisateur.',
    cooldown: ({ when }: { when: string }): string =>
      `${icons.warning} Vous avez récemment demandé l'accès à vos données. Vous pourrez en faire une nouvelle demande ${when}.`,
    legal: {
      title: 'Acceptation des documents légaux',
      accepted: ({
        version,
        when,
      }: {
        version: string;
        when: string;
      }): string => `Acceptée (version ${version}) ${when}.`,
      none: 'Non acceptée.',
      exempt: 'Exempté (acceptation non requise).',
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
      title: 'Mails',
      read: ({ count }: { count: number }): string =>
        `${count} mail(s) marqué(s) comme lu(s).`,
      notice: ({ when }: { when: string }): string =>
        `Dernier rappel de mails non lus : ${when}.`,
      none: 'Aucune interaction avec les mails.',
    },
    dataAccess: {
      title: "Demandes d'accès",
      last: ({ when }: { when: string }): string =>
        `Dernière demande d'accès ${when}.`,
    },
    footer: `Pour supprimer ces données, utilisez la commande ${md.code('delete-data')}.`,
  },
} as const satisfies CommandLang;
