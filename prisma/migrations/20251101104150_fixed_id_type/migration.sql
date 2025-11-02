/*
  Warnings:

  - The primary key for the `Accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Accounts" DROP CONSTRAINT "Accounts_pkey",
ADD COLUMN     "plaidId" TEXT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Accounts_pkey" PRIMARY KEY ("id");
