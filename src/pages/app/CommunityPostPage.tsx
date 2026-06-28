import { FormEvent, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { CommunityReplyList } from "../../components/community/CommunityReplyList";
import { Button } from "../../components/common/Button";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { StatusBadge } from "../../components/common/StatusBadge";
import { communityTypeLabels } from "../../lib/constants";
import { formatDateVi } from "../../lib/utils";
import { communityReplySchema } from "../../lib/validators";
import { createCommunityReply, getCommunityPost, listCommunityReplies, markPostResolved } from "../../services/communityService";
import { useAuth } from "../../auth/useAuth";

export function CommunityPostPage() {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postQuery = useQuery({ queryKey: ["community-post", postId], queryFn: () => getCommunityPost(postId || ""), enabled: Boolean(postId) });
  const repliesQuery = useQuery({ queryKey: ["community-replies", postId], queryFn: () => listCommunityReplies(postId || ""), enabled: Boolean(postId) });

  const replyMutation = useMutation({
    mutationFn: createCommunityReply,
    onSuccess: async () => {
      setBody("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["community-replies", postId] });
      await queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
    onError: () => setError("Không gửi được phản hồi lúc này."),
  });

  const resolveMutation = useMutation({
    mutationFn: (resolved: boolean) => markPostResolved(postId || "", resolved),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["community-post", postId] });
      await queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const parsed = communityReplySchema.safeParse({ body, is_anonymous: isAnonymous });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "Vui lòng nhập phản hồi.");
      return;
    }
    replyMutation.mutate({ post_id: postId || "", ...parsed.data });
  }

  if (postQuery.isLoading) return <LoadingState />;
  if (postQuery.isError || !postQuery.data) return <ErrorState description="Không mở được bài này." />;

  const post = postQuery.data;
  const isOwner = user?.id === post.user_id;

  return (
    <div className="space-y-6">
      <Link to="/app/community" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Quay lại cộng đồng
      </Link>
      <article className="rounded-card border border-app-border bg-white p-6 shadow-subtle md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge variant={post.is_resolved ? "success" : "blue"}>{communityTypeLabels[post.post_type]}</StatusBadge>
          {post.is_resolved ? <StatusBadge variant="success">Đã rõ</StatusBadge> : null}
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-10 text-app-text">{post.title}</h1>
        <p className="mt-2 text-sm text-app-muted">{post.is_anonymous ? "Thành viên ẩn danh" : "Thành viên"} • {formatDateVi(post.created_at)}</p>
        <p className="mt-6 whitespace-pre-wrap text-base leading-8 text-app-text">{post.body}</p>
        {isOwner ? (
          <div className="mt-6">
            <Button type="button" variant="secondary" onClick={() => resolveMutation.mutate(!post.is_resolved)} disabled={resolveMutation.isPending}>
              {post.is_resolved ? "Mở lại câu hỏi" : "Đánh dấu đã rõ"}
            </Button>
          </div>
        ) : null}
      </article>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-app-text">Phản hồi</h2>
        {repliesQuery.isLoading ? <LoadingState /> : null}
        {repliesQuery.data ? <CommunityReplyList replies={repliesQuery.data} /> : null}
      </section>

      <form onSubmit={submit} className="rounded-card border border-app-border bg-white p-5 shadow-subtle">
        <label className="block">
          <span className="text-sm font-medium text-app-text">Thêm phản hồi</span>
          <textarea value={body} onChange={(event) => setBody(event.target.value)} className="mt-2 min-h-[120px] w-full rounded-[18px] border border-app-border p-4 text-base leading-7" placeholder="Viết góp ý rõ ràng và tôn trọng..." />
        </label>
        <label className="mt-3 flex items-center gap-2 text-sm text-app-secondary">
          <input type="checkbox" checked={isAnonymous} onChange={(event) => setIsAnonymous(event.target.checked)} />
          Phản hồi ẩn danh
        </label>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <Button type="submit" className="mt-4" disabled={replyMutation.isPending}>
          {replyMutation.isPending ? "Đang gửi..." : "Gửi phản hồi"}
        </Button>
      </form>
    </div>
  );
}
