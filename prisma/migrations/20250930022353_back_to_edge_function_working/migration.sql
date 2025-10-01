/*
  Warnings:

  - You are about to drop the column `normalizedDescription` on the `CategorizationRule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CategorizationRule" DROP CONSTRAINT "CategorizationRule_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_categoryId_fkey";

-- AlterTable
ALTER TABLE "public"."CategorizationRule" DROP COLUMN "normalizedDescription";
