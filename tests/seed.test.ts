import { describe, expect, it } from "vitest";
import { seedWorkouts, weekLabels } from "../src/data/seed";

describe("12-week seed", () => {
  it("generates 13 sessions per week with unique keys", () => {
    expect(seedWorkouts).toHaveLength(156);
    expect(new Set(seedWorkouts.map((workout) => workout.sourceKey)).size).toBe(seedWorkouts.length);
    expect(seedWorkouts[0].sourceKey).toBe("w01-d0-strength-calistenia-a-bulletproofing");
  });

  it("marks weeks 4, 8 and 12 as recovery weeks", () => {
    expect(weekLabels.filter((week) => week.isDeload).map((week) => week.weekNumber)).toEqual([4, 8, 12]);
    expect(seedWorkouts.filter((workout) => workout.isDeload).every((workout) => [4, 8, 12].includes(workout.weekNumber))).toBe(true);
  });

  it("starts on 10 August and ends on 1 November", () => {
    expect(seedWorkouts[0].date).toBe("2026-08-10");
    expect(seedWorkouts.at(-1)?.date).toBe("2026-11-01");
  });
});
