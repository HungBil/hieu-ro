import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, friendlyError, jsonResponse } from "../_shared/cors.ts";
import { createServiceClient, requireUser } from "../_shared/supabaseClient.ts";
import { allowedLearningTypes, logTrace } from "../_shared/harness.ts";

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function sanitizeLearningPoint(point: any, fallbackInput: string) {
  return {
    item_type: allowedLearningTypes.has(String(point?.type)) ? String(point.type) : "clarity",
    title: typeof point?.title === "string" && point.title.trim() ? point.title.slice(0, 120) : "Viết rõ ý hơn",
    rule_text:
      typeof point?.rule_text === "string" && point.rule_text.trim()
        ? point.rule_text.slice(0, 500)
        : "Khi viết, hãy thêm đủ bối cảnh để người đọc hiểu ý chính.",
    unclear_example: typeof point?.unclear_example === "string" ? point.unclear_example.slice(0, 500) : fallbackInput.slice(0, 500),
    clear_example: typeof point?.clear_example === "string" ? point.clear_example.slice(0, 500) : null,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return friendlyError(405, "Phương thức không được hỗ trợ.");

  const started = Date.now();
  const service = createServiceClient();

  try {
    const user = await requireUser(req);
    const body = await req.json().catch(() => null);
    const sessionId = typeof body?.session_id === "string" ? body.session_id : null;
    if (!sessionId) return friendlyError(400, "Thiếu phiên viết lại.");

    const { data: session, error: sessionError } = await service
      .from("coach_sessions")
      .select("id,user_id,input_text,result_json")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session || session.user_id !== user.id) return friendlyError(404, "Không tìm thấy phiên viết lại.");

    const { data: existing, error: existingError } = await service
      .from("learning_items")
      .select("id")
      .eq("user_id", user.id)
      .eq("source_session_id", sessionId);

    if (existingError) throw existingError;
    if (existing?.length) {
      return jsonResponse({ item_ids: existing.map((item: any) => item.id), created_count: 0 });
    }

    const resultJson = session.result_json || {};
    const rawPoints = Array.isArray(resultJson.learning_points) ? resultJson.learning_points : [];
    const fallbackReasons = Array.isArray(resultJson.rewrite_reasons) ? resultJson.rewrite_reasons : [];
    const points = rawPoints.length
      ? rawPoints.slice(0, 3).map((point: any) => sanitizeLearningPoint(point, session.input_text))
      : [
          {
            item_type: "clarity",
            title: "Viết rõ ý chính",
            rule_text: fallbackReasons[0] || "Khi viết, hãy nêu rõ ý chính và thêm bối cảnh cần thiết để người đọc hiểu nhanh hơn.",
            unclear_example: session.input_text.slice(0, 500),
            clear_example: resultJson.rewritten_text || null,
          },
        ];

    const rows = points.map((point: any) => ({
      user_id: user.id,
      source_session_id: sessionId,
      ...point,
      next_review_at: addDays(1),
      interval_days: 1,
      ease_factor: 2.5,
      repetitions: 0,
      lapses: 0,
      is_active: true,
    }));

    const { data: inserted, error: insertError } = await service.from("learning_items").insert(rows).select("id");
    if (insertError) throw insertError;

    await service.from("usage_events").insert({
      user_id: user.id,
      event_type: "lesson_generation",
      metadata: { session_id: sessionId, created_count: inserted?.length || 0 },
    });

    await logTrace(service, {
      user_id: user.id,
      session_id: sessionId,
      trace_type: "persist",
      status: "success",
      output_snapshot: { item_ids: (inserted || []).map((item: any) => item.id) },
      metadata: { function: "generate-lesson" },
      started_at: started,
    });

    return jsonResponse({ item_ids: (inserted || []).map((item: any) => item.id), created_count: inserted?.length || 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message === "AUTH_REQUIRED") return friendlyError(401, "Bạn cần đăng nhập để dùng tính năng này.");
    return friendlyError(500, "Không thể tạo bài học lúc này. Vui lòng thử lại sau.");
  }
});
