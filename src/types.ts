export type Sport = "swim" | "bike" | "run" | "strength";
export type WorkoutStatus = "planned" | "completed" | "skipped";
export type AppView = "today" | "plan" | "register";

export interface TrainingPlan {
  id?: string;
  userId?: string;
  slug: string;
  name: string;
  startDate: string;
  endDate: string;
  timezone: string;
  weeksCount: number;
  seedVersion: number;
}

export interface PlannedWorkout {
  id: string;
  sourceKey: string;
  userId?: string;
  planId?: string;
  weekNumber: number;
  dayIndex: number;
  date: string;
  sport: Sport;
  title: string;
  description: string;
  plannedDurationMin: number;
  plannedDistance?: number;
  distanceUnit?: "m" | "km";
  intensity: string;
  isDeload: boolean;
  isOptional?: boolean;
}

export interface WorkoutLog {
  id?: string;
  userId?: string;
  workoutId: string;
  sourceKey: string;
  status: WorkoutStatus;
  completedAt: string | null;
  actualDurationMin: number | null;
  actualDistance: number | null;
  avgHr: number | null;
  maxHr: number | null;
  elevationM: number | null;
  cadence: number | null;
  carbsPerHour: number | null;
  fluidsL: number | null;
  rpe: number | null;
  pain: number | null;
  sleep: number | null;
  fatigue: number | null;
  notes: string;
  technicalNotes: string;
  exercises: string;
  updatedAt: string;
}

export interface RaceMilestone {
  id?: string;
  userId?: string;
  sourceKey: "ironman-703" | "full-ironman";
  name: string;
  date: string;
  distanceLabel: string;
}

export interface WorkoutFormPayload extends Omit<WorkoutLog, "updatedAt"> {}
