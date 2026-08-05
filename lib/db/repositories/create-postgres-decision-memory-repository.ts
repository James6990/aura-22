import {
  createDecisionMemoryRepository,
} from "./create-decision-memory-repository";
import {
  createPostgresDecisionMemoryStorage,
} from "./create-postgres-decision-memory-storage";

export function createPostgresDecisionMemoryRepository() {
  return createDecisionMemoryRepository(
    createPostgresDecisionMemoryStorage(),
  );
}
