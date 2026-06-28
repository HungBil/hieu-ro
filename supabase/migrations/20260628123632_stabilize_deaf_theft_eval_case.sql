update public.ai_eval_cases
set
  expected_ambiguities = '[
    {"any":["cap","cắp","trộm"]},
    {"any":["trung anh","anh điếc","tên người","cụm này"]},
    {"any":["bảo vệ","báo bảo vệ","nhờ bảo vệ"]}
  ]'::jsonb,
  expected_learning_points = '[
    {"any":["word_order","trật tự","thứ tự"]},
    {"any":["từ đúng","từ gần đúng","cắp","trộm"]},
    {"any":["nối ý","dấu phẩy","connector"]}
  ]'::jsonb
where name = 'deaf_written_order_theft_france';
