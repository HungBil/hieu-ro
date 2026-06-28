import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityComposer } from "../../components/community/CommunityComposer";
import { CommunityPostCard } from "../../components/community/CommunityPostCard";
import { CommunityStats } from "../../components/community/CommunityStats";
import { CommunityTabs } from "../../components/community/CommunityTabs";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { PageHeader } from "../../components/common/PageHeader";
import { communityPostSchema } from "../../lib/validators";
import { createCommunityPost, getCommunityStats, listCommunityPosts } from "../../services/communityService";
import type { CommunityPostType } from "../../types/app";

export function CommunityPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"all" | CommunityPostType>("all");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState<CommunityPostType>("ask_meaning");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statsQuery = useQuery({ queryKey: ["community-stats"], queryFn: getCommunityStats });
  const postsQuery = useQuery({
    queryKey: ["community-posts", tab],
    queryFn: () => listCommunityPosts(tab === "all" ? undefined : { type: tab }),
  });

  const createMutation = useMutation({
    mutationFn: createCommunityPost,
    onSuccess: async () => {
      setTitle("");
      setBody("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      await queryClient.invalidateQueries({ queryKey: ["community-stats"] });
    },
    onError: () => setError("Không đăng được bài lúc này."),
  });

  function submit() {
    setError(null);
    const parsed = communityPostSchema.safeParse({ title, body, post_type: postType, is_anonymous: isAnonymous });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "Vui lòng kiểm tra nội dung.");
      return;
    }
    createMutation.mutate(parsed.data);
  }

  return (
    <div>
      <PageHeader title="Cộng đồng cùng hiểu nhau hơn" description="Nơi mọi người chia sẻ cách diễn đạt, hỏi ý nghĩa câu viết và góp ý để giao tiếp rõ hơn." />
      <div className="space-y-6">
        <CommunityComposer
          title={title}
          body={body}
          postType={postType}
          isAnonymous={isAnonymous}
          submitting={createMutation.isPending}
          error={error}
          onTitleChange={setTitle}
          onBodyChange={setBody}
          onPostTypeChange={setPostType}
          onAnonymousChange={setIsAnonymous}
          onSubmit={submit}
        />
        {statsQuery.data ? <CommunityStats stats={statsQuery.data} /> : null}
        <CommunityTabs value={tab} onChange={setTab} />

        {postsQuery.isLoading ? <LoadingState /> : null}
        {postsQuery.isError ? <ErrorState description="Không tải được bài trong cộng đồng." /> : null}
        {postsQuery.data && postsQuery.data.length === 0 ? <EmptyState title="Chưa có thảo luận nào." description="Hãy đặt câu hỏi hoặc chia sẻ một mẫu câu để bắt đầu." /> : null}
        {postsQuery.data && postsQuery.data.length > 0 ? (
          <div className="space-y-4">
            {postsQuery.data.map((post) => <CommunityPostCard key={post.id} post={post} />)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
