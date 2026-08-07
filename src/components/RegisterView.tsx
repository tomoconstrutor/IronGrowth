import { useEffect, useMemo, useState, type FormEvent } from "react";
import { todayInLisbon } from "../lib/date";
import { calculatePace, calculateSpeed, calculateSwimPace } from "../lib/metrics";
import { validateWorkoutLog } from "../lib/validation";
import type { PlannedWorkout, WorkoutFormPayload, WorkoutLog } from "../types";
import { RotatingArchive } from "./RotatingArchive";

const emptyLog = (workout: PlannedWorkout): WorkoutFormPayload => ({
  workoutId: workout.id,
  sourceKey: workout.sourceKey,
  status: "completed",
  completedAt: todayInLisbon(),
  actualDurationMin: workout.plannedDurationMin,
  actualDistance: workout.plannedDistance ?? null,
  avgHr: null,
  maxHr: null,
  elevationM: null,
  cadence: null,
  carbsPerHour: null,
  fluidsL: null,
  rpe: null,
  pain: null,
  sleep: null,
  fatigue: null,
  notes: "",
  technicalNotes: "",
  exercises: "",
});

const numberValue = (value: string) => value === "" ? null : Number(value);

interface RegisterViewProps {
  selectedWorkout: PlannedWorkout;
  workouts: PlannedWorkout[];
  logs: WorkoutLog[];
  onSelect: (workout: PlannedWorkout) => void;
  onSave: (log: WorkoutLog) => Promise<void>;
}

export function RegisterView({ selectedWorkout, workouts, logs, onSelect, onSave }: RegisterViewProps) {
  const existing = logs.find((log) => log.sourceKey === selectedWorkout.sourceKey);
  const [form, setForm] = useState<WorkoutFormPayload>(existing ?? emptyLog(selectedWorkout));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(existing ?? emptyLog(selectedWorkout));
    setErrors({});
    setMessage("");
  }, [existing, selectedWorkout]);

  const performance = useMemo(() => {
    if (selectedWorkout.sport === "run") return calculatePace(form.actualDistance, form.actualDurationMin);
    if (selectedWorkout.sport === "bike") return calculateSpeed(form.actualDistance, form.actualDurationMin);
    if (selectedWorkout.sport === "swim") return calculateSwimPace(form.actualDistance, form.actualDurationMin);
    return form.actualDurationMin ? `${form.actualDurationMin} MIN` : null;
  }, [form.actualDistance, form.actualDurationMin, selectedWorkout.sport]);

  function update<Key extends keyof WorkoutFormPayload>(key: Key, value: WorkoutFormPayload[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateWorkoutLog(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setBusy(true);
    setMessage("");
    try {
      await onSave({ ...form, updatedAt: new Date().toISOString() });
      setMessage(form.status === "skipped" ? "SESSION MISSED. IT STAYS IN THE ARCHIVE." : "SESSION ARCHIVED.");
    } catch {
      setMessage("DATA MISSING. THE SESSION WAS NOT SAVED.");
    } finally {
      setBusy(false);
    }
  }

  const recent = [...workouts].filter((workout) => logs.some((log) => log.sourceKey === workout.sourceKey)).slice(-5).reverse();

  return (
    <section className="register-view page-section">
      <div className="page-lead register-lead">
        <header className="section-header register-header">
          <div><p className="eyebrow">SESSION SHEET</p><h1>FIELD<br />LOG</h1></div>
          <label className="workout-picker">SESSION
            <select value={selectedWorkout.sourceKey} onChange={(event) => onSelect(workouts.find((workout) => workout.sourceKey === event.target.value) ?? selectedWorkout)}>
              {workouts.map((workout) => <option value={workout.sourceKey} key={workout.sourceKey}>S{workout.weekNumber} · {workout.date} · {workout.title}</option>)}
            </select>
          </label>
        </header>
        <RotatingArchive placement="register" />
      </div>

      <div className="register-layout">
        <form className="training-form" onSubmit={submit}>
          <div className={`workout-ticket sport-${selectedWorkout.sport}`}>
            <span>{selectedWorkout.date} // WEEK {String(selectedWorkout.weekNumber).padStart(2, "0")}</span>
            <h2>{selectedWorkout.title}</h2>
            <p>{selectedWorkout.description}</p>
            <div><b>{selectedWorkout.plannedDistance ? `${selectedWorkout.plannedDistance} ${selectedWorkout.distanceUnit}` : `${selectedWorkout.plannedDurationMin} MIN`}</b><small>{selectedWorkout.intensity}</small></div>
          </div>

          <div className="status-switch" aria-label="Workout status">
            <button type="button" className={form.status === "completed" ? "active" : ""} onClick={() => update("status", "completed")}>COMPLETED</button>
            <button type="button" className={form.status === "skipped" ? "active failed" : ""} onClick={() => update("status", "skipped")}>MISSED / DNF</button>
          </div>

          <div className="form-grid">
            <label>ACTUAL DATE<input type="date" value={form.completedAt ?? ""} onChange={(event) => update("completedAt", event.target.value || null)} /></label>
            <label>DURATION / MIN<input type="number" min="0" value={form.actualDurationMin ?? ""} onChange={(event) => update("actualDurationMin", numberValue(event.target.value))} />{errors.actualDurationMin && <small>{errors.actualDurationMin}</small>}</label>
            {selectedWorkout.sport !== "strength" && <label>DISTANCE / {selectedWorkout.sport === "swim" ? "M" : "KM"}<input type="number" min="0" step="0.1" value={form.actualDistance ?? ""} onChange={(event) => update("actualDistance", numberValue(event.target.value))} /></label>}
            <div className="derived-stat"><span>{selectedWorkout.sport === "run" ? "PACE" : selectedWorkout.sport === "bike" ? "SPEED" : selectedWorkout.sport === "swim" ? "PACE / 100M" : "TIME"}</span><strong>{performance ?? "—"}</strong></div>
            {selectedWorkout.sport !== "strength" && <><label>AVERAGE HR<input type="number" min="0" value={form.avgHr ?? ""} onChange={(event) => update("avgHr", numberValue(event.target.value))} /></label><label>MAX HR<input type="number" min="0" value={form.maxHr ?? ""} onChange={(event) => update("maxHr", numberValue(event.target.value))} />{errors.maxHr && <small>{errors.maxHr}</small>}</label></>}
            {(selectedWorkout.sport === "run" || selectedWorkout.sport === "bike") && <><label>ELEVATION / M<input type="number" min="0" value={form.elevationM ?? ""} onChange={(event) => update("elevationM", numberValue(event.target.value))} /></label><label>CADENCE<input type="number" min="0" value={form.cadence ?? ""} onChange={(event) => update("cadence", numberValue(event.target.value))} /></label></>}
            {selectedWorkout.sport === "bike" && <><label>CARBS / H<input type="number" min="0" value={form.carbsPerHour ?? ""} onChange={(event) => update("carbsPerHour", numberValue(event.target.value))} /></label><label>FLUIDS / L<input type="number" min="0" step="0.1" value={form.fluidsL ?? ""} onChange={(event) => update("fluidsL", numberValue(event.target.value))} /></label></>}
          </div>

          <div className="readiness-band">
            {(["rpe", "pain", "sleep", "fatigue"] as const).map((key) => <label key={key}>{key === "rpe" ? "RPE" : key === "pain" ? "PAIN" : key === "sleep" ? "SLEEP" : "FATIGUE"}<input type="number" min="0" max="10" value={form[key] ?? ""} onChange={(event) => update(key, numberValue(event.target.value))} /><span>/10</span>{errors[key] && <small>{errors[key]}</small>}</label>)}
          </div>

          {selectedWorkout.sport === "swim" && <label className="wide-field">TECHNICAL NOTES<textarea rows={3} value={form.technicalNotes} onChange={(event) => update("technicalNotes", event.target.value)} placeholder="BREATHING, ELBOW, GLIDE..." /></label>}
          {selectedWorkout.sport === "strength" && <label className="wide-field">EXERCISES / SETS<textarea rows={4} value={form.exercises} onChange={(event) => update("exercises", event.target.value)} placeholder="PULL-UPS 4×6, DIPS 4×8..." /></label>}
          <label className="wide-field">FIELD NOTES<textarea rows={4} value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="WHAT HAPPENED, WITHOUT DRESSING IT UP." /></label>

          <button className="primary-command save-command" type="submit" disabled={busy}>{busy ? "ARCHIVING..." : "ARCHIVE SESSION"}</button>
          {message && <p className="form-message" role="status">{message}</p>}
        </form>

        <aside className="recent-log">
          <div className="section-label"><span>RECENT LOGS</span><span>{logs.length}</span></div>
          {recent.length ? recent.map((workout) => {
            const log = logs.find((item) => item.sourceKey === workout.sourceKey)!;
            return <button key={workout.sourceKey} onClick={() => onSelect(workout)}><span>{workout.date}</span><b>{workout.title}</b><strong className={`status-${log.status}`}>{log.status === "completed" ? "DONE" : "MISSED"}</strong><small>{log.actualDurationMin ?? 0} MIN // RPE {log.rpe ?? "—"}</small></button>;
          }) : <div className="empty-record">NO LOGS YET.<br />THE FIRST LINE WON'T WRITE ITSELF.</div>}
        </aside>
      </div>
    </section>
  );
}
