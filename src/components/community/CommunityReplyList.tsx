import { formatDateVi } from "../../lib/utils";
import type { CommunityReply } from "../../types/app";

export function CommunityReplyList({ replies }: { replies: CommunityReply[] }) {
  if (!replies.length) return <p className="rounded-card border border-dashed border-app-border bg-white p-5 text-sm text-app-secondary">Chưa có phản hồi nào.</p>;

  return (
    <div className="space-y-3">
      {replies.map((reply) => (
        <article key={reply.id} className="rounded-card border border-app-border bg-white p-5 shadow-subtle">
          <p className="whitespace-pre-wrap text-base leading-7 text-app-text">{reply.body}</p>
          <p className="mt-3 text-sm text-app-muted">{reply.is_anonymous ? "Thành viên ẩn danh" : "Thành viên"} • {formatDateVi(reply.created_at)}</p>
        </article>
      ))}
    </div>
  );
}
