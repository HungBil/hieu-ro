-- Source: 001_enums_extensions.sql
create extension if not exists pgcrypto;
create extension if not exists vector;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('learner','contributor','reviewer','admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'context_type') then
    create type public.context_type as enum ('general','personal_message','school','work','family','travel','money','warning','community','other');
  end if;
  if not exists (select 1 from pg_type where typname = 'tone_type') then
    create type public.tone_type as enum ('neutral','polite','friendly','formal','short');
  end if;
  if not exists (select 1 from pg_type where typname = 'sample_status') then
    create type public.sample_status as enum ('draft','pending_review','approved','rejected','needs_changes');
  end if;
  if not exists (select 1 from pg_type where typname = 'consent_scope') then
    create type public.consent_scope as enum ('public','anonymous','internal_only');
  end if;
  if not exists (select 1 from pg_type where typname = 'feedback_rating') then
    create type public.feedback_rating as enum ('correct','wrong_meaning','missing_meaning','too_verbose','too_hard','hallucinated','other');
  end if;
  if not exists (select 1 from pg_type where typname = 'learning_item_type') then
    create type public.learning_item_type as enum ('clarity','grammar','word_order','connector','time_specificity','politeness','sentence_pattern');
  end if;
  if not exists (select 1 from pg_type where typname = 'repetition_grade') then
    create type public.repetition_grade as enum ('again','hard','good','easy');
  end if;
  if not exists (select 1 from pg_type where typname = 'community_post_type') then
    create type public.community_post_type as enum ('ask_meaning','share_sample','feedback','discussion');
  end if;
end $$;


-- Source: 002_profiles_settings.sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'learner',
  is_deaf_community_member boolean not null default false,
  knows_sign_language boolean not null default false,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  save_history boolean not null default true,
  allow_learning_suggestions boolean not null default true,
  allow_notifications boolean not null default false,
  daily_learning_target integer not null default 5 check (daily_learning_target between 1 and 30),
  timezone text default 'Asia/Ho_Chi_Minh',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- Source: 003_core_app_tables.sql
create table if not exists public.coach_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  input_text text not null check (char_length(input_text) between 2 and 3000),
  context_type public.context_type not null default 'general',
  tone public.tone_type not null default 'polite',
  result_json jsonb,
  rewritten_text text,
  confidence_score numeric(4,3) check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 1)),
  saved boolean not null default false,
  feedback_summary text,
  quality_status text not null default 'unreviewed' check (quality_status in ('unreviewed','good','needs_review','bad')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists coach_sessions_user_idx on public.coach_sessions(user_id);
create index if not exists coach_sessions_created_at_idx on public.coach_sessions(created_at desc);

create table if not exists public.coach_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  coach_session_id uuid not null references public.coach_sessions(id) on delete cascade,
  rating public.feedback_rating not null,
  comment text,
  corrected_text text,
  created_at timestamptz not null default now()
);

create index if not exists coach_feedback_session_idx on public.coach_feedback(coach_session_id);
create index if not exists coach_feedback_user_idx on public.coach_feedback(user_id);

create table if not exists public.saved_phrases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  coach_session_id uuid references public.coach_sessions(id) on delete set null,
  original_text text not null,
  rewritten_text text not null,
  context_type public.context_type not null default 'general',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_phrases_user_idx on public.saved_phrases(user_id);
create index if not exists saved_phrases_created_at_idx on public.saved_phrases(created_at desc);

create table if not exists public.learning_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source_session_id uuid references public.coach_sessions(id) on delete set null,
  item_type public.learning_item_type not null,
  title text not null,
  rule_text text not null,
  unclear_example text,
  clear_example text,
  next_review_at timestamptz,
  interval_days integer not null default 1,
  ease_factor numeric(4,2) not null default 2.50,
  repetitions integer not null default 0,
  lapses integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_items_user_idx on public.learning_items(user_id);
create index if not exists learning_items_due_idx on public.learning_items(next_review_at);
create index if not exists learning_items_source_idx on public.learning_items(source_session_id);

create table if not exists public.learning_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  learning_item_id uuid not null references public.learning_items(id) on delete cascade,
  grade public.repetition_grade not null,
  previous_interval_days integer,
  new_interval_days integer,
  previous_ease_factor numeric(4,2),
  new_ease_factor numeric(4,2),
  created_at timestamptz not null default now()
);

create index if not exists learning_reviews_user_idx on public.learning_reviews(user_id);
create index if not exists learning_reviews_item_idx on public.learning_reviews(learning_item_id);

create table if not exists public.writing_samples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  original_text text not null,
  context_note text,
  intended_meaning text,
  standard_vietnamese_text text,
  consent_scope public.consent_scope not null default 'internal_only',
  status public.sample_status not null default 'pending_review',
  is_anonymized boolean not null default false,
  contains_sensitive_info boolean not null default false,
  reviewer_id uuid references public.profiles(id) on delete set null,
  review_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists writing_samples_user_idx on public.writing_samples(user_id);
create index if not exists writing_samples_status_idx on public.writing_samples(status);
create index if not exists writing_samples_review_idx on public.writing_samples(status, created_at);


-- Source: 004_community.sql
create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_type public.community_post_type not null default 'discussion',
  title text not null check (char_length(title) between 3 and 120),
  body text not null check (char_length(body) between 3 and 3000),
  is_anonymous boolean not null default false,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_posts_type_idx on public.community_posts(post_type);
create index if not exists community_posts_created_at_idx on public.community_posts(created_at desc);
create index if not exists community_posts_user_idx on public.community_posts(user_id);

create table if not exists public.community_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 2 and 3000),
  is_anonymous boolean not null default false,
  is_helpful boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_replies_post_idx on public.community_replies(post_id);
create index if not exists community_replies_user_idx on public.community_replies(user_id);


-- Source: 005_llm_harness.sql
create table if not exists public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version text not null,
  task text not null,
  system_prompt text not null,
  user_prompt_template text not null,
  output_schema jsonb not null,
  is_active boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(name, version)
);

create table if not exists public.ai_traces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  session_id uuid references public.coach_sessions(id) on delete cascade,
  trace_type text not null,
  status text not null default 'started',
  input_snapshot jsonb,
  output_snapshot jsonb,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  latency_ms integer,
  error_message text
);

create index if not exists ai_traces_user_idx on public.ai_traces(user_id);
create index if not exists ai_traces_session_idx on public.ai_traces(session_id);
create index if not exists ai_traces_created_idx on public.ai_traces(started_at desc);

create table if not exists public.ai_tool_calls (
  id uuid primary key default gen_random_uuid(),
  trace_id uuid references public.ai_traces(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  session_id uuid references public.coach_sessions(id) on delete cascade,
  tool_name text not null,
  tool_input jsonb not null default '{}'::jsonb,
  tool_output jsonb,
  status text not null default 'started',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  latency_ms integer,
  error_message text
);

create index if not exists ai_tool_calls_trace_idx on public.ai_tool_calls(trace_id);
create index if not exists ai_tool_calls_session_idx on public.ai_tool_calls(session_id);

create table if not exists public.ai_eval_cases (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  input_text text not null,
  context_type public.context_type not null default 'general',
  tone public.tone_type not null default 'polite',
  expected_rewrite text,
  expected_ambiguities jsonb not null default '[]'::jsonb,
  expected_learning_points jsonb not null default '[]'::jsonb,
  difficulty text not null default 'medium',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_eval_runs (
  id uuid primary key default gen_random_uuid(),
  run_by uuid references public.profiles(id) on delete set null,
  prompt_version text not null,
  model text not null,
  total_cases integer not null default 0,
  passed_cases integer not null default 0,
  average_score numeric(5,2),
  details jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  event_type text not null,
  cost_estimate numeric(10,6),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_user_type_idx on public.usage_events(user_id, event_type, created_at desc);

create table if not exists public.llm_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  coach_session_id uuid references public.coach_sessions(id) on delete set null,
  function_name text not null,
  provider text,
  model text,
  prompt_name text,
  prompt_version text not null,
  input_hash text,
  retrieved_chunk_ids uuid[] not null default '{}',
  request_payload jsonb,
  response_payload jsonb,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  latency_ms integer,
  cost_estimate numeric(10,6),
  success boolean not null default false,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists llm_runs_user_idx on public.llm_runs(user_id);
create index if not exists llm_runs_created_at_idx on public.llm_runs(created_at desc);
create index if not exists llm_runs_session_idx on public.llm_runs(coach_session_id);


-- Source: 006_rag_kb.sql
create table if not exists public.kb_sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id uuid,
  title text,
  raw_text text not null,
  normalized_text text,
  language text not null default 'vi',
  consent_scope public.consent_scope not null default 'internal_only',
  review_status public.sample_status not null default 'pending_review',
  pii_removed boolean not null default false,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_type, source_id)
);

create index if not exists kb_sources_active_idx on public.kb_sources(is_active, review_status);

create table if not exists public.kb_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.kb_sources(id) on delete cascade,
  chunk_index integer not null,
  chunk_text text not null,
  chunk_summary text,
  tags text[] not null default '{}',
  embedding vector(1536),
  token_count integer,
  pii_removed boolean not null default false,
  created_at timestamptz not null default now(),
  unique(source_id, chunk_index)
);

create index if not exists kb_chunks_source_idx on public.kb_chunks(source_id);
create index if not exists kb_chunks_embedding_idx on public.kb_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create table if not exists public.retrieval_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  session_id uuid references public.coach_sessions(id) on delete cascade,
  query_text text not null,
  query_embedding vector(1536),
  retrieved_chunk_ids uuid[] not null default '{}',
  reranked_chunk_ids uuid[] not null default '{}',
  retrieval_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists retrieval_logs_user_idx on public.retrieval_logs(user_id);
create index if not exists retrieval_logs_session_idx on public.retrieval_logs(session_id);


-- Source: 007_updated_at_auth_trigger.sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at before update on public.user_settings for each row execute function public.set_updated_at();

drop trigger if exists set_coach_sessions_updated_at on public.coach_sessions;
create trigger set_coach_sessions_updated_at before update on public.coach_sessions for each row execute function public.set_updated_at();

drop trigger if exists set_writing_samples_updated_at on public.writing_samples;
create trigger set_writing_samples_updated_at before update on public.writing_samples for each row execute function public.set_updated_at();

drop trigger if exists set_saved_phrases_updated_at on public.saved_phrases;
create trigger set_saved_phrases_updated_at before update on public.saved_phrases for each row execute function public.set_updated_at();

drop trigger if exists set_learning_items_updated_at on public.learning_items;
create trigger set_learning_items_updated_at before update on public.learning_items for each row execute function public.set_updated_at();

drop trigger if exists set_community_posts_updated_at on public.community_posts;
create trigger set_community_posts_updated_at before update on public.community_posts for each row execute function public.set_updated_at();

drop trigger if exists set_community_replies_updated_at on public.community_replies;
create trigger set_community_replies_updated_at before update on public.community_replies for each row execute function public.set_updated_at();

drop trigger if exists set_kb_sources_updated_at on public.kb_sources;
create trigger set_kb_sources_updated_at before update on public.kb_sources for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


-- Source: 008_rls_policies.sql
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

create or replace function public.is_reviewer_or_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('reviewer', 'admin')
  );
$$;

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.coach_sessions enable row level security;
alter table public.coach_feedback enable row level security;
alter table public.saved_phrases enable row level security;
alter table public.learning_items enable row level security;
alter table public.learning_reviews enable row level security;
alter table public.writing_samples enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_replies enable row level security;
alter table public.prompt_versions enable row level security;
alter table public.ai_traces enable row level security;
alter table public.ai_tool_calls enable row level security;
alter table public.ai_eval_cases enable row level security;
alter table public.ai_eval_runs enable row level security;
alter table public.usage_events enable row level security;
alter table public.llm_runs enable row level security;
alter table public.kb_sources enable row level security;
alter table public.kb_chunks enable row level security;
alter table public.retrieval_logs enable row level security;

-- profiles
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- user settings
drop policy if exists "Users manage own settings" on public.user_settings;
create policy "Users manage own settings" on public.user_settings for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- private user data
drop policy if exists "Users manage own coach sessions" on public.coach_sessions;
create policy "Users manage own coach sessions" on public.coach_sessions for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users manage own feedback" on public.coach_feedback;
create policy "Users manage own feedback" on public.coach_feedback for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users manage own saved phrases" on public.saved_phrases;
create policy "Users manage own saved phrases" on public.saved_phrases for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users manage own learning items" on public.learning_items;
create policy "Users manage own learning items" on public.learning_items for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users manage own learning reviews" on public.learning_reviews;
create policy "Users manage own learning reviews" on public.learning_reviews for all to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

-- writing samples
drop policy if exists "Users read own samples or reviewers read all" on public.writing_samples;
create policy "Users read own samples or reviewers read all" on public.writing_samples for select to authenticated using (user_id = auth.uid() or public.is_reviewer_or_admin());

drop policy if exists "Users insert own samples" on public.writing_samples;
create policy "Users insert own samples" on public.writing_samples for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Users update own unreviewed samples" on public.writing_samples;
create policy "Users update own unreviewed samples" on public.writing_samples for update to authenticated using (user_id = auth.uid() and status in ('draft','pending_review','needs_changes')) with check (user_id = auth.uid());

drop policy if exists "Reviewers update samples" on public.writing_samples;
create policy "Reviewers update samples" on public.writing_samples for update to authenticated using (public.is_reviewer_or_admin()) with check (public.is_reviewer_or_admin());

-- community
drop policy if exists "Authenticated users read community posts" on public.community_posts;
create policy "Authenticated users read community posts" on public.community_posts for select to authenticated using (auth.uid() is not null);

drop policy if exists "Users create own community posts" on public.community_posts;
create policy "Users create own community posts" on public.community_posts for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Users update own community posts" on public.community_posts;
create policy "Users update own community posts" on public.community_posts for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users delete own community posts" on public.community_posts;
create policy "Users delete own community posts" on public.community_posts for delete to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Authenticated users read community replies" on public.community_replies;
create policy "Authenticated users read community replies" on public.community_replies for select to authenticated using (auth.uid() is not null);

drop policy if exists "Users create own replies" on public.community_replies;
create policy "Users create own replies" on public.community_replies for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Users update own replies" on public.community_replies;
create policy "Users update own replies" on public.community_replies for update to authenticated using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users delete own replies" on public.community_replies;
create policy "Users delete own replies" on public.community_replies for delete to authenticated using (user_id = auth.uid() or public.is_admin());

-- AI harness
drop policy if exists "Admins manage prompt versions" on public.prompt_versions;
create policy "Admins manage prompt versions" on public.prompt_versions for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users read own ai traces" on public.ai_traces;
create policy "Users read own ai traces" on public.ai_traces for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Service role inserts ai traces" on public.ai_traces;
create policy "Service role inserts ai traces" on public.ai_traces for insert to service_role with check (true);

drop policy if exists "Users read own tool calls" on public.ai_tool_calls;
create policy "Users read own tool calls" on public.ai_tool_calls for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Service role inserts tool calls" on public.ai_tool_calls;
create policy "Service role inserts tool calls" on public.ai_tool_calls for insert to service_role with check (true);

drop policy if exists "Reviewers read eval cases" on public.ai_eval_cases;
create policy "Reviewers read eval cases" on public.ai_eval_cases for select to authenticated using (public.is_reviewer_or_admin());

drop policy if exists "Admins manage eval cases" on public.ai_eval_cases;
create policy "Admins manage eval cases" on public.ai_eval_cases for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Reviewers read eval runs" on public.ai_eval_runs;
create policy "Reviewers read eval runs" on public.ai_eval_runs for select to authenticated using (public.is_reviewer_or_admin());

drop policy if exists "Admins manage eval runs" on public.ai_eval_runs;
create policy "Admins manage eval runs" on public.ai_eval_runs for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users read own usage" on public.usage_events;
create policy "Users read own usage" on public.usage_events for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Service role inserts usage" on public.usage_events;
create policy "Service role inserts usage" on public.usage_events for insert to service_role with check (true);

drop policy if exists "Users read own llm runs" on public.llm_runs;
create policy "Users read own llm runs" on public.llm_runs for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Service role inserts llm runs" on public.llm_runs;
create policy "Service role inserts llm runs" on public.llm_runs for insert to service_role with check (true);

-- KB and retrieval logs are not queried directly by normal frontend routes.
drop policy if exists "Reviewers read kb sources" on public.kb_sources;
create policy "Reviewers read kb sources" on public.kb_sources for select to authenticated using (public.is_reviewer_or_admin());

drop policy if exists "Service role manages kb sources" on public.kb_sources;
create policy "Service role manages kb sources" on public.kb_sources for all to service_role using (true) with check (true);

drop policy if exists "Service role manages kb chunks" on public.kb_chunks;
create policy "Service role manages kb chunks" on public.kb_chunks for all to service_role using (true) with check (true);

drop policy if exists "Users read own retrieval logs" on public.retrieval_logs;
create policy "Users read own retrieval logs" on public.retrieval_logs for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Service role inserts retrieval logs" on public.retrieval_logs;
create policy "Service role inserts retrieval logs" on public.retrieval_logs for insert to service_role with check (true);

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;


-- Source: 009_prompt_versions_config.sql
insert into public.prompt_versions (name, version, task, system_prompt, user_prompt_template, output_schema, is_active)
values
(
  'rewrite_coach',
  'v1',
  'rewrite',
  'Bạn là công cụ hỗ trợ viết tiếng Việt phổ thông rõ ràng, tôn trọng và dễ hiểu. Giữ đúng ý người dùng. Nếu câu mơ hồ, hãy nêu chỗ chưa chắc và đặt câu hỏi làm rõ. Không tự thêm chi tiết không có trong câu gốc. Không tạo nội dung học tiếng Anh. Không dùng ngôn ngữ phán xét. Trả về JSON hợp lệ.',
  'Câu gốc: {{input_text}}\nNgữ cảnh: {{context_type}}\nGiọng điệu: {{tone}}\nTrả về JSON theo schema đã yêu cầu.',
  '{"type":"object","required":["rewritten_text","confidence_score","ambiguities","rewrite_reasons","learning_points"]}'::jsonb,
  true
),
(
  'lesson_generator',
  'v1',
  'lesson',
  'Tạo bài học nhỏ bằng tiếng Việt về cách viết rõ hơn. Không tạo bài học tiếng Anh. Nội dung ngắn, tôn trọng, dễ hiểu.',
  'Tạo bài học từ phiên viết lại: {{session_id}}',
  '{"type":"object","required":["learning_points"]}'::jsonb,
  true
),
(
  'output_critic',
  'v1',
  'critic',
  'Kiểm tra output AI theo tiêu chí giữ ý, rõ ràng, không phán xét, không thêm chi tiết không có căn cứ, không tạo bài học tiếng Anh.',
  'Kiểm tra output: {{output}}',
  '{"type":"object","required":["pass","issues","shouldRegenerate"]}'::jsonb,
  true
)
on conflict (name, version) do update set
  system_prompt = excluded.system_prompt,
  user_prompt_template = excluded.user_prompt_template,
  output_schema = excluded.output_schema,
  is_active = excluded.is_active;


-- Source: 010_rpc_match_kb_chunks.sql
create or replace function public.match_kb_chunks(
  query_embedding vector(1536),
  match_count int default 8,
  match_threshold float default 0.18
)
returns table (
  id uuid,
  source_id uuid,
  chunk_text text,
  chunk_summary text,
  tags text[],
  similarity float
)
language sql
stable
as $$
  select
    kc.id,
    kc.source_id,
    kc.chunk_text,
    kc.chunk_summary,
    kc.tags,
    1 - (kc.embedding <=> query_embedding) as similarity
  from public.kb_chunks kc
  join public.kb_sources ks on ks.id = kc.source_id
  where
    kc.embedding is not null
    and ks.is_active = true
    and ks.review_status = 'approved'
    and ks.pii_removed = true
    and kc.pii_removed = true
    and 1 - (kc.embedding <=> query_embedding) > match_threshold
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;

revoke all on function public.match_kb_chunks(vector, int, float) from public;
revoke all on function public.match_kb_chunks(vector, int, float) from anon;
revoke all on function public.match_kb_chunks(vector, int, float) from authenticated;
grant execute on function public.match_kb_chunks(vector, int, float) to service_role;


-- Source: 011_function_execute_hardening.sql
revoke all on function public.set_updated_at() from public;
revoke all on function public.handle_new_user() from public;

revoke all on function public.is_admin() from public;
revoke all on function public.is_reviewer_or_admin() from public;

grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.is_reviewer_or_admin() to authenticated, service_role;


