import { supabase } from "../lib/supabase";
import { addDays } from "../lib/utils";
import type { GenerateLessonResponse } from "../types/ai";
import type { LearningItem, RepetitionGrade } from "../types/app";

function unwrapFunctionResponse<T>(data: T | null, error: unknown): T {
  if (error) {
    const message = error instanceof Error ? error.message : "Không thể xử lý lúc này.";
    throw new Error(message);
  }
  if (!data) throw new Error("Không nhận được phản hồi từ máy chủ.");
  return data;
}

export async function generateLessonFromSession(sessionId: string): Promise<GenerateLessonResponse> {
  const { data, error } = await supabase.functions.invoke<GenerateLessonResponse>("generate-lesson", {
    body: { session_id: sessionId },
  });
  return unwrapFunctionResponse(data, error);
}

export async function listDueLearningItems(): Promise<LearningItem[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("learning_items")
    .select("*")
    .eq("is_active", true)
    .lte("next_review_at", now)
    .order("next_review_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as LearningItem[];
}

export async function listActiveLearningItems(): Promise<LearningItem[]> {
  const { data, error } = await supabase
    .from("learning_items")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as LearningItem[];
}

export function computeNextReview(item: LearningItem, grade: RepetitionGrade) {
  let interval = item.interval_days || 1;
  let ease = Number(item.ease_factor || 2.5);
  let repetitions = item.repetitions || 0;
  let lapses = item.lapses || 0;

  if (grade === "again") {
    interval = 1;
    ease = Math.max(1.3, ease - 0.3);
    lapses += 1;
  }

  if (grade === "hard") {
    interval = Math.max(1, Math.round(interval * 1.2));
    ease = Math.max(1.3, ease - 0.15);
  }

  if (grade === "good") {
    interval = repetitions === 0 ? 1 : Math.round(interval * ease);
  }

  if (grade === "easy") {
    interval = repetitions === 0 ? 3 : Math.round(interval * ease * 1.3);
    ease += 0.15;
  }

  repetitions += 1;

  return {
    interval_days: interval,
    ease_factor: Number(ease.toFixed(2)),
    repetitions,
    lapses,
    next_review_at: addDays(new Date(), interval).toISOString(),
  };
}

export async function reviewLearningItem(input: { item: LearningItem; grade: RepetitionGrade }) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  if (!userData.user) throw new Error("Bạn cần đăng nhập.");

  const next = computeNextReview(input.item, input.grade);

  const { error: reviewError } = await supabase.from("learning_reviews").insert({
    user_id: userData.user.id,
    learning_item_id: input.item.id,
    grade: input.grade,
    previous_interval_days: input.item.interval_days,
    new_interval_days: next.interval_days,
    previous_ease_factor: input.item.ease_factor,
    new_ease_factor: next.ease_factor,
  });

  if (reviewError) throw new Error(reviewError.message);

  const { data, error } = await supabase
    .from("learning_items")
    .update(next)
    .eq("id", input.item.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as LearningItem;
}

export async function getLessonStats() {
  const now = new Date().toISOString();
  const [{ count: dueCount, error: dueError }, { data: reviews, error: reviewsError }] = await Promise.all([
    supabase.from("learning_items").select("id", { count: "exact", head: true }).eq("is_active", true).lte("next_review_at", now),
    supabase.from("learning_reviews").select("created_at").order("created_at", { ascending: false }).limit(120),
  ]);

  if (dueError) throw new Error(dueError.message);
  if (reviewsError) throw new Error(reviewsError.message);

  const days = new Set((reviews || []).map((item) => new Date(item.created_at).toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { dueCount: dueCount || 0, streak };
}
