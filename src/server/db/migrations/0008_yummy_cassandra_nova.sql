CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
DROP TABLE "project_member" CASCADE;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "priority" "priority" DEFAULT 'low' NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "due_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "workspace_member" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;