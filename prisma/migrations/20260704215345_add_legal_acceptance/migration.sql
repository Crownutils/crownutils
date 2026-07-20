-- CreateTable
CREATE TABLE "LegalAcceptance" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "acceptedVersion" TEXT NOT NULL,
    "acceptedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
