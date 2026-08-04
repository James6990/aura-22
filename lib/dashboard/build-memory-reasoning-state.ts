import {
  analyseMemoryPatterns,
  type MemoryReasoningProfile,
} from "@/lib/memory/analyse-memory-patterns";
import type {
  DashboardData,
} from "@/lib/dashboard/get-dashboard";
import type {
  PersonalisationState,
} from "@/lib/dashboard/build-personalisation-state";

export type BuildMemoryReasoningStateInput = {
  data: DashboardData;
  personalisation: PersonalisationState;
};

export function buildMemoryReasoningState({
  data,
  personalisation,
}: BuildMemoryReasoningStateInput): MemoryReasoningProfile {
  return analyseMemoryPatterns({
    memories:
      data.apexMemories.map((memory) => ({
        key: memory.key,
        category: memory.category,
        title: memory.title,
        message: memory.message,
        payload: memory.payload,
        occurredAt: memory.occurredAt,
      })),
    personalisation,
  });
}
