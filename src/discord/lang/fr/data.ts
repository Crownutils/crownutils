import { md } from '@/discord/theme/markdown.js';
import type { CommandNode } from '../types.js';

export const data = {
  description: 'Consulter les données personnelles conservées par le bot.',
  messages: {
    title: 'Vos données',
    noDataStored: "Aucune donnée vous concernant n'a été stockée.",
    attachedIntro:
      "L'ensemble des données que Crownutils conserve à votre sujet est joint à ce message.",
    attachedReadable: `${md.bold('.md')} - une copie lisible, en langage clair.`,
    attachedPortable: `${md.bold('.json')} - les mêmes données dans un format exploitable par machine, à emporter ailleurs.`,
    /** Le fichier téléchargeable ; formulation volontairement simple, il répond à une demande d'accès RGPD. */
    document: {
      title: 'Vos données personnelles',
      generatedAt: (date: string, url: string): string =>
        `Export généré le ${date} (UTC) par Crownutils, ${url}.`,
      storedSection: 'Ce qui est conservé à votre sujet',
      /** Joins a field to its value; French puts a space before the colon, English does not. */
      field: (label: string, value: string): string => `${label} : ${value}`,
      discordIdLabel: 'Identifiant Discord',
      languageLabel: 'Langue',
      rankLabel: "Rang d'accès",
      legalLabel: 'Documents légaux',
      legalAcceptedValue: (version: string, date: string): string =>
        `acceptés (version ${version}) le ${date}`,
      legalNotAcceptedValue: 'non acceptés',
      banHashLabel: 'Empreinte de bannissement',
      banHashPresentValue:
        'une empreinte irréversible de votre identifiant Discord est conservée',
      banHashAbsentValue: 'aucune',
      notStored: 'non enregistré',
      remindersSection: 'Vos rappels',
      remindersNone: 'Aucun rappel enregistré.',
      reminderItem: (
        content: string,
        status: string,
        due: string,
        created: string,
      ): string =>
        `"${content}" - ${status}, échéance ${due}, créé le ${created}`,
      reminderStatus: {
        pending: 'en attente',
        delivering: "en cours d'envoi",
        failed: 'échec',
      },
      rightsSection: 'Vos droits',
      rightsIntro: 'Conformément au RGPD, vous pouvez à tout moment :',
      rights: {
        access:
          'Accéder à vos données - la commande qui a produit ce fichier, utilisable une fois par mois.',
        rectification:
          'Les faire rectifier - votre langue et vos rappels se modifient depuis le bot lui-même.',
        erasure:
          'Les faire effacer - la commande delete-data supprime votre profil, votre acceptation des documents légaux et vos rappels.',
        portability:
          'Les emporter ailleurs - le fichier .json joint en est la copie portable.',
      },
      rightsContact: (url: string): string =>
        `Pour exercer un droit que ce fichier ne couvre pas, ou pour déposer une réclamation, ouvrez un ticket sur ${url}.`,
      retentionSection: 'Durée de conservation',
      retentionBody: (legalVersion: string): string =>
        `Votre profil et vos rappels sont conservés jusqu'à ce que vous les effaciez ou cessiez d'utiliser le bot. L'acceptation des documents légaux enregistre la version que vous avez acceptée (actuellement ${legalVersion}). Une empreinte de bannissement, lorsqu'elle existe, est une empreinte irréversible conservée même après un effacement : c'est elle qui empêche le contournement d'un bannissement, et elle ne permet pas de remonter à votre identifiant.`,
      jsonNote:
        'Le fichier .json qui accompagne ce document contient les mêmes données dans un format structuré et exploitable par machine (art. 20 du RGPD).',
    },
    cooldownDenied: (date: string) =>
      `Vous avez déjà effectué une demande d'accès à vos données récemment. Vous pourrez en refaire une à partir du ${md.bold(date)}.`,
    userOption:
      "Owner uniquement : les données d'un autre utilisateur à consulter.",
    lookupPrompt: 'Choisissez un utilisateur dont consulter les données.',
    lookupPlaceholder: 'Sélectionner un utilisateur',
  },
} satisfies CommandNode;
