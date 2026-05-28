ALTER TABLE "raids" DROP CONSTRAINT "raids_name_unique";--> statement-breakpoint
ALTER TABLE "raids" ADD COLUMN "slug" text;--> statement-breakpoint
UPDATE "raids" SET "slug" = regexp_replace(lower(regexp_replace("name", '['']', '', 'g')), '[^a-z0-9]+', '-', 'g');--> statement-breakpoint
ALTER TABLE "raids" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "raid_slug_idx" ON "raids" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "raid_name_idx" ON "raids" USING btree ("name");--> statement-breakpoint
ALTER TABLE "raids" ADD CONSTRAINT "raids_slug_unique" UNIQUE("slug");