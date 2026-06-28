# Architecture

Hiểu Rõ core loop:

```txt
unclear input
-> analyze-writing Edge Function
-> clear Vietnamese message
-> meaning structure
-> uncertainty questions
-> micro-lesson
-> feedback
-> consented dataset improvement
```

Frontend is React/Vite and stores only public Supabase config. Supabase owns Auth, Postgres, RLS, Edge Functions, pgvector retrieval, eval runs, and learning review data.

Edge Functions:

- `analyze-writing`: auth, validation, sensitive detection, optional RAG, OpenAI call, schema validation, critic, persistence
- `save-feedback`: saves result feedback and can create follow-up learning items
- `generate-lesson`: turns result learning points into spaced-repetition items
- `ingest-approved-samples`: embeds approved anonymized samples
- `run-eval-suite`: runs core eval cases and stores release-gate results
