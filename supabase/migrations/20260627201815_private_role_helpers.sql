create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
    and role = 'admin'
  );
$$;

create or replace function private.is_reviewer_or_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
    and role in ('reviewer', 'admin')
  );
$$;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()) or private.is_admin());

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles for all to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists "Users manage own coach sessions" on public.coach_sessions;
create policy "Users manage own coach sessions" on public.coach_sessions for all to authenticated using (user_id = (select auth.uid()) or private.is_admin()) with check (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Users manage own feedback" on public.coach_feedback;
create policy "Users manage own feedback" on public.coach_feedback for all to authenticated using (user_id = (select auth.uid()) or private.is_admin()) with check (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Users manage own saved phrases" on public.saved_phrases;
create policy "Users manage own saved phrases" on public.saved_phrases for all to authenticated using (user_id = (select auth.uid()) or private.is_admin()) with check (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Users manage own learning items" on public.learning_items;
create policy "Users manage own learning items" on public.learning_items for all to authenticated using (user_id = (select auth.uid()) or private.is_admin()) with check (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Users manage own learning reviews" on public.learning_reviews;
create policy "Users manage own learning reviews" on public.learning_reviews for all to authenticated using (user_id = (select auth.uid()) or private.is_admin()) with check (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Users read own samples or reviewers read all" on public.writing_samples;
create policy "Users read own samples or reviewers read all" on public.writing_samples for select to authenticated using (user_id = (select auth.uid()) or private.is_reviewer_or_admin());

drop policy if exists "Reviewers update samples" on public.writing_samples;
create policy "Reviewers update samples" on public.writing_samples for update to authenticated using (private.is_reviewer_or_admin()) with check (private.is_reviewer_or_admin());

drop policy if exists "Users update own community posts" on public.community_posts;
create policy "Users update own community posts" on public.community_posts for update to authenticated using (user_id = (select auth.uid()) or private.is_admin()) with check (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Users delete own community posts" on public.community_posts;
create policy "Users delete own community posts" on public.community_posts for delete to authenticated using (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Users update own replies" on public.community_replies;
create policy "Users update own replies" on public.community_replies for update to authenticated using (user_id = (select auth.uid()) or private.is_admin()) with check (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Users delete own replies" on public.community_replies;
create policy "Users delete own replies" on public.community_replies for delete to authenticated using (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Admins manage prompt versions" on public.prompt_versions;
create policy "Admins manage prompt versions" on public.prompt_versions for all to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists "Users read own ai traces" on public.ai_traces;
create policy "Users read own ai traces" on public.ai_traces for select to authenticated using (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Users read own tool calls" on public.ai_tool_calls;
create policy "Users read own tool calls" on public.ai_tool_calls for select to authenticated using (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Reviewers read eval cases" on public.ai_eval_cases;
create policy "Reviewers read eval cases" on public.ai_eval_cases for select to authenticated using (private.is_reviewer_or_admin());

drop policy if exists "Admins manage eval cases" on public.ai_eval_cases;
create policy "Admins manage eval cases" on public.ai_eval_cases for all to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists "Reviewers read eval runs" on public.ai_eval_runs;
create policy "Reviewers read eval runs" on public.ai_eval_runs for select to authenticated using (private.is_reviewer_or_admin());

drop policy if exists "Admins manage eval runs" on public.ai_eval_runs;
create policy "Admins manage eval runs" on public.ai_eval_runs for all to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists "Users read own usage" on public.usage_events;
create policy "Users read own usage" on public.usage_events for select to authenticated using (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Users read own llm runs" on public.llm_runs;
create policy "Users read own llm runs" on public.llm_runs for select to authenticated using (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Reviewers read kb sources" on public.kb_sources;
create policy "Reviewers read kb sources" on public.kb_sources for select to authenticated using (private.is_reviewer_or_admin());

drop policy if exists "Users read own retrieval logs" on public.retrieval_logs;
create policy "Users read own retrieval logs" on public.retrieval_logs for select to authenticated using (user_id = (select auth.uid()) or private.is_admin());

create schema if not exists extensions;
set search_path = public, extensions;

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
set search_path = public, extensions
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

reset search_path;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon, authenticated;
revoke all on function public.is_reviewer_or_admin() from public, anon, authenticated;
do $$
begin
  revoke all on function public.rls_auto_enable() from public, anon, authenticated;
exception
  when undefined_function then null;
end $$;
revoke all on function public.match_kb_chunks(vector, int, float) from public, anon, authenticated;

revoke all on function private.is_admin() from public, anon;
revoke all on function private.is_reviewer_or_admin() from public, anon;
grant execute on function private.is_admin() to authenticated, service_role;
grant execute on function private.is_reviewer_or_admin() to authenticated, service_role;
grant execute on function public.match_kb_chunks(vector, int, float) to service_role;
