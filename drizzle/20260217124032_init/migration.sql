CREATE TABLE "credential" (
	"id" text PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"public_key" bytea NOT NULL,
	"counter" integer NOT NULL,
	"transports" text
);
--> statement-breakpoint
CREATE TABLE "file" (
	"hash" text PRIMARY KEY,
	"path" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"file_hash" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"dirty" boolean DEFAULT true NOT NULL,
	"published_at" timestamp,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "media_tag" (
	"media_id" uuid,
	"tag_id" uuid,
	CONSTRAINT "media_tag_pkey" PRIMARY KEY("media_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY,
	"watermark_file_hash" text,
	"watermark_position" text DEFAULT 'bottom-right' NOT NULL,
	"watermark_opacity" real DEFAULT 0.5 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"name" text NOT NULL,
	"color" text
);
--> statement-breakpoint
CREATE TABLE "tag_content" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"tag_id" uuid NOT NULL,
	"title" text,
	"slug" text NOT NULL,
	"description" text,
	"dirty" boolean DEFAULT true NOT NULL,
	"published_at" timestamp,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "media_file_hash_draft" ON "media" ("file_hash") WHERE published_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "media_slug_draft" ON "media" ("slug") WHERE published_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "tag_content_tag_id_draft" ON "tag_content" ("tag_id") WHERE published_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "tag_content_slug_draft" ON "tag_content" ("slug") WHERE published_at IS NULL;--> statement-breakpoint
ALTER TABLE "credential" ADD CONSTRAINT "credential_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_file_hash_file_hash_fkey" FOREIGN KEY ("file_hash") REFERENCES "file"("hash");--> statement-breakpoint
ALTER TABLE "media_tag" ADD CONSTRAINT "media_tag_media_id_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id");--> statement-breakpoint
ALTER TABLE "media_tag" ADD CONSTRAINT "media_tag_tag_id_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id");--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_watermark_file_hash_file_hash_fkey" FOREIGN KEY ("watermark_file_hash") REFERENCES "file"("hash");--> statement-breakpoint
ALTER TABLE "tag_content" ADD CONSTRAINT "tag_content_tag_id_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE;