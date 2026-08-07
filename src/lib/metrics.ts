import type { PlannedWorkout, WorkoutLog } from "../types";

export function calculatePace(distanceKm: number | null, durationMin: number | null) {
  if (!distanceKm || !durationMin || distanceKm <= 0 || durationMin <= 0) return null;
  const totalSeconds = Math.round((durationMin * 60) / distanceKm);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}/KM`;
}

export function calculateSwimPace(distanceM: number | null, durationMin: number | null) {
  if (!distanceM || !durationMin || distanceM <= 0 || durationMin <= 0) return null;
  const totalSeconds = Math.round((durationMin * 60) / (distanceM / 100));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}/100M`;
}

export function calculateSpeed(distanceKm: number | null, durationMin: number | null) {
  if (!distanceKm || !durationMin || distanceKm <= 0 || durationMin <= 0) return null;
  return `${(distanceKm / (durationMin / 60)).toFixed(1)} KM/H`;
}

export function completionRate(workouts: PlannedWorkout[], logs: WorkoutLog[]) {
  const relevant = workouts.filter((workout) => !workout.isOptional);
  if (!relevant.length) return 0;
  const completed = relevant.filter((workout) => logs.some((log) => log.sourceKey === workout.sourceKey && log.status === "completed")).length;
  return Math.round((completed / relevant.length) * 100);
}

export function totalsBySport(workouts: PlannedWorkout[], logs: WorkoutLog[]) {
  return (["swim", "bike", "run", "strength"] as const).map((sport) => {
    const sportWorkouts = workouts.filter((workout) => workout.sport === sport);
    const sportLogs = logs.filter((log) => sportWorkouts.some((workout) => workout.sourceKey === log.sourceKey) && log.status === "completed");
    return {
      sport,
      plannedMinutes: sportWorkouts.reduce((total, workout) => total + workout.plannedDurationMin, 0),
      actualMinutes: sportLogs.reduce((total, log) => total + (log.actualDurationMin ?? 0), 0),
      completed: sportLogs.length,
    };
  });
}
