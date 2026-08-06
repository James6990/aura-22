import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  unique,
  index,
  primaryKey,
} from "drizzle-orm/pg-core"
import type { Exercise } from "@/lib/aura-data"
import type {
  SerializedDecisionMemorySnapshot,
} from "@/lib/db/repositories/decision-memory-snapshot"
import type {
  ApexSyncEnvelope,
  ApexSyncRejection,
} from "@/lib/sync/contracts"
import type {
  DecisionMemoryEventAnalyticsSnapshot,
} from "@/lib/analytics/events/contracts"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})


// --- APEX PERFORMANCE GENOME -----------------------------------------------

// One current Performance Genome profile per authenticated user.
export const performanceGenome = pgTable("apex_performance_genome", {
  userId: text("userId")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),

  preferredName: text("preferredName").notNull(),

  age: integer("age"),
  heightCm: numeric("heightCm", {
    precision: 6,
    scale: 2,
    mode: "number",
  }),

  weightKg: numeric("weightKg", {
    precision: 6,
    scale: 2,
    mode: "number",
  }),

  unitSystem: text("unitSystem", {
    enum: ["metric", "imperial"],
  })
    .notNull()
    .default("metric"),

  primaryGoal: text("primaryGoal"),
  experienceLevel: text("experienceLevel"),

  /*
   * Legacy broad equipment values used by the current
   * workout engine. Retained during the migration.
   */
  equipment: jsonb("equipment")
    .$type<string[]>()
    .notNull()
    .default([]),

  trainingEnvironment: text("trainingEnvironment", {
    enum: [
      "commercial-gym",
      "home-gym",
      "outdoors",
      "bodyweight-only",
      "mixed",
    ],
  })
    .notNull()
    .default("bodyweight-only"),

  equipmentInventory: jsonb("equipmentInventory")
    .$type<string[]>()
    .notNull()
    .default([]),

  dietaryPreference: text("dietaryPreference")
    .notNull()
    .default("standard"),

  allergiesAndAvoidances: text("allergiesAndAvoidances")
    .notNull()
    .default(""),

  coachStyle: text("coachStyle")
    .notNull()
    .default("encouraging"),

  focusMode: boolean("focusMode")
    .notNull()
    .default(false),

  highContrast: boolean("highContrast")
    .notNull()
    .default(false),

  reducedMotion: boolean("reducedMotion")
    .notNull()
    .default(false),

  largerText: boolean("largerText")
    .notNull()
    .default(false),

  onboardingCompleted: boolean("onboardingCompleted")
    .notNull()
    .default(false),

  genomeVersion: integer("genomeVersion")
    .notNull()
    .default(1),

  createdAt: timestamp("createdAt")
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow(),
});


// One daily readiness check-in per user and calendar date.
export const dailyCheckIns = pgTable(
  "apex_daily_check_ins",
  {
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    date: text("date").notNull(),

    energy: integer("energy").notNull(),
    workoutCompleted: boolean("workoutCompleted")
      .notNull()
      .default(false),
    recoveryCompleted: boolean("recoveryCompleted")
      .notNull()
      .default(false),
    hydrationTargetReached: boolean("hydrationTargetReached")
      .notNull()
      .default(false),

    readinessScore: integer("readinessScore").notNull(),
    readinessLevel: text("readinessLevel").notNull(),

    createdAt: timestamp("createdAt")
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt")
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userDateUnique: unique(
      "apex_daily_check_ins_user_date_unique",
    ).on(table.userId, table.date),
  }),
);


// --- APEX EVENT ENGINE -----------------------------------------------------

export type ApexEventPayload = Record<
  string,
  string | number | boolean | null | string[] | number[]
>;

// Permanent timeline of meaningful user activity.
// Future workout, nutrition, recovery, accessibility and gamification
// systems can all publish events here.
export const apexEvents = pgTable("apex_events", {
  id: text("id").primaryKey(),

  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  type: text("type").notNull(),

  category: text("category", {
    enum: [
      "profile",
      "readiness",
      "workout",
      "nutrition",
      "recovery",
      "accessibility",
      "progress",
      "gamification",
      "system",
    ],
  }).notNull(),

  source: text("source").notNull().default("apex"),

  payload: jsonb("payload")
    .$type<ApexEventPayload>()
    .notNull()
    .default({}),

  schemaVersion: integer("schemaVersion")
    .notNull()
    .default(1),

  occurredAt: timestamp("occurredAt")
    .notNull()
    .defaultNow(),

  createdAt: timestamp("createdAt")
    .notNull()
    .defaultNow(),
});


// --- APEX WORKOUT PERFORMANCE ---------------------------------------------

export const workoutSessions = pgTable("apex_workout_sessions", {
  id: text("id").primaryKey(),

  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  date: text("date").notNull(),
  title: text("title").notNull(),
  intensity: text("intensity").notNull(),

  plannedDurationMinutes: integer(
    "plannedDurationMinutes",
  ),

  actualDurationMinutes: integer(
    "actualDurationMinutes",
  ),

  status: text("status", {
    enum: [
      "ready",
      "in-progress",
      "paused",
      "ready-to-complete",
      "completed",
      "skipped",
    ],
  })
    .notNull()
    .default("ready"),

  sessionRpe: integer("sessionRpe"),
  notes: text("notes").notNull().default(""),

  startedAt: timestamp("startedAt"),

  activeStartedAt: timestamp(
    "activeStartedAt",
  ),

  pausedAt: timestamp("pausedAt"),

  accumulatedActiveSeconds: integer(
    "accumulatedActiveSeconds",
  )
    .notNull()
    .default(0),

  totalPausedSeconds: integer(
    "totalPausedSeconds",
  )
    .notNull()
    .default(0),

  pauseCount: integer("pauseCount")
    .notNull()
    .default(0),

  longestPauseSeconds: integer(
    "longestPauseSeconds",
  )
    .notNull()
    .default(0),

  completionMode: text(
    "completionMode",
    {
      enum: ["normal", "early"],
    },
  ),

  finishReason: text("finishReason"),

  completedAt: timestamp("completedAt"),

  createdAt: timestamp("createdAt")
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updatedAt")
    .notNull()
    .defaultNow(),
});

export const workoutExerciseResults = pgTable(
  "apex_workout_exercise_results",
  {
    id: text("id").primaryKey(),

    sessionId: text("sessionId")
      .notNull()
      .references(() => workoutSessions.id, {
        onDelete: "cascade",
      }),

    userId: text("userId")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    exerciseId: text("exerciseId").notNull(),
    exerciseName: text("exerciseName").notNull(),

    orderIndex: integer("orderIndex").notNull(),

    plannedSets: integer("plannedSets").notNull(),
    completedSets: integer("completedSets")
      .notNull()
      .default(0),

    targetReps: text("targetReps").notNull(),

    loadKg: numeric("loadKg", {
      precision: 7,
      scale: 2,
      mode: "number",
    }),

    completedReps: jsonb("completedReps")
      .$type<number[]>()
      .notNull()
      .default([]),

    rpe: integer("rpe"),
    discomfortLevel: integer("discomfortLevel"),

    techniqueConfidence: integer(
      "techniqueConfidence",
    ),

    completionStatus: text("completionStatus", {
      enum: ["not-started", "partial", "completed", "skipped"],
    })
      .notNull()
      .default("not-started"),

    progressionDecision: text("progressionDecision", {
      enum: ["increase", "maintain", "reduce", "review"],
    }),

    recommendedNextLoadKg: numeric(
      "recommendedNextLoadKg",
      {
        precision: 7,
        scale: 2,
        mode: "number",
      },
    ),

    notes: text("notes").notNull().default(""),

    skipReason: text("skipReason", {
      enum: [
        "equipment-unavailable",
        "discomfort",
        "time-limit",
        "accessibility",
        "substituted",
        "personal-choice",
        "other",
      ],
    }),

    skipNote: text("skipNote"),

    resolvedAt: timestamp("resolvedAt"),

    createdAt: timestamp("createdAt")
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updatedAt")
      .notNull()
      .defaultNow(),
  },
);





// Durable history for each workout pause.
// Aggregate timing remains on the session for fast reads.
export const workoutSessionPauses = pgTable(
  "apex_workout_session_pauses",
  {
    id: text("id").primaryKey(),

    sessionId: text("sessionId")
      .notNull()
      .references(
        () => workoutSessions.id,
        {
          onDelete: "cascade",
        },
      ),

    userId: text("userId")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    reason: text("reason", {
      enum: [
        "rest",
        "interruption",
        "equipment-wait",
        "discomfort-check",
        "accessibility",
        "other",
      ],
    }),

    note: text("note"),

    startedAt: timestamp("startedAt")
      .notNull(),

    endedAt: timestamp("endedAt"),

    durationSeconds: integer(
      "durationSeconds",
    ),

    createdAt: timestamp("createdAt")
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updatedAt")
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index(
      "apex_workout_pauses_session_started_idx",
    ).on(
      table.sessionId,
      table.startedAt,
    ),

    index(
      "apex_workout_pauses_user_started_idx",
    ).on(
      table.userId,
      table.startedAt,
    ),
  ],
);

// --- APEX CLOUD SYNC -------------------------------------------------------

// One durable synchronization checkpoint per user and device.
export const apexSyncCheckpoints = pgTable(
  "apex_sync_checkpoints",
  {
    userId: text("userId")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    deviceId: text("deviceId")
      .notNull(),

    cursor: text("cursor"),

    lastUploadedSequence: integer(
      "lastUploadedSequence",
    )
      .notNull()
      .default(0),

    lastDownloadedAt: timestamp(
      "lastDownloadedAt",
    ),

    updatedAt: timestamp("updatedAt")
      .notNull()
      .defaultNow(),

    schemaVersion: integer(
      "schemaVersion",
    )
      .notNull()
      .default(1),
  },
  (table) => [
    primaryKey({
      name:
        "apex_sync_checkpoints_user_device_pk",
      columns: [
        table.userId,
        table.deviceId,
      ],
    }),
  ],
);

// Persistent outbound envelopes for offline and retry-safe synchronization.
export const apexSyncEnvelopes = pgTable(
  "apex_sync_envelopes",
  {
    id: text("id").primaryKey(),

    userId: text("userId")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    deviceId: text("deviceId")
      .notNull(),

    entityType: text("entityType", {
      enum: [
        "decision-memory-event",
        "decision-memory-snapshot",
      ],
    }).notNull(),

    entityId: text("entityId")
      .notNull(),

    operation: text("operation", {
      enum: [
        "append",
        "upsert",
      ],
    }).notNull(),

    sequence: integer("sequence")
      .notNull(),

    envelope: jsonb("envelope")
      .$type<ApexSyncEnvelope>()
      .notNull(),

    schemaVersion: integer(
      "schemaVersion",
    )
      .notNull()
      .default(1),

    occurredAt: timestamp("occurredAt")
      .notNull(),

    envelopeCreatedAt: timestamp(
      "envelopeCreatedAt",
    )
      .notNull(),

    status: text("status", {
      enum: [
        "pending",
        "accepted",
        "rejected",
      ],
    })
      .notNull()
      .default("pending"),

    rejection: jsonb("rejection")
      .$type<ApexSyncRejection | null>(),

    acknowledgedAt: timestamp(
      "acknowledgedAt",
    ),

    createdAt: timestamp("createdAt")
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updatedAt")
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique(
      "apex_sync_envelopes_user_device_sequence_unique",
    ).on(
      table.userId,
      table.deviceId,
      table.sequence,
    ),

    index(
      "apex_sync_envelopes_pending_idx",
    ).on(
      table.userId,
      table.deviceId,
      table.status,
      table.sequence,
    ),

    index(
      "apex_sync_envelopes_entity_idx",
    ).on(
      table.userId,
      table.entityType,
      table.entityId,
    ),
  ],
);

// --- APEX DECISION MEMORY PERSISTENCE --------------------------------------

// Complete, versioned Decision Memory snapshots for fast and reliable reads.
// The immutable lifecycle history remains in `apex_events`.
export const apexDecisionMemories = pgTable(
  "apex_decision_memories",
  {
    id: text("id").primaryKey(),

    userId: text("userId")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    decisionId: text("decisionId")
      .notNull(),

    status: text("status", {
      enum: [
        "awaiting-response",
        "awaiting-outcome",
        "ready-for-reflection",
        "reflected",
        "learning-created",
        "closed",
      ],
    }).notNull(),

    snapshot: jsonb("snapshot")
      .$type<SerializedDecisionMemorySnapshot>()
      .notNull(),

    schemaVersion: integer("schemaVersion")
      .notNull()
      .default(1),

    openedAt: timestamp("openedAt")
      .notNull(),

    lastUpdatedAt: timestamp("lastUpdatedAt")
      .notNull(),

    closedAt: timestamp("closedAt"),

    createdAt: timestamp("createdAt")
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updatedAt")
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique(
      "apex_decision_memories_user_decision_unique",
    ).on(
      table.userId,
      table.decisionId,
    ),

    index(
      "apex_decision_memories_user_status_idx",
    ).on(
      table.userId,
      table.status,
    ),

    index(
      "apex_decision_memories_user_updated_idx",
    ).on(
      table.userId,
      table.lastUpdatedAt,
    ),
  ],
);

// --- APEX EVENT ANALYTICS PERSISTENCE --------------------------------------

// Immutable, versioned analytics snapshots generated from event evidence.
// Source events remain authoritative and snapshots can be regenerated.
export const apexEventAnalyticsSnapshots = pgTable(
  "apex_event_analytics_snapshots",
  {
    id: text("id").primaryKey(),

    userId: text("userId")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    windowStartAt: timestamp(
      "windowStartAt",
    ).notNull(),

    windowEndAt: timestamp(
      "windowEndAt",
    ).notNull(),

    generatedAt: timestamp(
      "generatedAt",
    ).notNull(),

    schemaVersion: integer(
      "schemaVersion",
    )
      .notNull()
      .default(1),

    snapshot: jsonb("snapshot")
      .$type<
        DecisionMemoryEventAnalyticsSnapshot
      >()
      .notNull(),

    createdAt: timestamp("createdAt")
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updatedAt")
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index(
      "apex_event_analytics_user_window_idx",
    ).on(
      table.userId,
      table.windowStartAt,
      table.windowEndAt,
    ),

    index(
      "apex_event_analytics_user_generated_idx",
    ).on(
      table.userId,
      table.generatedAt,
    ),

    index(
      "apex_event_analytics_user_window_generated_idx",
    ).on(
      table.userId,
      table.windowStartAt,
      table.windowEndAt,
      table.generatedAt,
    ),
  ],
);

// --- APEX MEMORY ENGINE -----------------------------------------------------

export const apexMemories = pgTable(
  "apex_memories",
  {
    id: text("id").primaryKey(),

    userId: text("userId")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    key: text("key").notNull(),

    category: text("category", {
      enum: [
        "first",
        "workout",
        "progress",
        "consistency",
        "genome",
        "wellbeing",
        "nutrition",
        "community",
        "anniversary",
      ],
    }).notNull(),

    title: text("title").notNull(),
    message: text("message").notNull(),

    payload: jsonb("payload")
      .$type<Record<
        string,
        string | number | boolean | null
      >>()
      .notNull()
      .default({}),

    occurredAt: timestamp("occurredAt")
      .notNull()
      .defaultNow(),

    celebratedAt: timestamp("celebratedAt"),

    createdAt: timestamp("createdAt")
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("apex_memories_user_key_unique").on(
      table.userId,
      table.key,
    ),
  ],
);

// --- AURA 22 app tables ----------------------------------------------------
// Scoped per user via a plain `userId` column (no FK, per stack conventions).

// One row per user holding their three 22-day cycle goals.
export const goals = pgTable("aura_goals", {
  userId: text("userId").primaryKey(),
  g1: text("g1").notNull().default(""),
  g2: text("g2").notNull().default(""),
  g3: text("g3").notNull().default(""),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// One row per (user, day) holding that day's journal entry.
export const dayEntries = pgTable(
  "aura_day_entries",
  {
    userId: text("userId").notNull(),
    day: integer("day").notNull(),
    meals: boolean("meals").notNull().default(false),
    workout: boolean("workout").notNull().default(false),
    water: boolean("water").notNull().default(false),
    recovery: boolean("recovery").notNull().default(false),
    energy: text("energy").notNull().default("7"),
    sleep: text("sleep").notNull().default(""),
    notes: text("notes").notNull().default(""),
    exercises: jsonb("exercises").$type<Exercise[]>().notNull().default([]),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => ({
    userDayUnique: unique("aura_day_entries_user_day_unique").on(t.userId, t.day),
  }),
)
