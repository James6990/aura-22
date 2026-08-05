CREATE TABLE "apex_decision_memories" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"decisionId" text NOT NULL,
	"status" text NOT NULL,
	"snapshot" jsonb NOT NULL,
	"schemaVersion" integer DEFAULT 1 NOT NULL,
	"openedAt" timestamp NOT NULL,
	"lastUpdatedAt" timestamp NOT NULL,
	"closedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "apex_decision_memories_user_decision_unique" UNIQUE("userId","decisionId")
);
--> statement-breakpoint
ALTER TABLE "apex_decision_memories" ADD CONSTRAINT "apex_decision_memories_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "apex_decision_memories_user_status_idx" ON "apex_decision_memories" USING btree ("userId","status");--> statement-breakpoint
CREATE INDEX "apex_decision_memories_user_updated_idx" ON "apex_decision_memories" USING btree ("userId","lastUpdatedAt");