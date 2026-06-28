import { learningTypeLabels } from "../../lib/constants";
import type { LearningItem, RepetitionGrade } from "../../types/app";
import { StatusBadge } from "../common/StatusBadge";
import { ReviewButtons } from "./ReviewButtons";

export function LessonCard({ item, progressLabel, reviewing, onReview }: { item: LearningItem; progressLabel?: string; reviewing?: boolean; onReview: (grade: RepetitionGrade) => void }) {
  return (
    <article className="rounded-card border border-app-border bg-white p-6 shadow-subtle md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusBadge variant="blue">Bài học nhỏ</StatusBadge>
        {progressLabel ? <span className="text-sm text-app-muted">{progressLabel}</span> : null}
      </div>
      <h2 className="mt-5 text-2xl font-semibold tracking-[-0.01em] text-app-text">{item.title}</h2>
      <p className="mt-2 text-sm text-primary">{learningTypeLabels[item.item_type] || "Viết rõ hơn"}</p>
      <p className="mt-5 text-base leading-7 text-app-secondary">{item.rule_text}</p>
      {(item.unclear_example || item.clear_example) ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {item.unclear_example ? (
            <div className="rounded-[18px] border border-app-border bg-slate-50 p-4">
              <p className="text-sm font-medium text-app-secondary">Cách viết chưa rõ</p>
              <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-app-text">{item.unclear_example}</p>
            </div>
          ) : null}
          {item.clear_example ? (
            <div className="rounded-[18px] border border-blue-100 bg-primary-soft p-4">
              <p className="text-sm font-medium text-primary">Cách viết rõ hơn</p>
              <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-app-text">{item.clear_example}</p>
            </div>
          ) : null}
        </div>
      ) : null}
      <ReviewButtons disabled={reviewing} onReview={onReview} />
    </article>
  );
}
