import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { communityTypeLabels } from "../../lib/constants";
import { clampText, formatRelativeTimeVi } from "../../lib/utils";
import type { CommunityPost } from "../../types/app";
import { StatusBadge } from "../common/StatusBadge";

export function CommunityPostCard({ post }: { post: CommunityPost }) {
  return (
    <Link to={`/app/community/${post.id}`} className="block rounded-card border border-app-border bg-white p-5 shadow-subtle transition hover:border-primary">
      <div className="flex items-start justify-between gap-4">
        <div>
          <StatusBadge variant={post.is_resolved ? "success" : "blue"}>{communityTypeLabels[post.post_type]}</StatusBadge>
          <h2 className="mt-3 text-lg font-semibold text-app-text">{post.title}</h2>
          <p className="mt-2 text-base leading-7 text-app-secondary">{clampText(post.body, 220)}</p>
          <p className="mt-4 text-sm text-app-muted">
            {post.reply_count || 0} phản hồi • {formatRelativeTimeVi(post.created_at)}
          </p>
        </div>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-app-muted" aria-hidden="true" />
      </div>
    </Link>
  );
}
