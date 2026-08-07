import type { PlannedWorkout } from "../types";
import { PLAN_START_DATE } from "../data/seed";

export const APP_TIMEZONE = "Europe/Lisbon";

export function todayInLisbon(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((value) => value.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIMEZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function getPlanWeek(date: string, startDate = PLAN_START_DATE) {
  const current = new Date(`${date}T12:00:00Z`).getTime();
  const start = new Date(`${startDate}T12:00:00Z`).getTime();
  return Math.min(12, Math.max(1, Math.floor((current - start) / 604_800_000) + 1));
}

export function daysUntil(target: string, from = todayInLisbon()) {
  const targetTime = new Date(`${target}T12:00:00Z`).getTime();
  const fromTime = new Date(`${from}T12:00:00Z`).getTime();
  return Math.max(0, Math.ceil((targetTime - fromTime) / 86_400_000));
}

export function nextWorkout(workouts: PlannedWorkout[], date: string) {
  return workouts
    .filter((workout) => workout.date >= date && !workout.isOptional)
    .sort((a, b) => a.date.localeCompare(b.date) || a.dayIndex - b.dayIndex)[0];
}
