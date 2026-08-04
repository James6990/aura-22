export type EvidenceStrength =
  | "strong"
  | "moderate"
  | "limited"
  | "personal-trend";

export type EvidenceCategory =
  | "recovery"
  | "progression"
  | "training-load"
  | "accessibility"
  | "nutrition"
  | "body-composition"
  | "general-safety";

export type EvidenceRule = {
  id: string;
  version: string;
  title: string;
  category: EvidenceCategory;
  strength: EvidenceStrength;
  summary: string;
  applicablePopulation: string[];
  limitations: string[];
  sourceLabel: string;
  publishedAt: string | null;
  reviewAfter: string | null;
};

const rules: EvidenceRule[] = [
  {
    id: "recovery-respect-current-signals",
    version: "1.0.0",
    title: "Respect current recovery signals",
    category: "recovery",
    strength: "strong",
    summary:
      "Current readiness, discomfort and recovery signals should be considered before prescribing demanding training.",
    applicablePopulation: [
      "general-adult-fitness",
    ],
    limitations: [
      "This is general fitness guidance and does not diagnose medical conditions.",
    ],
    sourceLabel:
      "Apex curated professional guidance",
    publishedAt: null,
    reviewAfter: null,
  },
  {
    id: "progression-require-repeatable-performance",
    version: "1.0.0",
    title: "Progress after repeatable performance",
    category: "progression",
    strength: "moderate",
    summary:
      "Load progression should follow repeatable successful performance rather than one isolated result.",
    applicablePopulation: [
      "general-resistance-training",
    ],
    limitations: [
      "Individual exercise tolerance and technique remain overriding considerations.",
    ],
    sourceLabel:
      "Apex curated professional guidance",
    publishedAt: null,
    reviewAfter: null,
  },
  {
    id: "safety-discomfort-overrides-progression",
    version: "1.0.0",
    title: "Discomfort overrides progression",
    category: "general-safety",
    strength: "strong",
    summary:
      "Meaningful discomfort should prevent automatic progression and trigger review or substitution.",
    applicablePopulation: [
      "general-adult-fitness",
    ],
    limitations: [
      "Persistent, severe or unexplained symptoms require qualified professional assessment.",
    ],
    sourceLabel:
      "Apex safety policy",
    publishedAt: null,
    reviewAfter: null,
  },
];

const rulesById = new Map(
  rules.map((rule) => [rule.id, rule]),
);

export function getEvidenceRule(
  id: string,
): EvidenceRule | null {
  return rulesById.get(id) ?? null;
}

export function listEvidenceRules() {
  return [...rules];
}

export const evidenceRegistryVersion =
  "apex-evidence-v1";
