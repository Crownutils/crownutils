import { PREFIX } from '@/discord/constants.js';
import { icons } from '@/discord/icons.js';
import { md } from '@/discord/markdown.js';
import type { CommandLang } from './types.js';

/** Strings for the `/remind` command. */
export const remind = {
  commandDescription: 'Définir un rappel.',
  options: {
    time: 'La durée avant le rappel. Ex : 1h30m, 30s.',
    message: 'Le message du rappel.',
  },
  messages: {
    defaultMessage: 'Vous pouvez effectuer votre rapport.',
    created: {
      title: 'Rappel défini',
      cancelButton: 'Annuler ce rappel',
      description: ({
        message,
        when,
      }: {
        message: string;
        when: string;
      }): string =>
        `Votre rappel pour ${md.code(message)} a été défini pour : ${when}.`,
    },
    cancelled: {
      title: 'Rappel annulé',
      description: ({ message }: { message: string }): string =>
        `Votre rappel pour ${md.code(message)} a été annulé.`,
    },
    triggered: {
      title: `${icons.bell} DRING !`,
    },
    durationTooLong: 'Un rappel ne peut pas dépasser 24 jours.',
    limitReached: ({ max }: { max: number }): string =>
      `Vous avez atteint la limite de ${max} rappels simultanés.`,
    invalidFormat: {
      prefix: `Format invalide. Exemples : ${md.code(`${PREFIX}r`)}, ${md.code(`${PREFIX}r 1h30m faire les courses`)}`,
      slash: `Format invalide. Exemples : ${md.code('/remind')}, ${md.code('/remind time:1h30m message:faire les courses')}`,
    },
  },
} as const satisfies CommandLang;
