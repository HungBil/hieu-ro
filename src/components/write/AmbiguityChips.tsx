import type { Ambiguity } from "../../types/app";

export function AmbiguityChips({ ambiguities }: { ambiguities: Ambiguity[] }) {
  if (!ambiguities.length) {
    return <p className="text-sm text-app-secondary">Không có điểm mơ hồ lớn.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ambiguities.slice(0, 4).map((item, index) => (
        <span key={`${item.phrase}-${index}`} className="rounded-full border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {item.question}
        </span>
      ))}
    </div>
  );
}
