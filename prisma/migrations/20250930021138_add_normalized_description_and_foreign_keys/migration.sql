/*
  Warnings:

  - The primary key for the `RawTransactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `RawTransactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."CategorizationRule" ADD COLUMN     "normalizedDescription" TEXT;

-- AlterTable
ALTER TABLE "public"."RawTransactions" DROP CONSTRAINT "RawTransactions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "RawTransactions_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "public"."CategorizationRule" ADD CONSTRAINT "CategorizationRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
