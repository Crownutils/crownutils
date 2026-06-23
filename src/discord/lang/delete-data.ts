import { icons } from '@/discord/icons.js';
import { md } from '@/discord/markdown.js';
import type { CommandLang } from './types.js';

/** Strings for the `/delete-data` command. */
export const deleteData = {
  commandDescription:
    'Supprimer définitivement toutes les données que le bot conserve sur vous.',
  messages: {
    title: `${icons.trash} Suppression de vos données`,
    confirmPrompt:
      'Cette action supprime définitivement toutes vos données (rappels, accusés de lecture, acceptation des documents légaux, etc.) et est irréversible. Votre acceptation étant également supprimée, vous devrez accepter de nouveau les documents pour réutiliser le bot.',
    confirmButton: 'Supprimer mes données',
    cancelButton: 'Annuler',
    cancelled: "Suppression annulée. Aucune donnée n'a été supprimée.",
    success: `${icons.check} Toutes vos données ont été supprimées. Vous devrez accepter de nouveau les documents (commande ${md.code('legal')}) pour réutiliser le bot.`,
    nothing: "Aucune donnée n'était conservée à votre sujet.",
  },
} as const satisfies CommandLang;
