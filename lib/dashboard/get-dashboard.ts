import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { performanceGenome } from "@/lib/db/schema";

export async function getDashboardData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const genome = await db.query.performanceGenome.findFirst({
    where: eq(
      performanceGenome.userId,
      session.user.id,
    ),
  });

  return {
    user: session.user,
    genome,
  };
}
