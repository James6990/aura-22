export const TOTAL_DAYS = 22

export type Exercise = {
  name: string
  sets: string
  reps: string
  weight: string
}

export type DayData = {
  meals: boolean
  workout: boolean
  water: boolean
  recovery: boolean
  energy: string
  sleep: string
  notes: string
  exercises: Exercise[]
}

export type Goals = {
  g1: string
  g2: string
  g3: string
}

export const ENERGY_OPTIONS = [
  { value: '10', label: 'Peak Energy (10/10)' },
  { value: '7', label: 'Moderate Energy (7/10)' },
  { value: '4', label: 'Low Energy (4/10)' },
  { value: '2', label: 'Night Shift / Rest (2/10)' },
]

export function emptyDay(): DayData {
  return {
    meals: false,
    workout: false,
    water: false,
    recovery: false,
    energy: '7',
    sleep: '',
    notes: '',
    exercises: [],
  }
}

// Rotating 3-day training split used as defaults for each day
export const WORKOUT_PRESETS: Record<number, Exercise[]> = {
  1: [
    { name: 'Dumbbell Bench Press', sets: '3', reps: '8-10', weight: '20' },
    { name: 'Standing Cable Chest Flyes', sets: '3', reps: '12', weight: '15' },
    { name: 'Seated Dumbbell Shoulder Press', sets: '3', reps: '10', weight: '16' },
  ],
  2: [
    { name: 'Dumbbell Goblet Squats', sets: '4', reps: '10', weight: '24' },
    { name: 'Cable Bicep Curls', sets: '3', reps: '10-12', weight: '18' },
    { name: 'Tricep Rope Extensions', sets: '3', reps: '12', weight: '20' },
  ],
  3: [
    { name: 'Incline Dumbbell Bench Press', sets: '3', reps: '10', weight: '22' },
    { name: 'Cable Lateral Raises', sets: '4', reps: '12-15', weight: '10' },
    { name: 'Tricep Rope Pushdowns', sets: '3', reps: '12', weight: '22' },
  ],
}

export function presetForDay(day: number): Exercise[] {
  const key = ((day - 1) % 3) + 1
  return (WORKOUT_PRESETS[key] ?? WORKOUT_PRESETS[1]).map((e) => ({ ...e }))
}

export const GROCERY_STAPLES = [
  'Eggs (3 dozen)',
  'Turkey mince & lean beef mince',
  'White fish & salmon fillets',
  'Broccoli, cabbage, courgettes, spinach',
  'Sweet potatoes & buckwheat flakes',
  'Raw walnuts, almonds & cashew butter',
  'Apples, pears & fresh raspberries',
]

export type ReadinessCoaching = {
  tone: 'rest' | 'low' | 'peak'
  title: string
  body: string
}

export function coachingForEnergy(energy: string): ReadinessCoaching {
  const value = Number(energy)
  if (value <= 3) {
    return {
      tone: 'rest',
      title: 'Night Shift / Rest Mode',
      body: 'High fatigue detected. Skip heavy lifting today. Substitute with a 20 minute walk or light mobility work.',
    }
  }
  if (value <= 6) {
    return {
      tone: 'low',
      title: 'Low Energy Mode',
      body: 'Perform 2 sets per exercise instead of 3–4. Focus on crisp form and avoid lifting to complete failure.',
    }
  }
  return {
    tone: 'peak',
    title: 'Peak Readiness',
    body: 'Perform the full program. Attempt a +1–2.5 kg weight increase on your top set.',
  }
}

export type HeartZone = {
  key: 'idle' | 'warmup' | 'hypertrophy' | 'peak'
  label: string
}

export function zoneForBpm(bpm: number | null): HeartZone {
  if (bpm === null) return { key: 'idle', label: 'Device Idle' }
  if (bpm < 120) return { key: 'warmup', label: 'Zone 2 · Warmup / Active Recovery' }
  if (bpm <= 155) return { key: 'hypertrophy', label: 'Zone 3/4 · Hypertrophy & Growth' }
  return { key: 'peak', label: 'Zone 5 · Peak Cardio Threshold' }
}
