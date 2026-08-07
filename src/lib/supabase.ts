import { createClient, type Session } from "@supabase/supabase-js";
import { raceMilestones, seedWorkouts, trainingPlanSeed } from "../data/seed";
import type { WorkoutLog } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes("YOUR_PROJECT"));
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

const LOCAL_LOGS_KEY = "irongrowth.workout-logs.v1";

export function loadLocalLogs(): WorkoutLog[] {
  try {
    const value = localStorage.getItem(LOCAL_LOGS_KEY);
    return value ? (JSON.parse(value) as WorkoutLog[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalLog(log: WorkoutLog) {
  const logs = loadLocalLogs();
  const next = [...logs.filter((item) => item.sourceKey !== log.sourceKey), log];
  localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(next));
  return next;
}

export async function bootstrapRemotePlan(session: Session) {
  if (!supabase) return;
  const userId = session.user.id;
  const { data: plan, error: planError } = await supabase
    .from("training_plans")
    .upsert(
      {
        user_id: userId,
        slug: trainingPlanSeed.slug,
        name: trainingPlanSeed.name,
        start_date: trainingPlanSeed.startDate,
        end_date: trainingPlanSeed.endDate,
        timezone: trainingPlanSeed.timezone,
        weeks_count: trainingPlanSeed.weeksCount,
        seed_version: trainingPlanSeed.seedVersion,
      },
      { onConflict: "user_id,slug" },
    )
    .select("id")
    .single();
  if (planError) throw planError;

  const { error: workoutError } = await supabase.from("planned_workouts").upsert(
    seedWorkouts.map((workout) => ({
      user_id: userId,
      plan_id: plan.id,
      source_key: workout.sourceKey,
      week_number: workout.weekNumber,
      day_index: workout.dayIndex,
      workout_date: workout.date,
      sport: workout.sport,
      title: workout.title,
      description: workout.description,
      planned_duration_min: workout.plannedDurationMin,
      planned_distance: workout.plannedDistance ?? null,
      distance_unit: workout.distanceUnit ?? null,
      intensity: workout.intensity,
      is_deload: workout.isDeload,
      is_optional: workout.isOptional ?? false,
    })),
    { onConflict: "user_id,source_key" },
  );
  if (workoutError) throw workoutError;

  const { error: milestoneError } = await supabase.from("race_milestones").upsert(
    raceMilestones.map((milestone) => ({
      user_id: userId,
      source_key: milestone.sourceKey,
      name: milestone.name,
      milestone_date: milestone.date,
      distance_label: milestone.distanceLabel,
    })),
    { onConflict: "user_id,source_key" },
  );
  if (milestoneError) throw milestoneError;
}

export async function loadRemoteLogs(userId: string): Promise<WorkoutLog[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("workout_logs").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    workoutId: row.planned_workout_id ?? row.workout_source_key,
    sourceKey: row.workout_source_key,
    status: row.status,
    completedAt: row.completed_at,
    actualDurationMin: row.actual_duration_min,
    actualDistance: row.actual_distance,
    avgHr: row.avg_hr,
    maxHr: row.max_hr,
    elevationM: row.elevation_m,
    cadence: row.cadence,
    carbsPerHour: row.carbs_per_hour,
    fluidsL: row.fluids_l,
    rpe: row.rpe,
    pain: row.pain,
    sleep: row.sleep,
    fatigue: row.fatigue,
    notes: row.notes ?? "",
    technicalNotes: row.technical_notes ?? "",
    exercises: row.exercises ?? "",
    updatedAt: row.updated_at,
  }));
}

export async function saveRemoteLog(userId: string, log: WorkoutLog) {
  if (!supabase) return;
  const { data: workout, error: workoutError } = await supabase
    .from("planned_workouts")
    .select("id")
    .eq("user_id", userId)
    .eq("source_key", log.sourceKey)
    .single();
  if (workoutError) throw workoutError;

  const { error } = await supabase.from("workout_logs").upsert(
    {
      user_id: userId,
      planned_workout_id: workout.id,
      workout_source_key: log.sourceKey,
      status: log.status,
      completed_at: log.completedAt,
      actual_duration_min: log.actualDurationMin,
      actual_distance: log.actualDistance,
      avg_hr: log.avgHr,
      max_hr: log.maxHr,
      elevation_m: log.elevationM,
      cadence: log.cadence,
      carbs_per_hour: log.carbsPerHour,
      fluids_l: log.fluidsL,
      rpe: log.rpe,
      pain: log.pain,
      sleep: log.sleep,
      fatigue: log.fatigue,
      notes: log.notes,
      technical_notes: log.technicalNotes,
      exercises: log.exercises,
      updated_at: log.updatedAt,
    },
    { onConflict: "user_id,workout_source_key" },
  );
  if (error) throw error;
}
