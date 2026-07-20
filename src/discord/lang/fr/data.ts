import { icons } from '@/discord/theme/icons.js';
import { md } from '@/discord/theme/markdown.js';
import type { CommandNode } from '../types.js';

export const data = {
  description: 'Consulter les données personnelles conservées par le bot.',
  messages: {
    title: `${icons.shield} Vos données`,
    intro:
      "Voici l'ensemble des données que Crownutils conserve actuellement à votre sujet.",
    discordId: (id: string) =>
      `${md.bold('Identifiant Discord :')} ${md.code(id)}`,
    language: (language: string) => `${md.bold('Langue :')} ${language}`,
    rank: (rank: string) => `${md.bold("Rang d'accès :")} ${rank}`,
    legalAccepted: (version: string, date: string) =>
      `${md.bold('Documents légaux acceptés :')} version ${version} le ${date}`,
    legalNotAccepted: `${md.bold('Documents légaux acceptés :')} non`,
    banHashPresent: `${md.bold('Empreinte de bannissement :')} oui, une empreinte de votre identifiant est conservée`,
    banHashAbsent: `${md.bold('Empreinte de bannissement :')} aucune`,
    remindersTitle: (count: number) =>
      `${md.bold('Rappels enregistrés :')} ${count}`,
    remindersNone: `${md.bold('Rappels enregistrés :')} aucun`,
    reminderItem: (content: string, status: string, due: string) =>
      `• ${md.code(content)} — ${status}, échéance ${due}`,
    reminderStatus: {
      pending: 'en attente',
      delivering: "en cours d'envoi",
      delivered: 'envoyé',
      failed: 'échec',
    },
    notStored: 'non enregistré',
    noDataStored: "Aucune donnée vous concernant n'a été stockée.",
    cooldownDenied: (date: string) =>
      `Vous avez déjà effectué une demande d'accès à vos données récemment. Vous pourrez en refaire une à partir du ${md.bold(date)}.`,
    userOption:
      "Owner uniquement : les données d'un autre utilisateur à consulter.",
    lookupPrompt: 'Choisissez un utilisateur dont consulter les données.',
    lookupPlaceholder: 'Sélectionner un utilisateur',
  },
} satisfies CommandNode;
