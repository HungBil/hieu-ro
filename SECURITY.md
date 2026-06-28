# Security

- Never expose OpenAI or Supabase service-role secrets to the frontend.
- Frontend may use only `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_APP_ENV`.
- OpenAI calls must go through Supabase Edge Functions.
- Public tables have RLS enabled in migrations.
- User-owned tables use owner predicates with `auth.uid()` or private role helpers.
- `kb_chunks`, `kb_sources`, `ai_traces`, `llm_runs`, and `prompt_versions` are not queried by normal frontend screens.

## RLS Manual Probe

Create two disposable users, insert one row each in `coach_sessions`, `learning_items`, and `writing_samples`, then query as user A:

```sql
select count(*) from public.coach_sessions where user_id = '<user_b>';
select count(*) from public.learning_items where user_id = '<user_b>';
select count(*) from public.writing_samples where user_id = '<user_b>';
```

Each result must be `0`. Repeat write/update attempts against user B rows; they must fail or affect zero rows.

## Required Checks

```bash
npm run lint:secrets
npm audit --audit-level=high
npm run verify
```
