import { consentOptions } from "../../lib/constants";
import { cn } from "../../lib/utils";
import type { ConsentScope } from "../../types/app";

export function ConsentSelector({ value, onChange }: { value: ConsentScope; onChange: (value: ConsentScope) => void }) {
  return (
    <div>
      <p className="text-base font-semibold text-app-text">Quyền sử dụng mẫu câu bạn đóng góp</p>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {consentOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-[18px] border p-4 text-left transition",
              value === option.value ? "border-primary bg-primary-soft" : "border-app-border bg-white hover:bg-slate-50",
            )}
          >
            <span className="block text-sm font-semibold text-app-text">{option.title}</span>
            <span className="mt-1 block text-sm leading-6 text-app-secondary">{option.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
