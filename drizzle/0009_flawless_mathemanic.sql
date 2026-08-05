CREATE TABLE "apex_workout_session_pauses" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionId" text NOT NULL,
	"userId" text NOT NULL,
	"reason" text,
	"note" text,
	"startedAt" timestamp NOT NULL,
	"endedAt" timestamp,
	"durationSeconds" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "apex_workout_sessions" ALTER COLUMN "status" SET DEFAULT 'ready';
--> statement-breakpoint
UPDATE "apex_workout_sessions"
SET "status" = 'ready'
WHERE "status" = 'planned';
--> statement-breakpoint
ALTER TABLE "apex_workout_exercise_results" ADD COLUMN "skipReason" text;--> statement-breakpoint
ALTER TABLE "apex_workout_exercise_results" ADD COLUMN "skipNote" text;--> statement-breakpoint
ALTER TABLE "apex_workout_exercise_results" ADD COLUMN "resolvedAt" timestamp;--> statement-breakpoint
ALTER TABLE "apex_workout_sessions" ADD COLUMN "activeStartedAt" timestamp;--> statement-breakpoint
ALTER TABLE "apex_workout_sessions" ADD COLUMN "pausedAt" timestamp;--> statement-breakpoint
ALTER TABLE "apex_workout_sessions" ADD COLUMN "accumulatedActiveSeconds" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "apex_workout_sessions" ADD COLUMN "totalPausedSeconds" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "apex_workout_sessions" ADD COLUMN "pauseCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "apex_workout_sessions" ADD COLUMN "longestPauseSeconds" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "apex_workout_sessions" ADD COLUMN "completionMode" text;--> statement-breakpoint
ALTER TABLE "apex_workout_sessions" ADD COLUMN "finishReason" text;--> statement-breakpoint
ALTER TABLE "apex_workout_session_pauses" ADD CONSTRAINT "apex_workout_session_pauses_sessionId_apex_workout_sessions_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."apex_workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apex_workout_session_pauses" ADD CONSTRAINT "apex_workout_session_pauses_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "apex_workout_pauses_session_started_idx" ON "apex_workout_session_pauses" USING btree ("sessionId","startedAt");--> statement-breakpoint
CREATE INDEX "apex_workout_pauses_user_started_idx" ON "apex_workout_session_pauses" USING btree ("userId","startedAt");