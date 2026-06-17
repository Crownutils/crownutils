import { icons } from '@/discord/icons.js';
import { md } from '@/discord/markdown.js';
import type { CommandLang } from './types.js';

/** Strings for the `/invite` command. */
export const invite = {
  commandDescription: "Obtenir le lien d'invitation du bot.",
  messages: {
    title: `${icons.ticket} Inviter Crownutils`,
    description: (url: string) =>
      `Ajoutez Crownutils à votre serveur grâce au ${md.link("lien d'invitation", url)}.`,
  },
} as const satisfies CommandLang;
