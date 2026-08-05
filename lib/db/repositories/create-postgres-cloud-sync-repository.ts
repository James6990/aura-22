import {
  createCloudSyncRepository,
} from "@/lib/sync/repository";
import {
  createPostgresCloudSyncStorage,
} from "./create-postgres-cloud-sync-storage";

export function createPostgresCloudSyncRepository() {
  return createCloudSyncRepository(
    createPostgresCloudSyncStorage(),
  );
}
