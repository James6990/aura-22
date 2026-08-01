import type { DayData } from "@/lib/aura-data";
export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}



export interface GoalsData {
  g1: string;
  g2: string;
  g3: string;
  weekly?: string[];
  monthly?: string[];
  [key: string]: any;
}

export interface Stats {
  averageLength: number;
  workoutsDone: number;
  mealsDone: number;
  avgSleep: string;
  lastPeriodDate?: string;
  nextPredictedDate?: string;
  [key: string]: any;
}

export type CycleStats = Stats;

const STORAGE_KEYS = {
  JOURNAL: "aura_journal_entries",
  DAYS: "aura_days_data",
  GOALS: "aura_goals_data",
  CYCLE: "aura_cycle_stats",
};

// --- Journal Entries ---
export async function getJournalEntries(): Promise<JournalEntry[]> {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.JOURNAL);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading journal entries:", error);
    return [];
  }
}

export async function getJournalEntryById(id: string): Promise<JournalEntry | null> {
  const entries = await getJournalEntries();
  return entries.find((entry) => entry.id === id) || null;
}

export async function saveJournalEntry(
  entry: Partial<JournalEntry> & { title: string; content: string }
): Promise<JournalEntry> {
  const entries = await getJournalEntries();
  const now = new Date().toISOString();

  if (entry.id) {
    const index = entries.findIndex((e) => e.id === entry.id);
    if (index !== -1) {
      entries[index] = {
        ...entries[index],
        ...entry,
        updatedAt: now,
      };
      localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
      return entries[index];
    }
  }

  const newEntry: JournalEntry = {
    id: entry.id || "journal_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9),
    title: entry.title,
    content: entry.content,
    createdAt: now,
    updatedAt: now,
  };

  entries.unshift(newEntry);
  localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(entries));
  return newEntry;
}

export async function deleteJournalEntry(id: string): Promise<boolean> {
  const entries = await getJournalEntries();
  const filtered = entries.filter((entry) => entry.id !== id);

  if (filtered.length !== entries.length) {
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(filtered));
    return true;
  }
  return false;
}

// --- Day Operations ---
export async function getDay(date: string | number): Promise<DayData | null> {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAYS);
    const store = raw ? JSON.parse(raw) : {};
    return store[String(date)] || null;
  } catch (error) {
    console.error("Error fetching day data:", error);
    return null;
  }
}

export async function saveDay(date: string | number, data: Partial<DayData>): Promise<DayData> {
  if (typeof window === "undefined") return { ...data } as unknown as DayData;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAYS);
    const store = raw ? JSON.parse(raw) : {};
    const updated = { ...store[String(date)], ...data, date: String(date) };
    store[String(date)] = updated;
    localStorage.setItem(STORAGE_KEYS.DAYS, JSON.stringify(store));
    return updated;
  } catch (error) {
    console.error("Error saving day data:", error);
    return { ...data } as unknown as DayData;
  }
}

// --- Goals Operations ---
export async function getGoals(): Promise<GoalsData> {
  if (typeof window === "undefined") return { g1: "", g2: "", g3: "" };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    return raw ? { g1: "", g2: "", g3: "", ...JSON.parse(raw) } : { g1: "", g2: "", g3: "" };
  } catch (error) {
    console.error("Error fetching goals:", error);
    return { g1: "", g2: "", g3: "" };
  }
}

export async function saveGoals(goals: GoalsData): Promise<GoalsData> {
  if (typeof window === "undefined") return goals;
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return goals;
  } catch (error) {
    console.error("Error saving goals:", error);
    return goals;
  }
}

// --- Cycle & Stats Operations ---
export async function getCycleStats(): Promise<Stats> {
  const defaultStats: Stats = {
    averageLength: 28,
    workoutsDone: 0,
    mealsDone: 0,
    avgSleep: "8 hrs",
  };

  if (typeof window === "undefined") return defaultStats;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CYCLE);
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw);
    return { ...defaultStats, ...parsed };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return defaultStats;
  }
}

export async function getStats(): Promise<Stats> {
  return getCycleStats();
}
