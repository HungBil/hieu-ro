import { communityTypeLabels } from "../../lib/constants";
import type { CommunityPostType } from "../../types/app";
import { Button } from "../common/Button";

export function CommunityComposer({
  title,
  body,
  postType,
  isAnonymous,
  submitting,
  error,
  onTitleChange,
  onBodyChange,
  onPostTypeChange,
  onAnonymousChange,
  onSubmit,
}: {
  title: string;
  body: string;
  postType: CommunityPostType;
  isAnonymous: boolean;
  submitting?: boolean;
  error?: string | null;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onPostTypeChange: (value: CommunityPostType) => void;
  onAnonymousChange: (value: boolean) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="rounded-card border border-app-border bg-white p-5 shadow-subtle md:p-6">
      <div className="grid gap-4">
        <label className="block">
          <span className="sr-only">Tiêu đề</span>
          <input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Tiêu đề ngắn..."
            className="h-11 w-full rounded-[14px] border border-app-border px-4 text-base focus:border-primary focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="sr-only">Nội dung</span>
          <textarea
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
            placeholder="Bạn muốn chia sẻ điều gì với cộng đồng?"
            className="min-h-[120px] w-full rounded-[18px] border border-app-border p-4 text-base leading-7 focus:border-primary focus:outline-none"
          />
        </label>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(communityTypeLabels) as CommunityPostType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onPostTypeChange(type)}
                className={`h-9 rounded-full border px-3 text-sm ${postType === type ? "border-primary bg-primary-soft text-primary" : "border-app-border text-app-secondary"}`}
              >
                {communityTypeLabels[type]}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-app-secondary">
            <input type="checkbox" checked={isAnonymous} onChange={(event) => onAnonymousChange(event.target.checked)} />
            Đăng ẩn danh
          </label>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div>
          <Button type="button" onClick={onSubmit} disabled={submitting}>
            {submitting ? "Đang đăng..." : "Đăng bài"}
          </Button>
        </div>
      </div>
    </section>
  );
}
