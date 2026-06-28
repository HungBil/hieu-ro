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
  'deaf_written_order_theft_france',
  'deaf_translation',
  'Ở pháp người cap trộm tiền trung anh điếc may tiền bảo vệ',
  'warning',
  'neutral',
  'Có thể là: Ở Pháp, có người cắp trộm tiền của một anh điếc, nhưng may là có bảo vệ.',
  '["cap", "trung anh điếc", "bảo vệ"]'::jsonb,
  '["trật tự từ", "quan hệ sở hữu", "từ gần đúng"]'::jsonb,
  'hard',
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
