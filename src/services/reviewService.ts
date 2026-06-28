import { supabase } from "../lib/supabase";
import type { SampleStatus, WritingSample } from "../types/app";

export async function listReviewQueue(): Promise<WritingSample[]> {
  const { data, error } = await supabase
    .from("writing_samples")
    .select("*")
    .in("status", ["pending_review", "needs_changes"])
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as WritingSample[];
}

export async function updateSampleReview(input: {
  sampleId: string;
  status: SampleStatus;
  review_note?: string;
  is_anonymized?: boolean;
  contains_sensitive_info?: boolean;
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  if (!userData.user) throw new Error("Bạn cần đăng nhập.");

  const { data, error } = await supabase
    .from("writing_samples")
    .update({
      status: input.status,
      review_note: input.review_note || null,
      is_anonymized: input.is_anonymized ?? false,
      contains_sensitive_info: input.contains_sensitive_info ?? false,
      reviewer_id: userData.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", input.sampleId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as WritingSample;
}
