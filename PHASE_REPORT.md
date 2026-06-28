# Hiểu Rõ — Phase report

## Phase 1: App Foundation

1. Phase đã hoàn thành: Có.
2. File đã tạo/sửa: Vite/React/TypeScript config, Tailwind config, `src/main.tsx`, `src/App.tsx`, `src/lib/*`, `src/auth/*`, `src/layouts/*`, common states.
3. Database migration đã tạo/sửa: Chưa cần riêng cho Phase 1.
4. Edge Functions đã tạo/sửa: Chưa cần riêng cho Phase 1.
5. Cách test: `npm run build`, mở `/app/write` sau khi có Supabase env.
6. Lỗi còn lại: Chưa test browser thật vì chưa có Supabase project/env.
7. Việc cần làm thủ công: Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_ENV`.
8. Có thể chuyển sang phase tiếp theo chưa? Đã chuyển tiếp vì đã được xác nhận.

## Phase 2: Auth

1. Phase đã hoàn thành: Code hoàn thành.
2. File đã tạo/sửa: Login, register, forgot password, callback, AuthProvider, auth service.
3. Database migration đã tạo/sửa: auth/profile/settings/RLS nằm trong baseline `20260626054616_initial_schema.sql`.
4. Edge Functions đã tạo/sửa: Không cần OpenAI cho Auth.
5. Cách test: Register user mới, kiểm tra `profiles` và `user_settings`, login/logout.
6. Lỗi còn lại: Chưa test với Supabase Auth thật.
7. Việc cần làm thủ công: Bật email/password Auth, cấu hình Site URL và Redirect URLs.
8. Có thể chuyển sang phase tiếp theo chưa? Đã chuyển tiếp vì đã được xác nhận.

## Phase 3: Database + RLS

1. Phase đã hoàn thành: Migration đầy đủ đã tạo.
2. File đã tạo/sửa: `supabase/migrations/20260626054616_initial_schema.sql` và các migration timestamp tiếp theo.
3. Database migration đã tạo/sửa: Enums, core tables, harness tables, KB/RAG tables, triggers, auth trigger, policies, RPC `match_kb_chunks`.
4. Edge Functions đã tạo/sửa: Chưa cần riêng cho Phase 3.
5. Cách test: Apply migrations vào staging, chạy RLS test với User A/User B.
6. Lỗi còn lại: Chưa apply vào Supabase thật trong sandbox.
7. Việc cần làm thủ công: Chạy migrations trên Supabase staging trước production.
8. Có thể chuyển sang phase tiếp theo chưa? Đã chuyển tiếp vì đã được xác nhận.

## Phase 4: Core Rewrite Flow

1. Phase đã hoàn thành: Code hoàn thành.
2. File đã tạo/sửa: `/app/write`, `/app/write/:sessionId`, write components, coach service.
3. Database migration đã tạo/sửa: `coach_sessions`, `llm_runs`, `ai_traces`, `usage_events`, `retrieval_logs`.
4. Edge Functions đã tạo/sửa: `analyze-writing`.
5. Cách test: Gọi `/app/write`, nhập câu, kiểm tra kết quả ở `/app/write/:sessionId`, kiểm tra DB rows.
6. Lỗi còn lại: Chưa test OpenAI thật vì chưa có Supabase Edge secrets.
7. Việc cần làm thủ công: Set OpenAI secrets, deploy function.
8. Có thể chuyển sang phase tiếp theo chưa? Đã chuyển tiếp vì đã được xác nhận.

## Phase 5: Learning Loop

1. Phase đã hoàn thành: Code hoàn thành.
2. File đã tạo/sửa: `/app/lessons`, lesson components, lesson service.
3. Database migration đã tạo/sửa: `learning_items`, `learning_reviews`.
4. Edge Functions đã tạo/sửa: `generate-lesson`.
5. Cách test: Tạo bài học từ result, mở `/app/lessons`, bấm Học lại/Khó/Nhớ rồi/Rất dễ.
6. Lỗi còn lại: Chưa test với DB thật.
7. Việc cần làm thủ công: Deploy `generate-lesson`.
8. Có thể chuyển sang phase tiếp theo chưa? Đã chuyển tiếp vì đã được xác nhận.

## Phase 6: Samples / Dataset Builder

1. Phase đã hoàn thành: Code hoàn thành.
2. File đã tạo/sửa: `/app/samples`, `/app/samples/new`, sample components, sample service.
3. Database migration đã tạo/sửa: `writing_samples`, `saved_phrases`.
4. Edge Functions đã tạo/sửa: Ingestion function chuẩn bị cho Phase 8.
5. Cách test: Submit sample thật, kiểm tra status `pending_review`, consent saved.
6. Lỗi còn lại: Chưa test DB thật.
7. Việc cần làm thủ công: Reviewer/admin cần duyệt và đánh dấu anonymized trước ingestion.
8. Có thể chuyển sang phase tiếp theo chưa? Đã chuyển tiếp vì đã được xác nhận.

## Phase 7: Community

1. Phase đã hoàn thành: Code hoàn thành.
2. File đã tạo/sửa: `/app/community`, `/app/community/:postId`, community components, community service.
3. Database migration đã tạo/sửa: `community_posts`, `community_replies`.
4. Edge Functions đã tạo/sửa: Không cần OpenAI cho CRUD cộng đồng.
5. Cách test: Tạo post, filter tab, mở detail, reply, mark resolved nếu owner.
6. Lỗi còn lại: Chưa test DB thật.
7. Việc cần làm thủ công: Test moderation/RLS với 2 users.
8. Có thể chuyển sang phase tiếp theo chưa? Đã chuyển tiếp vì đã được xác nhận.

## Phase 8: RAG / Knowledge Base

1. Phase đã hoàn thành: Code nền tảng hoàn thành.
2. File đã tạo/sửa: KB/RAG migrations, `ingest-approved-samples`, retrieval trong `analyze-writing`.
3. Database migration đã tạo/sửa: `kb_sources`, `kb_chunks`, `retrieval_logs`, `match_kb_chunks`.
4. Edge Functions đã tạo/sửa: `ingest-approved-samples`, retrieval path trong `analyze-writing`.
5. Cách test: Duyệt sample, set `is_anonymized=true`, `contains_sensitive_info=false`, chạy ingestion, kiểm tra KB chunks, rewrite câu mơ hồ.
6. Lỗi còn lại: Rerank để mặc định off; chưa test embedding thật.
7. Việc cần làm thủ công: Set `OPENAI_EMBEDDING_MODEL`, deploy ingestion function.
8. Có thể chuyển sang phase tiếp theo chưa? Đã chuyển tiếp vì đã được xác nhận.

## Phase 9: Evaluation + Logs

1. Phase đã hoàn thành: Code và database production đã hoàn thành; live run còn phụ thuộc Edge Function secrets/token.
2. File đã tạo/sửa: Harness migrations, `run-eval-suite`, Structured Output schema, baseline eval cases, logging trong Edge Functions.
3. Database migration đã tạo/sửa: `ai_eval_cases`, `ai_eval_runs`, `ai_traces`, `llm_runs`, `usage_events`, `20260628014906_eval_cases_baseline.sql`.
4. Edge Functions đã tạo/sửa: `run-eval-suite`.
5. Cách test: `npm run eval:smoke`; sau khi deploy function/secrets thì chạy `npm run eval:live`.
6. Lỗi còn lại: Chưa chạy live eval vì chưa có production `EVAL_AUTH_TOKEN` và OpenAI secret được set qua kênh an toàn.
7. Việc cần làm thủ công: Tạo reviewer/admin token thật cho `EVAL_AUTH_TOKEN`.
8. Có thể chuyển sang phase tiếp theo chưa? Có, CI gate đã có sẵn và sẽ fail nếu eval cases rỗng hoặc average score thấp.

## Phase 10: Deploy

1. Phase đã hoàn thành: Cloudflare Pages production đã deploy; Supabase database production đã apply migrations. CI/CD workflow đã có.
2. File đã tạo/sửa: README, env examples, Cloudflare `_redirects`/`_headers`, GitHub Actions production workflow.
3. Database migration đã tạo/sửa: Production đã có migration history timestamp khớp local, gồm `private_role_helpers`, `move_vector_extension`, `eval_cases_baseline`, `rls_performance_indexes`, `remove_legacy_community_read_policies`, cộng hai no-op history sentinels `advisor_fk_indexes` và `drop_duplicate_learning_reviews_index`.
4. Edge Functions đã tạo/sửa: 5 Edge Functions đang ACTIVE trên Supabase; cần deploy lại từ source repo sau khi đủ production secrets để đảm bảo remote chạy đúng bản local mới nhất.
5. Cách test: `npm run verify`; Cloudflare Pages `https://hieu-ro.pages.dev`; Supabase advisors; function `POST /functions/v1/*` sau khi deploy.
6. Lỗi còn lại: GitHub/Supabase production secrets còn thiếu; Supabase Auth leaked-password protection cần bật trong Dashboard.
7. Việc cần làm thủ công: Rotate OpenAI key đã paste trong chat, set production secrets qua GitHub/Supabase UI hoặc token CLI, bật leaked-password protection.
8. Có thể chuyển sang phase tiếp theo chưa? Repo/DB/Pages sẵn; full production AI path chờ secrets, Edge Function deploy mới nhất và live eval.
