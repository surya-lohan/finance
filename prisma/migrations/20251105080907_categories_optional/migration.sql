-- DropForeignKey
ALTER TABLE "public"."Transactions" DROP CONSTRAINT "Transactions_categoriesId_fkey";

-- AlterTable
ALTER TABLE "Transactions" ALTER COLUMN "categoriesId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_categoriesId_fkey" FOREIGN KEY ("categoriesId") REFERENCES "Categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
