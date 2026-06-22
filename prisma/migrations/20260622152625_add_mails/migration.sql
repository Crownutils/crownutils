-- CreateTable
CREATE TABLE "Mail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MailRead" (
    "userId" TEXT NOT NULL,
    "mailId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "mailId")
);

-- CreateTable
CREATE TABLE "MailNotice" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "lastNotifiedAt" DATETIME NOT NULL
);
