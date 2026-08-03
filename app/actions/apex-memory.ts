"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { processApexMemories } from "@/lib/memory/process-apex-memories";

export type SyncApexMemoriesResult =
  | {
      success: true;
      processedCandidates: number;
    }
  | {
      success: false;
      error: string;
    };

export async function syncApexMemories(): Promise<SyncApexMemoriesResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      success: false,
      error: "You must be signed in to update your Apex memories.",
    };
  }

  try {
    const result = await processApexMemories(
      session.user.id,
    );

    revalidatePath("/dashboard");

    return {
      success: true,
      processedCandidates:
        result.processedCandidates,
    };
  } catch (error) {
    console.error(
      "Failed to process Apex memories:",
      error,
    );

    return {
      success: false,
      error: "Apex could not update your memories.",
    };
  }
}
