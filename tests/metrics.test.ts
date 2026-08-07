import { describe, expect, it } from "vitest";
import { calculatePace, calculateSpeed, calculateSwimPace, completionRate } from "../src/lib/metrics";
import { seedWorkouts } from "../src/data/seed";
import type { WorkoutLog } from "../src/types";

describe("training metrics", () => {
  it("calculates running pace", () => {
    expect(calculatePace(10, 50)).toBe("5:00/KM");
  });

  it("calcula velocidade de bike", () => {
    expect(calculateSpeed(40, 80)).toBe("30.0 KM/H");
  });

  it("calculates swim pace", () => {
    expect(calculateSwimPace(1500, 30)).toBe("2:00/100M");
  });

  it("ignores optional sessions in the completion rate", () => {
    const week = seedWorkouts.filter((workout) => workout.weekNumber === 1);
    const first = week.find((workout) => !workout.isOptional)!;
    const log: WorkoutLog = {
      workoutId: first.id,
      sourceKey: first.sourceKey,
      status: "completed",
      completedAt: first.date,
      actualDurationMin: first.plannedDurationMin,
      actualDistance: null,
      avgHr: null,
      maxHr: null,
      elevationM: null,
      cadence: null,
      carbsPerHour: null,
      fluidsL: null,
      rpe: 6,
      pain: 0,
      sleep: 8,
      fatigue: 3,
      notes: "",
      technicalNotes: "",
      exercises: "",
      updatedAt: new Date().toISOString(),
    };
    expect(completionRate(week, [log])).toBe(8);
  });
});
