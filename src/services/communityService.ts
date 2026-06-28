import { supabase } from "../lib/supabase";
import type { CommunityPost, CommunityPostType, CommunityReply } from "../types/app";

export async function listCommunityPosts(filters?: { type?: CommunityPostType }): Promise<CommunityPost[]> {
  let query = supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (filters?.type) query = query.eq("post_type", filters.type);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const posts = (data || []) as CommunityPost[];
  if (posts.length === 0) return [];

  const postIds = posts.map((post) => post.id);
  const { data: replies, error: replyError } = await supabase
    .from("community_replies")
    .select("post_id")
    .in("post_id", postIds);

  if (replyError) throw new Error(replyError.message);
  const counts = new Map<string, number>();
  for (const reply of replies || []) counts.set(reply.post_id, (counts.get(reply.post_id) || 0) + 1);

  return posts.map((post) => ({ ...post, reply_count: counts.get(post.id) || 0 }));
}

export async function getCommunityStats() {
  const [total, askMeaning, feedback, shareSample] = await Promise.all([
    supabase.from("community_posts").select("id", { count: "exact", head: true }),
    supabase.from("community_posts").select("id", { count: "exact", head: true }).eq("post_type", "ask_meaning"),
    supabase.from("community_posts").select("id", { count: "exact", head: true }).eq("post_type", "feedback"),
    supabase.from("community_posts").select("id", { count: "exact", head: true }).eq("post_type", "share_sample"),
  ]);

  for (const result of [total, askMeaning, feedback, shareSample]) {
    if (result.error) throw new Error(result.error.message);
  }

  return {
    total: total.count || 0,
    askMeaning: askMeaning.count || 0,
    feedback: feedback.count || 0,
    shareSample: shareSample.count || 0,
  };
}

export async function createCommunityPost(input: {
  post_type: CommunityPostType;
  title: string;
  body: string;
  is_anonymous?: boolean;
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  if (!userData.user) throw new Error("Bạn cần đăng nhập.");

  const { data, error } = await supabase
    .from("community_posts")
    .insert({ ...input, user_id: userData.user.id, is_anonymous: input.is_anonymous || false })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as CommunityPost;
}

export async function getCommunityPost(postId: string): Promise<CommunityPost> {
  const { data, error } = await supabase.from("community_posts").select("*").eq("id", postId).single();
  if (error) throw new Error(error.message);
  return data as CommunityPost;
}

export async function listCommunityReplies(postId: string): Promise<CommunityReply[]> {
  const { data, error } = await supabase
    .from("community_replies")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data || []) as CommunityReply[];
}

export async function createCommunityReply(input: { post_id: string; body: string; is_anonymous?: boolean }) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  if (!userData.user) throw new Error("Bạn cần đăng nhập.");

  const { data, error } = await supabase
    .from("community_replies")
    .insert({ ...input, user_id: userData.user.id, is_anonymous: input.is_anonymous || false })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as CommunityReply;
}

export async function markPostResolved(postId: string, isResolved = true) {
  const { data, error } = await supabase
    .from("community_posts")
    .update({ is_resolved: isResolved })
    .eq("id", postId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as CommunityPost;
}
