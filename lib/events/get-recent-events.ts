import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { apexEvents } from "@/lib/db/schema";

export async function getRecentEvents(
  userId: string,
  limit = 10,
) {
  return db
    .select({
      id: apexEvents.id,
      type: apexEvents.type,
      category: apexEvents.category,
      source: apexEvents.source,
      payload: apexEvents.payload,
      occurredAt: apexEvents.occurredAt,
    })
    .from(apexEvents)
    .where(eq(apexEvents.userId, userId))
    .orderBy(desc(apexEvents.occurredAt))
    .limit(limit);
}
