-- Add nullable first so we can backfill existing rows
ALTER TABLE "media" ADD COLUMN "draft_id" uuid;--> statement-breakpoint

-- Backfill drafts: draftId = own id
UPDATE "media" SET "draft_id" = "id" WHERE "published_at" IS NULL;--> statement-breakpoint

-- Backfill published snapshots: link via fileHash to the existing draft
UPDATE "media" p
SET "draft_id" = d."id"
FROM "media" d
WHERE d."file_hash" = p."file_hash"
  AND d."published_at" IS NULL
  AND p."published_at" IS NOT NULL;--> statement-breakpoint

-- Enforce NOT NULL
ALTER TABLE "media" ALTER COLUMN "draft_id" SET NOT NULL;--> statement-breakpoint

-- Add FK constraint
ALTER TABLE "media" ADD CONSTRAINT "media_draft_id_media_id_fkey" FOREIGN KEY ("draft_id") REFERENCES "media"("id");
