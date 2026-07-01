import { prisma } from '@/core/persistence/client.js';
import { memoCell } from '@/core/cache.js';

const BOT_STATE_ID = 1;

/** In-memory cache of the maintenance flag, kept in sync by {@link setMaintenanceEnabled}. */
const maintenanceEnabled = memoCell<boolean>();

/** Returns whether maintenance mode is currently active. */
export async function isMaintenanceEnabled(): Promise<boolean> {
  return maintenanceEnabled.get(async () => {
    const state = await prisma.botState.findUnique({
      where: { id: BOT_STATE_ID },
    });
    return state?.maintenanceEnabled ?? false;
  });
}

/**
 * Enables or disables maintenance mode. While enabled, only the bot owner
 * can run commands - everyone else is blocked before the command executes.
 * Persisted, so it survives bot restarts.
 */
export async function setMaintenanceEnabled(enabled: boolean): Promise<void> {
  await prisma.botState.upsert({
    where: { id: BOT_STATE_ID },
    update: { maintenanceEnabled: enabled },
    create: { id: BOT_STATE_ID, maintenanceEnabled: enabled },
  });
  maintenanceEnabled.set(enabled);
}
