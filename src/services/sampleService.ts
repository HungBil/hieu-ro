import { supabase } from "../lib/supabase";
import type { ConsentScope, SavedPhrase, WritingSample } from "../types/app";

export async function listSavedPhrases(): Promise<SavedPhrase[]> {
  const { data, error } = await supabase
    .from("saved_phrases")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as SavedPhrase[];
}

export async function deleteSavedPhrase(id: string) {
  const { error } = await supabase.from("saved_phrases").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function createWritingSample(input: {
  original_text: string;
  context_note?: string;
  intended_meaning?: string;
  standard_vietnamese_text: string;
  consent_scope: ConsentScope;
  contains_sensitive_info?: boolean;
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  if (!userData.user) throw new Error("Bạn cần đăng nhập.");

  const { data, error } = await supabase
    .from("writing_samples")
    .insert({
      user_id: userData.user.id,
      original_text: input.original_text,
      context_note: input.context_note || null,
      intended_meaning: input.intended_meaning || null,
      standard_vietnamese_text: input.standard_vietnamese_text,
      consent_scope: input.consent_scope,
      status: "pending_review",
      contains_sensitive_info: input.contains_sensitive_info || false,
      is_anonymized: false,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as WritingSample;
}

export async function listMyWritingSamples(): Promise<WritingSample[]> {
  const { data, error } = await supabase
    .from("writing_samples")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as WritingSample[];
}

export async function getWritingSample(id: string): Promise<WritingSample> {
  const { data, error } = await supabase.from("writing_samples").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data as WritingSample;
}
