CREATE TABLE "apex_daily_check_ins" (
	"userId" text NOT NULL,
	"date" text NOT NULL,
	"energy" integer NOT NULL,
	"workoutCompleted" boolean DEFAULT false NOT NULL,
	"recoveryCompleted" boolean DEFAULT false NOT NULL,
	"hydrationTargetReached" boolean DEFAULT false NOT NULL,
	"readinessScore" integer NOT NULL,
	"readinessLevel" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "apex_daily_check_ins_user_date_unique" UNIQUE("userId","date")
);
--> statement-breakpoint
ALTER TABLE "apex_daily_check_ins" ADD CONSTRAINT "apex_daily_check_ins_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;