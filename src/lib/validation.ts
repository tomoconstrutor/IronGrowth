import type { WorkoutFormPayload } from "../types";

export function validateWorkoutLog(payload: WorkoutFormPayload) {
  const errors: Record<string, string> = {};
  if (payload.status === "completed" && (!payload.actualDurationMin || payload.actualDurationMin <= 0)) {
    errors.actualDurationMin = "ENTER A VALID DURATION.";
  }
  for (const key of ["rpe", "pain", "sleep", "fatigue"] as const) {
    const value = payload[key];
    if (value !== null && (value < 0 || value > 10)) errors[key] = "USE A VALUE BETWEEN 0 AND 10.";
  }
  if (payload.avgHr !== null && payload.maxHr !== null && payload.avgHr > payload.maxHr) {
    errors.maxHr = "MAX HR MUST BE HIGHER THAN AVERAGE HR.";
  }
  return errors;
}
