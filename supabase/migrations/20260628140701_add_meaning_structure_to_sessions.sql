alter table public.coach_sessions
  add column if not exists meaning_structure jsonb not null default '{}'::jsonb,
  add column if not exists sensitive_flags jsonb not null default '{}'::jsonb;
