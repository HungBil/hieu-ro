import { Link } from "react-router-dom";
import { formatDateVi } from "../../lib/utils";
import type { SavedPhrase } from "../../types/app";
import { Button } from "../common/Button";

export function SavedPhraseList({
  items,
  onDelete,
  onCreateLesson,
}: {
  items: SavedPhrase[];
  onDelete: (id: string) => void;
  onCreateLesson: (sessionId: string | null) => void;
}) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={item.id} className="rounded-card border border-app-border bg-white p-5 shadow-subtle">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-app-secondary">Câu gốc</p>
              <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-app-text">{item.original_text}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-primary">Câu viết lại</p>
              <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-app-text">{item.rewritten_text}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3 border-t border-app-border pt-4 text-sm text-app-secondary sm:flex-row sm:items-center sm:justify-between">
            <span>{formatDateVi(item.created_at)}</span>
            <div className="flex flex-wrap gap-2">
              {item.coach_session_id ? (
                <Link className="inline-flex h-10 items-center rounded-[12px] border border-app-border bg-white px-3 font-medium text-app-text hover:bg-slate-50" to={`/app/write/${item.coach_session_id}`}>
                  Mở lại
                </Link>
              ) : null}
              <Button type="button" variant="secondary" className="h-10" onClick={() => onCreateLesson(item.coach_session_id)} disabled={!item.coach_session_id}>
                Tạo bài học
              </Button>
              <Button type="button" variant="ghost" className="h-10 text-red-600 hover:bg-red-50" onClick={() => onDelete(item.id)}>
                Xóa
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
