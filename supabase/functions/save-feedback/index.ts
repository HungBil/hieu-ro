import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, friendlyError, jsonResponse } from "../_shared/cors.ts";
import { createServiceClient, requireUser } from "../_shared/supabaseClient.ts";
import { logTrace } from "../_shared/harness.ts";

const allowedRatings = new Set(["correct", "wrong_meaning", "missing_meaning", "too_verbose", "too_hard", "hallucinated", "other"]);
const learningSignalRatings = new Set(["wrong_meaning", "missing_meaning", "hallucinated"]);

function qualityForRating(rating: string) {
  if (rating === "correct") return "good";
  if (rating === "wrong_meaning" || rating === "hallucinated" || rating === "missing_meaning") return "needs_review";
  return "unreviewed";
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
    const rating = typeof body?.rating === "string" ? body.rating : null;
    const comment = typeof body?.comment === "string" ? body.comment.slice(0, 1000) : null;
    const correctedText = typeof body?.corrected_text === "string" ? body.corrected_text.slice(0, 3000) : null;

    if (!sessionId || !rating || !allowedRatings.has(rating)) return friendlyError(400, "Góp ý chưa hợp lệ.");

    const { data: session, error: sessionError } = await service
      .from("coach_sessions")
      .select("id,user_id,input_text")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session || session.user_id !== user.id) return friendlyError(404, "Không tìm thấy phiên viết lại.");

    const { data: feedback, error: insertError } = await service
      .from("coach_feedback")
      .insert({
        user_id: user.id,
        coach_session_id: sessionId,
        rating,
        comment,
        corrected_text: correctedText,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    await service
      .from("coach_sessions")
      .update({ quality_status: qualityForRating(rating), feedback_summary: comment || rating })
      .eq("id", sessionId);

    if (correctedText && learningSignalRatings.has(rating)) {
      await service.from("learning_items").insert({
        user_id: user.id,
        source_session_id: sessionId,
        item_type: "clarity",
        title: "Sửa nghĩa theo góp ý",
        rule_text: "Khi bản dịch chưa đúng ý, so sánh câu gốc với câu đã sửa để nhớ cách diễn đạt tiếng Việt phổ thông sát nghĩa hơn.",
        unclear_example: session.input_text?.slice(0, 500) || null,
        clear_example: correctedText,
        next_review_at: new Date().toISOString(),
        interval_days: 1,
        ease_factor: 2.2,
        repetitions: 0,
        lapses: 1,
        is_active: true,
      });
    }

    await logTrace(service, {
      user_id: user.id,
      session_id: sessionId,
      trace_type: "persist",
      status: "success",
      output_snapshot: { feedback_id: feedback.id, rating },
      metadata: { function: "save-feedback" },
      started_at: started,
    });

    return jsonResponse({ feedback_id: feedback.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message === "AUTH_REQUIRED") return friendlyError(401, "Bạn cần đăng nhập để gửi góp ý.");
    return friendlyError(500, "Không thể lưu góp ý lúc này.");
  }
});
