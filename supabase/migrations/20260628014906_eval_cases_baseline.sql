create unique index if not exists ai_eval_cases_name_key on public.ai_eval_cases(name);

insert into public.ai_eval_cases (
  name,
  category,
  input_text,
  context_type,
  tone,
  expected_rewrite,
  expected_ambiguities,
  expected_learning_points,
  difficulty,
  is_active
)
values
(
  'ambiguous_time_place_meeting',
  'ambiguity',
  'Mai gặp ở chỗ cũ nha',
  'personal_message',
  'friendly',
  'Mai mình gặp nhau ở chỗ cũ nhé. Bạn xác nhận giúp mình thời gian cụ thể và địa điểm là chỗ nào được không?',
  '["mai", "chỗ cũ"]'::jsonb,
  '["thời gian", "địa điểm"]'::jsonb,
  'medium',
  true
),
(
  'vague_object_deadline_work',
  'ambiguity',
  'Gửi cái đó cho chị sớm nha',
  'work',
  'polite',
  'Chị muốn em gửi tài liệu nào và trước thời hạn nào? Em sẽ gửi đúng phần đó sau khi chị xác nhận giúp em.',
  '["cái đó", "sớm"]'::jsonb,
  '["đối tượng", "thời hạn"]'::jsonb,
  'medium',
  true
),
(
  'polite_specific_feedback',
  'politeness',
  'Cái này chưa ổn, làm lại đi',
  'work',
  'polite',
  'Phần này vẫn cần chỉnh lại để rõ hơn. Bạn xem giúp mình điểm chưa ổn và cập nhật lại nhé.',
  '["cái này"]'::jsonb,
  '["góp ý", "cụ thể"]'::jsonb,
  'medium',
  true
),
(
  'warning_without_blame',
  'warning',
  'Đừng để chuyện này xảy ra nữa',
  'work',
  'formal',
  'Mình muốn việc này không lặp lại. Lần sau, mình cần bạn kiểm tra kỹ hơn trước khi hoàn tất.',
  '["chuyện này"]'::jsonb,
  '["hành động", "mong muốn"]'::jsonb,
  'hard',
  true
),
(
  'family_time_specificity',
  'time_specificity',
  'Mẹ nhắc con về sớm',
  'family',
  'friendly',
  'Mẹ nhắc con về nhà sớm nhé. Con cho mẹ biết con dự kiến về lúc mấy giờ được không?',
  '["sớm"]'::jsonb,
  '["giờ cụ thể", "thời gian"]'::jsonb,
  'easy',
  true
)
on conflict (name) do update set
  category = excluded.category,
  input_text = excluded.input_text,
  context_type = excluded.context_type,
  tone = excluded.tone,
  expected_rewrite = excluded.expected_rewrite,
  expected_ambiguities = excluded.expected_ambiguities,
  expected_learning_points = excluded.expected_learning_points,
  difficulty = excluded.difficulty,
  is_active = excluded.is_active;
