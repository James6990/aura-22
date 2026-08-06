CREATE TABLE "apex_event_analytics_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"windowStartAt" timestamp NOT NULL,
	"windowEndAt" timestamp NOT NULL,
	"generatedAt" timestamp NOT NULL,
	"schemaVersion" integer DEFAULT 1 NOT NULL,
	"snapshot" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "apex_event_analytics_snapshots" ADD CONSTRAINT "apex_event_analytics_snapshots_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "apex_event_analytics_user_window_idx" ON "apex_event_analytics_snapshots" USING btree ("userId","windowStartAt","windowEndAt");--> statement-breakpoint
CREATE INDEX "apex_event_analytics_user_generated_idx" ON "apex_event_analytics_snapshots" USING btree ("userId","generatedAt");--> statement-breakpoint
CREATE INDEX "apex_event_analytics_user_window_generated_idx" ON "apex_event_analytics_snapshots" USING btree ("userId","windowStartAt","windowEndAt","generatedAt");