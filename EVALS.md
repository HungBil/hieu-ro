# Evals

Eval cases live in `public.ai_eval_cases` and are seeded only as eval data, not user/community/sample runtime content.

Run local static smoke:

```bash
npm run eval:smoke
```

Run live production/staging eval:

```bash
EVAL_FUNCTION_URL=https://<project-ref>.supabase.co/functions/v1/run-eval-suite EVAL_AUTH_TOKEN=<token> npm run eval:live
```

Release gate:

- core eval cases must all pass
- average overall must be at least `4.0`
- failures print the failed core case name and checks

Required category coverage: missing subject, time ambiguity, recipient ambiguity, school, family, work, polite request, money warning, and high ambiguity.
