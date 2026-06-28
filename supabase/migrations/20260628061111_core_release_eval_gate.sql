update public.ai_eval_cases
set category = 'general_communication.regression'
where name in (
  'ambiguous_time_place_meeting',
  'vague_object_deadline_work',
  'polite_specific_feedback',
  'warning_without_blame',
  'family_time_specificity'
);

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
  'deaf_word_order_bus_late',
  'deaf_translation.word_order',
  'Hôm qua tôi xe buýt trễ cô giáo giận',
  'school',
  'neutral',
  'Có thể là: Hôm qua tôi đi xe buýt trễ nên cô giáo giận.',
  '[{"any":["xe buýt trễ","cô giáo giận"]}]'::jsonb,
  '[{"any":["trật tự từ","thứ tự ý","từ nối","nên"]}]'::jsonb,
  'medium',
  true
),
(
  'deaf_missing_role_medicine_mother',
  'deaf_translation.missing_roles',
  'Mẹ thuốc uống quên sáng đau đầu',
  'family',
  'neutral',
  'Có thể là: Sáng nay mẹ quên uống thuốc nên bị đau đầu.',
  '[{"any":["mẹ","thuốc","sáng","đau đầu"]}]'::jsonb,
  '[{"any":["chủ ngữ","ai làm gì","trật tự từ","nguyên nhân"]}]'::jsonb,
  'medium',
  true
),
(
  'deaf_possession_wallet_friend',
  'deaf_translation.possession',
  'Bạn tôi mất ví tiền trong quán tôi thấy lo',
  'personal_message',
  'neutral',
  'Có thể là: Bạn tôi bị mất ví tiền trong quán nên tôi thấy lo.',
  '[{"any":["bạn tôi","mất ví","trong quán"]}]'::jsonb,
  '[{"any":["quan hệ sở hữu","của ai","ai bị mất","trật tự từ"]}]'::jsonb,
  'medium',
  true
),
(
  'deaf_approx_word_train_ticket',
  'deaf_translation.approx_word',
  'Tôi mua vé tàu nhầm ngày mai hết chổ',
  'travel',
  'neutral',
  'Có thể là: Tôi mua nhầm vé tàu cho ngày mai, nhưng đã hết chỗ.',
  '[{"any":["nhầm ngày","hết chỗ","hết chổ"]}]'::jsonb,
  '[{"any":["từ gần đúng","chính tả","trật tự từ","hết chỗ"]}]'::jsonb,
  'medium',
  true
),
(
  'deaf_multi_clause_rain_phone',
  'deaf_translation.multi_clause',
  'Mưa to điện thoại hư không gọi bố đón',
  'family',
  'neutral',
  'Có thể là: Vì mưa to nên điện thoại bị hư, tôi không gọi được cho bố đến đón.',
  '[{"any":["mưa to","điện thoại hư","bố đón"]}]'::jsonb,
  '[{"any":["từ nối","vì","nên","nối ý"]}]'::jsonb,
  'medium',
  true
),
(
  'deaf_sensitive_money_guard',
  'deaf_translation.sensitive',
  'Ở pháp người cap trộm tiền trung anh điếc may tiền bảo vệ',
  'money',
  'neutral',
  'Có thể là: Ở Pháp, có người cắp trộm tiền của một anh điếc, may là có bảo vệ.',
  '[{"any":["cap","cắp","cướp"]},{"any":["anh điếc","tiền của anh điếc"]},{"any":["bảo vệ"]}]'::jsonb,
  '[{"any":["quan hệ sở hữu","từ gần đúng","trật tự từ"]}]'::jsonb,
  'hard',
  true
),
(
  'deaf_missing_receiver_send_photo',
  'deaf_translation.missing_roles',
  'Gửi hình bác sĩ xem chân đau',
  'family',
  'neutral',
  'Có thể là: Tôi gửi hình chân đau cho bác sĩ xem.',
  '[{"any":["gửi hình","bác sĩ","chân đau"]}]'::jsonb,
  '[{"any":["người nhận","ai gửi cho ai","chủ ngữ","tân ngữ"]}]'::jsonb,
  'medium',
  true
),
(
  'deaf_connector_lost_card_police',
  'deaf_translation.multi_clause',
  'Tôi mất thẻ ngân hàng lo quá đi công an hỏi',
  'money',
  'neutral',
  'Có thể là: Tôi bị mất thẻ ngân hàng nên rất lo và muốn đi hỏi công an.',
  '[{"any":["mất thẻ","ngân hàng","công an"]}]'::jsonb,
  '[{"any":["từ nối","nên","và","nối ý"]}]'::jsonb,
  'hard',
  true
),
(
  'learning_word_order_from_real_sentence',
  'learning_point.extraction',
  'Em mai bệnh viện đi mẹ cùng',
  'family',
  'neutral',
  'Có thể là: Ngày mai em đi bệnh viện cùng mẹ.',
  '[{"any":["mai","bệnh viện","mẹ cùng"]}]'::jsonb,
  '[{"any":["trật tự từ","thứ tự ý","ai đi đâu","cùng ai"]}]'::jsonb,
  'easy',
  true
),
(
  'learning_possession_from_real_sentence',
  'learning_point.extraction',
  'Anh điếc tiền bị lấy ở chợ',
  'money',
  'neutral',
  'Có thể là: Tiền của anh điếc bị lấy ở chợ.',
  '[{"any":["anh điếc","tiền","ở chợ"]}]'::jsonb,
  '[{"any":["quan hệ sở hữu","của ai","tiền của anh"]}]'::jsonb,
  'medium',
  true
),
(
  'deaf_approx_word_protect_help',
  'deaf_translation.approx_word',
  'Bảo dệ giúp tôi tìm ví mất',
  'money',
  'neutral',
  'Có thể là: Bảo vệ giúp tôi tìm chiếc ví bị mất.',
  '[{"any":["bảo dệ","bảo vệ"]},{"any":["ví mất","ví bị mất"]}]'::jsonb,
  '[{"any":["từ gần đúng","chính tả","bảo vệ"]}]'::jsonb,
  'easy',
  true
),
(
  'deaf_sensitive_accident_uncertain',
  'deaf_translation.sensitive',
  'Xe máy người kia đụng tôi ngã đau chân chưa biết lỗi ai',
  'warning',
  'neutral',
  'Có thể là: Tôi bị ngã và đau chân sau khi xe máy của người kia va chạm với tôi, nhưng chưa rõ lỗi thuộc về ai.',
  '[{"any":["người kia","xe máy"]},{"any":["chưa biết lỗi ai","chưa rõ lỗi","chưa xác định"]}]'::jsonb,
  '[{"any":["chưa rõ","chưa xác định","lỗi thuộc về ai","quan hệ sở hữu","nối ý"]}]'::jsonb,
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
