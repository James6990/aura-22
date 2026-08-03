import { randomUUID } from "crypto";

import { db } from "@/lib/db";
import {
  apexEvents,
  type ApexEventPayload,
} from "@/lib/db/schema";

export type ApexEventCategory =
  | "profile"
  | "readiness"
  | "workout"
  | "nutrition"
  | "recovery"
  | "accessibility"
  | "progress"
  | "gamification"
  | "system";

export type RecordApexEventInput = {
  userId: string;
  type: string;
  category: ApexEventCategory;
  source?: string;
  payload?: ApexEventPayload;
  occurredAt?: Date;
};

export async function recordApexEvent({
  userId,
  type,
  category,
  source = "apex",
  payload = {},
  occurredAt = new Date(),
}: RecordApexEventInput) {
  await db.insert(apexEvents).values({
    id: randomUUID(),
    userId,
    type,
    category,
    source,
    payload,
    schemaVersion: 1,
    occurredAt,
  });
}
