-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "triggerAt" DATETIME NOT NULL,
    "message" TEXT NOT NULL
);
