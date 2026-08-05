CREATE TABLE "apex_sync_checkpoints" (
	"userId" text NOT NULL,
	"deviceId" text NOT NULL,
	"cursor" text,
	"lastUploadedSequence" integer DEFAULT 0 NOT NULL,
	"lastDownloadedAt" timestamp,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"schemaVersion" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "apex_sync_checkpoints_user_device_pk" PRIMARY KEY("userId","deviceId")
);
--> statement-breakpoint
CREATE TABLE "apex_sync_envelopes" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"deviceId" text NOT NULL,
	"entityType" text NOT NULL,
	"entityId" text NOT NULL,
	"operation" text NOT NULL,
	"sequence" integer NOT NULL,
	"envelope" jsonb NOT NULL,
	"schemaVersion" integer DEFAULT 1 NOT NULL,
	"occurredAt" timestamp NOT NULL,
	"envelopeCreatedAt" timestamp NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"rejection" jsonb,
	"acknowledgedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "apex_sync_envelopes_user_device_sequence_unique" UNIQUE("userId","deviceId","sequence")
);
--> statement-breakpoint
ALTER TABLE "apex_sync_checkpoints" ADD CONSTRAINT "apex_sync_checkpoints_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apex_sync_envelopes" ADD CONSTRAINT "apex_sync_envelopes_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "apex_sync_envelopes_pending_idx" ON "apex_sync_envelopes" USING btree ("userId","deviceId","status","sequence");--> statement-breakpoint
CREATE INDEX "apex_sync_envelopes_entity_idx" ON "apex_sync_envelopes" USING btree ("userId","entityType","entityId");