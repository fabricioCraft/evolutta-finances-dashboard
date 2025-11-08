-- Migration: Convert public."User" id to UUID safely and add email
-- Strategy: introduce uuid columns, backfill via join, swap/rename, then recreate FKs.

-- 0) Ensure uuid generation function is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Drop FKs that reference User.id so we can change types safely
ALTER TABLE "public"."Category" DROP CONSTRAINT IF EXISTS "Category_userId_fkey";
ALTER TABLE "public"."Transaction" DROP CONSTRAINT IF EXISTS "Transaction_userId_fkey";
ALTER TABLE "public"."RawTransactions" DROP CONSTRAINT IF EXISTS "RawTransactions_userId_fkey";

-- 2) Add temporary uuid PK column on User and backfill from existing id
ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "id_uuid" uuid;
UPDATE "public"."User"
  SET "id_uuid" = CASE
    WHEN "id" ~* '^[0-9a-fA-F-]{36}$' THEN "id"::uuid
    ELSE gen_random_uuid()
  END;
ALTER TABLE "public"."User" ALTER COLUMN "id_uuid" SET NOT NULL;

-- 3) Add uuid columns to child tables and backfill using join to User(id)
-- Category
ALTER TABLE "public"."Category" ADD COLUMN IF NOT EXISTS "userId_new" uuid;
UPDATE "public"."Category" c
  SET "userId_new" = u."id_uuid"
  FROM "public"."User" u
  WHERE c."userId" = u."id";
ALTER TABLE "public"."Category" DROP COLUMN IF EXISTS "userId";
ALTER TABLE "public"."Category" RENAME COLUMN "userId_new" TO "userId";

-- Transaction
ALTER TABLE "public"."Transaction" ADD COLUMN IF NOT EXISTS "userId_new" uuid;
UPDATE "public"."Transaction" t
  SET "userId_new" = u."id_uuid"
  FROM "public"."User" u
  WHERE t."userId" = u."id";
ALTER TABLE "public"."Transaction" DROP COLUMN IF EXISTS "userId";
ALTER TABLE "public"."Transaction" RENAME COLUMN "userId_new" TO "userId";

-- RawTransactions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'RawTransactions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE "public"."RawTransactions" ADD COLUMN IF NOT EXISTS "user_id_new" uuid;
    UPDATE "public"."RawTransactions" r
      SET "user_id_new" = u."id_uuid"
      FROM "public"."User" u
      WHERE r."user_id" = u."id";
    ALTER TABLE "public"."RawTransactions" DROP COLUMN IF EXISTS "user_id";
    ALTER TABLE "public"."RawTransactions" RENAME COLUMN "user_id_new" TO "user_id";
  ELSE
    ALTER TABLE "public"."RawTransactions" ADD COLUMN IF NOT EXISTS "user_id" uuid;
  END IF;
END $$;

-- 4) Swap User.id to uuid primary key
ALTER TABLE "public"."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE "public"."User" DROP COLUMN IF EXISTS "id";
ALTER TABLE "public"."User" RENAME COLUMN "id_uuid" TO "id";
ALTER TABLE "public"."User" ADD PRIMARY KEY ("id");

-- 5) Add optional email column and unique index
ALTER TABLE "public"."User" ADD COLUMN IF NOT EXISTS "email" text;
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "public"."User"("email");

-- 6) Recreate FKs for Category and Transaction (RawTransactions FK will be handled later)
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;