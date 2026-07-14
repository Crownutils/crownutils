/*
  Warnings:

  - Added the required column `durationMs` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" DATETIME
);
INSERT INTO "new_Reminder" ("attempts", "channelId", "content", "createdAt", "deliveredAt", "dueAt", "id", "lastError", "status", "userId") SELECT "attempts", "channelId", "content", "createdAt", "deliveredAt", "dueAt", "id", "lastError", "status", "userId" FROM "Reminder";
DROP TABLE "Reminder";
ALTER TABLE "new_Reminder" RENAME TO "Reminder";
CREATE INDEX "Reminder_status_dueAt_idx" ON "Reminder"("status", "dueAt");
CREATE INDEX "Reminder_userId_status_idx" ON "Reminder"("userId", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
