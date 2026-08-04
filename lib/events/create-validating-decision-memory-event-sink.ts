import type {
  DecisionMemoryEventSink,
} from "@/lib/apex-core/create-decision-memory-event-publisher";
import {
  assertValidDecisionMemoryEvent,
} from "@/lib/events/validation/validate-decision-memory-event";

export function createValidatingDecisionMemoryEventSink(
  sink: DecisionMemoryEventSink,
): DecisionMemoryEventSink {
  return {
    async publish(event) {
      assertValidDecisionMemoryEvent(
        event,
      );

      await sink.publish(event);
    },
  };
}
