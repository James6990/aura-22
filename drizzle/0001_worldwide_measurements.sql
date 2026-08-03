ALTER TABLE "apex_performance_genome" ALTER COLUMN "heightCm" SET DATA TYPE numeric(6, 2);--> statement-breakpoint
ALTER TABLE "apex_performance_genome" ALTER COLUMN "weightKg" SET DATA TYPE numeric(6, 2);--> statement-breakpoint
ALTER TABLE "apex_performance_genome" ADD COLUMN "unitSystem" text DEFAULT 'metric' NOT NULL;