/*
  A delivered reminder is now erased instead of being kept as history: the
  `delivered` status and the `deliveredAt` column both disappear, and the rows
  that already carried them are deleted.
*/
-- Drop the history that is no longer retained.
DELETE FROM "Reminder" WHERE "status" = 'delivered';

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "dueAt" DATETIME NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Reminder" ("attempts", "channelId", "content", "createdAt", "dueAt", "durationMs", "id", "lastError", "status", "userId") SELECT "attempts", "channelId", "content", "createdAt", "dueAt", "durationMs", "id", "lastError", "status", "userId" FROM "Reminder";
DROP TABLE "Reminder";
ALTER TABLE "new_Reminder" RENAME TO "Reminder";
CREATE INDEX "Reminder_status_dueAt_idx" ON "Reminder"("status", "dueAt");
CREATE INDEX "Reminder_userId_status_idx" ON "Reminder"("userId", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
