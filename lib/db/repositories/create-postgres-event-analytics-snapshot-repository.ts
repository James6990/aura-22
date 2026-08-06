import {
  createEventAnalyticsSnapshotRepository,
} from "@/lib/analytics/events/repository";

import {
  createPostgresEventAnalyticsSnapshotStorage,
} from "./create-postgres-event-analytics-snapshot-storage";

export function createPostgresEventAnalyticsSnapshotRepository() {
  return createEventAnalyticsSnapshotRepository(
    createPostgresEventAnalyticsSnapshotStorage(),
  );
}
