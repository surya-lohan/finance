-- CreateTable
CREATE TABLE "Accounts" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Accounts_id_key" ON "Accounts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Accounts_userId_key" ON "Accounts"("userId");
