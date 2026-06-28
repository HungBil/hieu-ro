import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, friendlyError, jsonResponse } from "../_shared/cors.ts";
import { callOpenAIChat, embedText } from "../_shared/openai.ts";
import { createServiceClient, requireUser } from "../_shared/supabaseClient.ts";
import {
  buildRewriteMessages,
  chooseModel,
  criticRewriteResult,
  detectSensitiveInfo,
  estimateAmbiguityScore,
  estimateCost,
  hashText,
  logTrace,
  rewriteResultJsonSchema,
  safeParseJson,
  validateAnalyzeInput,
  validateRewriteResult,
  type RewriteResult,
} from "../_shared/harness.ts";

const PROMPT_NAME = "rewrite_coach";
const PROMPT_VERSION = "v2";

function isConfigurationError(message: string | null) {
  return Boolean(message?.startsWith("Missing "));
}

async function enforceDailyLimit(service: any, userId: string) {
  const { data: profile } = await service.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (profile?.role === "admin") return;

  const limit = Number(Deno.env.get("DAILY_REWRITE_LIMIT") || "30");
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await service
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("event_type", "rewrite_call")
    .gte("created_at", since);

  if (error) throw error;
  if ((count || 0) >= limit) throw new Error("DAILY_LIMIT_EXCEEDED");
}

async function maybeRetrieve(service: any, input: {
  userId: string;
  sessionId: string;
  query: string;
  ambiguityScore: number;
  sensitive: boolean;
}) {
  const ragEnabled = (Deno.env.get("RAG_ENABLED") || "true") === "true";
  if (!ragEnabled || input.sensitive) {
    return { chunks: [], ids: [], reason: ragEnabled ? "sensitive_input" : "rag_disabled" };
  }

  const { count } = await service.from("kb_chunks").select("id", { count: "exact", head: true }).not("embedding", "is", null);
  if (!count) return { chunks: [], ids: [], reason: "kb_empty" };

  const embedding = await embedText(input.query);
  const { data, error } = await service.rpc("match_kb_chunks", {
    query_embedding: embedding,
    match_count: 8,
    match_threshold: 0.18,
  });

  if (error) throw error;
  const chunks = Array.isArray(data) ? data : [];
  const ids = chunks.map((chunk: any) => chunk.id);

  await service.from("retrieval_logs").insert({
    user_id: input.userId,
    session_id: input.sessionId,
    query_text: input.query,
    query_embedding: embedding,
    retrieved_chunk_ids: ids,
    reranked_chunk_ids: ids.slice(0, 4),
    retrieval_metadata: {
      topK: 8,
      minSimilarity: 0.18,
      reason: "pgvector",
      rerankEnabled: false,
    },
  });

  return { chunks: chunks.slice(0, 4), ids, reason: "retrieved" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return friendlyError(405, "Phương thức không được hỗ trợ.");

  const service = createServiceClient();
  const functionStarted = Date.now();
  let userId: string | null = null;
  let sessionId: string | null = null;
  let model = Deno.env.get("OPENAI_FAST_MODEL") || "gpt-5.4-mini";
  let inputHash: string | null = null;
  let llmPayload: Record<string, unknown> | null = null;
  let retrievedChunkIds: string[] = [];

  try {
    const user = await requireUser(req);
    userId = user.id;

    const body = await req.json().catch(() => null);
    const parsed = validateAnalyzeInput(body);
    inputHash = await hashText(parsed.inputText);

    await enforceDailyLimit(service, user.id);

    const sensitive = detectSensitiveInfo(parsed.inputText);
    const ambiguityScore = estimateAmbiguityScore(parsed.inputText);
    model = chooseModel({
      inputText: parsed.inputText,
      ambiguityScore,
      hasSensitiveSignals: sensitive.hasSensitiveInfo,
      requestedDepth: parsed.requestedDepth,
    });

    await logTrace(service, {
      user_id: user.id,
      trace_type: "input_normalization",
      status: "success",
      output_snapshot: {
        length: parsed.normalized.length,
        lineCount: parsed.normalized.lineCount,
        hasUrl: parsed.normalized.hasUrl,
        hasPhoneLikeText: parsed.normalized.hasPhoneLikeText,
        hasEmail: parsed.normalized.hasEmail,
      },
      metadata: { function: "analyze-writing" },
      started_at: functionStarted,
    });

    await logTrace(service, {
      user_id: user.id,
      trace_type: "pii_detection",
      status: "success",
      output_snapshot: sensitive,
      metadata: { categories: sensitive.categories },
    });

    const { data: session, error: sessionError } = await service
      .from("coach_sessions")
      .insert({
        user_id: user.id,
        input_text: parsed.inputText,
        context_type: parsed.contextType,
        tone: parsed.tone,
        sensitive_flags: sensitive,
      })
      .select("id")
      .single();

    if (sessionError || !session) throw sessionError || new Error("SESSION_INSERT_FAILED");
    sessionId = session.id;

    const retrievalStarted = Date.now();
    const retrieval = await maybeRetrieve(service, {
      userId: user.id,
      sessionId,
      query: parsed.normalized.normalizedForSearch,
      ambiguityScore,
      sensitive: sensitive.hasSensitiveInfo,
    }).catch(async (error) => {
      await logTrace(service, {
        user_id: user.id,
        session_id: sessionId,
        trace_type: "retrieval",
        status: "failed",
        error_message: error instanceof Error ? error.message : "retrieval failed",
        started_at: retrievalStarted,
      });
      return { chunks: [], ids: [], reason: "retrieval_failed" };
    });
    retrievedChunkIds = retrieval.ids;

    await logTrace(service, {
      user_id: user.id,
      session_id: sessionId,
      trace_type: "retrieval",
      status: "success",
      output_snapshot: { count: retrieval.chunks.length, reason: retrieval.reason },
      metadata: { retrievedChunkIds },
      started_at: retrievalStarted,
    });

    let result: RewriteResult | null = null;
    let finalIssues: string[] = [];
    let usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined;
    let rawResponse: unknown = null;
    let success = false;
    let errorMessage: string | null = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const attemptStarted = Date.now();
      const messages = buildRewriteMessages({
        inputText: parsed.inputText,
        contextType: parsed.contextType,
        tone: parsed.tone,
        retrievedExamples: retrieval.chunks,
        retryIssues: attempt === 0 ? undefined : finalIssues,
      });

      llmPayload = {
        model,
        prompt_name: PROMPT_NAME,
        prompt_version: PROMPT_VERSION,
        input_length: parsed.inputText.length,
        context_type: parsed.contextType,
        tone: parsed.tone,
        ambiguity_score: ambiguityScore,
        sensitive_categories: sensitive.categories,
        retrieved_chunk_ids: retrievedChunkIds,
        attempt: attempt + 1,
      };

      try {
        const completion = await callOpenAIChat({
          model,
          messages,
          responseFormat: { name: "rewrite_result", schema: rewriteResultJsonSchema },
          timeoutMs: 20000,
        });
        usage = completion.usage;
        rawResponse = completion.raw;
        const parsedJson = safeParseJson(completion.content);
        const validation = validateRewriteResult(parsedJson);
        finalIssues = validation.issues;

        if (validation.result) {
          const critic = criticRewriteResult(parsed.inputText, validation.result);
          if (!critic.pass) finalIssues = [...finalIssues, ...critic.issues];
          if (!validation.issues.length && critic.pass) {
            result = validation.result;
            success = true;
            await logTrace(service, {
              user_id: user.id,
              session_id: sessionId,
              trace_type: "schema_validation",
              status: "success",
              output_snapshot: { pass: true },
              started_at: attemptStarted,
            });
            break;
          }
        }

        await logTrace(service, {
          user_id: user.id,
          session_id: sessionId,
          trace_type: "output_critic",
          status: "failed",
          output_snapshot: { issues: finalIssues },
          started_at: attemptStarted,
        });
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : "LLM error";
        finalIssues = [errorMessage];
        await logTrace(service, {
          user_id: user.id,
          session_id: sessionId,
          trace_type: "llm_call",
          status: "failed",
          error_message: errorMessage,
          started_at: attemptStarted,
        });
      }
    }

    if (!result && isConfigurationError(errorMessage)) {
      throw new Error("AI_CONFIG_MISSING");
    }

    if (!result) throw new Error("AI_OUTPUT_FAILED");

    const latencyMs = Date.now() - functionStarted;
    const inputTokens = usage?.prompt_tokens ?? null;
    const outputTokens = usage?.completion_tokens ?? null;
    const totalTokens = usage?.total_tokens ?? null;
    const costEstimate = estimateCost(model, inputTokens ?? undefined, outputTokens ?? undefined);

    const { error: updateError } = await service
      .from("coach_sessions")
      .update({
        result_json: result,
        rewritten_text: result.rewritten_text,
        confidence_score: result.confidence_score,
        meaning_structure: result.meaning_structure,
        sensitive_flags: sensitive,
      })
      .eq("id", sessionId);

    if (updateError) throw updateError;

    await service.from("llm_runs").insert({
      user_id: user.id,
      coach_session_id: sessionId,
      function_name: "analyze-writing",
      provider: "openai",
      model,
      prompt_name: PROMPT_NAME,
      prompt_version: PROMPT_VERSION,
      input_hash: inputHash,
      retrieved_chunk_ids: retrievedChunkIds,
      request_payload: llmPayload,
      response_payload: success ? { result } : { fallback: true, issues: finalIssues },
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_tokens: totalTokens,
      latency_ms: latencyMs,
      cost_estimate: costEstimate,
      success,
      error_message: success ? null : errorMessage,
    });

    await service.from("usage_events").insert({
      user_id: user.id,
      event_type: "rewrite_call",
      cost_estimate: costEstimate,
      metadata: { model, success, session_id: sessionId },
    });

    await logTrace(service, {
      user_id: user.id,
      session_id: sessionId,
      trace_type: "persist",
      status: "success",
      output_snapshot: { session_id: sessionId, success },
      started_at: functionStarted,
    });

    return jsonResponse({ session_id: sessionId, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    const isAuth = message === "AUTH_REQUIRED";
    const isLimit = message === "DAILY_LIMIT_EXCEEDED";
    const isLength = message === "INPUT_TOO_LONG" || message === "INPUT_TOO_SHORT" || message === "INVALID_INPUT";

    if (userId) {
      await service.from("llm_runs").insert({
        user_id: userId,
        coach_session_id: sessionId,
        function_name: "analyze-writing",
        provider: "openai",
        model,
        prompt_name: PROMPT_NAME,
        prompt_version: PROMPT_VERSION,
        input_hash: inputHash,
        request_payload: llmPayload,
        latency_ms: Date.now() - functionStarted,
        success: false,
        error_message: message,
      });
    }

    if (isAuth) return friendlyError(401, "Bạn cần đăng nhập để dùng tính năng này.");
    if (isLimit) return friendlyError(429, "Bạn đã dùng hết lượt hôm nay. Hãy quay lại vào ngày mai.");
    if (isLength) return friendlyError(400, "Nội dung chưa phù hợp. Vui lòng nhập từ 2 đến 3000 ký tự.");
    if (message === "AI_CONFIG_MISSING") return friendlyError(500, "AI chưa được cấu hình trên production. Vui lòng báo quản trị viên kiểm tra OPENAI_API_KEY.");
    return friendlyError(500, "Hiểu Rõ chưa xử lý được câu này. Bạn có thể thử lại hoặc thêm bối cảnh để hệ thống hiểu rõ hơn.");
  }
});
