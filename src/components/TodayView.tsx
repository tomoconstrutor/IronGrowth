import { useEffect, useState } from "react";
import { RotatingArchive } from "./RotatingArchive";
import { raceMilestones } from "../data/seed";
import { daysUntil, formatLongDate, nextWorkout, todayInLisbon } from "../lib/date";
import { loadDailyUpdates, type DailyUpdate } from "../lib/dailyUpdates";
import { completionRate, totalsBySport } from "../lib/metrics";
import type { PlannedWorkout, WorkoutLog } from "../types";

const sportLabel = { swim: "SWIM", bike: "BIKE", run: "RUN", strength: "STRENGTH" } as const;

function formatDailyWorkout(workout: DailyUpdate["workouts"][number]) {
  const bits = [
    workout.durationMin ? `${workout.durationMin}′` : null,
    workout.distance ? `${workout.distance}${workout.distanceUnit ?? "km"}` : null,
    workout.calories ? `${workout.calories} kcal` : null,
    workout.avgHr ? `${workout.avgHr} bpm` : null,
    workout.rpe ? `RPE ${workout.rpe}` : null,
  ].filter(Boolean);
  return bits.length ? bits.join(" // ") : workout.notes ?? "ARCHIVED";
}

interface TodayViewProps {
  weekNumber: number;
  workouts: PlannedWorkout[];
  logs: WorkoutLog[];
  onRegister: (workout: PlannedWorkout) => void;
}

export function TodayView({ weekNumber, workouts, logs, onRegister }: TodayViewProps) {
  const today = todayInLisbon();
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>([]);
  const weekWorkouts = workouts.filter((workout) => workout.weekNumber === weekNumber);
  const todayWorkouts = workouts.filter((workout) => workout.date === today);
  const next = nextWorkout(workouts, today);
  const rate = completionRate(weekWorkouts, logs);
  const totals = totalsBySport(weekWorkouts, logs);
  const latestUpdate = dailyUpdates[0];

  useEffect(() => {
    let active = true;
    void loadDailyUpdates().then((updates) => {
      if (active) setDailyUpdates(updates);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="today-view">
      <RotatingArchive placement="today" />
      <aside className="today-editorial">
        <div className="edition-line">
          <span>{formatLongDate(today).toUpperCase()}</span>
          <span>WK. {String(weekNumber).padStart(2, "0")} / 12</span>
        </div>

        <section className="manifesto-block">
          <p className="eyebrow">FIELD REPORT</p>
          <h1>DISCIPLINE.<br />NO <em>EXCUSES.</em></h1>
          <div className="completion-mark">
            <strong>{rate}%</strong>
            <span>OF THE WEEK<br />ARCHIVED</span>
          </div>
        </section>

        <section className="milestone-grid" aria-label="Race countdown">
          {raceMilestones.map((milestone) => (
            <article key={milestone.sourceKey}>
              <span>{milestone.name}</span>
              <strong>{daysUntil(milestone.date, today)}</strong>
              <small>DAYS // {milestone.distanceLabel}</small>
            </article>
          ))}
        </section>

        <section className="today-session">
          <div className="section-label"><span>TODAY'S WORKOUT</span><span>{todayWorkouts.length || "—"} SESSIONS</span></div>
          {(todayWorkouts.length ? todayWorkouts : next ? [next] : []).map((workout) => {
            const log = logs.find((item) => item.sourceKey === workout.sourceKey);
            return (
              <button className={`session-row sport-${workout.sport}`} key={workout.sourceKey} onClick={() => onRegister(workout)}>
                <span className="sport-bar" />
                <span className="session-copy">
                  <small>{todayWorkouts.length ? sportLabel[workout.sport] : `NEXT // ${workout.date}`}</small>
                  <b>{workout.title}</b>
                  <span>{workout.intensity}</span>
                </span>
                <strong>{workout.plannedDistance ? `${workout.plannedDistance}${workout.distanceUnit}` : `${workout.plannedDurationMin}′`}</strong>
                <span className={`status-dot status-${log?.status ?? "planned"}`} aria-label={log?.status ?? "planeado"} />
              </button>
            );
          })}
        </section>

        <section className="daily-report" aria-label="Latest daily update">
          <div className="section-label"><span>DAILY UPDATE</span><span>{latestUpdate?.date ?? "—"}</span></div>
          {latestUpdate ? (
            <div className="daily-report-card">
              <div className="daily-report-head">
                <span className={`daily-status daily-status-${latestUpdate.status}`}>{latestUpdate.status === "published" ? "PUBLISHED" : "DRAFT"}</span>
                <strong>{latestUpdate.calories ? `${latestUpdate.calories} kcal` : "CALORIES —"}</strong>
                {latestUpdate.bodyWeightKg && <small>{latestUpdate.bodyWeightKg} KG</small>}
              </div>
              {latestUpdate.workouts.length ? latestUpdate.workouts.map((workout, index) => (
                <article key={`${latestUpdate.date}-${workout.title}-${index}`}>
                  <span>{workout.source ?? workout.type.toUpperCase()}</span>
                  <b>{workout.title}</b>
                  <small>{formatDailyWorkout(workout)}</small>
                  {workout.notes && <p>{workout.notes}</p>}
                </article>
              )) : <p className="daily-empty">NO WORKOUTS ARCHIVED YET.</p>}
              {latestUpdate.notes && <p className="daily-notes">{latestUpdate.notes}</p>}
            </div>
          ) : <div className="daily-report-card"><p className="daily-empty">WAITING FOR FIELD DATA.</p></div>}
        </section>

        <section className="discipline-strips" aria-label="Progress by sport">
          {totals.map((total) => (
            <div className={`discipline-strip sport-${total.sport}`} key={total.sport}>
              <span>{sportLabel[total.sport]}</span>
              <div><i style={{ width: `${Math.min(100, total.plannedMinutes ? (total.actualMinutes / total.plannedMinutes) * 100 : 0)}%` }} /></div>
              <strong>{total.actualMinutes}<small> / {total.plannedMinutes} MIN</small></strong>
            </div>
          ))}
        </section>
      </aside>
    </div>
  );
}
