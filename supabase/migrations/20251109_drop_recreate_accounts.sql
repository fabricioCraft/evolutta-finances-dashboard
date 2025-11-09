-- Drop & Recreate public.accounts with the exact same schema and constraints
-- Source: prisma/migrations/20251108000305_create-accounts-and-relations/migration.sql
-- This script safely drops FKs, drops the table, and recreates it with indices and FKs.

BEGIN;

-- 1) Drop foreign keys that reference public.accounts
ALTER TABLE IF EXISTS "public"."Transaction" DROP CONSTRAINT IF EXISTS "Transaction_account_id_fkey";
ALTER TABLE IF EXISTS "public"."RawTransactions" DROP CONSTRAINT IF EXISTS "RawTransactions_account_id_fkey";

-- 2) Drop accounts table (cascade to remove any dependent objects)
DROP TABLE IF EXISTS "public"."accounts" CASCADE;

-- 3) Recreate accounts table with the original schema
CREATE TABLE IF NOT EXISTS "public"."accounts" (
  "id" TEXT NOT NULL,
  "belvo_account_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "balance" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL,
  "belvo_link_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- 4) Unique index on belvo_account_id
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_belvo_account_id_key"
  ON "public"."accounts"("belvo_account_id");

-- 5) Foreign key to belvo_links(id)
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_belvo_link_id_fkey"
  FOREIGN KEY ("belvo_link_id") REFERENCES "public"."belvo_links"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- 6) Re-add FKs from Transaction and RawTransactions to accounts(id)
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id")
  ON DELETE SET NULL ON UPDATE CASCADE NOT VALID;

ALTER TABLE "public"."RawTransactions" ADD CONSTRAINT "RawTransactions_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id")
  ON DELETE SET NULL ON UPDATE CASCADE NOT VALID;

COMMIT;