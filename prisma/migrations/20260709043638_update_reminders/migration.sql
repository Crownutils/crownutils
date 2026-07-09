-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN "lastError" TEXT;
ALTER TABLE "Reminder" ADD COLUMN "sentAt" DATETIME;

-- CreateIndex
CREATE INDEX "Reminder_status_dueAt_idx" ON "Reminder"("status", "dueAt");

-- CreateIndex
CREATE INDEX "Reminder_userId_idx" ON "Reminder"("userId");
