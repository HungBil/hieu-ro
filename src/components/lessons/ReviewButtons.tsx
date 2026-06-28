import type { RepetitionGrade } from "../../types/app";
import { Button } from "../common/Button";

const labels: Record<RepetitionGrade, string> = {
  again: "Học lại",
  hard: "Khó",
  good: "Nhớ rồi",
  easy: "Rất dễ",
};

export function ReviewButtons({ disabled, onReview }: { disabled?: boolean; onReview: (grade: RepetitionGrade) => void }) {
  return (
    <div className="mt-6 grid gap-2 sm:grid-cols-4">
      {(Object.keys(labels) as RepetitionGrade[]).map((grade) => (
        <Button key={grade} type="button" variant={grade === "good" || grade === "easy" ? "primary" : "secondary"} disabled={disabled} onClick={() => onReview(grade)}>
          {labels[grade]}
        </Button>
      ))}
    </div>
  );
}
