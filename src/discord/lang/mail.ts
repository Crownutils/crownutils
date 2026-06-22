import { icons } from '@/discord/icons.js';
import { md } from '@/discord/markdown.js';
import type { CommandLang } from './types.js';

/** Strings for `/mail`: publishing a team announcement (owner only). */
export const mail = {
  commandDescription: "Publier un mail de l'équipe (réservé au propriétaire).",
  messages: {
    modalTitle: 'Nouveau mail',
    titleLabel: 'Titre',
    titlePlaceholder: 'Titre du mail (facultatif)',
    bodyLabel: 'Message',
    bodyPlaceholder: 'Votre message… le Markdown est pris en charge.',
    sent: 'Votre mail a bien été publié.',
    empty: 'Le message ne peut pas être vide.',
    timeout: 'Le formulaire a expiré. Relancez la commande pour réessayer.',
  },
} as const satisfies CommandLang;

/** Strings for `/mails`: the inbox of team announcements. */
export const mails = {
  commandDescription: "Consulter les mails de l'équipe.",
  messages: {
    inboxTitle: `${icons.mailbox} Boîte de réception`,
    empty: "Aucun mail de l'équipe pour le moment.",
    selectPlaceholder: 'Sélectionnez un mail à lire',
    pageIndicator: ({ current, total }: { current: number; total: number }) =>
      `Page ${current}/${total}`,
    previous: 'Précédent',
    next: 'Suivant',
    back: 'Retour',
    noTitle: 'Sans titre',
    sentAt: ({ when }: { when: string }) => `Publié ${when}`,
    unreadNotice: ({ count }: { count: number }) =>
      `${icons.mailbox} Vous avez ${md.bold(`${count} message(s) non lu(s)`)}. Consultez-les avec ${md.code('/mails')}.`,
  },
} as const satisfies CommandLang;
