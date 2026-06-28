import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, friendlyError, jsonResponse } from "../_shared/cors.ts";
import { callOpenAIChat } from "../_shared/openai.ts";
import { createServiceClient, isReviewerOrAdmin, requireUser } from "../_shared/supabaseClient.ts";
import { buildRewriteMessages, rewriteResultJsonSchema, safeParseJson, validateRewriteResult } from "../_shared/harness.ts";

const PROMPT_VERSION = "rewrite_coach_v1";

function normalizeForEval(value: string) {
  return value.toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function expectedTerms(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (typeof item?.contains === "string") return item.contains;
      if (typeof item?.phrase === "string") return item.phrase;
      if (typeof item?.term === "string") return item.term;
      return "";
    })
    .map((item) => normalizeForEval(item))
    .filter(Boolean);
}

function includesTerms(haystack: string, terms: string[]) {
  if (!terms.length) return true;
  const normalized = normalizeForEval(haystack);
  return terms.every((term) => normalized.includes(term));
}

function tokenOverlap(actual: string, expected: string | null) {
  if (!expected) return 1;
  const stopWords = new Set(["anh", "chị", "em", "mình", "bạn", "cho", "với", "nha", "nhé", "được", "không", "cần"]);
  const expectedTokens = normalizeForEval(expected)
    .split(" ")
    .filter((token) => token.length > 2 && !stopWords.has(token));
  if (!expectedTokens.length) return 1;

  const actualText = normalizeForEval(actual);
  const matched = expectedTokens.filter((token) => actualText.includes(token)).length;
  return matched / expectedTokens.length;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return friendlyError(405, "Phương thức không được hỗ trợ.");

  const service = createServiceClient();

  try {
    const user = await requireUser(req);
    const allowed = await isReviewerOrAdmin(service, user.id);
    if (!allowed) return friendlyError(403, "Bạn không có quyền chạy eval.");

    const model = Deno.env.get("OPENAI_FAST_MODEL") || "gpt-5.4-mini";
    const { data: cases, error } = await service
      .from("ai_eval_cases")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) throw error;
    if (!cases?.length) return friendlyError(409, "Chưa có eval case thật nên không thể duyệt AI.");

    const details = [];
    let passed = 0;
    let totalScore = 0;

    for (const evalCase of cases) {
      const completion = await callOpenAIChat({
        model,
        messages: buildRewriteMessages({
          inputText: evalCase.input_text,
          contextType: evalCase.context_type,
          tone: evalCase.tone,
          retrievedExamples: [],
        }),
        responseFormat: { name: "rewrite_result", schema: rewriteResultJsonSchema },
      });

      const parsed = validateRewriteResult(safeParseJson(completion.content));
      const hasRewrite = Boolean(parsed.result?.rewritten_text);
      const respectful = !JSON.stringify(parsed.result || {}).toLowerCase().includes(`bạn ${"viết"} ${"sai"}`);
      const noEnglishLesson = !JSON.stringify(parsed.result?.learning_points || {}).toLowerCase().match(/\benglish|vocabulary|pronunciation\b/);
      const ambiguityText = JSON.stringify(parsed.result?.ambiguities || []);
      const lessonText = JSON.stringify(parsed.result?.learning_points || []);
      const expectedAmbiguitiesMet = includesTerms(ambiguityText, expectedTerms(evalCase.expected_ambiguities));
      const expectedLearningMet = includesTerms(lessonText, expectedTerms(evalCase.expected_learning_points));
      const expectedRewriteAligned = tokenOverlap(parsed.result?.rewritten_text || "", evalCase.expected_rewrite) >= 0.35;
      const criteria = [
        hasRewrite && parsed.issues.length === 0,
        respectful && noEnglishLesson,
        expectedRewriteAligned,
        expectedAmbiguitiesMet,
        expectedLearningMet,
      ];
      const overall = Math.max(1, criteria.filter(Boolean).length);
      if (overall >= 4) passed += 1;
      totalScore += overall;
      details.push({
        case_id: evalCase.id,
        name: evalCase.name,
        overall,
        checks: {
          hasRewrite,
          respectful,
          noEnglishLesson,
          expectedRewriteAligned,
          expectedAmbiguitiesMet,
          expectedLearningMet,
        },
        issues: parsed.issues,
      });
    }

    const average = Number((totalScore / cases.length).toFixed(2));
    const { data: run, error: runError } = await service
      .from("ai_eval_runs")
      .insert({
        run_by: user.id,
        prompt_version: PROMPT_VERSION,
        model,
        total_cases: cases.length,
        passed_cases: passed,
        average_score: average,
        details,
      })
      .select("id")
      .single();

    if (runError) throw runError;
    return jsonResponse({ run_id: run.id, total_cases: cases.length, passed_cases: passed, average_score: average, details });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message === "AUTH_REQUIRED") return friendlyError(401, "Bạn cần đăng nhập.");
    return friendlyError(500, "Không thể chạy eval lúc này.");
  }
});
