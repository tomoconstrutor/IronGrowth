import type { PlannedWorkout, RaceMilestone, TrainingPlan } from "../types";
import { assetUrl } from "../lib/assets";

export const PLAN_START_DATE = "2026-08-10";
export const SEED_VERSION = 1;

export const trainingPlanSeed: TrainingPlan = {
  slug: "ironman-base-12w-2026",
  name: "Ironman Base — 12 weeks",
  startDate: PLAN_START_DATE,
  endDate: "2026-11-01",
  timezone: "Europe/Lisbon",
  weeksCount: 12,
  seedVersion: SEED_VERSION,
};

export const raceMilestones: RaceMilestone[] = [
  {
    sourceKey: "ironman-703",
    name: "Ironman 70.3",
    date: "2027-04-03",
    distanceLabel: "1.9 / 90 / 21.1",
  },
  {
    sourceKey: "full-ironman",
    name: "Full Ironman",
    date: "2027-08-10",
    distanceLabel: "3.8 / 180 / 42.2",
  },
];

const weekTypes = [
  "BASE",
  "BUILD",
  "BUILD",
  "RECOVERY",
  "BASE 2",
  "BUILD",
  "BUILD",
  "RECOVERY",
  "BASE 3",
  "BUILD",
  "BUILD",
  "RECOVERY / TESTS",
];

export const weekVolumeLabels = [
  "8–9 h",
  "8.5–9.5 h",
  "9–10 h",
  "6.5–7.5 h",
  "9–10 h",
  "9.5–10.5 h",
  "10–11 h",
  "7–8 h",
  "10–11 h",
  "10.5–11.5 h",
  "11–12 h",
  "7.5–8.5 h",
];

export const weekLabels = weekTypes.map((type, index) => ({
  weekNumber: index + 1,
  type,
  volume: weekVolumeLabels[index],
  isDeload: [4, 8, 12].includes(index + 1),
}));

const runTuesday = [30, 35, 35, 30, 40, 40, 45, 30, 45, 45, 50, 35];
const runThursday = [35, 35, 40, 30, 40, 40, 40, 30, 45, 45, 45, 30];
const runBrick = [15, 15, 20, 10, 20, 25, 25, 15, 30, 30, 35, 15];
const runLong = [50, 55, 60, 45, 60, 65, 70, 50, 75, 80, 85, 60];
const bikeZ2 = [90, 90, 100, 75, 90, 100, 110, 75, 100, 110, 120, 90];
const bikeIntensity = [60, 60, 60, 45, 60, 70, 70, 50, 70, 75, 75, 60];
const bikeLong = [150, 150, 180, 120, 180, 195, 210, 135, 210, 225, 240, 150];
const swimTechnique = [1600, 1600, 1800, 1500, 1800, 2000, 2000, 1700, 2100, 2200, 2300, 1900];
const swimEndurance = [1900, 2000, 2200, 1700, 2200, 2400, 2500, 2000, 2600, 2700, 3000, 2200];
const strengthMain = [65, 70, 75, 50, 75, 80, 85, 55, 85, 90, 95, 60];

const intensitySeries = [
  "4 × 5 min Z3",
  "5 × 5 min Z3",
  "4 × 6 min Z3",
  "Easy Z2, no intensity",
  "5 × 6 min Z3",
  "4 × 8 min Z3",
  "5 × 8 min Z3",
  "Easy Z2, no intensity",
  "3 × 10 min Z3",
  "4 × 10 min Z3",
  "2 × 15 min Z3",
  "Easy Z2, no hard intensity",
];

const addDays = (date: string, days: number) => {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

// Source slugs stay stable so existing local and remote logs survive copy changes.
type WorkoutInput = Omit<PlannedWorkout, "id" | "sourceKey" | "weekNumber" | "date" | "isDeload"> & { sourceSlug: string };

const createWorkout = (weekIndex: number, input: WorkoutInput): PlannedWorkout => {
  const weekNumber = weekIndex + 1;
  const { sourceSlug, ...workout } = input;
  const sourceKey = `w${String(weekNumber).padStart(2, "0")}-d${input.dayIndex}-${input.sport}-${sourceSlug}`;

  return {
    ...workout,
    id: sourceKey,
    sourceKey,
    weekNumber,
    date: addDays(PLAN_START_DATE, weekIndex * 7 + input.dayIndex),
    isDeload: [4, 8, 12].includes(weekNumber),
  };
};

export const seedWorkouts: PlannedWorkout[] = Array.from({ length: 12 }, (_, weekIndex) => {
  const deload = [3, 7, 11].includes(weekIndex);
  const strengthDescription = deload
    ? "Reduce volume by 30–40%. Keep moving without chasing progression."
    : "Pull-ups, dips, Bulgarian split squats, goblet squats, calf raises and hollow body. Finish with 2–3 reps in reserve.";

  return [
    createWorkout(weekIndex, {
      dayIndex: 0,
      sport: "strength",
      sourceSlug: "calistenia-a-bulletproofing",
      title: "Calisthenics A + bulletproofing",
      description: strengthDescription,
      plannedDurationMin: strengthMain[weekIndex],
      intensity: "RPE 6–7",
    }),
    createWorkout(weekIndex, {
      dayIndex: 1,
      sport: "swim",
      sourceSlug: "natacao-tecnica",
      title: "Swim technique",
      description: "300 m warm-up, 50 m technique drills, a progressive main set and 100–200 m easy cool-down.",
      plannedDurationMin: Math.round(swimTechnique[weekIndex] / 35),
      plannedDistance: swimTechnique[weekIndex],
      distanceUnit: "m",
      intensity: "Easy / moderate",
    }),
    createWorkout(weekIndex, {
      dayIndex: 1,
      sport: "run",
      sourceSlug: "corrida-facil",
      title: "Easy run",
      description: weekIndex === 2 ? "Z2 or below. Finish with 6 controlled strides." : "Z2 or below. Finish fresh; run for 8 min and walk for 1 min if needed.",
      plannedDurationMin: runTuesday[weekIndex],
      intensity: weekIndex === 9 ? "3 × 6 min Z3" : "Z2 or below",
    }),
    createWorkout(weekIndex, {
      dayIndex: 2,
      sport: "bike",
      sourceSlug: "bike-z2",
      title: "Bike Z2",
      description: "Steady cadence and controlled breathing: warm up, ride a continuous Z2 block and finish with 10 min easy.",
      plannedDurationMin: bikeZ2[weekIndex],
      intensity: "Z2",
    }),
    createWorkout(weekIndex, {
      dayIndex: 2,
      sport: "strength",
      sourceSlug: "calistenia-b-muscle-up",
      title: "Calisthenics B — muscle-up",
      description: "Explosive pull-ups, straight bar dips, assisted transitions, single-leg RDLs, swings and core. Keep every rep technical.",
      plannedDurationMin: deload ? 40 : 55,
      intensity: "Technique / RPE 6–7",
    }),
    createWorkout(weekIndex, {
      dayIndex: 3,
      sport: "run",
      sourceSlug: "corrida-facil",
      title: "Easy run",
      description: "Warm up for 5 min, run in Z2 and walk for 3–5 min at the end.",
      plannedDurationMin: runThursday[weekIndex],
      intensity: "Z2 or below",
    }),
    createWorkout(weekIndex, {
      dayIndex: 3,
      sport: "strength",
      sourceSlug: "bulletproofing-b",
      title: "Bulletproofing B",
      description: "Single-leg glute bridge, Copenhagen plank, side plank, dead bug, scapular work, external rotation and mobility.",
      plannedDurationMin: deload ? 25 : 35,
      intensity: "Control",
    }),
    createWorkout(weekIndex, {
      dayIndex: 4,
      sport: "swim",
      sourceSlug: "natacao-resistencia",
      title: "Swim endurance",
      description: "Warm-up, long easy/moderate blocks, technique work and 100–200 m easy cool-down.",
      plannedDurationMin: Math.round(swimEndurance[weekIndex] / 34),
      plannedDistance: swimEndurance[weekIndex],
      distanceUnit: "m",
      intensity: "Easy / moderate",
    }),
    createWorkout(weekIndex, {
      dayIndex: 4,
      sport: "bike",
      sourceSlug: "bike-intensidade-controlada",
      title: "Controlled bike intensity",
      description: `${intensitySeries[weekIndex]}. Strong but controlled; never sprint.`,
      plannedDurationMin: bikeIntensity[weekIndex],
      intensity: deload ? "Z2" : "Controlled Z3",
    }),
    createWorkout(weekIndex, {
      dayIndex: 5,
      sport: "bike",
      sourceSlug: "bike-longa",
      title: "Long bike",
      description: "Continuous Z2. Drink regularly and test carbohydrate intake without finishing empty.",
      plannedDurationMin: bikeLong[weekIndex],
      intensity: "Z2",
    }),
    createWorkout(weekIndex, {
      dayIndex: 5,
      sport: "run",
      sourceSlug: "brick-muito-facil",
      title: "Very easy brick",
      description: "Come off the bike and run very easily. Alternate 5 min running with 1 min walking if needed.",
      plannedDurationMin: runBrick[weekIndex],
      intensity: "Z1 / Z2",
    }),
    createWorkout(weekIndex, {
      dayIndex: 6,
      sport: "run",
      sourceSlug: "corrida-longa-facil",
      title: "Easy long run",
      description: "Time on your feet, not pace. Option: run for 8 min and walk for 1 min.",
      plannedDurationMin: runLong[weekIndex],
      intensity: "Z2 or below",
    }),
    createWorkout(weekIndex, {
      dayIndex: 6,
      sport: "strength",
      sourceSlug: "calistenia-c-opcional",
      title: "Optional calisthenics C",
      description: "Chin-ups, push-ups, lunges, step-ups, Copenhagen plank and mobility. Only when fatigue is under control.",
      plannedDurationMin: deload ? 20 : 30,
      intensity: "Very easy",
      isOptional: true,
    }),
  ];
}).flat();

export const photoArchive = [
  { src: assetUrl("assets/photos/underwater-fighter.webp"), alt: "Athlete training underwater", crop: "underwater", caption: "BREATH. STRENGTH. SILENCE." },
  { src: assetUrl("assets/photos/finish-line-collapse.webp"), alt: "Exhausted athlete after the finish", crop: "collapse", caption: "THE FINISH ISN'T PRETTY." },
  { src: assetUrl("assets/photos/city-runner.webp"), alt: "Runner on a city street", crop: "runner", caption: "RUN WHEN NOBODY ASKS." },
  { src: assetUrl("assets/photos/yellow-cyclist.webp"), alt: "Cyclist wearing yellow kit", crop: "yellow-bike", caption: "Z2. NO DRAMA." },
  { src: assetUrl("assets/photos/vintage-bike.webp"), alt: "Athlete on a vintage bike", crop: "vintage-bike", caption: "IT STARTED BEFORE DATA." },
  { src: assetUrl("assets/photos/road-cyclist-bw.webp"), alt: "Road cyclist in black and white", crop: "road-bw", caption: "EAT. DRINK. RIDE." },
  { src: assetUrl("assets/photos/mini-motorbike.webp"), alt: "Man in a suit on a mini motorbike", crop: "mini-bike", caption: "WRONG SCALE. RIGHT ATTITUDE." },
  { src: assetUrl("assets/photos/error-tie.webp"), alt: "Tie made from error windows", crop: "error", caption: "FAILURE GOES IN THE ARCHIVE." },
  { src: assetUrl("assets/photos/smoking-kills-racing.webp"), alt: "Racing driver in an archive image", crop: "racing", caption: "CONTROLLED RISK." },
];
