import { md } from '@/discord/theme/markdown.js';
import type { CommandNode } from '../types.js';

export const data = {
  description: 'View the personal data the bot holds about you.',
  messages: {
    title: 'Your data',
    noDataStored: 'No data about you has been stored.',
    attachedIntro:
      'Everything Crownutils holds about you is attached to this message.',
    attachedReadable: `${md.bold('.md')} - a readable copy, in plain language.`,
    attachedPortable: `${md.bold('.json')} - the same data in a machine-readable format, to carry elsewhere.`,
    /** The downloadable export; wording is deliberately plain, it answers a GDPR access request. */
    document: {
      title: 'Your personal data',
      generatedAt: (date: string, url: string): string =>
        `Export generated on ${date} (UTC) by Crownutils, ${url}.`,
      storedSection: 'What is stored about you',
      /** Joins a field to its value; French puts a space before the colon, English does not. */
      field: (label: string, value: string): string => `${label}: ${value}`,
      discordIdLabel: 'Discord id',
      languageLabel: 'Language',
      rankLabel: 'Access rank',
      legalLabel: 'Legal documents',
      legalAcceptedValue: (version: string, date: string): string =>
        `accepted (version ${version}) on ${date}`,
      legalNotAcceptedValue: 'not accepted',
      banHashLabel: 'Ban fingerprint',
      banHashPresentValue:
        'a one-way fingerprint of your Discord id is on record',
      banHashAbsentValue: 'none',
      notStored: 'not stored',
      remindersSection: 'Your reminders',
      remindersNone: 'No reminder is stored.',
      reminderItem: (
        content: string,
        status: string,
        due: string,
        created: string,
      ): string => `"${content}" - ${status}, due ${due}, created ${created}`,
      reminderStatus: {
        pending: 'pending',
        delivering: 'sending',
        delivered: 'delivered',
        failed: 'failed',
      },
      rightsSection: 'Your rights',
      rightsIntro: 'Under the GDPR you may, at any time:',
      rights: {
        access:
          'Access your data - the command that produced this file, usable once a month.',
        rectification:
          'Have it corrected - your language and reminders are editable from the bot itself.',
        erasure:
          'Have it erased - the delete-data command removes your profile, your legal acceptance and your reminders.',
        portability:
          'Take it elsewhere - the attached .json file is the portable copy.',
      },
      rightsContact: (url: string): string =>
        `To exercise a right this file does not cover, or to lodge a complaint, open an issue at ${url}.`,
      retentionSection: 'Retention',
      retentionBody: (legalVersion: string): string =>
        `Your profile and reminders are kept until you erase them or stop using the bot. The legal acceptance records which version of the documents you agreed to (currently ${legalVersion}). A ban fingerprint, when one exists, is a one-way hash kept even after an erasure, since it is what prevents ban evasion and cannot be traced back to your id.`,
      jsonNote:
        'The .json file next to this document contains the same data in a structured, machine-readable format (GDPR art. 20).',
    },
    cooldownDenied: (date: string) =>
      `You already made a data access request recently. You can make another one starting ${md.bold(date)}.`,
    userOption: "Owner only: another user's data to look up.",
    lookupPrompt: 'Pick a user to look up their data.',
    lookupPlaceholder: 'Select a user',
  },
} satisfies CommandNode;
