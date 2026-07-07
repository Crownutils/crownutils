/*
  Warnings:

  - The primary key for the `Banned` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `pseudoId` on the `Banned` table. All the data in the column will be lost.
  - The primary key for the `GdprRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `GdprRequest` table. All the data in the column will be lost.
  - Added the required column `hash` to the `Banned` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hash` to the `GdprRequest` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Banned" (
    "hash" TEXT NOT NULL PRIMARY KEY
);
DROP TABLE "Banned";
ALTER TABLE "new_Banned" RENAME TO "Banned";
CREATE UNIQUE INDEX "Banned_hash_key" ON "Banned"("hash");
CREATE TABLE "new_GdprRequest" (
    "hash" TEXT NOT NULL PRIMARY KEY,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_GdprRequest" ("requestedAt") SELECT "requestedAt" FROM "GdprRequest";
DROP TABLE "GdprRequest";
ALTER TABLE "new_GdprRequest" RENAME TO "GdprRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
