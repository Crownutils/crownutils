import type { CommandPermissionError } from '@/core/permissions/types.js';
import { PERMISSION_LABELS } from './permissions.js';
import { md } from '@/discord/markdown.js';

/** Shared error strings used across commands. */
export const errors = {
  unexpected:
    'Une erreur inattendue est survenue. Veuillez réessayer plus tard.',
  interactionNotAllowed: 'Vous ne pouvez pas interagir avec cette interaction.',
  maintenance:
    'Le bot est actuellement en maintenance. Veuillez réessayer plus tard.',
} as const;

/** Formats a list of failed permission checks into a single error message. */
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
