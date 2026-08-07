-- IronGrowth v1 schema. Run in a new Supabase project's SQL editor.

create table if not exists public.training_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null,
  name text not null,
  start_date date not null,
  end_date date not null,
  timezone text not null default 'Europe/Lisbon',
  weeks_count smallint not null check (weeks_count > 0),
  seed_version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create table if not exists public.planned_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.training_plans(id) on delete cascade,
  source_key text not null,
  week_number smallint not null check (week_number between 1 and 52),
  day_index smallint not null check (day_index between 0 and 6),
  workout_date date not null,
  sport text not null check (sport in ('swim', 'bike', 'run', 'strength')),
  title text not null,
  description text not null default '',
  planned_duration_min integer not null check (planned_duration_min > 0),
  planned_distance numeric,
  distance_unit text check (distance_unit in ('m', 'km')),
  intensity text not null default '',
  is_deload boolean not null default false,
  is_optional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, source_key)
);

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planned_workout_id uuid not null references public.planned_workouts(id) on delete cascade,
  workout_source_key text not null,
  status text not null check (status in ('planned', 'completed', 'skipped')),
  completed_at date,
  actual_duration_min integer check (actual_duration_min is null or actual_duration_min >= 0),
  actual_distance numeric check (actual_distance is null or actual_distance >= 0),
  avg_hr integer check (avg_hr is null or avg_hr >= 0),
  max_hr integer check (max_hr is null or max_hr >= 0),
  elevation_m numeric check (elevation_m is null or elevation_m >= 0),
  cadence numeric check (cadence is null or cadence >= 0),
  carbs_per_hour numeric check (carbs_per_hour is null or carbs_per_hour >= 0),
  fluids_l numeric check (fluids_l is null or fluids_l >= 0),
  rpe smallint check (rpe is null or rpe between 0 and 10),
  pain smallint check (pain is null or pain between 0 and 10),
  sleep smallint check (sleep is null or sleep between 0 and 10),
  fatigue smallint check (fatigue is null or fatigue between 0 and 10),
  notes text not null default '',
  technical_notes text not null default '',
  exercises text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, workout_source_key)
);

create table if not exists public.race_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_key text not null,
  name text not null,
  milestone_date date not null,
  distance_label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, source_key)
);

create index if not exists training_plans_user_id_idx on public.training_plans(user_id);
create index if not exists planned_workouts_user_id_idx on public.planned_workouts(user_id);
create index if not exists planned_workouts_date_idx on public.planned_workouts(user_id, workout_date);
create index if not exists workout_logs_user_id_idx on public.workout_logs(user_id);
create index if not exists race_milestones_user_id_idx on public.race_milestones(user_id);

alter table public.training_plans enable row level security;
alter table public.planned_workouts enable row level security;
alter table public.workout_logs enable row level security;
alter table public.race_milestones enable row level security;

revoke all on public.training_plans from anon;
revoke all on public.planned_workouts from anon;
revoke all on public.workout_logs from anon;
revoke all on public.race_milestones from anon;

grant select, insert, update on public.training_plans to authenticated;
grant select, insert, update on public.planned_workouts to authenticated;
grant select, insert, update on public.workout_logs to authenticated;
grant select, insert, update on public.race_milestones to authenticated;

drop policy if exists "training plans select own" on public.training_plans;
drop policy if exists "training plans insert own" on public.training_plans;
drop policy if exists "training plans update own" on public.training_plans;
drop policy if exists "planned workouts select own" on public.planned_workouts;
drop policy if exists "planned workouts insert own" on public.planned_workouts;
drop policy if exists "planned workouts update own" on public.planned_workouts;
drop policy if exists "workout logs select own" on public.workout_logs;
drop policy if exists "workout logs insert own" on public.workout_logs;
drop policy if exists "workout logs update own" on public.workout_logs;
drop policy if exists "race milestones select own" on public.race_milestones;
drop policy if exists "race milestones insert own" on public.race_milestones;
drop policy if exists "race milestones update own" on public.race_milestones;

create policy "training plans select own" on public.training_plans for select to authenticated using ((select auth.uid()) = user_id);
create policy "training plans insert own" on public.training_plans for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "training plans update own" on public.training_plans for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "planned workouts select own" on public.planned_workouts for select to authenticated using ((select auth.uid()) = user_id);
create policy "planned workouts insert own" on public.planned_workouts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "planned workouts update own" on public.planned_workouts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "workout logs select own" on public.workout_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy "workout logs insert own" on public.workout_logs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "workout logs update own" on public.workout_logs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "race milestones select own" on public.race_milestones for select to authenticated using ((select auth.uid()) = user_id);
create policy "race milestones insert own" on public.race_milestones for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "race milestones update own" on public.race_milestones for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
