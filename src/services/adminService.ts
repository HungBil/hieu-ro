import { supabase } from "../lib/supabase";

export async function getAdminCounts() {
  const [sessions, users, llmRuns, samples] = await Promise.all([
    supabase.from("coach_sessions").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("llm_runs").select("id", { count: "exact", head: true }),
    supabase.from("writing_samples").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
  ]);

  for (const result of [sessions, users, llmRuns, samples]) {
    if (result.error) throw new Error(result.error.message);
  }

  return {
    sessions: sessions.count || 0,
    users: users.count || 0,
    llmRuns: llmRuns.count || 0,
    pendingSamples: samples.count || 0,
  };
}
