-- Create accounts table and wire relations to belvo_links, RawTransactions, and Transaction

-- 1) Create accounts table
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

-- Unique index on belvo_account_id
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_belvo_account_id_key" ON "public"."accounts"("belvo_account_id");

-- Ensure belvo_link_id has the correct type in existing tables
ALTER TABLE "public"."accounts" ALTER COLUMN "belvo_link_id" TYPE uuid USING "belvo_link_id"::uuid;

-- FK: accounts -> belvo_links(id)
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_belvo_link_id_fkey"
  FOREIGN KEY ("belvo_link_id") REFERENCES "public"."belvo_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2) Transaction.account_id column and FK -> accounts(id)
ALTER TABLE "public"."Transaction" ADD COLUMN IF NOT EXISTS "account_id" TEXT;
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE NOT VALID;

-- 3) RawTransactions.account_id FK -> accounts(id)
-- Column is expected to already exist as TEXT; add FK
ALTER TABLE "public"."RawTransactions" ADD CONSTRAINT "RawTransactions_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE NOT VALID;

-- Note: NOT VALID defers validation for existing rows. New inserts/updates will be checked.