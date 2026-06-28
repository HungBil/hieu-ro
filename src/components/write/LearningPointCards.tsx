import { learningTypeLabels } from "../../lib/constants";
import type { LearningPoint } from "../../types/app";
import { StatusBadge } from "../common/StatusBadge";

export function LearningPointCards({ points, onCreateLesson }: { points: LearningPoint[]; onCreateLesson?: () => void }) {
  if (!points.length) return <p className="text-sm text-app-secondary">Chưa có bài học nhỏ cho câu này.</p>;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {points.slice(0, 2).map((point, index) => (
        <button
          key={`${point.title}-${index}`}
          type="button"
          onClick={onCreateLesson}
          className="rounded-card border border-app-border bg-white p-5 text-left transition hover:border-primary hover:bg-primary-soft"
        >
          <StatusBadge variant="blue">{learningTypeLabels[point.type] || "Bài học"}</StatusBadge>
          <h3 className="mt-3 text-base font-semibold text-app-text">{point.title}</h3>
          <p className="mt-2 text-sm leading-6 text-app-secondary">{point.rule_text}</p>
        </button>
      ))}
    </div>
  );
}
