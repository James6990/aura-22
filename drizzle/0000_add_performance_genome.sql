CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aura_day_entries" (
	"userId" text NOT NULL,
	"day" integer NOT NULL,
	"meals" boolean DEFAULT false NOT NULL,
	"workout" boolean DEFAULT false NOT NULL,
	"water" boolean DEFAULT false NOT NULL,
	"recovery" boolean DEFAULT false NOT NULL,
	"energy" text DEFAULT '7' NOT NULL,
	"sleep" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"exercises" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "aura_day_entries_user_day_unique" UNIQUE("userId","day")
);
--> statement-breakpoint
CREATE TABLE "aura_goals" (
	"userId" text PRIMARY KEY NOT NULL,
	"g1" text DEFAULT '' NOT NULL,
	"g2" text DEFAULT '' NOT NULL,
	"g3" text DEFAULT '' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apex_performance_genome" (
	"userId" text PRIMARY KEY NOT NULL,
	"preferredName" text NOT NULL,
	"age" integer,
	"heightCm" integer,
	"weightKg" integer,
	"primaryGoal" text,
	"experienceLevel" text,
	"equipment" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dietaryPreference" text DEFAULT 'standard' NOT NULL,
	"allergiesAndAvoidances" text DEFAULT '' NOT NULL,
	"coachStyle" text DEFAULT 'encouraging' NOT NULL,
	"focusMode" boolean DEFAULT false NOT NULL,
	"highContrast" boolean DEFAULT false NOT NULL,
	"reducedMotion" boolean DEFAULT false NOT NULL,
	"largerText" boolean DEFAULT false NOT NULL,
	"onboardingCompleted" boolean DEFAULT false NOT NULL,
	"genomeVersion" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apex_performance_genome" ADD CONSTRAINT "apex_performance_genome_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;