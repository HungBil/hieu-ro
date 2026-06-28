import type { RewriteResult } from "../../types/app";
import { Button } from "../common/Button";

export function RewriteResultCard({
  result,
  onCopy,
  onSave,
  onCreateLesson,
  saving,
  creatingLesson,
}: {
  result: RewriteResult;
  onCopy: () => void;
  onSave: () => void;
  onCreateLesson: () => void;
  saving?: boolean;
  creatingLesson?: boolean;
}) {
  return (
    <section className="rounded-card border border-primary/20 bg-white p-6 shadow-subtle md:p-8">
      <p className="text-sm font-medium text-primary">Câu viết lại rõ hơn</p>
      <p className="mt-4 whitespace-pre-wrap text-xl leading-9 text-app-text">{result.rewritten_text}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button type="button" variant="secondary" onClick={onCopy}>
          Sao chép
        </Button>
        <Button type="button" variant="secondary" onClick={onSave} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu mẫu câu"}
        </Button>
        <Button type="button" onClick={onCreateLesson} disabled={creatingLesson}>
          {creatingLesson ? "Đang tạo..." : "Tạo bài học từ câu này"}
        </Button>
      </div>
    </section>
  );
}
