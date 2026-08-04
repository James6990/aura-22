import {
  decisionMemoryEventCategory,
  decisionMemoryEventSchemaVersion,
  decisionMemoryEventSource,
  getDecisionMemoryEventContract,
  isDecisionMemoryEventType,
  type DecisionMemoryDomainEvent,
  type DecisionMemoryEventPayload,
} from "@/lib/events/contracts";

export type EventValidationIssue = {
  path: string;
  code: string;
  message: string;
};

export type EventValidationResult =
  | {
      valid: true;
      event:
        DecisionMemoryDomainEvent;
      issues: [];
    }
  | {
      valid: false;
      event: null;
      issues:
        EventValidationIssue[];
    };

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isNonEmptyString(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function isNullableString(
  value: unknown,
) {
  return (
    value === null ||
    isNonEmptyString(value)
  );
}

function isFiniteNumber(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function isNonNegativeInteger(
  value: unknown,
): value is number {
  return (
    Number.isInteger(value) &&
    Number(value) >= 0
  );
}

function isPositiveInteger(
  value: unknown,
): value is number {
  return (
    Number.isInteger(value) &&
    Number(value) >= 1
  );
}

function isStringArray(
  value: unknown,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      isNonEmptyString,
    )
  );
}

function addIssue(
  issues: EventValidationIssue[],
  path: string,
  code: string,
  message: string,
) {
  issues.push({
    path,
    code,
    message,
  });
}

function validatePayload(
  payload: unknown,
  issues: EventValidationIssue[],
): payload is DecisionMemoryEventPayload {
  if (!isRecord(payload)) {
    addIssue(
      issues,
      "payload",
      "invalid-type",
      "Event payload must be an object.",
    );

    return false;
  }

  const requiredStrings = [
    "eventId",
    "correlationId",
    "memoryId",
    "decisionId",
    "decisionType",
    "priority",
    "memoryStatus",
    "decisionStatus",
    "reasoningTone",
  ] as const;

  for (
    const field of
    requiredStrings
  ) {
    if (
      !isNonEmptyString(
        payload[field],
      )
    ) {
      addIssue(
        issues,
        `payload.${field}`,
        "required-string",
        `${field} must be a non-empty string.`,
      );
    }
  }

  if (
    !isNullableString(
      payload.causationId,
    )
  ) {
    addIssue(
      issues,
      "payload.causationId",
      "invalid-nullable-string",
      "causationId must be a non-empty string or null.",
    );
  }

  if (
    !isFiniteNumber(
      payload.reasoningConfidence,
    ) ||
    payload.reasoningConfidence < 0 ||
    payload.reasoningConfidence > 100
  ) {
    addIssue(
      issues,
      "payload.reasoningConfidence",
      "invalid-confidence",
      "reasoningConfidence must be between 0 and 100.",
    );
  }

  if (
    typeof payload
      .evidenceSufficient !==
    "boolean"
  ) {
    addIssue(
      issues,
      "payload.evidenceSufficient",
      "invalid-boolean",
      "evidenceSufficient must be a boolean.",
    );
  }

  if (
    typeof payload
      .requiresMoreEvidence !==
    "boolean"
  ) {
    addIssue(
      issues,
      "payload.requiresMoreEvidence",
      "invalid-boolean",
      "requiresMoreEvidence must be a boolean.",
    );
  }

  if (
    !isNullableString(
      payload.outcomeStatus,
    )
  ) {
    addIssue(
      issues,
      "payload.outcomeStatus",
      "invalid-nullable-string",
      "outcomeStatus must be a non-empty string or null.",
    );
  }

  if (
    !isNullableString(
      payload.reflectionOutcome,
    )
  ) {
    addIssue(
      issues,
      "payload.reflectionOutcome",
      "invalid-nullable-string",
      "reflectionOutcome must be a non-empty string or null.",
    );
  }

  if (
    !isStringArray(
      payload.learningEntryIds,
    )
  ) {
    addIssue(
      issues,
      "payload.learningEntryIds",
      "invalid-string-array",
      "learningEntryIds must contain only non-empty strings.",
    );
  }

  if (
    !isNonNegativeInteger(
      payload.learningCount,
    )
  ) {
    addIssue(
      issues,
      "payload.learningCount",
      "invalid-count",
      "learningCount must be a non-negative integer.",
    );
  }

  if (
    !isPositiveInteger(
      payload.memorySchemaVersion,
    )
  ) {
    addIssue(
      issues,
      "payload.memorySchemaVersion",
      "invalid-schema-version",
      "memorySchemaVersion must be a positive integer.",
    );
  }

  if (
    isStringArray(
      payload.learningEntryIds,
    ) &&
    isNonNegativeInteger(
      payload.learningCount,
    )
  ) {
    if (
      payload.learningEntryIds
        .length !==
      payload.learningCount
    ) {
      addIssue(
        issues,
        "payload.learningCount",
        "learning-count-mismatch",
        "learningCount must equal the number of learningEntryIds.",
      );
    }

    if (
      new Set(
        payload.learningEntryIds,
      ).size !==
      payload.learningEntryIds
        .length
    ) {
      addIssue(
        issues,
        "payload.learningEntryIds",
        "duplicate-learning-id",
        "learningEntryIds must not contain duplicates.",
      );
    }
  }

  return issues.length === 0;
}

function validateLifecycleRules({
  type,
  payload,
  issues,
}: {
  type: string;
  payload:
    DecisionMemoryEventPayload;
  issues:
    EventValidationIssue[];
}) {
  switch (type) {
    case "decision-memory.created": {
      if (
        payload.outcomeStatus !==
        null
      ) {
        addIssue(
          issues,
          "payload.outcomeStatus",
          "unexpected-outcome",
          "Created events must not contain an outcome.",
        );
      }

      if (
        payload.reflectionOutcome !==
        null
      ) {
        addIssue(
          issues,
          "payload.reflectionOutcome",
          "unexpected-reflection",
          "Created events must not contain a reflection.",
        );
      }

      if (
        payload.learningCount !== 0
      ) {
        addIssue(
          issues,
          "payload.learningCount",
          "unexpected-learning",
          "Created events must not contain learning entries.",
        );
      }

      break;
    }

    case "decision-memory.outcome-recorded": {
      if (
        payload.outcomeStatus ===
        null
      ) {
        addIssue(
          issues,
          "payload.outcomeStatus",
          "missing-outcome",
          "Outcome-recorded events require an outcome status.",
        );
      }

      break;
    }

    case "decision-memory.reflection-recorded": {
      if (
        payload.reflectionOutcome ===
        null
      ) {
        addIssue(
          issues,
          "payload.reflectionOutcome",
          "missing-reflection",
          "Reflection-recorded events require a reflection outcome.",
        );
      }

      break;
    }

    case "decision-memory.learning-created": {
      if (
        payload.learningCount < 1
      ) {
        addIssue(
          issues,
          "payload.learningCount",
          "missing-learning",
          "Learning-created events require at least one learning entry.",
        );
      }

      break;
    }

    case "decision-memory.closed": {
      if (
        payload.memoryStatus !==
        "closed"
      ) {
        addIssue(
          issues,
          "payload.memoryStatus",
          "memory-not-closed",
          "Closed events require memoryStatus to be closed.",
        );
      }

      break;
    }
  }
}

export function validateDecisionMemoryEvent(
  value: unknown,
): EventValidationResult {
  const issues:
    EventValidationIssue[] = [];

  if (!isRecord(value)) {
    return {
      valid: false,
      event: null,
      issues: [
        {
          path: "$",
          code:
            "invalid-event",
          message:
            "Decision Memory event must be an object.",
        },
      ],
    };
  }

  if (
    !isNonEmptyString(
      value.userId,
    )
  ) {
    addIssue(
      issues,
      "userId",
      "required-string",
      "userId must be a non-empty string.",
    );
  }

  if (
    !isNonEmptyString(
      value.type,
    )
  ) {
    addIssue(
      issues,
      "type",
      "required-string",
      "type must be a non-empty string.",
    );
  } else if (
    !isDecisionMemoryEventType(
      value.type,
    )
  ) {
    addIssue(
      issues,
      "type",
      "unsupported-event-type",
      "Event type is not registered as a Decision Memory event.",
    );
  }

  if (
    value.category !==
    decisionMemoryEventCategory
  ) {
    addIssue(
      issues,
      "category",
      "invalid-category",
      `Decision Memory events must use category "${decisionMemoryEventCategory}".`,
    );
  }

  if (
    value.source !==
    decisionMemoryEventSource
  ) {
    addIssue(
      issues,
      "source",
      "invalid-source",
      `Decision Memory events must use source "${decisionMemoryEventSource}".`,
    );
  }

  if (
    value.schemaVersion !==
    decisionMemoryEventSchemaVersion
  ) {
    addIssue(
      issues,
      "schemaVersion",
      "unsupported-schema-version",
      `Decision Memory events must use schema version ${decisionMemoryEventSchemaVersion}.`,
    );
  }

  if (
    !(value.occurredAt instanceof Date) ||
    Number.isNaN(
      value.occurredAt.getTime(),
    )
  ) {
    addIssue(
      issues,
      "occurredAt",
      "invalid-date",
      "occurredAt must be a valid Date.",
    );
  }

  const candidatePayload =
    value.payload;

  const payloadValid =
    validatePayload(
      candidatePayload,
      issues,
    );

  if (
    payloadValid &&
    isNonEmptyString(value.type) &&
    isDecisionMemoryEventType(
      value.type,
    )
  ) {
    const contract =
      getDecisionMemoryEventContract(
        value.type,
      );

    if (
      contract.category !==
      value.category ||
      contract.source !==
      value.source ||
      contract.schemaVersion !==
      value.schemaVersion
    ) {
      addIssue(
        issues,
        "$",
        "contract-mismatch",
        "Event metadata does not match its registered contract.",
      );
    }

    validateLifecycleRules({
      type: value.type,
      payload:
        candidatePayload,
      issues,
    });
  }

  if (issues.length > 0) {
    return {
      valid: false,
      event: null,
      issues,
    };
  }

  return {
    valid: true,
    event:
      value as
        DecisionMemoryDomainEvent,
    issues: [],
  };
}

export function assertValidDecisionMemoryEvent(
  value: unknown,
): asserts value is DecisionMemoryDomainEvent {
  const result =
    validateDecisionMemoryEvent(
      value,
    );

  if (!result.valid) {
    const detail =
      result.issues
        .map(
          (issue) =>
            `${issue.path}: ${issue.message}`,
        )
        .join("; ");

    throw new Error(
      `Invalid Decision Memory event: ${detail}`,
    );
  }
}
