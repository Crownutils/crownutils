import type { CommandPermission } from '@/types/command.js';
import { PERMISSION_LABELS } from './permissions.js';

export const errors = {
  unexpected:
    'Une erreur inattendue est survenue. Veuillez réessayer plus tard.',
} as const;

export function formatMissingPermissions(
  missingPermissions: CommandPermission[],
): string {
  const labels = missingPermissions.map(
    (permission) => PERMISSION_LABELS[permission],
  );
  const noun = labels.length > 1 ? 'erreurs' : 'erreur';
  return `La commande n'a pas pu être exécutée. (\`${noun} : ${labels.join(', ')}\`)`;
}
