import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

export type AuthenticatedUser = {
  id: string;
  email?: string;
};

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function createServiceClient() {
  return createClient(requiredEnv("SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createAnonClient() {
  return createClient(requiredEnv("SUPABASE_URL"), requiredEnv("SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function requireUser(req: Request): Promise<AuthenticatedUser> {
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("AUTH_REQUIRED");

  const token = authHeader.replace("Bearer ", "").trim();
  const supabase = createAnonClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new Error("AUTH_REQUIRED");

  return { id: data.user.id, email: data.user.email || undefined };
}

export async function isReviewerOrAdmin(serviceClient: ReturnType<typeof createServiceClient>, userId: string) {
  const { data, error } = await serviceClient.from("profiles").select("role").eq("id", userId).single();
  if (error) return false;
  return data?.role === "reviewer" || data?.role === "admin";
}

export async function isAdmin(serviceClient: ReturnType<typeof createServiceClient>, userId: string) {
  const { data, error } = await serviceClient.from("profiles").select("role").eq("id", userId).single();
  if (error) return false;
  return data?.role === "admin";
}
