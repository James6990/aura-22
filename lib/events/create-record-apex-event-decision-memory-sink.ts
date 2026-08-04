import type {
  DecisionMemoryEventSink,
} from "@/lib/apex-core/create-decision-memory-event-publisher";
import {
  assertValidDecisionMemoryEvent,
} from "@/lib/events/validation/validate-decision-memory-event";
import {
  recordApexEvent,
} from "./record-apex-event";

export function createRecordApexEventDecisionMemorySink():
  DecisionMemoryEventSink {
  return {
    async publish(event) {
      assertValidDecisionMemoryEvent(
        event,
      );

      await recordApexEvent({
        userId:
          event.userId,

        type:
          event.type,

        category:
          event.category,

        source:
          event.source,

        payload: {
          ...event.payload,
        },

        occurredAt:
          event.occurredAt,
      });
    },
  };
}
