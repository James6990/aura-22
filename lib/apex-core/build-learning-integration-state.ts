import type {
  KnowledgeRelationship,
} from "./create-knowledge-relationship";
import type {
  LearningDomain,
  LearningLedgerEntry,
} from "./create-learning-ledger-entry";

export type IntegratedLearningDomain = {
  domain: LearningDomain;
  learnings: LearningLedgerEntry[];
  averageConfidence: number;
};

export type LearningIntegrationState = {
  activeLearnings: LearningLedgerEntry[];
  activeRelationships: KnowledgeRelationship[];

  domains: IntegratedLearningDomain[];

  strongestDomain: LearningDomain | null;
  weakestDomain: LearningDomain | null;

  evidenceSourceIds: string[];

  confidence: number;
  summary: string;
};

export type BuildLearningIntegrationStateInput = {
  learnings: LearningLedgerEntry[];
  relationships: KnowledgeRelationship[];
};

function average(
  values: number[],
) {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (total, value) =>
        total + value,
      0,
    ) / values.length
  );
}

function isActiveLearning(
  learning: LearningLedgerEntry,
) {
  return (
    learning.canInfluenceDecision &&
    (
      learning.status === "provisional" ||
      learning.status === "validated"
    )
  );
}

function isActiveRelationship(
  relationship: KnowledgeRelationship,
  activeLearningIds: Set<string>,
) {
  return (
    relationship.canInfluenceDecision &&
    (
      relationship.status === "provisional" ||
      relationship.status === "validated"
    ) &&
    activeLearningIds.has(
      relationship.sourceLearningId,
    ) &&
    activeLearningIds.has(
      relationship.targetLearningId,
    )
  );
}

export function buildLearningIntegrationState({
  learnings,
  relationships,
}: BuildLearningIntegrationStateInput): LearningIntegrationState {
  const activeLearnings =
    learnings
      .filter(isActiveLearning)
      .sort(
        (a, b) =>
          b.confidence - a.confidence ||
          a.key.localeCompare(b.key),
      );

  const activeLearningIds =
    new Set(
      activeLearnings.map(
        (learning) => learning.id,
      ),
    );

  const activeRelationships =
    relationships
      .filter(
        (relationship) =>
          isActiveRelationship(
            relationship,
            activeLearningIds,
          ),
      )
      .sort(
        (a, b) =>
          b.confidence - a.confidence ||
          a.id.localeCompare(b.id),
      );

  const groupedByDomain =
    new Map<
      LearningDomain,
      LearningLedgerEntry[]
    >();

  for (const learning of activeLearnings) {
    const existing =
      groupedByDomain.get(
        learning.domain,
      ) ?? [];

    existing.push(learning);

    groupedByDomain.set(
      learning.domain,
      existing,
    );
  }

  const domains =
    [...groupedByDomain.entries()]
      .map(
        ([domain, domainLearnings]) => ({
          domain,
          learnings:
            domainLearnings,
          averageConfidence:
            Math.round(
              average(
                domainLearnings.map(
                  (learning) =>
                    learning.confidence,
                ),
              ),
            ),
        }),
      )
      .sort(
        (a, b) =>
          b.averageConfidence -
            a.averageConfidence ||
          a.domain.localeCompare(
            b.domain,
          ),
      );

  const evidenceSourceIds =
    [
      ...new Set(
        activeLearnings.flatMap(
          (learning) =>
            learning.sources.map(
              (source) =>
                source.sourceId,
            ),
        ),
      ),
    ];

  const confidence =
    activeLearnings.length === 0
      ? 0
      : Math.round(
          average(
            activeLearnings.map(
              (learning) =>
                learning.confidence,
            ),
          ),
        );

  return {
    activeLearnings,
    activeRelationships,
    domains,

    strongestDomain:
      domains[0]?.domain ?? null,

    weakestDomain:
      domains.length > 0
        ? domains[
            domains.length - 1
          ]?.domain ?? null
        : null,

    evidenceSourceIds,

    confidence,

    summary:
      activeLearnings.length === 0
        ? "Apex does not yet have validated personal learning available for decisions."
        : `Apex has ${activeLearnings.length} active learning conclusion${
            activeLearnings.length === 1
              ? ""
              : "s"
          } across ${domains.length} coaching domain${
            domains.length === 1
              ? ""
              : "s"
          }.`,
  };
}
