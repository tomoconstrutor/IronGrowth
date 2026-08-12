export interface DailyWorkoutUpdate {
  type: string;
  title: string;
  durationMin?: number | null;
  distance?: number | null;
  distanceUnit?: "m" | "km" | null;
  calories?: number | null;
  avgHr?: number | null;
  rpe?: number | null;
  source?: string;
  notes?: string;
}

export interface DailyUpdate {
  date: string;
  status: "draft" | "published";
  calories?: number | null;
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
