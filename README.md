# Hiểu Rõ

Web app hỗ trợ viết tiếng Việt phổ thông rõ hơn, có auth, Supabase Postgres/RLS, Supabase Edge Functions, LLM harness, RAG từ mẫu đã duyệt, eval gate và Cloudflare Pages deploy.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Supabase Auth, Postgres, RLS, Edge Functions, pgvector
- AI: OpenAI API chỉ gọi từ Supabase Edge Functions
- Deploy: Supabase + Cloudflare Pages

## Local

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`.env.local`:

```txt
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
VITE_APP_ENV=staging
```

## Verify Before Commit

```bash
npm run verify
git config core.hooksPath .githooks
```

`verify` runs secret scan, npm audit, eval smoke gate, and production build. Live eval runs in CI after Supabase deploy through `run-eval-suite`; it fails if there are no real `ai_eval_cases`.

## Cloudflare Pages

For Git integration:

```txt
Root directory: /
Framework preset: Vite
Build command: npm run build
Build output: dist
```

Security headers are in `public/_headers`; SPA fallback is in `public/_redirects`; SEO basics are in `index.html`, `public/robots.txt`, and `public/sitemap.xml`.

## Supabase

Apply migrations in `supabase/migrations`, then deploy all functions:

```bash
supabase link --project-ref <ref>
supabase db push --yes
supabase secrets set OPENAI_API_KEY=<secret> OPENAI_FAST_MODEL=gpt-5.4-mini OPENAI_STRONG_MODEL=gpt-5.5 OPENAI_EMBEDDING_MODEL=text-embedding-3-small --project-ref <ref>
supabase functions deploy analyze-writing --no-verify-jwt
supabase functions deploy generate-lesson --no-verify-jwt
supabase functions deploy save-feedback --no-verify-jwt
supabase functions deploy ingest-approved-samples --no-verify-jwt
supabase functions deploy run-eval-suite --no-verify-jwt
```

Migration files use timestamp versions that match the production Supabase migration history. Do not re-add the old numeric `001_*` style files to `supabase/migrations`; that would make CI try to apply already-squashed schema again.

Production project currently used by this repo:

```txt
SUPABASE_PROJECT_REF=ktyshhoihpiyijswemjl
VITE_SUPABASE_URL=https://ktyshhoihpiyijswemjl.supabase.co
CLOUDFLARE_PAGES_PROJECT=hieu-ro
```

Supabase Auth URL Configuration:

```txt
Email provider: Confirm email = enabled
Site URL: https://hieu-ro.pages.dev
Redirect URLs:
https://hieu-ro.pages.dev/auth/callback
http://localhost:3000/auth/callback
http://localhost:5173/auth/callback
```

Required Edge Function secrets:

```txt
OPENAI_API_KEY
OPENAI_FAST_MODEL=gpt-5.4-mini
OPENAI_STRONG_MODEL=gpt-5.5
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
EVAL_RUNNER_TOKEN
RAG_ENABLED=true
RERANK_ENABLED=false
AI_DEFAULT_MODE=balanced
LOG_LEVEL=info
DAILY_REWRITE_LIMIT=30
```

## CI/CD

Workflow: `.github/workflows/production.yml`

Required GitHub secrets:

```txt
SUPABASE_ACCESS_TOKEN
SUPABASE_DB_PASSWORD
OPENAI_API_KEY
EVAL_AUTH_TOKEN
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

Do not push `main` until these secrets are present; the production workflow intentionally fails closed when a required deploy or eval secret is missing.

Required GitHub vars:

```txt
SUPABASE_PROJECT_REF
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
CLOUDFLARE_PAGES_PROJECT=hieu-ro
```

Deploy order on `main`: verify -> Supabase migrations/functions/secrets -> live eval -> Cloudflare Pages.

`EVAL_AUTH_TOKEN` is the GitHub-side copy of the Supabase Edge Function `EVAL_RUNNER_TOKEN`. It is only used by CI to run `run-eval-suite`; human reviewer/admin JWTs still work through normal Supabase Auth.

Security note: rotate any OpenAI key that was pasted into chat or logs before setting it as a production secret. Do not commit keys or pass them as plain command arguments.
