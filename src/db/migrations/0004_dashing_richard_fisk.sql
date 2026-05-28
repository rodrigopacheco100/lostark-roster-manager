ALTER TABLE "characters" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "rosters" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;