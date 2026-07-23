import { icons } from '@/discord/theme/icons.js';
import { md } from '@/discord/theme/markdown.js';
import type { CommandNode } from '../types.js';

export const data = {
  description: 'View the personal data the bot holds about you.',
  messages: {
    title: `${icons.shield} Your data`,
    intro: 'Here is everything Crownutils currently holds about you.',
    discordId: (id: string) => `${md.bold('Discord id:')} ${md.code(id)}`,
    language: (language: string) => `${md.bold('Language:')} ${language}`,
    rank: (rank: string) => `${md.bold('Access rank:')} ${rank}`,
    legalAccepted: (version: string, date: string) =>
      `${md.bold('Legal documents accepted:')} version ${version} on ${date}`,
    legalNotAccepted: `${md.bold('Legal documents accepted:')} no`,
    banHashPresent: `${md.bold('Ban hash:')} yes, a hash of your id is on record`,
    banHashAbsent: `${md.bold('Ban hash:')} none`,
    remindersTitle: (count: number) =>
      `${md.bold('Reminders on record:')} ${count}`,
    remindersNone: `${md.bold('Reminders on record:')} none`,
    reminderItem: (content: string, status: string, due: string) =>
      `• ${md.code(content)} - ${status}, due ${due}`,
    reminderStatus: {
      pending: 'pending',
      delivering: 'sending',
      delivered: 'delivered',
      failed: 'failed',
    },
    notStored: 'not stored',
    noDataStored: 'No data about you has been stored.',
    cooldownDenied: (date: string) =>
      `You already made a data access request recently. You can make another one starting ${md.bold(date)}.`,
    userOption: "Owner only: another user's data to look up.",
    lookupPrompt: 'Pick a user to look up their data.',
    lookupPlaceholder: 'Select a user',
  },
} satisfies CommandNode;
