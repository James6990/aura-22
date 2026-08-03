CREATE TABLE "apex_memories" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"key" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurredAt" timestamp DEFAULT now() NOT NULL,
	"celebratedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "apex_memories_user_key_unique" UNIQUE("userId","key")
);
--> statement-breakpoint
ALTER TABLE "apex_memories" ADD CONSTRAINT "apex_memories_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;