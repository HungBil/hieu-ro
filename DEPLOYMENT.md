# Deployment

## Local

```bash
npm ci
npm run dev
```

`.env.local` cần:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_APP_ENV=local
```

## Supabase

```bash
supabase link --project-ref <ref>
supabase db push --yes
supabase secrets set OPENAI_API_KEY=<secret> OPENAI_FAST_MODEL=gpt-5.4-mini OPENAI_STRONG_MODEL=gpt-5.5 OPENAI_EMBEDDING_MODEL=text-embedding-3-small RAG_ENABLED=true RERANK_ENABLED=false AI_DEFAULT_MODE=balanced DAILY_REWRITE_LIMIT=30 LOG_LEVEL=info --project-ref <ref>
supabase functions deploy analyze-writing generate-lesson save-feedback ingest-approved-samples run-eval-suite --project-ref <ref> --no-verify-jwt
```

## Cloudflare Pages

CI deploys `dist` with Wrangler after live eval passes. Required GitHub vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `CLOUDFLARE_PAGES_PROJECT`.

Manual fallback:

```bash
npm run verify
npx wrangler@4.100.0 pages deploy dist --project-name hieu-ro --branch main
```
