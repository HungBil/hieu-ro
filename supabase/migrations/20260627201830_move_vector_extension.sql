create schema if not exists extensions;
grant usage on schema extensions to anon, authenticated, service_role;

do $$
begin
  if exists (
    select 1
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'vector'
    and n.nspname <> 'extensions'
  ) then
    alter extension vector set schema extensions;
  end if;
end $$;

create or replace function public.match_kb_chunks(
  query_embedding extensions.vector(1536),
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

revoke all on function public.match_kb_chunks(extensions.vector, int, float) from public, anon, authenticated;
grant execute on function public.match_kb_chunks(extensions.vector, int, float) to service_role;
