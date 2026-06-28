import { supabase } from "../lib/supabase";
import type { Profile, UserSettings } from "../types/app";

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  const user = userData.user;
  if (!user) return null;

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return data as Profile;

  const fallbackName =
    (user.user_metadata?.display_name as string | undefined) || user.email?.split("@")[0] || "Người dùng";

  const { data: created, error: createError } = await supabase
    .from("profiles")
    .insert({ id: user.id, email: user.email, display_name: fallbackName })
    .select("*")
    .single();

  if (createError) throw new Error(createError.message);
  await supabase.from("user_settings").insert({ user_id: user.id }).select().maybeSingle();
  return created as Profile;
}

export async function updateProfile(input: Partial<Pick<Profile, "display_name" | "full_name" | "avatar_url" | "is_deaf_community_member" | "knows_sign_language" | "onboarding_completed">>) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  if (!userData.user) throw new Error("Bạn cần đăng nhập.");

  const { data, error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", userData.user.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data) return data as UserSettings;

  const { data: created, error: createError } = await supabase
    .from("user_settings")
    .insert({ user_id: userData.user.id })
    .select("*")
    .single();

  if (createError) throw new Error(createError.message);
  return created as UserSettings;
}

export async function updateUserSettings(input: Partial<Pick<UserSettings, "save_history" | "allow_learning_suggestions" | "allow_notifications" | "daily_learning_target" | "timezone">>) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  if (!userData.user) throw new Error("Bạn cần đăng nhập.");

  const { data, error } = await supabase
    .from("user_settings")
    .update(input)
    .eq("user_id", userData.user.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as UserSettings;
}
