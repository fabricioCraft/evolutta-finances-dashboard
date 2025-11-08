-- Create belvo_links table per Prisma model BelvoLink
CREATE TABLE "public"."belvo_links" (
  "id" TEXT NOT NULL,
  "user_id" UUID NOT NULL,
  "belvo_link_id" TEXT NOT NULL,
  "institution" TEXT NOT NULL,
  "access_mode" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'valid',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "belvo_links_pkey" PRIMARY KEY ("id")
);

-- Unique constraint for belvo_link_id
CREATE UNIQUE INDEX "belvo_links_belvo_link_id_key" ON "public"."belvo_links"("belvo_link_id");

-- Foreign key to User(id) with cascading deletes/updates
ALTER TABLE "public"."belvo_links" ADD CONSTRAINT "belvo_links_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;