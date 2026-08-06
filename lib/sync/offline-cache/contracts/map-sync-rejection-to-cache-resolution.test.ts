import assert from "node:assert/strict";

import type {
  ApexSyncRejection,
} from "@/lib/sync/contracts";

import {
  mapSyncRejectionToCacheResolution,
} from "./map-sync-rejection-to-cache-resolution";

function createRejection(
  code:
    ApexSyncRejection["code"],
  retryable:
    boolean,
): ApexSyncRejection {
  return {
    envelopeId:
      "envelope-1",

    code,

    message:
      `Rejected with ${code}.`,

    retryable,
  };
}

function run() {
  const detectedAt =
    "2026-08-06T09:50:00.000Z";

  const invalid =
    mapSyncRejectionToCacheResolution({
      rejection:
        createRejection(
          "invalid-envelope",
          true,
        ),

      detectedAt,
    });

  assert.deepEqual(
    invalid,
    {
      status:
        "invalid",

      conflict:
        null,

      retryable:
        false,
    },
  );

  const cases: Array<{
    rejectionCode:
      ApexSyncRejection["code"];

    conflictCode:
      string;

    retryable:
      boolean;
  }> = [
    {
      rejectionCode:
        "unsupported-schema",

      conflictCode:
        "unsupported-schema",

      retryable:
        false,
    },
    {
      rejectionCode:
        "ownership-mismatch",

      conflictCode:
        "ownership-mismatch",

      retryable:
        false,
    },
    {
      rejectionCode:
        "sequence-conflict",

      conflictCode:
        "sequence-conflict",

      retryable:
        true,
    },
    {
      rejectionCode:
        "entity-conflict",

      conflictCode:
        "entity-conflict",

      retryable:
        true,
    },
    {
      rejectionCode:
        "duplicate-envelope",

      conflictCode:
        "remote-divergence",

      retryable:
        false,
    },
  ];

  for (
    const testCase of cases
  ) {
    const resolution =
      mapSyncRejectionToCacheResolution({
        rejection:
          createRejection(
            testCase.rejectionCode,
            testCase.retryable,
          ),

        detectedAt,
      });

    assert.equal(
      resolution.status,
      "conflicted",
    );

    assert.equal(
      resolution.conflict?.code,
      testCase.conflictCode,
    );

    assert.equal(
      resolution.conflict?.detectedAt,
      detectedAt,
    );

    assert.equal(
      resolution.conflict?.relatedEnvelopeId,
      "envelope-1",
    );

    assert.equal(
      resolution.retryable,
      testCase.retryable,
    );

    assert.equal(
      resolution.conflict?.retryable,
      testCase.retryable,
    );
  }

  console.log(
    "Sync rejection to Offline Cache resolution tests passed.",
  );
}

run();
