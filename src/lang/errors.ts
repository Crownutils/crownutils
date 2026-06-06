import type { CommandPermission } from '@/types/command.js';

export function buildCommandPermissionsErrorReply(
  missing_permissions: CommandPermission[],
): string {
  return `La commande n'a pas pu être exécutée. (\`${missing_permissions.length > 1 ? 'erreurs' : 'erreur'}: ${missing_permissions.join(', ')}\`)`;
}
