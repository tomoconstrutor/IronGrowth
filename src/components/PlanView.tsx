import { useMemo, useState } from "react";
import { weekLabels } from "../data/seed";
import { formatLongDate } from "../lib/date";
import type { PlannedWorkout, Sport, WorkoutLog } from "../types";
import { RotatingArchive } from "./RotatingArchive";

const filters: Array<{ value: "all" | Sport; label: string }> = [
  { value: "all", label: "ALL" },
  { value: "swim", label: "SWIM" },
  { value: "bike", label: "BIKE" },
  { value: "run", label: "RUN" },
  { value: "strength", label: "STRENGTH" },
];

interface PlanViewProps {
  currentWeek: number;
  workouts: PlannedWorkout[];
  logs: WorkoutLog[];
  onRegister: (workout: PlannedWorkout) => void;
}

export function PlanView({ currentWeek, workouts, logs, onRegister }: PlanViewProps) {
  const [week, setWeek] = useState(currentWeek);
  const [filter, setFilter] = useState<"all" | Sport>("all");
  const weekMeta = weekLabels[week - 1];
  const visible = useMemo(
    () => workouts.filter((workout) => workout.weekNumber === week && (filter === "all" || workout.sport === filter)),
    [filter, week, workouts],
  );

  return (
    <section className="plan-view page-section">
      <div className="page-lead">
        <header className="section-header">
          <div><p className="eyebrow">BLOCK 01 // BASE</p><h1>OPERATIONS<br />PLAN</h1></div>
          <div className={`week-stamp ${weekMeta.isDeload ? "is-deload" : ""}`}>
            <span>WEEK</span><strong>{String(week).padStart(2, "0")}</strong><small>{weekMeta.type}</small>
          </div>
        </header>
        <RotatingArchive placement="plan" />
      </div>

      <div className="week-rail" aria-label="Choose week">
        {weekLabels.map((item) => (
          <button className={item.weekNumber === week ? "active" : ""} key={item.weekNumber} onClick={() => setWeek(item.weekNumber)}>
            <span>{String(item.weekNumber).padStart(2, "0")}</span>
            <small>{item.isDeload ? "REC." : item.type.split(" ")[0]}</small>
          </button>
        ))}
      </div>

      <div className="plan-tools">
        <div className="filter-tabs" aria-label="Filter by sport">
          {filters.map((item) => <button className={filter === item.value ? "active" : ""} key={item.value} onClick={() => setFilter(item.value)}>{item.label}</button>)}
        </div>
        <span>TARGET VOLUME // {weekMeta.volume}</span>
      </div>

      <div className="result-sheet">
        <div className="result-head"><span>DATE / SPORT</span><span>SESSION</span><span>TARGET</span><span>STATUS</span></div>
        {visible.map((workout) => {
          const log = logs.find((item) => item.sourceKey === workout.sourceKey);
          return (
            <button className={`result-row sport-${workout.sport}`} key={workout.sourceKey} onClick={() => onRegister(workout)}>
              <span className="result-date"><b>{formatLongDate(workout.date).split(" ")[0]}</b><small>{workout.date.slice(5)}</small></span>
              <span className="result-session"><b>{workout.title}</b><small>{workout.description}</small></span>
              <span className="result-target"><b>{workout.plannedDistance ? `${workout.plannedDistance} ${workout.distanceUnit}` : `${workout.plannedDurationMin} min`}</b><small>{workout.intensity}</small></span>
              <span className={`result-status status-${log?.status ?? "planned"}`}>{log?.status === "completed" ? "DONE" : log?.status === "skipped" ? "MISSED" : workout.isOptional ? "OPTIONAL" : "PLANNED"}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
