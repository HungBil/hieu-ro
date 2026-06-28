import { communityTabs } from "../../lib/constants";
import { cn } from "../../lib/utils";
import type { CommunityPostType } from "../../types/app";

export function CommunityTabs({ value, onChange }: { value: "all" | CommunityPostType; onChange: (value: "all" | CommunityPostType) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {communityTabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            "h-10 rounded-full border px-4 text-sm font-medium transition",
            value === tab.value ? "border-primary bg-primary-soft text-primary" : "border-app-border bg-white text-app-secondary hover:bg-slate-50",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
