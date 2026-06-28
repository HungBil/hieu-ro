import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, friendlyError, jsonResponse } from "../_shared/cors.ts";
import { callOpenAIChat } from "../_shared/openai.ts";
import { createServiceClient, isReviewerOrAdmin, requireUser } from "../_shared/supabaseClient.ts";
import { buildRewriteMessages, criticRewriteResult, rewriteResultJsonSchema, safeParseJson, validateRewriteResult } from "../_shared/harness.ts";

const PROMPT_VERSION = "rewrite_coach_v2";

function normalizeForEval(value: string) {
  return value.toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function expectedTerms(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value;
}

function includesTermGroup(haystack: string, item: unknown) {
  const normalized = normalizeForEval(haystack);
  if (typeof item === "string") return normalized.includes(normalizeForEval(item));
  if (!item || typeof item !== "object") return true;
  const group = item as { contains?: unknown; phrase?: unknown; term?: unknown; any?: unknown };
  if (typeof group.contains === "string") return normalized.includes(normalizeForEval(group.contains));
  if (typeof group.phrase === "string") return normalized.includes(normalizeForEval(group.phrase));
  if (typeof group.term === "string") return normalized.includes(normalizeForEval(group.term));
  if (Array.isArray(group.any)) return group.any.some((term) => typeof term === "string" && normalized.includes(normalizeForEval(term)));
  return true;
}

function includesTerms(haystack: string, terms: unknown[]) {
  if (!terms.length) return true;
  return terms.every((term) => includesTermGroup(haystack, term));
}

function isCoreEval(category: string | null) {
  return Boolean(category?.startsWith("deaf_translation") || category?.startsWith("learning_point") || category?.startsWith("adaptive_learning"));
}

function safeTokenEqual(a: string, b: string) {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    diff |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return diff === 0;
}

async function requireEvalRunner(req: Request, service: ReturnType<typeof createServiceClient>) {
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "").trim() : "";
  const runnerToken = Deno.env.get("EVAL_RUNNER_TOKEN");
  if (runnerToken && token && safeTokenEqual(token, runnerToken)) return null;

  const user = await requireUser(req);
  const allowed = await isReviewerOrAdmin(service, user.id);
  if (!allowed) throw new Error("EVAL_FORBIDDEN");
  return user.id;
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

const rubricKeys = ["meaning_preservation", "clarity", "no_hallucination", "respectful_tone", "ambiguity_handling", "learning_quality", "overall"] as const;

function emptyRubric() {
  return Object.fromEntries(rubricKeys.map((key) => [key, 0])) as Record<(typeof rubricKeys)[number], number>;
}

function addRubricScore(total: Record<(typeof rubricKeys)[number], number>, score: Record<(typeof rubricKeys)[number], number>) {
  for (const key of rubricKeys) total[key] += score[key];
}

function averageRubric(total: Record<(typeof rubricKeys)[number], number>, count: number) {
  return Object.fromEntries(rubricKeys.map((key) => [key, Number((total[key] / count).toFixed(2))]));
}

function classifyError(message: string) {
  if (message.startsWith("Missing OPENAI_API_KEY")) return "missing_openai_api_key";
  if (/quota|billing|insufficient/i.test(message)) return "openai_quota_or_billing";
  if (/api key|authentication|unauthorized/i.test(message)) return "openai_auth";
  if (/schema|response_format|json_schema/i.test(message)) return "openai_schema";
  if (/model/i.test(message)) return "openai_model";
  return "internal";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return friendlyError(405, "Phương thức không được hỗ trợ.");

  const service = createServiceClient();
  let runBy: string | null = null;
  let model = Deno.env.get("OPENAI_FAST_MODEL") || "gpt-5.4-mini";

  try {
    runBy = await requireEvalRunner(req, service);
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
    let corePassed = 0;
    let coreCases = 0;
    let coreScore = 0;
    const coreRubricTotal = emptyRubric();

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
      const critic = parsed.result ? criticRewriteResult(evalCase.input_text, parsed.result) : { pass: false, issues: ["missing result"] };
      const hasRewrite = Boolean(parsed.result?.rewritten_text);
      const respectful = !JSON.stringify(parsed.result || {}).toLowerCase().includes(`bạn ${"viết"} ${"sai"}`);
      const noEnglishLesson = !JSON.stringify(parsed.result?.learning_points || {}).toLowerCase().match(/\benglish|vocabulary|pronunciation\b/);
      const ambiguityText = JSON.stringify(parsed.result?.ambiguities || []);
      const lessonText = JSON.stringify(parsed.result?.learning_points || []);
      const expectedAmbiguitiesMet = includesTerms(ambiguityText, expectedTerms(evalCase.expected_ambiguities));
      const expectedLearningMet = includesTerms(lessonText, expectedTerms(evalCase.expected_learning_points));
      const expectedRewriteAligned = tokenOverlap(parsed.result?.rewritten_text || "", evalCase.expected_rewrite) >= 0.35;
      const criteria = [
        hasRewrite && parsed.issues.length === 0 && critic.pass,
        respectful && noEnglishLesson,
        expectedRewriteAligned,
        expectedAmbiguitiesMet,
        expectedLearningMet,
      ];
      const overall = expectedRewriteAligned ? Math.max(1, criteria.filter(Boolean).length) : 0;
      const rubric = {
        meaning_preservation: expectedRewriteAligned ? 5 : 0,
        clarity: hasRewrite && parsed.issues.length === 0 ? 5 : 2,
        no_hallucination: critic.pass && expectedRewriteAligned ? 5 : 2,
        respectful_tone: respectful && noEnglishLesson ? 5 : 0,
        ambiguity_handling: expectedAmbiguitiesMet ? 5 : 3,
        learning_quality: expectedLearningMet && noEnglishLesson ? 5 : noEnglishLesson ? 4 : 0,
        overall,
      };
      if (overall >= 4) passed += 1;
      totalScore += overall;
      const core = isCoreEval(evalCase.category);
      if (core) {
        coreCases += 1;
        coreScore += overall;
        addRubricScore(coreRubricTotal, rubric);
        if (overall >= 4) corePassed += 1;
      }
      details.push({
        case_id: evalCase.id,
        name: evalCase.name,
        category: evalCase.category,
        core,
        overall,
        rewritten_text: parsed.result?.rewritten_text || "",
        ambiguities: parsed.result?.ambiguities || [],
        learning_points: parsed.result?.learning_points || [],
        rubric,
        checks: {
          hasRewrite,
          respectful,
          noEnglishLesson,
          criticPass: critic.pass,
          expectedRewriteAligned,
          expectedAmbiguitiesMet,
          expectedLearningMet,
        },
        issues: [...parsed.issues, ...critic.issues],
      });
    }

    if (!coreCases) return friendlyError(409, "Chưa có eval core cho tính năng dịch câu người điếc.");

    const average = Number((coreScore / coreCases).toFixed(2));
    const allAverage = Number((totalScore / cases.length).toFixed(2));
    const corePassRate = Number((corePassed / coreCases).toFixed(3));
    const coreRubric = averageRubric(coreRubricTotal, coreCases);
    const { data: run, error: runError } = await service
      .from("ai_eval_runs")
      .insert({
        run_by: runBy,
        prompt_version: PROMPT_VERSION,
        model,
        total_cases: cases.length,
        passed_cases: corePassed,
        average_score: average,
        details: { core: { total_cases: coreCases, passed_cases: corePassed, average_score: average, pass_rate: corePassRate, rubric: coreRubric }, all: { total_cases: cases.length, passed_cases: passed, average_score: allAverage }, cases: details },
      })
      .select("id")
      .single();

    if (runError) throw runError;
    return jsonResponse({ run_id: run.id, total_cases: coreCases, passed_cases: corePassed, average_score: average, pass_rate: corePassRate, rubric: coreRubric, details });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (message === "AUTH_REQUIRED") return friendlyError(401, "Bạn cần đăng nhập.");
    if (message === "EVAL_FORBIDDEN") return friendlyError(403, "Bạn không có quyền chạy eval.");
    const debugCode = classifyError(message);
    console.error("run-eval-suite failed", { message });
    await service.from("ai_eval_runs").insert({
      run_by: runBy,
      prompt_version: PROMPT_VERSION,
      model,
      total_cases: 0,
      passed_cases: 0,
      average_score: 0,
      details: [{ error_code: debugCode }],
    });
    return jsonResponse({ error: "Không thể chạy eval lúc này.", debug_code: debugCode }, 500);
  }
});
