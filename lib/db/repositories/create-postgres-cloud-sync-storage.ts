import {
  and,
  asc,
  desc,
  eq,
  inArray,
} from "drizzle-orm";

import {
  db,
} from "@/lib/db";
import {
  apexSyncCheckpoints,
  apexSyncEnvelopes,
} from "@/lib/db/schema";
import type {
  ApexSyncCheckpoint,
  ApexSyncEnvelope,
} from "@/lib/sync/contracts";
import type {
  CloudSyncStorage,
  StoredSyncEnvelope,
} from "@/lib/sync/repository";

function checkpointFromRow(
  row:
    typeof apexSyncCheckpoints
      .$inferSelect,
): ApexSyncCheckpoint {
  return {
    userId:
      row.userId,

    deviceId:
      row.deviceId,

    cursor:
      row.cursor,

    lastUploadedSequence:
      row.lastUploadedSequence,

    lastDownloadedAt:
      row.lastDownloadedAt
        ?.toISOString() ??
      null,

    updatedAt:
      row.updatedAt
        .toISOString(),

    schemaVersion:
      row.schemaVersion,
  };
}

function storedEnvelopeFromRow(
  row:
    typeof apexSyncEnvelopes
      .$inferSelect,
): StoredSyncEnvelope {
  return {
    envelope:
      row.envelope,

    status:
      row.status,

    rejection:
      row.rejection,

    acknowledgedAt:
      row.acknowledgedAt,

    updatedAt:
      row.updatedAt,
  };
}

export function createPostgresCloudSyncStorage():
  CloudSyncStorage {
  return {
    async getCheckpoint({
      userId,
      deviceId,
    }) {
      const rows =
        await db
          .select()
          .from(
            apexSyncCheckpoints,
          )
          .where(
            and(
              eq(
                apexSyncCheckpoints
                  .userId,
                userId,
              ),

              eq(
                apexSyncCheckpoints
                  .deviceId,
                deviceId,
              ),
            ),
          )
          .limit(1);

      return rows[0]
        ? checkpointFromRow(
            rows[0],
          )
        : null;
    },

    async upsertCheckpoint(
      checkpoint,
    ) {
      const rows =
        await db
          .insert(
            apexSyncCheckpoints,
          )
          .values({
            userId:
              checkpoint.userId,

            deviceId:
              checkpoint.deviceId,

            cursor:
              checkpoint.cursor,

            lastUploadedSequence:
              checkpoint
                .lastUploadedSequence,

            lastDownloadedAt:
              checkpoint
                .lastDownloadedAt
                ? new Date(
                    checkpoint
                      .lastDownloadedAt,
                  )
                : null,

            updatedAt:
              new Date(
                checkpoint
                  .updatedAt,
              ),

            schemaVersion:
              checkpoint
                .schemaVersion,
          })
          .onConflictDoUpdate({
            target: [
              apexSyncCheckpoints
                .userId,
              apexSyncCheckpoints
                .deviceId,
            ],

            set: {
              cursor:
                checkpoint.cursor,

              lastUploadedSequence:
                checkpoint
                  .lastUploadedSequence,

              lastDownloadedAt:
                checkpoint
                  .lastDownloadedAt
                  ? new Date(
                      checkpoint
                        .lastDownloadedAt,
                    )
                  : null,

              updatedAt:
                new Date(
                  checkpoint
                    .updatedAt,
                ),

              schemaVersion:
                checkpoint
                  .schemaVersion,
            },
          })
          .returning();

      const row = rows[0];

      if (!row) {
        throw new Error(
          "PostgreSQL did not return the saved Cloud Sync checkpoint.",
        );
      }

      return checkpointFromRow(
        row,
      );
    },

    async getEnvelopeById(
      envelopeId,
    ) {
      const rows =
        await db
          .select()
          .from(
            apexSyncEnvelopes,
          )
          .where(
            eq(
              apexSyncEnvelopes.id,
              envelopeId,
            ),
          )
          .limit(1);

      return rows[0]
        ? storedEnvelopeFromRow(
            rows[0],
          )
        : null;
    },

    async getHighestSequence({
      userId,
      deviceId,
    }) {
      const rows =
        await db
          .select({
            sequence:
              apexSyncEnvelopes
                .sequence,
          })
          .from(
            apexSyncEnvelopes,
          )
          .where(
            and(
              eq(
                apexSyncEnvelopes
                  .userId,
                userId,
              ),

              eq(
                apexSyncEnvelopes
                  .deviceId,
                deviceId,
              ),
            ),
          )
          .orderBy(
            desc(
              apexSyncEnvelopes
                .sequence,
            ),
          )
          .limit(1);

      return (
        rows[0]?.sequence ??
        0
      );
    },

    async insertEnvelope(
      envelope,
    ) {
      const rows =
        await db
          .insert(
            apexSyncEnvelopes,
          )
          .values({
            id:
              envelope.id,

            userId:
              envelope.userId,

            deviceId:
              envelope.deviceId,

            entityType:
              envelope.entityType,

            entityId:
              envelope.entityId,

            operation:
              envelope.operation,

            sequence:
              envelope.sequence,

            envelope,

            schemaVersion:
              envelope.schemaVersion,

            occurredAt:
              new Date(
                envelope.occurredAt,
              ),

            envelopeCreatedAt:
              new Date(
                envelope.createdAt,
              ),

            status:
              "pending",

            rejection: null,

            acknowledgedAt: null,

            updatedAt:
              new Date(),
          })
          .returning();

      const row = rows[0];

      if (!row) {
        throw new Error(
          "PostgreSQL did not return the queued Cloud Sync envelope.",
        );
      }

      return storedEnvelopeFromRow(
        row,
      );
    },

    async listPending({
      userId,
      deviceId,
      limit,
    }) {
      const rows =
        await db
          .select()
          .from(
            apexSyncEnvelopes,
          )
          .where(
            and(
              eq(
                apexSyncEnvelopes
                  .userId,
                userId,
              ),

              eq(
                apexSyncEnvelopes
                  .deviceId,
                deviceId,
              ),

              eq(
                apexSyncEnvelopes
                  .status,
                "pending",
              ),
            ),
          )
          .orderBy(
            asc(
              apexSyncEnvelopes
                .sequence,
            ),
          )
          .limit(limit);

      return rows.map(
        storedEnvelopeFromRow,
      );
    },

    async applyAcknowledgement({
      acknowledgement,
      acknowledgedAt,
    }) {
      await db.transaction(
        async (tx) => {
          if (
            acknowledgement
              .acceptedEnvelopeIds
              .length > 0
          ) {
            await tx
              .update(
                apexSyncEnvelopes,
              )
              .set({
                status:
                  "accepted",

                rejection: null,

                acknowledgedAt,

                updatedAt:
                  acknowledgedAt,
              })
              .where(
                and(
                  eq(
                    apexSyncEnvelopes
                      .userId,
                    acknowledgement
                      .userId,
                  ),

                  eq(
                    apexSyncEnvelopes
                      .deviceId,
                    acknowledgement
                      .deviceId,
                  ),

                  inArray(
                    apexSyncEnvelopes
                      .id,
                    acknowledgement
                      .acceptedEnvelopeIds,
                  ),
                ),
              );
          }

          for (
            const rejection of
            acknowledgement.rejected
          ) {
            await tx
              .update(
                apexSyncEnvelopes,
              )
              .set({
                status:
                  "rejected",

                rejection,

                acknowledgedAt,

                updatedAt:
                  acknowledgedAt,
              })
              .where(
                and(
                  eq(
                    apexSyncEnvelopes
                      .id,
                    rejection
                      .envelopeId,
                  ),

                  eq(
                    apexSyncEnvelopes
                      .userId,
                    acknowledgement
                      .userId,
                  ),

                  eq(
                    apexSyncEnvelopes
                      .deviceId,
                    acknowledgement
                      .deviceId,
                  ),
                ),
              );
          }

          const checkpoint =
            acknowledgement
              .nextCheckpoint;

          await tx
            .insert(
              apexSyncCheckpoints,
            )
            .values({
              userId:
                checkpoint.userId,

              deviceId:
                checkpoint.deviceId,

              cursor:
                checkpoint.cursor,

              lastUploadedSequence:
                checkpoint
                  .lastUploadedSequence,

              lastDownloadedAt:
                checkpoint
                  .lastDownloadedAt
                  ? new Date(
                      checkpoint
                        .lastDownloadedAt,
                    )
                  : null,

              updatedAt:
                new Date(
                  checkpoint
                    .updatedAt,
                ),

              schemaVersion:
                checkpoint
                  .schemaVersion,
            })
            .onConflictDoUpdate({
              target: [
                apexSyncCheckpoints
                  .userId,
                apexSyncCheckpoints
                  .deviceId,
              ],

              set: {
                cursor:
                  checkpoint.cursor,

                lastUploadedSequence:
                  checkpoint
                    .lastUploadedSequence,

                lastDownloadedAt:
                  checkpoint
                    .lastDownloadedAt
                    ? new Date(
                        checkpoint
                          .lastDownloadedAt,
                      )
                    : null,

                updatedAt:
                  new Date(
                    checkpoint
                      .updatedAt,
                  ),

                schemaVersion:
                  checkpoint
                    .schemaVersion,
              },
            });
        },
      );
    },
  };
}
