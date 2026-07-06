-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "pseudoId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "rank" TEXT NOT NULL DEFAULT 'normal'
);
INSERT INTO "new_User" ("language", "pseudoId", "userId") SELECT "language", "pseudoId", "userId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_pseudoId_key" ON "User"("pseudoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
