import { supabase } from "../lib/supabase";
import type { AnalyzeWritingInput, AnalyzeWritingResponse } from "../types/ai";
import type { CoachSession, FeedbackRating, SavedPhrase } from "../types/app";

async function unwrapFunctionResponse<T>(data: T | null, error: unknown): Promise<T> {
  if (error) {
    const context = (error as { context?: { json?: () => Promise<{ error?: string }> } })?.context;
    const body = context?.json ? await context.json().catch(() => null) : null;
    if (body?.error) throw new Error(body.error);
    const message = error instanceof Error ? error.message : "Không thể xử lý lúc này.";
    throw new Error(message);
  }
  if (!data) throw new Error("Không nhận được phản hồi từ máy chủ.");
  return data;
}

export async function analyzeWriting(input: AnalyzeWritingInput): Promise<AnalyzeWritingResponse> {
  const { data, error } = await supabase.functions.invoke<AnalyzeWritingResponse>("analyze-writing", {
    body: input,
  });

  return unwrapFunctionResponse(data, error);
}

export async function getCoachSession(sessionId: string): Promise<CoachSession> {
  const { data, error } = await supabase.from("coach_sessions").select("*").eq("id", sessionId).single();
  if (error) throw new Error(error.message);
  return data as CoachSession;
}

export async function listRecentCoachSessions(): Promise<CoachSession[]> {
  const { data, error } = await supabase
    .from("coach_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) throw new Error(error.message);
  return (data || []) as CoachSession[];
}

export async function savePhraseFromSession(sessionId: string): Promise<SavedPhrase> {
  const session = await getCoachSession(sessionId);
  if (!session.rewritten_text) throw new Error("Chưa có câu viết lại để lưu.");

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  if (!userData.user) throw new Error("Bạn cần đăng nhập.");

  const { data, error } = await supabase
    .from("saved_phrases")
    .insert({
      user_id: userData.user.id,
      coach_session_id: session.id,
      original_text: session.input_text,
      rewritten_text: session.rewritten_text,
      context_type: session.context_type,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  await supabase.from("coach_sessions").update({ saved: true }).eq("id", session.id);
  return data as SavedPhrase;
}

export async function saveCoachFeedback(input: {
  session_id: string;
  rating: FeedbackRating;
  comment?: string;
  corrected_text?: string;
}) {
  const { data, error } = await supabase.functions.invoke<{ feedback_id: string }>("save-feedback", {
    body: input,
  });
  return unwrapFunctionResponse(data, error);
}
