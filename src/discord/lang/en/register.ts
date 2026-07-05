import { icons } from '@/discord/icons.js';
import type { CommandNode } from '../types.js';

export const register = {
  description: 'Register with the bot to access its features.',
  messages: {
    acceptButtonLabel: 'Accept',
    declineButtonLabel: 'Decline',
    doneTitle: `${icons.success} Registration complete`,
    doneBody:
      'You accepted the documents and now have access to all of the bot features.',
    cancelledTitle: `${icons.error} Registration cancelled`,
    cancelledBody:
      'You declined the documents. You can register again at any time.',
    alreadyTitle: `${icons.success} Already registered`,
    alreadyBody: (version: string, date: string) =>
      `You already accepted the documents (version ${version}) on ${date}.`,
  },
} satisfies CommandNode;
