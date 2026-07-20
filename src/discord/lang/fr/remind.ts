import { COMMAND_PREFIX } from '@/discord/utils/constants.js';
import { icons } from '@/discord/theme/icons.js';
import { md } from '@/discord/theme/markdown.js';
import type { CommandNode } from '../types.js';

export const remind = {
  description: 'Définir un rappel.',
  messages: {
    timeOption: 'La durée avant le rappel. Ex : 1h30m, 30s.',
    messageOption: 'Le message du rappel.',
    defaultMessage: 'Rapport Crownicles',
    created: {
      title: 'Rappel défini',
      cancelButton: 'Annuler ce rappel',
      description: (message: string, when: string): string =>
        `Votre rappel pour ${md.code(message)} a été défini pour ${when}.`,
    },
    cancelled: {
      title: 'Rappel annulé',
      description: (message: string): string =>
        `Votre rappel pour ${md.code(message)} a été annulé.`,
    },
    triggered: {
      title: `${icons.bell} DRING !`,
      relaunchButton: 'Relancer',
    },
    durationTooLong: 'Un rappel ne peut pas être programmé à plus de 10 ans.',
    limitReached: (max: number): string =>
      `Vous avez atteint la limite de ${max} rappels simultanés.`,
    invalidFormat: {
      prefix: `Format invalide. Exemples : ${md.code(`${COMMAND_PREFIX}r`)}, ${md.code(`${COMMAND_PREFIX}r 1h30m faire les courses`)}.`,
      slash: `Format invalide. Exemples : ${md.code('/remind')}, ${md.code('/remind time:1h30m message:faire les courses')}.`,
    },
  },
} as const satisfies CommandNode;
