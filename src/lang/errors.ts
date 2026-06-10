import type { CommandPermissionError } from '@/types/command/command-permission.js';
import { PERMISSION_LABELS } from './permissions.js';
import { md } from '@/lib/markdown.js';

export const errors = {
  unexpected:
    'Une erreur inattendue est survenue. Veuillez réessayer plus tard.',
} as const;

export function formatPermissionErrors(
  permissionErrors: CommandPermissionError[],
): string {
  const labels = permissionErrors.map(
    (error) => PERMISSION_LABELS[error.required],
  );
  const noun = labels.length > 1 ? 'erreurs' : 'erreur';
  const detail = `${noun} : ${labels.join(', ')}`;
  return `La commande n'a pas pu être exécutée. (${md.code(detail)})`;
}
