create index if not exists ai_eval_cases_created_by_idx on public.ai_eval_cases(created_by);
create index if not exists ai_eval_runs_run_by_idx on public.ai_eval_runs(run_by);
create index if not exists ai_tool_calls_user_idx on public.ai_tool_calls(user_id);
create index if not exists coach_feedback_user_idx on public.coach_feedback(user_id);
create index if not exists community_posts_user_idx on public.community_posts(user_id);
create index if not exists community_replies_user_idx on public.community_replies(user_id);
create index if not exists kb_sources_created_by_idx on public.kb_sources(created_by);
create index if not exists learning_items_source_session_idx on public.learning_items(source_session_id);
create index if not exists learning_reviews_item_idx on public.learning_reviews(learning_item_id);
create index if not exists learning_reviews_user_idx on public.learning_reviews(user_id);
create index if not exists llm_runs_coach_session_idx on public.llm_runs(coach_session_id);
create index if not exists prompt_versions_created_by_idx on public.prompt_versions(created_by);
create index if not exists saved_phrases_coach_session_idx on public.saved_phrases(coach_session_id);
create index if not exists writing_samples_reviewer_idx on public.writing_samples(reviewer_id);

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Profiles select access" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or private.is_admin());
create policy "Profiles insert access" on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()) or private.is_admin());
create policy "Profiles update access" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or private.is_admin())
  with check (id = (select auth.uid()) or private.is_admin());
create policy "Profiles delete admin access" on public.profiles
  for delete to authenticated
  using (private.is_admin());

drop policy if exists "Users manage own settings" on public.user_settings;
create policy "Users manage own settings" on public.user_settings
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users insert own samples" on public.writing_samples;
create policy "Users insert own samples" on public.writing_samples
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users update own unreviewed samples" on public.writing_samples;
drop policy if exists "Reviewers update samples" on public.writing_samples;
create policy "Samples update access" on public.writing_samples
  for update to authenticated
  using (
    (user_id = (select auth.uid()) and status in ('draft','pending_review','needs_changes'))
    or private.is_reviewer_or_admin()
  )
  with check (user_id = (select auth.uid()) or private.is_reviewer_or_admin());

drop policy if exists "Authenticated users read community posts" on public.community_posts;
create policy "Authenticated users read community posts" on public.community_posts
  for select to authenticated
  using ((select auth.uid()) is not null);

drop policy if exists "Users create own community posts" on public.community_posts;
create policy "Users create own community posts" on public.community_posts
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Authenticated users read community replies" on public.community_replies;
create policy "Authenticated users read community replies" on public.community_replies
  for select to authenticated
  using ((select auth.uid()) is not null);

drop policy if exists "Users create own replies" on public.community_replies;
create policy "Users create own replies" on public.community_replies
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Reviewers read eval cases" on public.ai_eval_cases;
drop policy if exists "Admins manage eval cases" on public.ai_eval_cases;
create policy "Reviewers read eval cases" on public.ai_eval_cases
  for select to authenticated
  using (private.is_reviewer_or_admin());
create policy "Admins insert eval cases" on public.ai_eval_cases
  for insert to authenticated
  with check (private.is_admin());
create policy "Admins update eval cases" on public.ai_eval_cases
  for update to authenticated
  using (private.is_admin())
  with check (private.is_admin());
create policy "Admins delete eval cases" on public.ai_eval_cases
  for delete to authenticated
  using (private.is_admin());

drop policy if exists "Reviewers read eval runs" on public.ai_eval_runs;
drop policy if exists "Admins manage eval runs" on public.ai_eval_runs;
create policy "Reviewers read eval runs" on public.ai_eval_runs
  for select to authenticated
  using (private.is_reviewer_or_admin());
create policy "Admins insert eval runs" on public.ai_eval_runs
  for insert to authenticated
  with check (private.is_admin());
create policy "Admins update eval runs" on public.ai_eval_runs
  for update to authenticated
  using (private.is_admin())
  with check (private.is_admin());
create policy "Admins delete eval runs" on public.ai_eval_runs
  for delete to authenticated
  using (private.is_admin());
