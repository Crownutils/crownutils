-- CreateTable
CREATE TABLE "BotState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "maintenanceEnabled" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "pseudoId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en'
);

-- CreateIndex
CREATE UNIQUE INDEX "User_pseudoId_key" ON "User"("pseudoId");
