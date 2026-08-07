import { describe, expect, it } from "vitest";
import { validateWorkoutLog } from "../src/lib/validation";
import type { WorkoutFormPayload } from "../src/types";

const valid: WorkoutFormPayload = {
  workoutId: "workout",
  sourceKey: "workout",
  status: "completed",
  completedAt: "2026-08-10",
  actualDurationMin: 60,
  actualDistance: 10,
  avgHr: 140,
  maxHr: 170,
  elevationM: 100,
  cadence: 85,
  carbsPerHour: 40,
  fluidsL: 1,
  rpe: 6,
  pain: 1,
  sleep: 8,
  fatigue: 3,
  notes: "",
  technicalNotes: "",
  exercises: "",
};

describe("workout log validation", () => {
  it("accepts a valid session", () => {
    expect(validateWorkoutLog(valid)).toEqual({});
  });

  it("rejects an empty duration and scales outside 0–10", () => {
    const errors = validateWorkoutLog({ ...valid, actualDurationMin: null, pain: 11 });
    expect(errors.actualDurationMin).toBeTruthy();
    expect(errors.pain).toBeTruthy();
  });

  it("rejects average HR above max HR", () => {
    expect(validateWorkoutLog({ ...valid, avgHr: 180, maxHr: 170 }).maxHr).toBeTruthy();
  });
});
