import type { CommandNode } from '../types.js';

export const deleteData = {
  description:
    'Supprime définitivement les données que le bot stocke sur vous.',
  messages: {
    title: 'Supprimer vos données ?',
    warning: 'Cette action est irréversible.',
    willDelete:
      'Seront supprimés : votre langue et votre rang, votre acceptation des documents légaux, et tous vos rappels.',
    willKeep:
      'Seront conservés : un éventuel bannissement de votre compte et le délai entre deux demandes de données.',
    confirmButton: 'Supprimer',
    cancelButton: 'Annuler',
    doneTitle: 'Données supprimées',
    doneDescription: 'Vos données ont été définitivement supprimées.',
    cancelledTitle: 'Annulé',
    cancelledDescription: "Vos données n'ont pas été supprimées.",
    emptyTitle: 'Aucune donnée',
    emptyDescription:
      'Le bot ne stocke aucune donnée supprimable vous concernant.',
    checkDm: 'Consultez vos messages privés pour confirmer la suppression.',
  },
} as const satisfies CommandNode;
