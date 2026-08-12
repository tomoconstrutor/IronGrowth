import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AuthView } from "./components/AuthView";
import { PlanView } from "./components/PlanView";
import { RegisterView } from "./components/RegisterView";
import { TodayView } from "./components/TodayView";
import { seedWorkouts } from "./data/seed";
import { getPlanWeek, nextWorkout, todayInLisbon } from "./lib/date";
import { dailyUpdatesToLogs, loadDailyUpdates, type DailyUpdate } from "./lib/dailyUpdates";
import { bootstrapRemotePlan, isSupabaseConfigured, loadLocalLogs, loadRemoteLogs, saveLocalLog, saveRemoteLog, supabase } from "./lib/supabase";
import type { AppView, PlannedWorkout, WorkoutLog } from "./types";

const navItems: Array<{ id: AppView; label: string; index: string }> = [
  { id: "today", label: "TODAY", index: "01" },
  { id: "plan", label: "PLAN", index: "02" },
  { id: "register", label: "LOG", index: "03" },
];

export function App() {
  const today = todayInLisbon();
  const currentWeek = getPlanWeek(today);
  const [view, setView] = useState<AppView>("today");
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [syncState, setSyncState] = useState<"local" | "syncing" | "synced" | "error">(isSupabaseConfigured ? "syncing" : "local");
  const [logs, setLogs] = useState<WorkoutLog[]>(() => loadLocalLogs());
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>([]);
  const initialWorkout = useMemo(() => nextWorkout(seedWorkouts, today) ?? seedWorkouts[0], [today]);
  const [selectedWorkout, setSelectedWorkout] = useState<PlannedWorkout>(initialWorkout);
  const displayedLogs = useMemo(() => {
    const feedLogs = dailyUpdatesToLogs(dailyUpdates, seedWorkouts);
    const localKeys = new Set(logs.map((log) => log.sourceKey));
    return [...logs, ...feedLogs.filter((log) => !localKeys.has(log.sourceKey))];
  }, [dailyUpdates, logs]);

  useEffect(() => {
    let active = true;
    void loadDailyUpdates().then((updates) => {
      if (active) setDailyUpdates(updates);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    async function hydrate(nextSession: Session | null) {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession) {
        setAuthLoading(false);
        return;
      }
      setSyncState("syncing");
      try {
        await bootstrapRemotePlan(nextSession);
        const remoteLogs = await loadRemoteLogs(nextSession.user.id);
        if (active) {
          setLogs(remoteLogs);
          setSyncState("synced");
        }
      } catch {
        if (active) setSyncState("error");
      } finally {
        if (active) setAuthLoading(false);
      }
    }

    void supabase.auth.getSession().then(({ data }) => hydrate(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      window.setTimeout(() => void hydrate(nextSession), 0);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  function openRegister(workout: PlannedWorkout) {
    setSelectedWorkout(workout);
    setView("register");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveLog(log: WorkoutLog) {
    const nextLogs = saveLocalLog(log);
    setLogs(nextLogs);
    if (session) {
      setSyncState("syncing");
      try {
        await saveRemoteLog(session.user.id, { ...log, userId: session.user.id });
        setSyncState("synced");
      } catch (error) {
        setSyncState("error");
        throw error;
      }
    }
  }

  if (authLoading) {
    return <main className="loading-screen"><span>IRON<span>GROWTH</span></span><p>OPENING THE ARCHIVE...</p></main>;
  }

  if (isSupabaseConfigured && !session) return <AuthView />;

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand" onClick={() => setView("today")} aria-label="Go to Today">IRON<span>GROWTH</span></button>
        <div className="header-edition"><span>YEAR-LONG BUILD</span><b>10.08.26 — 10.08.27</b></div>
        <div className="archive-state">
          <span className={`sync-light sync-${syncState}`} />
          <span>{syncState === "synced" ? "ARCHIVE ONLINE" : syncState === "syncing" ? "SYNCING" : syncState === "error" ? "SYNC MISSING" : "LOCAL ARCHIVE"}</span>
          {session && <button onClick={() => supabase?.auth.signOut()}>SIGN OUT</button>}
        </div>
      </header>

      <main className="app-content">
        {view === "today" && <TodayView weekNumber={currentWeek} workouts={seedWorkouts} logs={displayedLogs} dailyUpdates={dailyUpdates} onRegister={openRegister} />}
        {view === "plan" && <PlanView currentWeek={currentWeek} workouts={seedWorkouts} logs={displayedLogs} onRegister={openRegister} />}
        {view === "register" && <RegisterView selectedWorkout={selectedWorkout} workouts={seedWorkouts} logs={displayedLogs} onSelect={setSelectedWorkout} onSave={saveLog} />}
      </main>

      <nav className="app-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <button className={view === item.id ? "active" : ""} key={item.id} onClick={() => setView(item.id)}>
            <small>{item.index}</small><span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
