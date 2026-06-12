import type { CommandPermissionError } from '@/core/permissions/types.js';
import { PERMISSION_LABELS } from './permissions.js';
import { md } from '@/discord/markdown.js';

export const errors = {
  unexpected:
    'Une erreur inattendue est survenue. Veuillez réessayer plus tard.',
  interactionNotAllowed: 'Vous ne pouvez pas interagir avec cette interaction.',
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
