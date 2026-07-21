import type { CommandNode } from '../types.js';

export const deleteData = {
  description: 'Permanently deletes the data the bot stores about you.',
  messages: {
    title: 'Delete your data?',
    warning: 'This action is irreversible.',
    willDelete:
      'Will be deleted: your language and rank, your acceptance of the legal documents, and all your reminders.',
    willKeep:
      'Will be kept: any ban on your account and the delay between two data requests.',
    confirmButton: 'Delete',
    cancelButton: 'Cancel',
    doneTitle: 'Data deleted',
    doneDescription: 'Your data has been permanently deleted.',
    cancelledTitle: 'Cancelled',
    cancelledDescription: 'Your data has not been deleted.',
    emptyTitle: 'No data',
    emptyDescription: 'The bot holds no deletable data about you.',
    checkDm: 'Check your private messages to confirm the deletion.',
  },
} as const satisfies CommandNode;
