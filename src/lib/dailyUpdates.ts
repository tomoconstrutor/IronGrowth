import type { PlannedWorkout, Sport, WorkoutLog } from "../types";

export interface DailyWorkoutUpdate {
  type: Sport;
  title: string;
  durationMin?: number | null;
  distance?: number | null;
  distanceUnit?: "m" | "km" | null;
  avgHr?: number | null;
  rpe?: number | null;
  source?: string;
  notes?: string;
}

export interface DailyUpdate {
  date: string;
  status: "draft" | "published";
  caloriesTarget?: number | null;
  bodyWeightKg?: number | null;
  workouts: DailyWorkoutUpdate[];
  notes?: string;
}

export async function loadDailyUpdates(): Promise<DailyUpdate[]> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/daily-updates.json`, { cache: "no-store" });
    if (!response.ok) return [];
    return (await response.json()) as DailyUpdate[];
  } catch {
    return [];
  }
}

export function dailyUpdatesToLogs(updates: DailyUpdate[], workouts: PlannedWorkout[]): WorkoutLog[] {
  return updates.flatMap((update) => {
    const used = new Set<string>();
    return update.workouts.flatMap((item) => {
      const workout = workouts.find((candidate) => (
        candidate.date === update.date &&
        candidate.sport === item.type &&
        !used.has(candidate.sourceKey)
      ));
      if (!workout) return [];
      used.add(workout.sourceKey);
      return [{
        workoutId: workout.id,
        sourceKey: workout.sourceKey,
        status: "completed" as const,
        completedAt: update.date,
        actualDurationMin: item.durationMin ?? workout.plannedDurationMin,
        actualDistance: item.distance ?? workout.plannedDistance ?? null,
        avgHr: item.avgHr ?? null,
        maxHr: null,
        elevationM: null,
        cadence: null,
        carbsPerHour: null,
        fluidsL: null,
        rpe: item.rpe ?? null,
        pain: null,
        sleep: null,
        fatigue: null,
        notes: item.notes ?? item.title,
        technicalNotes: "",
        exercises: "",
        updatedAt: new Date(`${update.date}T12:00:00Z`).toISOString(),
      } satisfies WorkoutLog];
    });
  });
}
