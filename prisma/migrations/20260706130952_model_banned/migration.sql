/*
  Warnings:

  - You are about to drop the column `pseudoId` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Banned" (
    "pseudoId" TEXT NOT NULL PRIMARY KEY
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "language" TEXT NOT NULL DEFAULT 'en',
    "rank" TEXT NOT NULL DEFAULT 'normal'
);
INSERT INTO "new_User" ("language", "rank", "userId") SELECT "language", "rank", "userId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Banned_pseudoId_key" ON "Banned"("pseudoId");
