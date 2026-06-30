import { PREFIX } from '../constants.js';
import { md } from '../markdown.js';
import type { CommandLang } from './types.js';

/** Strings for the `/help` command. */
export const help = {
  commandDescription: "Affiche le menu d'aide du bot.",
  messages: {
    title: `Crownutils`,
    welcome:
      "Bienvenue sur l'aide de Crownutils, vous trouverez ici toutes les commandes disponibles.",
    myPrefix: `Le préfixe pour mes commandes est ${md.code(PREFIX)} mais vous pouvez aussi utiliser les commandes slashs !`,
    usageTitle: 'Usage',
    usage: (help: string) => `${md.code(help)}`,
    prefixAliasesTitle: 'Alias',
    selectMenu: {
      placeholder: 'Sélectionnez une commande',
    },
  },
} as const satisfies CommandLang;
