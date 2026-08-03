import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { apexMemories } from "@/lib/db/schema";

export async function getApexMemories(
  userId: string,
  limit = 10,
) {
  return db
    .select({
      id: apexMemories.id,
      key: apexMemories.key,
      category: apexMemories.category,
      title: apexMemories.title,
      message: apexMemories.message,
      payload: apexMemories.payload,
      occurredAt: apexMemories.occurredAt,
      celebratedAt: apexMemories.celebratedAt,
    })
    .from(apexMemories)
    .where(eq(apexMemories.userId, userId))
    .orderBy(desc(apexMemories.occurredAt))
    .limit(limit);
}
