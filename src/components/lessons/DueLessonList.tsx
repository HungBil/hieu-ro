import type { LearningItem } from "../../types/app";

export function DueLessonList({ items }: { items: LearningItem[] }) {
  if (!items.length) return null;
  return (
    <aside className="rounded-card border border-app-border bg-white p-5 shadow-subtle">
      <h2 className="text-base font-semibold text-app-text">Hôm nay cần ôn</h2>
      <ul className="mt-4 space-y-3 text-sm text-app-secondary">
        {items.slice(0, 6).map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {item.title}
          </li>
        ))}
      </ul>
    </aside>
  );
}
