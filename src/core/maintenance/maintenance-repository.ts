import { prisma } from '@/core/persistence/client.js';

const BOT_STATE_ID = 1;

/**
 * In-memory cache of the maintenance flag, populated on first read and kept
 * in sync by {@link setMaintenanceEnabled}. Avoids a DB round-trip on every
 * command.
 */
let cachedMaintenanceEnabled: boolean | undefined;

/** Returns whether maintenance mode is currently active. */
export async function isMaintenanceEnabled(): Promise<boolean> {
  if (cachedMaintenanceEnabled === undefined) {
    const state = await prisma.botState.findUnique({
      where: { id: BOT_STATE_ID },
    });
    cachedMaintenanceEnabled = state?.maintenanceEnabled ?? false;
  }
  return cachedMaintenanceEnabled;
}

/**
 * Enables or disables maintenance mode. While enabled, only the bot owner
 * can run commands — everyone else is blocked before the command executes.
 * Persisted, so it survives bot restarts.
 */
export async function setMaintenanceEnabled(enabled: boolean): Promise<void> {
  await prisma.botState.upsert({
    where: { id: BOT_STATE_ID },
    update: { maintenanceEnabled: enabled },
    create: { id: BOT_STATE_ID, maintenanceEnabled: enabled },
  });
  cachedMaintenanceEnabled = enabled;
}
