CREATE TABLE "apex_workout_exercise_results" (
	"id" text PRIMARY KEY NOT NULL,
	"sessionId" text NOT NULL,
	"userId" text NOT NULL,
	"exerciseId" text NOT NULL,
	"exerciseName" text NOT NULL,
	"orderIndex" integer NOT NULL,
	"plannedSets" integer NOT NULL,
	"completedSets" integer DEFAULT 0 NOT NULL,
	"targetReps" text NOT NULL,
	"loadKg" numeric(7, 2),
	"completedReps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rpe" integer,
	"discomfortLevel" integer,
	"techniqueConfidence" integer,
	"completionStatus" text DEFAULT 'not-started' NOT NULL,
	"progressionDecision" text,
	"recommendedNextLoadKg" numeric(7, 2),
	"notes" text DEFAULT '' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apex_workout_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"date" text NOT NULL,
	"title" text NOT NULL,
	"intensity" text NOT NULL,
	"plannedDurationMinutes" integer,
	"actualDurationMinutes" integer,
	"status" text DEFAULT 'planned' NOT NULL,
	"sessionRpe" integer,
	"notes" text DEFAULT '' NOT NULL,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "apex_workout_exercise_results" ADD CONSTRAINT "apex_workout_exercise_results_sessionId_apex_workout_sessions_id_fk" FOREIGN KEY ("sessionId") REFERENCES "public"."apex_workout_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apex_workout_exercise_results" ADD CONSTRAINT "apex_workout_exercise_results_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apex_workout_sessions" ADD CONSTRAINT "apex_workout_sessions_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;