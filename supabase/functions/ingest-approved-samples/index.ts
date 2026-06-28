import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, friendlyError, jsonResponse } from "../_shared/cors.ts";
import { embedText } from "../_shared/openai.ts";
import { createServiceClient, isReviewerOrAdmin, requireUser } from "../_shared/supabaseClient.ts";
import { detectSensitiveInfo, logTrace } from "../_shared/harness.ts";

function formatSample(sample: any) {
  return `[Câu gốc]\n${sample.original_text}\n\n[Bối cảnh]\n${sample.context_note || "Không có bối cảnh bổ sung."}\n\n[Ý định]\n${sample.intended_meaning || "Không có ghi chú ý định."}\n\n[Câu viết rõ hơn]\n${sample.standard_vietnamese_text || ""}\n\n[Bài học]\nViết rõ ý chính, thêm bối cảnh cần thiết và giữ giọng tôn trọng.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return friendlyError(405, "Phương thức không được hỗ trợ.");

  const started = Date.now();
  const service = createServiceClient();

  try {
    const user = await requireUser(req);
    const allowed = await isReviewerOrAdmin(service, user.id);
    if (!allowed) return friendlyError(403, "Bạn không có quyền chạy ingestion.");

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Number(body?.limit || 20), 100);

    const { data: samples, error } = await service
      .from("writing_samples")
      .select("*")
      .eq("status", "approved")
      .eq("is_anonymized", true)
      .eq("contains_sensitive_info", false)
      .limit(limit);

    if (error) throw error;

    let ingested = 0;
    const skipped: Array<{ id: string; reason: string }> = [];

    for (const sample of samples || []) {
      const { data: existing } = await service
        .from("kb_sources")
        .select("id")
        .eq("source_type", "writing_sample")
        .eq("source_id", sample.id)
        .maybeSingle();

      if (existing) {
        skipped.push({ id: sample.id, reason: "already_ingested" });
        continue;
      }

      const formatted = formatSample(sample);
      const sensitive = detectSensitiveInfo(formatted);
      if (sensitive.hasSensitiveInfo) {
        skipped.push({ id: sample.id, reason: "sensitive_detected" });
        continue;
      }

      const embedding = await embedText(formatted);
      const { data: source, error: sourceError } = await service
        .from("kb_sources")
        .insert({
          source_type: "writing_sample",
          source_id: sample.id,
          title: "Mẫu câu đã duyệt",
          raw_text: formatted,
          normalized_text: formatted.toLowerCase().normalize("NFC"),
          language: "vi",
          consent_scope: sample.consent_scope,
          review_status: "approved",
          pii_removed: true,
          is_active: true,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (sourceError) throw sourceError;

      const { error: chunkError } = await service.from("kb_chunks").insert({
        source_id: source.id,
        chunk_index: 0,
        chunk_text: formatted,
        chunk_summary: sample.standard_vietnamese_text || null,
        tags: ["writing_sample", "approved"],
        embedding,
        token_count: Math.ceil(formatted.length / 4),
        pii_removed: true,
      });

      if (chunkError) throw chunkError;
      ingested += 1;
    }

    await logTrace(service, {
      user_id: user.id,
      trace_type: "persist",
      status: "success",
      output_snapshot: { ingested, skipped },
      metadata: { function: "ingest-approved-samples" },
      started_at: started,
    });

    return jsonResponse({ ingested, skipped });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message === "AUTH_REQUIRED") return friendlyError(401, "Bạn cần đăng nhập.");
    return friendlyError(500, "Không thể ingest mẫu câu lúc này.");
  }
});
