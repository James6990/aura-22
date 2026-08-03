CREATE TABLE "apex_events" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"source" text DEFAULT 'apex' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"schemaVersion" integer DEFAULT 1 NOT NULL,
	"occurredAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "apex_events" ADD CONSTRAINT "apex_events_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;