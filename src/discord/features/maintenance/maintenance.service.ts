import type { SupportedLocale } from '@/core/types.js';
import { setMaintenanceEnabled } from '@/core/repositories/index.js';
import type { CommandResponse } from '../../interactions/index.js';
import { buildMaintenanceContainer } from './maintenance.ui.js';

/**
 * Toggles maintenance mode and returns the owner-facing confirmation. While
 * enabled, the pipeline blocks every non-owner before their command runs.
 */
export async function runMaintenanceCommand(
  enabled: boolean,
  language: SupportedLocale,
): Promise<CommandResponse> {
  await setMaintenanceEnabled(enabled);
  return {
    container: buildMaintenanceContainer(language, enabled),
    ephemeral: true,
  };
}
